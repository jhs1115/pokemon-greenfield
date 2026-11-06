from pathlib import Path
import json,re,random,urllib.request,concurrent.futures
R=Path(__file__).resolve().parents[1]
def read(p):return (R/p).read_text(encoding='utf-8')
def write(p,s): (R/p).write_text(s,encoding='utf-8')
def edit(p,a,b):
 s=read(p)
 if a not in s:raise ValueError(p+': '+a[:60])
 write(p,s.replace(a,b))
D=json.loads(read('data/reference.json'));dex={p['key'].replace('-','').replace('.',''):p['id'] for p in D['pokemon']};moves={v['key'].replace('-',''):v['id'] for v in D['moves'].values()}
sourcepath=R/'supabase/.temp/trainer-parties.h'
if not sourcepath.exists():
 sourcepath.parent.mkdir(parents=True,exist_ok=True)
 urllib.request.urlretrieve('https://raw.githubusercontent.com/pret/pokefirered/master/src/data/trainer_parties.h',sourcepath)
source=read('supabase/.temp/trainer-parties.h')
bosses=[]
for name in ['Koga','Sabrina','Blaine']:
 block=source[source.index('sParty_Leader'+name+'[]'):];block=block[:block.index('};')]
 mons=re.findall(r'\.lvl = (\d+),\s*\.species = SPECIES_([A-Z_]+),\s*\.moves = \{([^}]+)\}',block)
 bosses.append({'enemy':[dex[p.lower().replace('_','')] for _,p,_ in mons],'moves':[[moves[m.strip().removeprefix('MOVE_').lower().replace('_','')] for m in ms.split(',') if m.strip()] for _,_,ms in mons]})
teams=[
 [[48,49,44,70],[111,102,114,46],[84,85,128,115],[24,42,89,97],[113,108,83,22],[147,148,55,119],[24,110,89,53],[112,105,127,123],[45,71,49,73]],
 [[64,93,97,122],[82,101,137,125],[67,106,107,57],[20,42,97,110],[65,94,124,49],[128,143,112,115],[103,97,80,121],[53,89,110,42,97],[123,127,125,126]],
 [[72,73,86,87],[77,78,58,59],[75,95,112,105],[24,89,110,97],[126,136,38,78],[103,114,123,127],[53,42,89,110,97],[139,141,142,131],[59,38,136,126,78]]]
add=[]
for ch,rows in enumerate(teams,5):
 for n,team in enumerate(rows,1):
  lv=34+(ch-5)*7+n//2
  s={'name':f'{ch}-{n}','chapter':ch,'enemy':team,'levels':[lv+(i%2) for i in range(len(team))],'theme':{5:'marsh',6:'city',7:'island'}[ch]}
  if (ch,n) in [(5,4),(5,7),(6,4),(6,8),(7,4),(7,7)]:s.update(rocket=True,trainer=True,portrait='rocket_grunt_m')
  add.append(s)
 boss=bosses[ch-5];boss.update(name=f'{ch}-10',chapter=ch,levels=[[39,40,39,42],[45,44,45,48],[49,48,49,53]][ch-5],leader=['독수','초련','강연'][ch-5],portrait=['leader_koga','leader_sabrina','leader_blaine'][ch-5],gym=['poison','psychic','fire'][ch-5],theme={5:'marsh',6:'city',7:'island'}[ch],trainer=True);add.append(boss)
