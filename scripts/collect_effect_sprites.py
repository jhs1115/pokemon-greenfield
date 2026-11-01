"""Download existing Emerald battle sprites; expose indexed transparency and pack frames.

No new artwork is generated. Frame order and motion are configured in sprite-effects.js.
Requires Pillow: python -m pip install Pillow
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json, urllib.request
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets' / 'effects'
SOURCE = DEST / 'source'
STRIPS = DEST / 'strips'
BASE = 'https://raw.githubusercontent.com/pret/pokeemerald/master/graphics/battle_anims/sprites/'
NAMES = '''air_slash air_wave blue_burst blue_star bubble bubble_burst circle_impact claw_slash cross_impact electricity fang_attack fangs fire fire_plume fury_swipes glowy_red_orb green_sparkle impact leaf lightning poison_bubble razor_leaf scratch shadow_ball sharp_teeth shock slam_hit slam_hit_2 slash small_ember spark_0 spark_1 spark_2 speed_dust spinning_fire spinning_green_orbs thin_ring toxic_bubble vine vine_2 water_column water_droplet water_impact water_orb whirlwind whirlwind_2 yellow_star pink_orb hollow_orb ring rainbow_rings purple_droplet purple_scratch purple_swipe bluegreen_orb'''.split()
OVERRIDES = {'air_wave':(32,16), 'razor_leaf':(32,16), 'fangs':(32,64), 'rainbow_rings':(8,16)}

def collect(name):
    path = SOURCE / (name + '.png')
    if not path.exists():
        with urllib.request.urlopen(BASE + name + '.png', timeout=30) as response:
            path.write_bytes(response.read())
    im = Image.open(path)
    # GBA object palette entry zero is transparent. Preserve all other source pixels.
    im.info['transparency'] = 0
    im = im.convert('RGBA')
    width,height = OVERRIDES.get(name,(im.width,min(im.width,im.height)))
    if im.width%width or im.height%height:
        raise ValueError(f'Invalid frame size for {name}: {im.size} vs {width,height}')
    frames = [im.crop((x,y,x+width,y+height)) for y in range(0,im.height,height) for x in range(0,im.width,width)]
    strip=Image.new('RGBA',(width*len(frames),height))
    for i,frame in enumerate(frames):strip.paste(frame,(width*i,0))
    strip.save(STRIPS/(name+'.png'))
    return name,{'src':f'assets/effects/strips/{name}.png','width':width,'height':height,'frames':len(frames)}

if __name__=='__main__':
    SOURCE.mkdir(parents=True,exist_ok=True)
    STRIPS.mkdir(parents=True,exist_ok=True)
    with ThreadPoolExecutor(max_workers=10) as pool:manifest=dict(pool.map(collect,NAMES))
    (DEST/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    (DEST/'manifest.js').write_text('window.EFFECT_SPRITES = '+json.dumps(manifest)+';',encoding='utf-8')
    print(f'Prepared {len(manifest)} original sprite sheets, {sum(v["frames"] for v in manifest.values())} source frames.')
