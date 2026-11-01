import json,urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
items={}
# Read just the static keys from the local item source.
import re
keys=re.findall(r"^'([^']+)':",Path('items.js').read_text(encoding='utf-8'),re.M)
Path('assets/items').mkdir(exist_ok=True)
def get(key):urllib.request.urlretrieve('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'+key+'.png',Path('assets/items')/(key+'.png'))
with ThreadPoolExecutor(max_workers=6)as pool:list(pool.map(get,keys))
entries=json.load(urllib.request.urlopen('https://api.github.com/repos/pret/pokefirered/contents/graphics/trainers/front_pics'))
print([e['name']for e in entries if any(k in e['name']for k in ['misty','surge','erika','rocket'])])
for name in ['leader_misty','leader_lt_surge','leader_erika','rocket_grunt_m']:
 match=next((e for e in entries if e['name']==name+'_front_pic.png'),None)
 if match:
  source=Path('assets/trainers')/(name+'.source.png');urllib.request.urlretrieve(match['download_url'],source)
  from PIL import Image
  im=Image.open(source).convert('RGBA');bg=im.getpixel((0,0))[:3];im.putdata([(r,g,b,0 if (r,g,b)==bg else a)for r,g,b,a in im.get_flattened_data()]);im.save(Path('assets/trainers')/(name+'.png'))
print('Items:',len(keys))
