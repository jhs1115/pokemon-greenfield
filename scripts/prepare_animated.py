from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request
root=Path('assets/pokemon/animated');root.mkdir(exist_ok=True)
def get(i):
 p=root/f'{i}.gif'
 if not p.exists():urllib.request.urlretrieve(f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/{i}.gif',p)
 if p.read_bytes()[:3]!=b'GIF':raise ValueError(i)
 return p.stat().st_size
with ThreadPoolExecutor(max_workers=8)as pool:print('151 animated originals:',sum(pool.map(get,range(1,152))))
