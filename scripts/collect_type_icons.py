"""Download existing Pokemon X/Y type badges from PokeAPI/sprites."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen

DEST = Path(__file__).resolve().parents[1] / 'assets' / 'types'
BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/'

def collect(type_id):
    with urlopen(BASE + str(type_id) + '.png', timeout=30) as response:
        data = response.read()
    if not data.startswith(b'\x89PNG\r\n\x1a\n'):
        raise ValueError('Expected a PNG type badge')
    (DEST / f'{type_id}.png').write_bytes(data)

if __name__ == '__main__':
    DEST.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(collect, range(1, 19)))
    print('Downloaded 18 existing type badges.')
