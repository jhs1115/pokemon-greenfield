"""Download reproducible PokéAPI reference data and existing sprite assets."""
import concurrent.futures, csv, io, json, pathlib, urllib.request, time
ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / 'data' / 'raw'
RAW.mkdir(parents=True, exist_ok=True)
SPRITES = ROOT / 'assets' / 'pokemon'
SPRITES.mkdir(parents=True, exist_ok=True)
BASE = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/'
FILES = ['pokemon', 'pokemon_species', 'pokemon_species_names', 'pokemon_stats', 'pokemon_types', 'types', 'type_names', 'type_efficacy', 'moves', 'move_names', 'abilities', 'ability_names', 'pokemon_abilities', 'pokemon_evolution', 'evolution_chains', 'pokemon_moves']
def download(pair):
    url, path = pair
    if path.exists() and path.stat().st_size: return
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=90) as response: path.write_bytes(response.read())
            return
        except Exception:
            if attempt == 2: raise
            time.sleep(1)
def rows(name):
    return list(csv.DictReader(io.StringIO((RAW / (name + '.csv')).read_text(encoding='utf-8-sig'))))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    list(pool.map(download, [(BASE + name + '.csv', RAW / (name + '.csv')) for name in FILES]))
print('Reference tables downloaded.', flush=True)
names = {int(r['pokemon_species_id']): r['name'] for r in rows('pokemon_species_names') if r['local_language_id']=='3'}
types = {int(r['type_id']):r['name'] for r in rows('type_names') if r['local_language_id']=='3'}
move_names = {int(r['move_id']):r['name'] for r in rows('move_names') if r['local_language_id']=='3'}
stats, ptypes = {}, {}
for r in rows('pokemon_stats'): stats.setdefault(int(r['pokemon_id']), {})[int(r['stat_id'])] = int(r['base_stat'])
for r in rows('pokemon_types'): ptypes.setdefault(int(r['pokemon_id']), []).append(int(r['type_id']))
pokemon = [{ 'id':int(r['id']), 'key':r['identifier'], 'name':names.get(int(r['species_id']),r['identifier']), 'types':ptypes.get(int(r['id']), []), 'stats':stats.get(int(r['id']),{}), 'height':int(r['height']), 'weight':int(r['weight'])} for r in rows('pokemon')]
moves = {int(r['id']):{'id':int(r['id']), 'name':move_names.get(int(r['id']),r['identifier']), 'key':r['identifier'], 'type':int(r['type_id']), 'power':int(r['power'] or 0), 'accuracy':int(r['accuracy'] or 100), 'pp':int(r['pp'] or 0), 'priority':int(r['priority']), 'damageClass':int(r['damage_class_id']), 'target':int(r['target_id']), 'effect':int(r['effect_id'] or 0)} for r in rows('moves')}
efficacy = {r['damage_type_id']+'-'+r['target_type_id']:int(r['damage_factor'])/100 for r in rows('type_efficacy')}
learnsets = {}
for r in rows('pokemon_moves'):
    pid=int(r['pokemon_id'])
    if pid <= 151: learnsets.setdefault(pid,set()).add(int(r['move_id']))
data = {'source':'https://github.com/PokeAPI/pokeapi', 'collectedAt':time.strftime('%Y-%m-%d'), 'pokemon':pokemon, 'types':types, 'moves':moves, 'efficacy':efficacy, 'learnsets':{k:sorted(v) for k,v in learnsets.items()}}
(ROOT/'data'/'reference.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
(ROOT/'data'/'reference.js').write_text('window.POKE_DATA = '+json.dumps(data,ensure_ascii=False)+';',encoding='utf-8')
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    list(pool.map(download, [('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+str(i)+'.png',SPRITES/(str(i)+'.png')) for i in range(1,152)]))
print(f'Collected {len(pokemon)} Pokemon entries, {len(moves)} moves, {len(types)} type names, {len(efficacy)} type matchups and 151 original sprites.',flush=True)
