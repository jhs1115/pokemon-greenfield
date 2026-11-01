from pathlib import Path
import random
random.seed(40)
W,H=1000,620
s=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="620" viewBox="0 0 1000 620" shape-rendering="crispEdges">','<defs><pattern id="grass" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="#99c77a"/><path d="M4 9h3v4H4zM22 23h3v4h-3zM7 7h2v4H7z" fill="#7aaf61"/><path d="M17 3h5v2h-5zM2 27h6v2H2z" fill="#afd58d"/></pattern><g id="tree"><path d="M-5 7h10v18H-5z" fill="#7d6045"/><path d="M-19 0h38v9h-38z" fill="#4d7749"/><path d="M-25-16h50V1h-50zM-19-30h38v14h-38zM-11-39h22v9h-22z" fill="#367451"/><path d="M-17-22h10v8h-10zM-10-33h13v8h-13zM-21-8h11v6h-11z" fill="#569660"/><path d="M16-22h5v18h-5zM4-31h7v6H4z" fill="#285b43"/></g></defs><rect width="1000" height="620" fill="url(#grass)"/>']
# Pond and water highlights.
s+=['<path d="M22 43h166v20h34v33h-17v30H53v-17H22z" fill="#5f9986"/><path d="M30 40h155v20h30v28h-18v29H59v-17H30z" fill="#87ccd0"/>']
for x,y in [(57,67),(119,90),(157,65),(82,100)]:s.append(f'<path d="M{x} {y}h28v3h-28z" fill="#c7eff0"/>')
# Clumps of tall grass and flowers.
for _ in range(120):
 x=random.randrange(30,965);y=random.randrange(32,595)
 s.append(f'<path d="M{x} {y}v-8h3v5h3v-10h3v13z" fill="{random.choice(["#72a65c","#6da15a","#8bba6b"])}"/>')
for _ in range(65):
 x=random.randrange(20,980);y=random.randrange(25,600);c=random.choice(['#f5e5a0','#f8c6a7','#e7ecda'])
 s.append(f'<path d="M{x} {y}h3v6h-3z" fill="#6c9e58"/><path d="M{x-2} {y-3}h7v4h-7z" fill="{c}"/>')
# Path with winding shape matching the user's sketch.
path='M80 496 L200 298 L350 546 L430 335 L440 100 L600 93 L660 298 L710 490 L840 446 L910 242'
s.append(f'<path d="{path}" stroke="#80a963" stroke-width="44" stroke-linejoin="round" fill="none"/>')
s.append(f'<path d="{path}" stroke="#d2c492" stroke-width="30" stroke-linejoin="round" fill="none"/>')
s.append(f'<path d="{path}" stroke="#e1d3a3" stroke-width="20" stroke-linejoin="round" fill="none"/>')
# Forest perimeter, arranged clear of route nodes.
for y in [25,615]:
 for x in range(0,1030,43):s.append(f'<use href="#tree" x="{x}" y="{y}"/>')
for x in [0,1000]:
 for y in range(72,610,46):s.append(f'<use href="#tree" x="{x}" y="{y}"/>')
for x,y in [(295,70),(325,112),(270,118),(90,242),(72,286),(537,455),(577,470),(510,490),(806,170),(846,178),(811,209),(155,570),(200,580),(920,526),(950,560),(310,390),(280,365),(527,230)]:s.append(f'<use href="#tree" x="{x}" y="{y}"/>')
# Little starting house.
s+=['<path d="M49 437h62v45H49z" fill="#f4e1b2"/><path d="M40 436h80v-12h-10v-12H52v12H40z" fill="#cf805e"/><path d="M56 447h13v13H56zM91 447h13v13H91z" fill="#83b6bd"/><path d="M76 458h12v24H76z" fill="#8c6a4d"/>']
# Gym at the end.
s+=['<path d="M864 159h93v75h-93z" fill="#e6ddbc"/><path d="M852 160h117v-15h-15v-16h-86v16h-16z" fill="#718d98"/><path d="M864 161h93v9h-93z" fill="#b4b899"/><path d="M878 183h16v22h-16zM928 183h16v22h-16z" fill="#a2c3c5"/><path d="M902 203h20v31h-20z" fill="#786d57"/><path d="M899 177h27v17h-27z" fill="#baa878"/><path d="M907 181h11v9h-11z" fill="#f4e5a4"/>']
s.append('</svg>');Path('assets/world').mkdir(exist_ok=True);Path('assets/world/kanto-route.svg').write_text(''.join(s),encoding='utf-8')
p=Path('menus.js');s=p.read_text(encoding='utf-8');start=s.index('function renderStages(){');end=s.index('function pokemonCard(',start)
s=s[:start]+'''const ROUTE_POINTS=[[8,80],[20,48],[35,88],[43,54],[44,16],[60,15],[66,48],[71,79],[84,72],[91,39]];
let selectedStage=0;
function renderStages(){
 if(!G.unlocked(game,selectedStage))selectedStage=Math.max(0,game.clears.findIndex(n=>!n));const c=chapters[selectedStage];
 $('#app').innerHTML=`<div class="menu-shell route-shell">${menuHeader('스토리 모드')}<div class="route-map" role="group" aria-label="풀숲 모험 지도">${chapters.map((c,i)=>`<button class="route-node ${game.clears[i]?'cleared':''} ${i===selectedStage?'selected':''} ${c.leader?'gym-node':''}" style="left:${ROUTE_POINTS[i][0]}%;top:${ROUTE_POINTS[i][1]}%" data-route-stage="${i}" aria-label="${c.name}${c.leader?' 체육관 웅이':''}${game.clears[i]?' 클리어':''}" ${G.unlocked(game,i)?'':'disabled'}><span>${G.unlocked(game,i)?c.leader?'◆':game.clears[i]?'✓':i+1:'·'}</span><b>${c.name}</b></button>`).join('')}<span class="map-next-chapter">2-1 · 준비중</span></div><div class="route-detail"><div><h2>${c.name}${c.leader?' · 웅이':''}</h2><span class="route-reward">${game.clears[selectedStage]?'반복 5회마다 1 COIN':`첫 클리어 ${selectedStage===9?3:1} COIN`}</span></div><div class="route-enemies">${c.enemy.map((id,i)=>`<div><img src="${img(id)}" alt="${species(id).name}"><small>Lv.${c.levels[i]}</small></div>`).join('')}</div><button id="route-start" class="primary">${c.leader?'체육관 도전':'출발'} →</button></div></div>`;
 bindMenuHeader();document.querySelectorAll('[data-route-stage]').forEach(btn=>btn.onclick=()=>{selectedStage=+btn.dataset.routeStage;renderStages();});$('#route-start').onclick=()=>{stage=selectedStage;if(G.unlocked(game,stage))beginStage();};
}
''' + s[end:];p.write_text(s,encoding='utf-8')
