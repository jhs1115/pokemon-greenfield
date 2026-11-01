from pathlib import Path
import json,urllib.request,urllib.parse,concurrent.futures,re
repo='Pokemon-Tectonic-Team/Pokemon-Essentials-Chasm-Engine'
tree=json.loads(Path('data/raw/Pokemon-Essentials-Chasm-Engine-tree.json').read_text(encoding='utf8'))['tree'];norm=lambda s:re.sub('[^a-z0-9]','',s.lower())
paths=[v['path'] for v in tree if '/Anim/PRSFX-' in v['path'] and v['path'].lower().endswith(('.ogg','.mp3','.wav'))]
lookup={}
for path in sorted(paths):
 name=Path(path).stem.split('PRSFX- ')[-1];lookup.setdefault(norm(re.sub(r'\d+$','',name)),path)
d=json.loads(Path('data/reference.json').read_text(encoding='utf8'));dest=Path('assets/audio/moves');dest.mkdir(exist_ok=True)
matched={str(m['id']):lookup[norm(m['key'])] for m in d['moves'].values() if norm(m['key']) in lookup}
def download(pair):
 id,path=pair;target=dest/(id+Path(path).suffix);url='https://raw.githubusercontent.com/'+repo+'/HEAD/'+urllib.parse.quote(path)
 try:
  if not target.exists():target.write_bytes(urllib.request.urlopen(url,timeout=25).read())
  return id,{'src':target.as_posix(),'source':path}
 except Exception as e:return id,None
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:result=dict(pool.map(download,matched.items()))
result={k:v for k,v in result.items() if v};extra='https://raw.githubusercontent.com/Aditya-xcity/pokemon-battle-simulator/main/battle/Sound/Attacks/Growl.mp3';(dest/'45.mp3').write_bytes(urllib.request.urlopen(extra).read());result['45']={'src':'assets/audio/moves/45.mp3','source':extra};Path('assets/audio/move-sounds.json').write_text(json.dumps(result,indent=2),encoding='utf8');Path('assets/audio/move-sounds.js').write_text('window.MOVE_SOUNDS='+json.dumps(result,separators=(',',':'))+';',encoding='utf8')
for key in ['thunder-stone','moon-stone','fire-stone','water-stone','leaf-stone']:
 (Path('assets/items')/(key+'.png')).write_bytes(urllib.request.urlopen('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'+key+'.png').read())
print('Downloaded',len(result),'move sound files and 5 stone sprites')
