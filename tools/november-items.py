from pathlib import Path
import json,re
p=Path('items.js');s=p.read_text(encoding='utf8');idx=s.index("'exp-share'");s=s[:idx]+''.join("'%s':{name:'%s',description:'알맞은 포켓몬에게 주면 진화한다. 사용하면 사라진다.',stone:%d},\n"%x for x in [('moon-stone','달의돌',81),('fire-stone','불꽃의돌',82),('thunder-stone','천둥의돌',83),('water-stone','물의돌',84),('leaf-stone','리프의돌',85)])+s[idx:];p.write_text(s,encoding='utf8')
p=Path('game-state.js');s=p.read_text(encoding='utf8');s=s.replace("...(chapter>=3?['leftovers']:[])","...(chapter>=3?['leftovers','moon-stone','fire-stone','thunder-stone','water-stone','leaf-stone']:[])")
s=s.replace("const old=state.heldItems[id]||null;", "if(key&&ITEMS[key]?.stone){const rule=info(id).evolutions.find(e=>e.trigger===3&&e.item===ITEMS[key].stone);if(!rule)throw new Error('이 포켓몬에게 사용할 수 없는 진화의 돌입니다');return evolve(state,id,rule.to); }const old=state.heldItems[id]||null;")
needle="throw new Error('진화 조건을 만족하지 않습니다');state.owned"
s=s.replace(needle,"throw new Error('진화 조건을 만족하지 않습니다');if(state.owned.includes(next))throw new Error('이미 보유한 진화형입니다');if(rule.trigger===3){const key=Object.keys(ITEMS).find(k=>ITEMS[k].stone===rule.item);if(!key||!(state.inventory[key]>0))throw new Error('해당 진화의 돌이 필요합니다. 3장부터 획득할 수 있습니다');state.inventory[key]--;}state.owned")
p.write_text(s,encoding='utf8')
p=Path('campaign-ui.js');s=p.read_text(encoding='utf8');s=s.replace("Object.keys(window.ITEM_DATA).filter(k=>game.inventory[k]>0||k===key)","Object.keys(window.ITEM_DATA).filter(k=>(game.inventory[k]>0||k===key)&&(!window.ITEM_DATA[k].stone||P.pokemon[id].evolutions.some(e=>e.item===window.ITEM_DATA[k].stone)))")
s=s.replace('G.equipItem(game,+el.dataset.heldMon,el.value||null);saveGame();renderManagement();',"const from=+el.dataset.heldMon,next=G.equipItem(game,from,el.value||null);savedTeam=game.team;saveGame();renderManagement();if(next)queueEvolution(from,next);")
p.write_text(s,encoding='utf8')
p=Path('menus.js');s=p.read_text(encoding='utf8');s=s.replace("e.level?`<span>","e.trigger===3?`<span>${P.items[e.item]||'진화의 돌'} · 도구에서 선택${game.clears[19]?'':' (3장부터 획득)'}</span>`:e.level?`<span>");p.write_text(s,encoding='utf8')
# Read the original FRLG trainer party source, rather than guessing move lists.
p=Path('stages.js');s=p.read_text(encoding='utf8');src=Path('data/raw/frlg-trainer-parties.h').read_text(encoding='utf8');d=json.loads(Path('data/reference.json').read_text(encoding='utf8'));norm=lambda x:re.sub('[^a-z0-9]','',x.lower());moves={norm(m['key']):m['id'] for m in d['moves'].values()};arr=json.loads(s.split('=',1)[1].split(';',1)[0]);
for i,name in [(9,'Brock'),(19,'Misty'),(29,'LtSurge'),(39,'Erika')]:
 block=src.split('sParty_Leader'+name+'[] = {',1)[1].split('\n};',1)[0];arr[i]['moves']=[[moves[norm(m)] for m in row.split(', ') if m!='MOVE_NONE'] for row in re.findall(r'\.moves = \{([^}]+)\}',block) for row in [row.replace('MOVE_','')]]
 # MOVE_NONE has already lost its prefix.
 arr[i]['moves']=[[v for v in row] for row in arr[i]['moves']]
s='window.STORY_STAGES='+json.dumps(arr,ensure_ascii=False,separators=(',',':'))+';\n'+s.split(';',1)[1].strip();p.write_text(s,encoding='utf8')
