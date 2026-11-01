"""Build current per-species Gen 1 learnsets from game-versioned PokeAPI rows."""
import csv,json,pathlib,collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/'data/raw'
def read(name):
    with (RAW/(name+'.csv')).open(encoding='utf-8-sig') as f:return list(csv.DictReader(f))
groups={int(r['id']):r for r in read('version_groups')}
parents={int(r['id']):int(r['evolves_from_species_id'] or 0) for r in read('pokemon_species')}
wanted=set(range(1,152))
for pid in range(1,152):
    ancestor=parents[pid]
    while ancestor:wanted.add(ancestor);ancestor=parents[ancestor]
by_species=collections.defaultdict(lambda:collections.defaultdict(set))
with (RAW/'pokemon_moves.csv').open(encoding='utf-8-sig') as f:
    for r in csv.DictReader(f):
        pid=int(r['pokemon_id'])
        if pid in wanted:by_species[pid][int(r['version_group_id'])].add(int(r['move_id']))
game_names={23:'브릴리언트 다이아몬드·샤이닝 펄',24:'레전드 아르세우스',25:'스칼렛·바이올렛',26:'벽록의 가면',27:'남청의 원반',30:'레전드 Z-A',31:'메가 차원',32:'챔피언스'}
learnsets={}
for pid in range(1,152):
    group=max(by_species[pid],key=lambda g:int(groups[g]['order']))
    moves=set(by_species[pid][group]);ancestor=parents[pid]
    while ancestor:
        moves.update(by_species[ancestor].get(group,set()));ancestor=parents[ancestor]
    learnsets[pid]={'version':group,'versionName':game_names.get(group,groups[group]['identifier']),'moves':sorted(moves)}
changes=collections.defaultdict(list)
for r in read('move_meta_stat_changes'):changes[int(r['move_id'])].append({'stat':int(r['stat_id']),'change':int(r['change'])})
meta={int(r['move_id']):{'category':int(r['meta_category_id']),'ailment':int(r['meta_ailment_id']),'drain':int(r['drain']),'healing':int(r['healing']),'minHits':int(r['min_hits'] or 1),'maxHits':int(r['max_hits'] or 1),'statChance':int(r['stat_chance']),'ailmentChance':int(r['ailment_chance']),'statChanges':changes[int(r['move_id'])]} for r in read('move_meta')}
data={'source':'https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv','basis':'Latest available version group by chronological order for each species, including pre-evolution moves in the same group. All acquisition methods included.','learnsets':learnsets,'meta':meta}
(ROOT/'data/training.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
(ROOT/'data/training.js').write_text('window.TRAINING_DATA = '+json.dumps(data,ensure_ascii=False)+';',encoding='utf-8')
print('151 species; version coverage:',dict(collections.Counter(r['versionName'] for r in learnsets.values())))
print('Distinct teachable moves:',len(set(m for r in learnsets.values() for m in r['moves'])))
assert all(learnsets[i]['moves'] for i in range(1,152))
