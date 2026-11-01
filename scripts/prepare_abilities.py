import urllib.request,csv,json
from pathlib import Path
base='https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/'
for name in ['pokemon_abilities','abilities','ability_names','ability_flavor_text']:
 p=Path('data/raw/'+name+'.csv')
 if not p.exists():urllib.request.urlretrieve(base+name+'.csv',p)
def rows(n):return list(csv.DictReader(Path('data/raw/'+n+'.csv').open(encoding='utf-8-sig',newline='')))
names={int(r['ability_id']):r['name'] for r in rows('ability_names') if r['local_language_id']=='3'}
abilities={int(r['id']):{'key':r['identifier'],'name':names.get(int(r['id']),r['identifier'])} for r in rows('abilities')}
latest={}
for r in rows('ability_flavor_text'):
 if r['language_id']=='3':
  i=int(r['ability_id']);v=int(r['version_group_id'])
  if i not in latest or v>latest[i][0]:latest[i]=(v,' '.join(r['flavor_text'].split()))
for i,v in latest.items():abilities[i]['description']=v[1]
pokemon={}
for r in rows('pokemon_abilities'):
 i=int(r['pokemon_id'])
 if i<=151:pokemon.setdefault(i,[]).append({'id':int(r['ability_id']),'hidden':r['is_hidden']=='1','slot':int(r['slot'])})
for v in pokemon.values():v.sort(key=lambda a:a['slot'])
data={'abilities':abilities,'pokemon':pokemon}
Path('data/abilities.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
Path('data/abilities.js').write_text('window.ABILITY_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
Path('assets/fonts').mkdir(exist_ok=True)
urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/ofl/jua/Jua-Regular.ttf','assets/fonts/Jua-Regular.ttf')
urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/ofl/jua/OFL.txt','assets/fonts/OFL.txt')
# Original FireRed/LeafGreen female trainer portrait.
url='https://api.github.com/repos/pret/pokefirered/contents/graphics/trainers/front_pics'
entries=json.load(urllib.request.urlopen(url));print([e['name'] for e in entries if any(k in e['name'] for k in ['leaf','lass','beauty','female'])])
