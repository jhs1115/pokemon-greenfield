from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request,json,zipfile
root=Path('assets/audio');(root/'cries').mkdir(exist_ok=True)
def get(i):
 path=root/'cries'/f'{i}.ogg'
 if not path.exists():urllib.request.urlretrieve(f'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/{i}.ogg',path)
 header=path.read_bytes()[:4]
 if header!=b'OggS' and not (header[:3]==b'ID3' or header[0]==255):raise ValueError(i)
 return path.stat().st_size
with ThreadPoolExecutor(max_workers=8)as pool: sizes=list(pool.map(get,range(1,152)))
urllib.request.urlretrieve('https://raw.githubusercontent.com/PokeAPI/cries/main/LICENSE',root/'licenses'/'pokeapi-cries.txt')
p=root/'manifest.json';data=json.loads(p.read_text(encoding='utf-8'))
for i in range(1,152):
 source=root/'cries'/f'{i}.ogg';ext='ogg' if source.read_bytes()[:4]==b'OggS' else 'mp3'
 if ext=='mp3':(root/'cries'/f'{i}.mp3').write_bytes(source.read_bytes())
 data['cry-'+str(i)]={'src':f'assets/audio/cries/{i}.{ext}','pack':'pokeapi-cries'}
p.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');(root/'manifest.js').write_text('window.AUDIO_ASSETS='+json.dumps(data,separators=(',',':'))+';',encoding='utf-8')
print('151 original cries:',sum(sizes),'bytes')