write('late-stages.js','/* FRLG leader species/moves: pret/pokefirered trainer_parties.h. Levels follow this campaign. */\nwindow.STORY_STAGES.push(...'+json.dumps(add,ensure_ascii=False,separators=(',',':'))+');\n')
points=[[[8,77],[16,43],[31,23],[43,49],[32,76],[51,85],[66,61],[59,25],[78,17],[90,43]],[[8,23],[23,44],[15,79],[35,85],[47,60],[38,29],[60,17],[76,36],[68,70],[90,80]],[[8,79],[20,50],[34,77],[45,47],[37,16],[58,23],[65,53],[75,83],[86,58],[89,21]]]
write('late-maps.js','window.CHAPTER_MAPS.push(...'+json.dumps(points)+');\n')
# Draw maps in the same pixel palette as the earlier chapters, with straight route segments.
for ch,pts in enumerate(points,5):
 random.seed(ch*99);bg={5:'#9bb69a',6:'#adbba8',7:'#b3c698'}[ch];svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="620" viewBox="0 0 1000 620" shape-rendering="crispEdges"><rect width="1000" height="620" fill="{bg}"/>']
 if ch==5:svg+=['<path d="M0 180H190V220H260V320H170V390H0ZM610 0H710V130H790V220H1000V310H750V190H650Z" fill="#7fabb1"/><path d="M0 198H158M12 351H125M805 242H970" stroke="#b3d0ca" stroke-width="5"/>']
 if ch==6:
  for x,y in [(80,40),(420,40),(750,70),(80,340),(440,380),(790,370)]:svg+=[f'<rect x="{x}" y="{y}" width="120" height="100" fill="#7d8f8b"/><rect x="{x-8}" y="{y-12}" width="136" height="24" fill="#5a757a"/>'+''.join(f'<rect x="{x+16+i*30}" y="{y+25+j*35}" width="16" height="20" fill="#d7e7c4"/>' for i in range(3) for j in range(2))]
 if ch==7:svg+=['<path d="M0 0H1000V60H940V100H820V75H650V110H480V60H300V90H170V55H0ZM0 545H140V510H310V570H500V520H690V560H850V510H1000V620H0Z" fill="#74b3bf"/><path d="M0 42H140M800 29H980M10 590H160M640 592H970" stroke="#cfdfc2" stroke-width="6"/><path d="M430 130L510 20L590 130Z" fill="#748078"/><path d="M490 47L510 20L531 47Z" fill="#ddd4b1"/>']
 route=' '.join(('M' if i==0 else 'L')+f'{x*10} {y*6.2:g}' for i,(x,y) in enumerate(pts))
 svg +=[f'<path d="{route}" fill="none" stroke="#79906b" stroke-width="38" stroke-linejoin="round"/><path d="{route}" fill="none" stroke="#e5d8ad" stroke-width="27" stroke-linejoin="round"/><path d="{route}" fill="none" stroke="#f4eac8" stroke-width="3" stroke-dasharray="4 13"/>']
 for _ in range(75):
  x,y=random.randrange(15,985),random.randrange(20,605)
  if any(abs(x-px*10)<48 and abs(y-py*6.2)<45 for px,py in pts):continue
  if ch!=6:svg+=[f'<g transform="translate({x} {y})"><rect x="-4" y="0" width="8" height="18" fill="#827956"/><path d="M-19 0H19V-16H12V-27H-12V-16H-19Z" fill="#4e7960"/><path d="M-13-12H-3V-23H8V-27H-12V-16H-13Z" fill="#78a078"/></g>']
  else:svg+=[f'<rect x="{x}" y="{y}" width="8" height="8" fill="#8a9f88"/>']
 x,y=pts[-1];svg+=[f'<g transform="translate({x*10} {y*6.2-12:g})"><rect x="-40" y="-30" width="80" height="55" fill="#eee5c9"/><path d="M-48-30H48L33-55H-33Z" fill="{["#7e688b","#7c7a9c","#ac795d"][ch-5]}"/><rect x="-10" y="0" width="20" height="25" fill="#53685e"/></g></svg>']
 write(f'assets/world/chapter-{ch}.svg',''.join(svg))

