"""Download source music/UI packs from their public source pages; then select_audio.py and prepare_cries.py."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request,json,zipfile
root=Path('assets/audio');root.mkdir(exist_ok=True)
def pack(item):
 name,slug=item;p=root/(name+'.zip')
 if p.exists() and zipfile.is_zipfile(p):return name,p.stat().st_size
 key=('assets/'+slug).encode().hex();request=urllib.request.Request('https://kenney.nl/download-link/'+key,headers={'Referer':'https://kenney.nl/assets/'+slug,'Accept':'application/json','User-Agent':'Mozilla/5.0'})
 url=json.load(urllib.request.urlopen(request))['url'];urllib.request.urlretrieve(url,p)
 if not zipfile.is_zipfile(p):raise ValueError('Invalid archive: '+name)
 return name,p.stat().st_size
with ThreadPoolExecutor(max_workers=4)as pool:
 for result in pool.map(pack,[('interface','interface-sounds'),('rpg','rpg-audio'),('jingles','music-jingles'),('scifi','sci-fi-sounds')]):print(result)
tracks={'quiet-village.mp3':'04_holiznacc0_-_quiet_village_1.mp3','battle.ogg':'battleloop.ogg','gym-rock.ogg':'heartfelt-battle_loop.ogg','gym-water.ogg':'flowerbed_fields.ogg','gym-electric.ogg':'bossbattle.ogg','gym-grass.ogg':'confrontation_1.ogg'}
def music(item):
 name,source=item;p=root/name
 if not p.exists():urllib.request.urlretrieve('https://opengameart.org/sites/default/files/'+source,p)
 return name,p.stat().st_size
with ThreadPoolExecutor(max_workers=6)as pool:
 for result in pool.map(music,tracks.items()):print(result)
