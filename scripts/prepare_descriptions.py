import urllib.request,csv,json
from pathlib import Path
path=Path('data/raw/move_flavor_text.csv')
if not path.exists(): urllib.request.urlretrieve('https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/move_flavor_text.csv',path)
rows={}
with path.open(encoding='utf-8',newline='') as f:
 for r in csv.DictReader(f):
  if r['language_id']=='3':
   k=int(r['move_id']);v=int(r['version_group_id'])
   if k not in rows or v>rows[k][0]: rows[k]=(v,' '.join(r['flavor_text'].split()))
out={k:v[1] for k,v in rows.items()}
# Add explicit activation conditions to the concise in-game descriptions.
for k,v in json.loads(Path('data/reference.json').read_text(encoding='utf-8')).get('moves',{}).items():
 if v['key']=='sucker-punch':out[int(k)]='상대가 공격 기술을 선택했고 아직 행동하지 않았을 때만 먼저 공격한다. 상대가 변화 기술을 쓰거나 먼저 행동했다면 실패한다.'
 if v['key']=='upper-hand':out[int(k)]='상대가 우선도 +1 이상인 공격 기술을 사용하려고 할 때만 선공해 풀죽게 한다. 조건에 맞지 않거나 상대가 먼저 행동했다면 실패한다.'
Path('data/move-descriptions.js').write_text('window.MOVE_DESCRIPTIONS='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
print('Korean descriptions:',len(out))