def scene(title,bg,npc,lines):return {'title':title,'backdrop':bg,'npc':npc,'lines':[dict(speaker=s,text=t,**(extra[0] if extra else {})) for s,t,*extra in lines]}
scenes={
'opening':scene('태초마을 연구소','lab','oak',[
 ('oak','왔구나. 여행을 떠나고 싶다고 했지?'),('player','네. 포켓몬과 함께 리그에 도전하고 싶어요.'),('oak','리그에 가려면 체육관 배지 여덟 개가 필요하단다. 먼저 회색시티로 가 보렴.'),('player','그전에 함께할 포켓몬을 골라도 될까요?'),('oak','물론이지. 파이리, 꼬부기, 이상해씨 중에서 골라 보렴.',{'choice':'starter'}),('oak','{partner}로 정했구나. 자, 여행 경비도 챙겨 가렴.'),('player','감사합니다. 잘 다녀올게요.'),('oak','길에서는 포켓몬의 상태를 잘 살피렴. 첫 배지를 얻으면 마을의 스카우터도 찾아가 보고.'),('narrator','{partner}와 함께 마을 밖으로 나섰다.',{'backdrop':'road'})]),
'before-0':scene('첫 배틀','road',None,[('narrator','풀숲에서 야생 포켓몬이 나타났다.'),('player','{partner}, 먼저 자리를 잡자. 너무 가까이 가지는 말고.')]),
'before-3':scene('숲길에서','road','brock',[('brock','앞쪽 길은 비 때문에 미끄러워. 왼쪽으로 돌아가는 게 좋아.'),('player','고맙습니다. 회색시티로 가는 길인가요?'),('brock','맞아. 나는 웅이야. 체육관에서 다시 보자.')]),
'before-11':scene('블루시티의 강가','river','misty',[('misty','거긴 물이 깊어. 이쪽으로 와.'),('player','고마워. 체육관에 가는 중이야.'),('misty','그럼 곧 다시 만나겠네. 난 이슬이야. 강을 건너면 바로 블루시티야.')]),
'ambush':scene('로켓단','river','rocket',[('narrator','길가에 포켓몬이 든 우리가 놓여 있다.'),('rocket','그건 우리 거다. 손대지 마.'),('player','포켓몬들이 다쳤잖아요. 풀어 주세요.'),('rocket','로켓단 일에 끼어들지 마라!')]),
'before-20':scene('갈색시티 항구','harbor','surge',[('surge','항구 창고는 당분간 접근 금지다. 포켓몬이 사라졌다는 신고가 들어왔어.'),('player','강가에서 로켓단을 만났어요. 여기도 그 사람들일까요?'),('surge','확인해 보지. 나는 마티스, 이곳 관장이야. 수상한 걸 보면 알려 다오.')]),
'before-22':scene('창고 앞','harbor','rocket',[('player','상자 안에 포켓몬이 있죠? 문을 열어요.'),('rocket','또 너냐. 운송을 방해하면 가만두지 않겠다.')]),
'before-27':scene('운송 기록','harbor','rocket',[('narrator','상자에 무지개시티로 향하는 운송장이 붙어 있다.'),('rocket','그건 내려놔! 연구소에 보내야 하는 물건이다.'),('player','포켓몬을 어디로 데려가는 거죠?')]),
'before-31':scene('무지개시티의 정원','garden','erika',[('erika','항구에서 온 짐을 찾으시나요? 검은 옷을 입은 사람들이 오락장으로 가져가더군요.'),('player','로켓단을 찾고 있어요. 포켓몬을 빼앗아 가고 있거든요.'),('erika','저는 민화입니다. 정원에서 사라진 포켓몬도 있어요. 함께 확인해 보지요.')]),
'before-37':scene('로켓단 거점','hideout','rocket',[('narrator','오락장 지하에서 갇힌 포켓몬들을 발견했다.'),('rocket','여길 어떻게 찾았지? 보스의 연구를 방해할 셈이냐?'),('player','우리를 열어요. 포켓몬들은 데려갈 거예요.')]),
'after-37':scene('남은 기록','hideout','erika',[('erika','갇혀 있던 포켓몬들은 모두 무사해요.'),('player','이 기록에 뮤츠라는 이름이 있어요. 통제 장치를 만든다고 적혀 있는데요.'),('erika','오박사님께 보내 확인해 볼게요. 다른 거점도 있는 듯해요.')]),
'scout':scene('스카우터','shop','scout',[('scout','오박사님께 연락받았어요. 함께 여행할 포켓몬을 찾고 있죠?'),('player','네. 어떤 포켓몬들이 있나요?'),('scout','여기서 만나 보세요. 첫 만남 비용은 박사님이 맡겨 주셨어요.')]),
'manage':scene('출발 준비','lounge',None,[('player','다음에 나갈 친구들과 도구를 확인하자.')]),
'training':scene('연습장','training',None,[('player','다음 길에 가기 전에 기술을 정리해 두자.')]),
'before-40':scene('연분홍시티로','river','koga',[('koga','사파리에서 포켓몬을 잡아가는 자들이 있다. 순찰 중이지.'),('player','로켓단이라면 저도 찾고 있어요.'),('koga','흔적을 발견하면 알려 다오. 나는 독수, 연분홍체육관의 관장이다.')]),
'before-43':scene('사파리 외곽','river','rocket',[('rocket','잡은 포켓몬은 도시로 보낸다. 상처 내지 말라고 했잖아.'),('player','이번에도 연구에 쓰려는 거죠? 여기서 멈춰요.')]),
'before-46':scene('막힌 운송로','river','rocket',[('rocket','실프의 장치만 있으면 그 녀석도 잡아둘 수 있다는데… 또 너냐!'),('player','장치는 어디에 있죠?')]),
'after-46':scene('도시로 이어지는 단서','river','koga',[('koga','운송차는 노랑시티로 향했다. 그쪽에도 소식을 전해 두지.'),('player','알겠습니다. 먼저 체육관에 도전하고 출발할게요.')]),
'before-50':scene('노랑시티','harbor','sabrina',[('sabrina','실프주식회사에 낯선 사람들이 들어갔어. 직원들도 밖으로 나오지 못하고 있어.'),('player','로켓단이 장치를 찾고 있어요. 그 건물에 있는 것 같아요.'),('sabrina','정문은 내가 지킬게. 안에 있는 사람들을 부탁해.')]),
'before-53':scene('실프주식회사','hideout','rocket',[('rocket','통제 장치의 설계도만 챙기면 된다. 서둘러!'),('player','그 장치는 가져갈 수 없어요.')]),
'before-57':scene('중앙 제어실','hideout','rocket',[('rocket','설계도는 이미 홍련섬에 보냈다. 네가 여기서 뭘 해도 늦었어.'),('player','우선 직원들부터 풀어 주세요.')]),
'after-57':scene('멈춘 장치','harbor','sabrina',[('sabrina','직원들은 모두 나왔어. 장치도 멈췄고.'),('player','홍련섬으로 보낸 설계도는 남아 있어요.'),('sabrina','그곳 연구를 알던 사람이 있어. 강연 관장을 찾아가 봐.')]),
'before-60':scene('홍련섬','river','blaine',[('blaine','초련에게 연락받았다. 뮤츠의 기록을 찾고 있다지?'),('player','로켓단이 통제 장치를 만들고 있어요.'),('blaine','옛 저택에 연구 일지가 남아 있다. 나도 함께 살펴보마.')]),
'before-63':scene('폐허가 된 저택','hideout','rocket',[('rocket','남은 자료는 전부 회수해. 보스가 직접 확인하신다.'),('player','비주기가 시킨 일이군요. 그 자료를 보여 주세요.')]),
'before-66':scene('연구실의 문','hideout','rocket',[('rocket','그 포켓몬은 우리 힘으로 다룰 수 있어. 보스가 증명하실 거다.'),('player','그래서 다른 포켓몬들까지 잡아간 건가요? 여기서 끝내요.')]),
'after-66':scene('연구 일지','hideout','blaine',[('blaine','뮤를 바탕으로 새로운 포켓몬을 만들었다는 기록이다. 이름은 뮤츠.'),('player','로켓단은 그 힘을 이용하려는 거군요.'),('blaine','현재 계획은 비주기만 알겠지. 남은 단서는 상록시티 쪽이다.')]),
'after-69':scene('다음 목적지','river','blaine',[('blaine','볼케이노배지다. 이제 배지는 하나 남았구나.'),('player','상록시티로 갈게요. 비주기도 찾아야 해요.'),('blaine','기록은 오박사에게 보내 두마. 조심해서 가거라.')]),
'secret-marsh':scene('사파리의 분실물','river','koga',[('narrator','풀숲 사이에서 작은 가방을 발견했다.'),('koga','순찰대 가방이군. 찾아줘서 고맙다. 안의 시몬열매는 가져가도 좋아.')]),
'secret-journal':scene('책장 뒤의 쪽지','hideout','blaine',[('narrator','책장 뒤에 연구원이 남긴 쪽지가 끼워져 있다.'),('blaine','통제 실험은 실패했다… 뮤츠가 스스로 탈출한 모양이군. 이건 오박사에게 전하마. 옆의 불꽃의돌은 네가 쓰렴.')]),
}
gyms={
'brock':[('brock','숲길에서 만났지. 회색체육관에 온 걸 환영해.'),('player','배지에 도전하러 왔어요.'),('brock','좋아. 바위 포켓몬들을 상대할 준비는 됐겠지?')],
'misty':[('misty','강을 무사히 건너왔네! 이제 정식으로 겨뤄 볼까?'),('player','응. 준비됐어.'),('misty','블루체육관의 이슬이야. 시작하자!')],
'surge':[('surge','항구 일은 고맙다. 오늘은 도전자로 왔군.'),('player','네. 전력으로 부탁드려요.'),('surge','좋다! 갈색체육관의 전격을 보여 주마.')],
'erika':[('erika','포켓몬들을 구해 주셔서 감사해요. 오늘은 배지를 걸고 겨루어요.'),('player','잘 부탁드립니다.'),('erika','무지개체육관의 민화, 도전을 받겠습니다.')],
'koga':[('koga','사파리 일은 잘 처리됐어. 이제 네 실력을 보자.'),('player','독타입에 대비해 왔어요.'),('koga','그럼 시작하지. 연분홍체육관의 독수다.')],
'sabrina':[('sabrina','도시를 도와줘서 고마워. 이번엔 우리 차례네.'),('player','배지에 도전할게.'),('sabrina','노랑체육관의 초련이야. 준비됐어.')],
'blaine':[('blaine','저택에서 수고했다. 출발 전에 배지를 얻어 가야지.'),('player','네. 준비됐습니다.'),('blaine','홍련체육관의 강연이다! 뜨거운 승부를 해 보자.')],}
cast={'oak':('오박사','oak'),'brock':('웅이','leader_brock'),'misty':('이슬이','leader_misty'),'surge':('마티스','leader_lt_surge'),'erika':('민화','leader_erika'),'koga':('독수','leader_koga'),'sabrina':('초련','leader_sabrina'),'blaine':('강연','leader_blaine'),'rocket':('로켓단 조무래기','rocket_grunt_m'),'scout':('스카우터','scout-ranger')}
book={'scenes':scenes,'gymLines':gyms,'cast':{k:{'name':n,'src':f+'.png'} for k,(n,f) in cast.items()}}
write('story-scenes.js',"/* Dialogue stays in-world; contextual controls live in the battle UI. */\n(function(root){root.KANTO_STORY="+json.dumps(book,ensure_ascii=False,indent=2)+";if(typeof module==='object')module.exports=root.KANTO_STORY;})(typeof window==='object'?window:globalThis);\n")
# Primary game sprites and existing PokeAPI item pixels, no generated Pokemon art.
downloads={f'assets/trainers/leader_{name}.png':f'https://raw.githubusercontent.com/pret/pokefirered/master/graphics/trainers/front_pics/leader_{name}_front_pic.png' for name in ['koga','sabrina','blaine']}
for key in ['lonely','brave','adamant','naughty','bold','relaxed','impish','lax','timid','hasty','serious','jolly','naive','modest','mild','quiet','rash','calm','gentle','sassy','careful']:
 downloads[f'assets/items/{key}-mint.png']=f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/{key}-mint.png'
def fetch(pair):
 path,url=pair
 if not (R/path).exists():
  with urllib.request.urlopen(url,timeout=35) as r:data=r.read()
  if not data.startswith(b'\x89PNG'):raise ValueError(url)
  (R/path).write_bytes(data)
 return path
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: print('Downloaded',len(list(pool.map(fetch,downloads.items()))),'sprites')
print('30 encounters, three routes, three gym teams and concise story written')
