"""FRLG level-up learnsets, canonical growth tables, evolution conditions and EXP yields."""
import csv,json,re,pathlib,collections
ROOT=pathlib.Path(__file__).resolve().parents[1];RAW=ROOT/'data/raw'
def rows(n):
    with (RAW/(n+'.csv')).open(encoding='utf-8-sig')as f:return list(csv.DictReader(f))
species={int(r['id']):r for r in rows('pokemon_species')}
growth=collections.defaultdict(dict)
for r in rows('experience'):growth[int(r['growth_rate_id'])][int(r['level'])]=int(r['experience'])
learn=collections.defaultdict(list)
with (RAW/'pokemon_moves.csv').open(encoding='utf-8-sig')as f:
    for r in csv.DictReader(f):
        pid=int(r['pokemon_id'])
        if pid<=151 and r['version_group_id']=='7' and r['pokemon_move_method_id']=='1':
            learn[pid].append({'move':int(r['move_id']),'level':int(r['level']),'order':int(r['order'] or 0)})
for p in learn:learn[p].sort(key=lambda r:(r['level'],r['order'],r['move']))
evo=collections.defaultdict(list)
for r in rows('pokemon_evolution'):
    to=int(r['evolved_species_id']);parent=int(species[to]['evolves_from_species_id']or 0)
    if to<=151 and parent<=151 and parent and r['is_default']=='1' and int(r['version_group_id']or 0)<=7:
        condition={'to':to,'trigger':int(r['evolution_trigger_id']),'level':int(r['minimum_level']or 0),'item':int(r['trigger_item_id']or 0),'relativeStats':r['relative_physical_stats']}
        if condition not in evo[parent]:evo[parent].append(condition)
source=(RAW/'frlg_species_info.h').read_text()
yields={k:int(v)for k,v in re.findall(r'\[SPECIES_(\w+)\]\s*=\s*\{.*?\.expYield\s*=\s*(\d+)',source,re.S)}
pokemon={}
for r in rows('pokemon'):
    pid=int(r['id'])
    if pid>151:continue
    s=species[pid];key=r['identifier'].upper().replace('-','_')
    pokemon[pid]={'growth':int(s['growth_rate_id']),'parent':int(s['evolves_from_species_id']or 0),'chain':int(s['evolution_chain_id']),'legendary':s['is_legendary']=='1','mythical':s['is_mythical']=='1','baseExp':yields.get(key,int(r['base_experience']or 0)),'evolutions':evo[pid],'levelMoves':learn[pid]}
item_names={int(r['item_id']):r['name']for r in rows('item_names')if r['local_language_id']=='3'}
data={'basis':'파이어레드·리프그린','versionGroup':7,'pokemon':pokemon,'growth':growth,'items':item_names}
(ROOT/'data/progression.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
(ROOT/'data/progression.js').write_text('window.PROGRESSION_DATA = '+json.dumps(data,ensure_ascii=False)+';',encoding='utf-8')
assert all(p['levelMoves']for p in pokemon.values())
print('Prepared 151 FRLG level-up lists, six growth curves, original EXP yields and evolution conditions.')
for i in [1,4,7]:print(i,[m for m in pokemon[i]['levelMoves']if m['level']<=5])
