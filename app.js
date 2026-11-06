'use strict';
const D=window.POKE_DATA,E=window.BattleEngine,$=s=>document.querySelector(s);
const T=window.TRAINING_DATA,P=window.PROGRESSION_DATA,A=window.ABILITY_DATA,G=window.createGameModel(D,T,P,A);
const roster=Array.from({length:151},(_,i)=>i+1);
const sets={25:[84,98,85,21],1:[22,33,75,36],4:[52,10,53,163],7:[55,33,44,57],133:[98,33,44,129],16:[16,98,33,17],37:[52,98,53,126],43:[71,51,72,188],54:[55,10,93,57],63:[93,94,247,129],58:[52,44,98,172],19:[98,33,44,158]};
const chapters=window.STORY_STAGES;
const PROFILE_NAME=typeof location!=='undefined'?(new URLSearchParams(location.search).get('profile')||''):'';
const QA_PROFILE=/^qa(?:-[a-z]+)*$/.test(PROFILE_NAME);
const SAVE_PREFIX=QA_PROFILE?'greenfield-'+PROFILE_NAME+'-slot-v2-':'greenfield-slot-v2-';
let activeSlot=null,game=G.normalize(),savedTeam=game.team,progress=0;
let view='title',stage=0,battle,selectedTeam=[],token=0;
window.getBattlePlaybackRate=()=>view==='battle'&&!battle?.tutorial&&!battle?.pvp&&game.clears[4]>0&&game.battleSpeed===2?2:1;
function battleDuration(ms){return ms/window.getBattlePlaybackRate();}
window.battleDuration=battleDuration;
function saveGame(){if(activeSlot===null)return;game.updatedAt=new Date().toISOString();try{if(window.GameAccount){window.GameAccount.save(activeSlot,game);return;}localStorage.setItem(SAVE_PREFIX+activeSlot,JSON.stringify(game));}catch(error){toast(window.GameAccount?'클라우드 저장 상태를 확인해 주세요.':'저장 공간을 확인해 주세요');}}
function navigate(next,confirmed=false){if(view==='trade'&&next!=='trade'){window.TradeUI.leave();return;}if(view==='battle'&&['manage','training','scout'].includes(next))return;if(view==='battle'&&next!=='battle'&&!battle.result&&!confirmed){confirmBattleLeave().then(async yes=>{if(!yes||view!=='battle')return;if(battle.pvp){await window.PvpUI.leave();return;}navigate(next,true);});return;}if(view==='battle'&&next!=='battle'){if(battle.pvp)window.PvpUI?.stop();token++;}if(view==='pvp'&&next!=='pvp')window.PvpUI?.stop();view=next;render();}
let leaveDialogPromise=null;
function confirmBattleLeave(message='전투를 그만 두시겠습니까?'){if(leaveDialogPromise)return leaveDialogPromise;leaveDialogPromise=new Promise(resolve=>{const overlay=document.createElement('div');overlay.className='leave-battle-overlay';overlay.setAttribute('role','alertdialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',message);overlay.innerHTML=`<div><h2>${escapeHTML(message)}</h2><div><button class="secondary" data-leave-cancel>취소</button><button class="primary" data-leave-confirm>확인</button></div></div>`;document.body.append(overlay);const finish=yes=>{overlay.remove();document.removeEventListener('keydown',escape);leaveDialogPromise=null;resolve(yes);},escape=event=>{if(event.key==='Escape'){event.preventDefault();finish(false);}};overlay.querySelector('[data-leave-cancel]').onclick=()=>finish(false);overlay.querySelector('[data-leave-confirm]').onclick=()=>finish(true);document.addEventListener('keydown',escape);overlay.querySelector('[data-leave-cancel]').focus();});return leaveDialogPromise;}

const img=id=>`assets/pokemon/animated/${id}.gif`;
const badges=types=>types.map(t=>`<img class="type-badge" src="assets/types/${t}.png" alt="${D.types[t]}" title="${D.types[t]}">`).join('');
function moveFor(id){
 const m={...D.moves[id],meta:T.meta[id]||{statChanges:[]}};
 const fx={1:'tackle',2:'slam',3:'gust',4:'sludge',5:'slam',6:'slam',7:'scratch',8:'shadow',9:'slash',10:'embers',11:'watergun',12:'leaves',13:'shock',14:'confusion',15:'watergun',16:'shadow',17:'bite',18:'stars'}[m.type]||'tackle';
 const fallback=m.damageClass===1?{range:m.target===7?0:3,impact:m.target===7?'self':'single',fx:m.meta.healing>0?'drain':fx}:{range:3,impact:m.power>=100?'square':'single',size:1,fx};
 return E.normalizeMove(window.MOVE_RULES[id]?{...m,...fallback,...window.MOVE_RULES[id]}:{...m,...fallback,...window.getExpandedMoveRule(m)});
}
function aimDescription(m){return ({self:'자신',square:`${m.size*2+1}×${m.size*2+1}`,front:m.width?`정면 ${(m.depth||1)*3}칸`:'정면 1칸',ray:`직선 ${m.range}칸`,cone:'부채꼴 최대 9칸',cross:`십자 ${1+4*m.size}칸`,single:m.mask?`${m.mask.length}칸`:'단일 지점',diagonal:'대각선',diamond:'마름모',ring:'고리',burst:'주변 확산'})[m.impact];}
function defaultAim(origin,m){
 if(m.impact==='self'||m.impact==='burst')return {...origin};
 if(E.directional(m)){const dx=enemy().id&&battle.enemyPos.x-origin.x,dy=battle.enemyPos.y-origin.y;return Math.abs(dx)>=Math.abs(dy)?{x:origin.x+(dx>=0?1:-1),y:origin.y}:{x:origin.x,y:origin.y+(dy>=0?1:-1)};}
 return {x:Math.max(0,Math.min(9,origin.x+Math.max(-m.range,Math.min(m.range,battle.enemyPos.x-origin.x)))),y:Math.max(0,Math.min(6,origin.y+Math.max(-m.range,Math.min(m.range,battle.enemyPos.y-origin.y))))};
}
function makeMon(id,isEnemy=false,enemyLevel=5){const p=D.pokemon.find(p=>p.id===id),stats={},level=isEnemy?enemyLevel:(game.records[id]?.level||5);const natureKey=isEnemy?'Serious':G.effectiveNature(game.records[id]);Object.assign(stats,G.battleStats(id,level,natureKey));const moveIds=isEnemy?enemyMoveIds(id,level):(game.moveSets[id]||G.defaultMoves(id,level));return {...p,level,natureKey,heldItem:isEnemy?'':(game.heldItems[id]||''),abilityId:isEnemy?G.defaultAbility(id):G.ability(game,id),abilityKey:A?.abilities[isEnemy?G.defaultAbility(id):G.ability(game,id)]?.key||'noability',types:[...p.types],battleStats:stats,statStages:{2:0,3:0,4:0,5:0,6:0},maxHP:stats[1],hp:stats[1],moves:moveIds.map(id=>({...moveFor(id),remaining:D.moves[id].pp}))};}
function startBattle(tutorial=false,encounter=null){view='battle';savedTeam=game.team;token++;const chapter=encounter||chapters[stage];battle={encounter:chapter,ambush:!!encounter,id:Date.now()+'-'+Math.random().toString(36).slice(2),party:savedTeam.filter(Boolean).map(id=>makeMon(id)),foes:chapter.enemy.map((id,i)=>makeMon(id,true,chapter.levels[i])),active:0,enemy:0,pos:{x:2,y:3},enemyPos:{x:tutorial?4:7,y:3},turn:1,move:null,destination:null,target:null,hover:null,mode:'idle',logs:[],busy:false,result:null,reward:null,tutorial,experiencePaid:[],participants:[0]};if(chapter.moves&&!tutorial)battle.foes.forEach((mon,i)=>{mon.moves=chapter.moves[i].map(id=>({...moveFor(id),remaining:D.moves[id].pp}));});if(tutorial){const dummy=makeMon(19,true,1);dummy.name='연습 더미';dummy.hp=6;dummy.maxHP=6;dummy.art='assets/trainers/dummy.png';battle.foes=[dummy];}battle.combat=window.NativeCombat.create(battle,D,E,moveFor);battle.combat.apply(battle.combat.snapshot());render();const initial=battle.combat.sim.log.slice(),startToken=token;setTimeout(()=>{if(view!=='battle'||battle.busy||token!==startToken)return;const entry=initial.filter(l=>/\|(?:-boost|-unboost|-status|-weather)\|/.test(l));if(entry.length){const snap=battle.combat.snapshot();battle.messages=describeCombat({actor:'p0',before:snap,after:snap,logs:entry},player(),{name:'특성'});battle.entryUntil=Date.now()+battleDuration(2200);render();showBattleNotes(battle.messages);setTimeout(()=>{if(view==='battle'&&!battle.busy&&token===startToken)render();},battleDuration(2250));}showAbilityNotices(initial);if(!battle.tutorial){window.GameAudio?.play('cry-'+player().id,{volume:.7});window.GameAudio?.later('cry-'+enemy().id,850,{volume:.55});}},battleDuration(350));}
function battleImage(mon){return mon.art||`assets/pokemon/${mon.appearance||mon.id}.png`;}
function grantKnockoutExperience(){const b=battle;if(b.tutorial||enemy().hp>0||b.experiencePaid.includes(b.enemy))return;b.experiencePaid.push(b.enemy);const allocations=G.experienceShares(game,b.party,b.experienceParticipants?.[b.enemy]||b.participants),events=[];for(const allocation of allocations){const i=allocation.index;const mon=b.party[i],oldHP=mon.hp,oldMax=mon.maxHP,remaining=new Map(mon.moves.map(m=>[m.id,m.remaining]));const event=G.gainExperience(game,mon.id,enemy(),!!b.encounter.trainer,1,allocation.weight*(b.encounter.chapter>=3?1.5:1)),fresh=makeMon(event.id);Object.assign(mon,fresh);mon.hp=Math.max(0,Math.min(mon.maxHP,oldHP+mon.maxHP-oldMax));mon.moves.forEach(m=>{if(remaining.has(m.id))m.remaining=remaining.get(m.id);});events.push(event);}savedTeam=game.team;saveGame();if(events.length)showExperienceNotice(events);}
const player=()=>battle.party[battle.active],enemy=()=>battle.foes[battle.enemy];
function log(t){battle.logs.unshift(t);}
function render(){if(render.previousView&&render.previousView!==view){transitionView();window.requestAnimationFrame?.(()=>window.scrollTo?.({top:0,left:0,behavior:'instant'}));}render.previousView=view;document.body.dataset.view=view;document.body.dataset.pvp=String(view==='battle'&&!!battle?.pvp);document.body.dataset.battleRate=String(window.getBattlePlaybackRate());window.GameAudio?.scene(view==='battle'?('battle:'+((battle?.encounter?.gym)|| (battle?.encounter?.rocket?'rocket':'wild'))):view);if(view==='dialogue')return window.StoryUI.render();if(view==='story-archive')return window.StoryUI.renderArchive();if(['scout','manage','training'].includes(view)&&window.StoryUI?.beforeMenu(view))return;if(view==='auth')return renderAuth();if(view==='title')return renderTitle();if(view==='files')return renderFiles();if(view==='tutorial')return renderTutorial();if(view==='leader')return renderLeader();if(view==='rocket')return renderRocket();if(view==='battle')return renderStory();if(view==='pvp')return window.PvpUI.render();if(view==='trade')return window.TradeUI.render();if(view==='story')return renderStages();if(view==='manage')return renderManagement();if(view==='training')return renderTraining();if(view==='village')return renderVillage();if(view==='shop')return renderShop();if(view==='scout')return renderScout();renderHome();}
function monPanel(p,isEnemy){return `<div class="unit-hud ${isEnemy?'enemy-hud':'player-hud'}"><div><b>${p.name}<small> Lv.${p.level}</small></b><span>${p.hp}/${p.maxHP}</span></div><div class="hp-track"><div class="hp-fill ${p.hp<p.maxHP/3?'low':''}" style="width:${p.hp/p.maxHP*100}%"></div></div><div class="hud-types">${badges(p.types)}${statusBadges(p)}</div></div>`;}
function battleFieldStatus(){const f=battle.field||battle.combat?.snapshot()?.field||{},weather=f.weather||'',terrain=f.terrain||'',names={raindance:'비',primordialsea:'강한 비',sunnyday:'쾌청',desolateland:'강한 햇살',sandstorm:'모래바람',hail:'싸라기눈',snowscape:'눈',electricterrain:'일렉트릭필드',grassyterrain:'그래스필드',mistyterrain:'미스트필드',psychicterrain:'사이코필드'};return `${weather||terrain?`<div class="battle-field-label" role="status">${[names[weather],names[terrain]].filter(Boolean).join(' · ')}</div>`:''}`;}
function battleFieldArt(){const f=battle.field||battle.combat?.snapshot()?.field||{};return `<div class="battle-atmosphere weather-${f.weather||''} terrain-${f.terrain||''}" aria-hidden="true"></div>`;}
function renderStory(){
 const b=battle,p=player(),f=enemy(),m=p.moves[b.move],origin=b.destination||b.pos;
 const previewTarget=b.mode==='target'&&m?(b.hover||b.target||defaultAim(origin,m)):null;
 const preview=previewTarget?E.attackTiles(origin,previewTarget,m):[];
 const criticalPreview=previewTarget?E.criticalTiles(origin,previewTarget,m):[];
 const planned=b.destination&&(b.destination.x!==b.pos.x||b.destination.y!==b.pos.y);
 let tiles='';
 for(let y=0;y<7;y++)for(let x=0;x<10;x++){
  const pos={x,y},isP=x===b.pos.x&&y===b.pos.y,isF=x===b.enemyPos.x&&y===b.enemyPos.y;
  let cls='tile';
  if(b.mode==='move'&&(!['slp','frz'].includes(p.status)||isP)&&E.path(b.pos,pos,b.enemyPos)!==null&&!b.busy&&!b.result)cls+=' reachable';
  if(b.mode==='target'&&m&&E.range(origin,pos,m)&&!b.busy&&!b.result)cls+=' target-option';
  if(preview.some(t=>t.x===x&&t.y===y))cls+=' damage-zone';
  if(criticalPreview.some(t=>t.x===x&&t.y===y))cls+=' critical-zone';
  if(isP&&planned)cls+=' origin-dim';
  if(b.destination?.x===x&&b.destination?.y===y)cls+=' selected';
  if(b.target?.x===x&&b.target?.y===y)cls+=' aim';
  tiles+=`<button class="${cls}" data-x="${x}" data-y="${y}" aria-label="${x+1}열 ${y+1}행${isP?' 아군 '+p.name:isF?' 상대 '+f.name:''}" ${b.busy||b.result||(b.mode==='idle'&&!isP)||(b.mode==='move'&&['slp','frz'].includes(p.status)&&!isP)||b.mode==='skill'?'disabled':''}>${isP||isF?`<span class="unit-shadow ${isF?'enemy-shadow':''}"></span><img src="${isP?battleImage(p):battleImage(f)}" alt="">`:''}${planned&&origin.x===x&&origin.y===y?`<img class="move-ghost" src="${battleImage(p)}" alt="이동 예정">`:''}</button>`;
 }
 $('#app').innerHTML=`<div class="battle-wrapper">${menuHeader(b.tutorial?'연습':b.encounter.name+(b.encounter.leader?' · '+b.encounter.leader:''),true)}${!game.tutorial.done?'<button id="battle-skip-tutorial" class="outline battle-skip-tutorial">튜토리얼 스킵</button>':''}<div class="game-shell">${battleFieldStatus()}<div class="battle-instruction" role="status">${b.pvp?window.PvpUI.clockHTML():(b.busy||Date.now()<b.entryUntil)&&b.messages?.length?b.messages.map(n=>`<span class="combat-note ${n.kind}">${n.text}</span>`).join(''):battleInstruction()}</div><div class="top-hud">${monPanel(p,false)}<span class="turn" role="status" aria-label="${b.turn}턴 ${b.busy?'실행 중':'선택 중'}">${b.busy?'•••':String(b.turn).padStart(2,'0')}</span>${monPanel(f,true)}</div>${b.pvp?'<div class="pvp-battle-frame">'+window.PvpUI.rosterHTML('p'):''}<div class="arena arena-${b.encounter.theme||'forest'}">${battleFieldArt()}<div class="board" role="group" aria-label="10열 7행 풀숲 전장">${tiles}</div></div>${b.pvp?window.PvpUI.rosterHTML('e')+'</div>':''}${b.mode==='target'?'<div class="range-key"><span class="range-key-aim">사거리</span><span class="range-key-hit">타격</span><span class="range-key-critical">급소 ×1.5</span></div>':''}<div class="bottom-hud"><div class="party">${b.party.map((mon,i)=>`<button class="party-slot ${i===b.active?'active':''} ${mon.hp<=0?'fainted':''}" data-switch="${i}" title="${mon.name}${i===b.active?' · 출전 중':' · 교체'}" aria-label="${mon.name} ${i===b.active?'출전 중':'교체'}" ${b.busy||b.result||i===b.active||mon.hp<=0||!b.combat.canSwitch(i)?'disabled':''}><img src="${img(mon.id)}" alt=""><div class="hp-track"><div class="hp-fill" style="width:${mon.hp/mon.maxHP*100}%"></div></div></button>`).join('')}</div><div class="skill-list">${p.moves.map((m,i)=>`<button class="skill ${i===b.move&&b.mode==='target'?'active':''}" data-skill="${i}" title="${moveClassName(m)} · ${D.types[m.type]} · ${aimDescription(m)} · 위력 ${m.power} · 우선도 ${m.priority}" ${b.busy||b.result||!['skill','target'].includes(b.mode)||m.remaining<=0||m.disabled?'disabled':''}><span class="skill-type">${badges([m.type])}</span><b>${m.name}</b><div class="skill-meta">${moveClassBadge(m)}<small>${m.remaining}/${m.pp}</small></div></button>`).join('')}</div><div class="actions"><button id="reset-command" class="icon-button" aria-label="이동 다시 선택" title="이동 다시 선택" ${b.busy||b.result?'disabled':''}>↶</button><button id="wait" class="secondary" ${b.busy||b.result||!b.destination?'disabled':''}>대기</button><button id="confirm" class="primary" ${b.busy||b.result||!b.target||!m||m.remaining<=0||m.disabled?'disabled':''}>확정</button></div></div>${practiceHint()}${b.result?`<div class="result-overlay"><div><h2>${b.result==='win'?'승리':b.result==='draw'?'무승부':'패배'}</h2><button class="primary" id="next-stage">${b.pvp?'대기실':b.tutorial?'확인':b.result==='win'?(b.ambush?'지도':game.rocketPending&&stage===14?'확인':stage%10===9?'지역 지도':'다음 전투'):'다시 시작'}</button>${b.tutorial||b.pvp?'':'<button class="secondary" id="retry-stage">다시하기</button><button class="secondary" id="battle-stages">스테이지</button>'}${b.reward?.item?`<p class="reward-item"><img src="assets/items/${b.reward.item}.png" alt="">${window.ITEM_DATA[b.reward.item].name} ×1</p>`:''}${b.reward?`<p class="reward-total">+${b.reward.total} COIN${b.reward.first?` <small>첫 클리어 +${b.reward.first}</small>`:''}</p>`:''}</div></div>`:''}</div></div>`;
 bindMenuHeader();if($('#battle-speed'))$('#battle-speed').onclick=()=>{if(b.busy||!game.clears[4]||b.tutorial)return;game.battleSpeed=game.battleSpeed===2?1:2;saveGame();render();};if($('#battle-skip-tutorial'))$('#battle-skip-tutorial').onclick=skipTutorial;if($('#battle-stages'))$('#battle-stages').onclick=()=>navigate('story');
 document.querySelectorAll('[data-x]').forEach(btn=>{btn.onclick=()=>chooseTile(+btn.dataset.x,+btn.dataset.y);btn.onpointerenter=()=>previewAim(+btn.dataset.x,+btn.dataset.y);});
 $('.board').onpointerleave=()=>{if(b.mode==='target'){b.hover=null;paintPreview(b.target||defaultAim(origin,m));}};
 document.querySelectorAll('[data-skill]').forEach(btn=>btn.onclick=()=>{if(!b.destination||!['skill','target'].includes(b.mode))return;b.move=+btn.dataset.skill;b.mode='target';b.target=null;b.hover=null;render();});
 document.querySelectorAll('[data-switch]').forEach(btn=>btn.onclick=()=>resolveTurn({kind:'switch',index:+btn.dataset.switch}));
 $('#reset-command').onclick=()=>{b.mode='idle';b.destination=null;b.target=null;b.hover=null;b.move=null;render();};
 $('#confirm').onclick=()=>resolveTurn({kind:'attack',destination:b.destination||{...b.pos},target:{...b.target},move:b.move});
 $('#wait').onclick=()=>resolveTurn({kind:'wait',destination:{...b.destination}});
 if($('#retry-stage'))$('#retry-stage').onclick=()=>startBattle(b.tutorial,b.ambush?b.encounter:null);
 if($('#next-stage'))$('#next-stage').onclick=()=>{if(b.pvp){window.PvpUI.returnLobby();return;}if(b.tutorial){game.tutorial.step='scout';saveGame();view='scout';render();return;}if(b.ambush&&b.result!=='win'){beginRocket();return;}if(b.result==='win'){if(b.ambush){mapChapter=1;navigate('story');return;}if(stage===14&&game.rocketPending){beginRocket();return;}if(stage%10===9){mapChapter=Math.floor(stage/10);navigate('story');return;}if(stage<chapters.length-1)stage++;}beginStage();};
 if($('#next-stage')&&b.result==='win'&&!b.pvp&&!b.tutorial&&!b.ambush){const action=$('#next-stage').onclick;$('#next-stage').onclick=()=>{if(window.StoryUI?.afterBattle(stage,action))return;action();};}
}
function chooseTile(x,y){
 const b=battle;if(b.busy||b.result)return;const pos={x,y};
 if(b.mode==='idle'){if(x!==b.pos.x||y!==b.pos.y)return;b.mode='move';}
 else if(b.mode==='move'){if(['slp','frz'].includes(player().status)&&(x!==b.pos.x||y!==b.pos.y))return;if(E.path(b.pos,pos,b.enemyPos)===null)return;b.destination=pos;b.mode='skill';b.move=null;b.target=null;b.hover=null;}
 else if(b.mode==='target'){const m=player().moves[b.move];if(!m||!E.range(b.destination,pos,m))return;b.target=pos;b.hover=null;}
 else return;
 render();
}
function paintPreview(target){
 const b=battle,m=player().moves[b.move];if(!m)return;
 const origin=b.destination||b.pos,cells=E.attackTiles(origin,target,m),critical=E.criticalTiles(origin,target,m);
 document.querySelectorAll('.tile').forEach(el=>{const x=+el.dataset.x,y=+el.dataset.y;el.classList.toggle('damage-zone',cells.some(p=>p.x===x&&p.y===y));el.classList.toggle('critical-zone',critical.some(p=>p.x===x&&p.y===y));});
}
function previewAim(x,y){const b=battle,m=player().moves[b.move];if(b.mode!=='target'||!m||b.busy||!E.range(b.destination,{x,y},m))return;b.hover={x,y};paintPreview(b.hover);}
function enemyMoveIds(id,level){
 const moves=[...new Set(G.levelMoves(id,level))].map(moveFor),p=D.pokemon.find(v=>v.id===id);
 const attacks=moves.filter(m=>m.damageClass!==1).sort((a,b)=>((b.power||30)*(p.types.includes(b.type)?1.5:1)*(b.accuracy||100))-((a.power||30)*(p.types.includes(a.type)?1.5:1)*(a.accuracy||100)));
 const selected=[];for(const m of attacks)if(!selected.some(v=>v.type===m.type)||selected.length<2){selected.push(m);if(selected.length===3)break;}
 const status=moves.filter(m=>m.damageClass===1).reverse().sort((a,b)=>Number(!!window.PKMN.Dex.moves.get(b.key).status)-Number(!!window.PKMN.Dex.moves.get(a.key).status));
 for(const m of [...status,...moves.slice().reverse()])if(selected.length<4&&!selected.some(v=>v.id===m.id))selected.push(m);
 return selected.map(m=>m.id);
}
function enemyMoveValue(m,p,def,can,critical){
 const native=window.PKMN.Dex.moves.get(m.key),accuracy=typeof native.accuracy==='number'?native.accuracy/100:1;
 if(m.damageClass!==1){if(!can)return 0;const factor=E.effectiveness(m.type,def.types,D),damage=E.damage(p,def,m,D,{critical});
  const immunity=({levitate:5,flashfire:10,waterabsorb:11,stormdrain:11,voltabsorb:13,lightningrod:13,motordrive:13,sapsipper:12})[def.abilityKey?.replace(/-/g,'')];
  if(immunity===m.type)return 0;let score=damage*10*accuracy;if(damage>=def.hp)score+=70;if(native.priority>0&&def.hp<def.maxHP*.3)score+=20;
  if(native.secondary?.status&&!def.status)score+=15;if(native.drain&&p.hp<p.maxHP*.7)score+=15;return factor===0?0:score;
 }
 const self=['self','allySide','all'].includes(native.target)||m.impact==='self';if(!self&&!can)return 0;
 if(native.heal)return p.hp<p.maxHP*.55?Math.min(p.maxHP-p.hp,p.maxHP*.5)*9:0;
 if(native.status){if(def.status)return 0;const status=native.status;
  if((status==='par'&&def.types.includes(13))||(['psn','tox'].includes(status)&&def.types.some(t=>[4,9].includes(t)))||(status==='brn'&&def.types.includes(10))||(native.flags.powder&&def.types.includes(12)))return 0;
  return (['slp','par'].includes(status)?115:75)*accuracy;
 }
 if(native.volatileStatus)return def.volatiles?.includes(native.volatileStatus)?0:(['confusion','leechseed'].includes(native.volatileStatus)?75:25)*accuracy;
 if(native.boosts){const target=self?p:def,good=Object.entries(native.boosts).filter(([key,v])=>{const index=({atk:2,def:3,spa:4,spd:5,spe:6})[key],current=(key==='evasion'?target.evasionStage:key==='accuracy'?target.accuracyStage:target.statStages?.[index])||0;return self?v>0&&current<2:v<0&&current>-2;});
  return good.length&&(p.hp>p.maxHP*.4)?Math.min(80,good.reduce((sum,[,v])=>sum+Math.abs(v)*35,0)):0;
 }return 0;
}
function aiCommand(){
 const b=battle,p=enemy(),def=player(),options=[];if(b.tutorial)return {kind:'wait',destination:{...b.enemyPos}};
 for(let y=0;y<7;y++)for(let x=0;x<10;x++){
  const pos={x,y};if(E.path(b.enemyPos,pos,b.pos)===null)continue;
  for(let i=0;i<p.moves.length;i++){
   const m=p.moves[i];if(m.remaining<=0||m.disabled)continue;
   for(let ty=0;ty<7;ty++)for(let tx=0;tx<10;tx++){
    const target={x:tx,y:ty};if(!E.range(pos,target,m))continue;
    const can=E.attackTiles(pos,target,m).some(t=>t.x===b.pos.x&&t.y===b.pos.y),value=enemyMoveValue(m,p,def,can,E.isCritical(pos,target,b.pos,m));
    // Keep useful distance for ranged moves; do not read the player's pending command.
    const distance=E.distance(pos,b.pos),spacing=value>0?-Math.abs(distance-Math.max(1,Math.min(3,m.range)))*2:-distance*3;
    options.push({kind:'attack',destination:pos,target,move:i,score:value+spacing-E.distance(pos,b.enemyPos)*.3-E.distance(target,b.pos)*.01});
   }
  }
 }
 options.sort((a,b)=>b.score-a.score);return options[0]||{kind:'wait',destination:{...b.enemyPos}};
}
const pause=ms=>new Promise(r=>setTimeout(r,battleDuration(ms)));
async function playRecordedMove(record,options,applyFrame){const frames=record.hitFrames?.length?record.hitFrames:[record.after];for(let i=0;i<frames.length;i++){await window.GameAudio?.cast(options.move);await window.playMoveEffect({...options,hit:options.hit||frames.length>1,durationScale:frames.length>1?.36:1});if(view!=='battle')return;if(frames.length>1){applyFrame(frames[i]);render();await pause(65);}}}
async function applyBattleActive(snapshot){const b=battle,old=[b.active,b.enemy];if(old[1]!==+snapshot.active[1].slice(1)){b.experienceParticipants||={};b.experienceParticipants[old[1]]=[...b.participants];}b.combat.apply(snapshot,true);if(old[0]!==b.active&&!b.participants.includes(b.active))b.participants.push(b.active);if(old[1]!==b.enemy)b.participants=[b.active];if(old[0]!==b.active||old[1]!==b.enemy){render();for(const side of [0,1])if(old[side]!==[b.active,b.enemy][side]){const pos=side===0?b.pos:b.enemyPos;document.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"] img:not(.move-ghost)`)?.animate?.([{opacity:0,transform:'scale(.7)'},{opacity:1,transform:'scale(1)'}],{duration:battleDuration(220),easing:'ease-out'});}await pause(230);}}
async function resolveTurn(command){
if(battle?.pvp)return window.PvpUI.submit(command);
const b=battle;if(b.busy||b.result)return;player().protected=false;enemy().protected=false;
const ownToken=token,opponent=aiCommand();
b.busy=true;b.messages=[];b.message='';b.mode='resolving';b.destination=null;b.target=null;b.hover=null;render();
const actions=E.order([
 {side:'p',command,speed:player().actionSpeed||player().battleStats[6]*E.stageMultiplier(player().statStages[6]),priority:command.kind==='switch'?6:command.kind==='attack'?player().moves[command.move].priority:0},
 {side:'e',command:opponent,speed:enemy().actionSpeed||enemy().battleStats[6]*E.stageMultiplier(enemy().statStages[6]),priority:opponent.kind==='attack'?enemy().moves[opponent.move].priority:0}
]);
for(const a of actions.filter(a=>a.command.kind==='switch')){
 if(ownToken!==token)return;
 player().statStages={2:0,3:0,4:0,5:0,6:0};b.active=a.command.index;b.pos=E.spawnPosition(0,b.enemyPos);window.GameAudio?.play('cry-'+player().id,{volume:.7});if(!b.participants.includes(b.active))b.participants.push(b.active);render();await pause(400);
}
const mobility=b.combat.prepareMovement(command,opponent);
const movers=E.order(actions.filter(a=>a.command.kind!=='switch').map(a=>({...a,priority:0})));
for(const a of movers){
 if(ownToken!==token)return;
 b.acting=a.side;render();
 const key=a.side==='p'?'pos':'enemyPos',other=a.side==='p'?b.enemyPos:b.pos;
 const actorName=(a.side==='p'?'p'+b.active:'e'+b.enemy);
 const steps=mobility[actorName]===false?[]:E.path(b[key],a.command.destination,other);
 if(steps&&steps.length){const next=steps.at(-1);await window.animateMovement({...b[key]},next);if(ownToken!==token)return;b[key]={...next};render();}
 await pause(140);
}
await pause(200);
let turn;try{turn=b.combat.turn(command,opponent);}catch(error){console.error(error);b.busy=false;b.mode='idle';render();toast('이 명령은 지금 사용할 수 없습니다. 다시 선택해 주세요.');return;}
for(const [recordIndex,record]of turn.records.entries()){
 if(ownToken!==token)return;
 await applyBattleActive(record.before);const aSide=record.actor[0],atk=b.combat.lookup(record.actor).mon,c=aSide==='p'?command:opponent,pos=aSide==='p'?b.pos:b.enemyPos,defPos=aSide==='p'?b.enemyPos:b.pos,m=D.moves[record.move]?moveFor(record.move):{id:0,name:'행동',impact:'self',range:0,damageClass:1},target=c.target||pos;
 b.acting=aSide;b.message=m.name;b.messages=[];render();await pause(160);
 const attempted=record.logs.some(l=>l.startsWith('|move|')),failed=record.logs.some(l=>/\|(?:-fail|-miss|-immune|cant)\|/.test(l));
 if(attempted)showMoveName(m.name,pos);
 if(attempted)await playRecordedMove(record,{move:m,origin:pos,target,tiles:E.attackTiles(pos,target,m),hit:!failed,critical:record.logs.some(l=>l.startsWith('|-crit|')),defenderPos:m.impact==='self'?pos:defPos,side:aSide},frame=>b.combat.apply(frame));
 if(ownToken!==token)return;
 b.combat.apply(record.after);const nextSnapshot=turn.records[recordIndex+1]?.before||turn.final;if(nextSnapshot.active.some((n,i)=>+n.slice(1)!==[b.active,b.enemy][i]))await applyBattleActive(nextSnapshot);window.GameAudio?.result(record);const notes=describeCombat(record,atk,m);b.message=notes.map(n=>n.text).join(' ');b.messages=notes;log(b.message);render();showBattleNotes(notes);await pause(850);
}
showAbilityNotices(turn.logs);
syncBattleItems();
const beforeResidual=turn.records.at(-1)?.after||b.combat.snapshot();b.combat.apply(turn.final);
if(turn.residual.some(l=>/\|(?:-damage|-heal|-weather|-status|-boost|-unboost)\|/.test(l))){const residualNotes=describeCombat({actor:'p'+b.active,before:beforeResidual,after:turn.final,logs:turn.residual},player(),{name:'턴 종료'});b.messages=residualNotes;b.message=residualNotes.map(n=>n.text).join(' ');render();showBattleNotes(residualNotes);await pause(850);}
for(let i=0;i<b.foes.length;i++)if(b.foes[i].hp<=0&&!b.experiencePaid.includes(i)){const prior=b.enemy;b.enemy=i;grantKnockoutExperience();b.enemy=prior;}
// Apply active replacements without overwriting experience-driven level/species updates.
const previousActive=b.active,previousEnemy=b.enemy;
b.active=+turn.final.active[0].slice(1);b.enemy=+turn.final.active[1].slice(1);
if(previousActive!==b.active){if(!b.participants.includes(b.active))b.participants.push(b.active);}
if(previousEnemy!==b.enemy){window.GameAudio?.play('cry-'+enemy().id,{volume:.6});b.participants=[b.active];}
if(b.pos.x===b.enemyPos.x&&b.pos.y===b.enemyPos.y)b.enemyPos.x=8;
for(const entry of turn.final.mons){const mon=b.combat.lookup(entry.name).mon;mon.nativeRequest=entry.request;mon.volatiles=entry.volatiles;}b.combat.syncGrowth();
if(ownToken!==token)return;
b.acting=null;
const pAlive=b.party.some(p=>p.hp>0),eAlive=b.foes.some(p=>p.hp>0);
if(!pAlive||!eAlive){b.result=pAlive?'win':'lose';window.GameAudio?.celebrate(b.result==='win'?'victory':'defeat');if(b.result==='win'&&!b.tutorial){b.reward=b.ambush?G.rewardRocket(game,b.id):G.reward(game,stage,b.id);progress=game.clears.filter(n=>n>0).length;saveGame();}log(b.result==='win'?'배틀에서 승리했습니다!':'포켓몬이 모두 쓰러졌습니다.');}
else{if(player().hp===0){b.active=b.party.findIndex(p=>p.hp>0);if(!b.participants.includes(b.active))b.participants.push(b.active);log(`${player().name}이(가) 이어서 출전했다.`);}if(enemy().hp===0){b.enemy=b.foes.findIndex(p=>p.hp>0);b.participants=[b.active];log(`상대 ${enemy().name}이(가) 출전했다.`);}b.turn++;}
b.busy=false;b.mode='idle';b.destination=null;b.target=null;b.hover=null;b.move=null;render();if(b.result==='win'&&!b.ambush&&stage===9&&!game.itemUnlockSeen){await pause(700);if(ownToken===token)navigate('home');}}
function openTeam(){if(view!=='battle')navigate('manage');}
function statusBadges(mon){const names={par:'마비',brn:'화상',psn:'독',tox:'맹독',slp:'잠듦',frz:'얼음'};return `${mon.status?`<span class="status-badge ${mon.status}">${names[mon.status]||mon.status}</span>`:''}${mon.volatiles?.includes('confusion')?'<span class="status-badge">혼란</span>':''}`;}
function battleInstruction(){const b=battle;return b.message&&b.busy?b.message:b.result?'':b.busy?'행동 중…':b.mode==='idle'?'포켓몬을 클릭해 이동시키세요!':b.mode==='move'&&['slp','frz'].includes(player().status)?'지금은 이동할 수 없습니다. 현재 칸을 눌러 기술이나 대기를 선택하세요.':b.mode==='move'?'이동할 칸을 선택하세요. 현재 칸을 누르면 제자리입니다.':b.mode==='skill'?(stage===0&&b.turn===1&&!b.pvp?'사용할 기술을 선택하세요. 이동한 자리에서 공격합니다.':'사용할 기술을 선택하세요.'):(stage===0&&b.turn===1&&!b.pvp?'파란 칸은 사거리, 붉은 칸은 타격 범위입니다. 목표를 고르고 확정하세요.':'목표 칸을 선택하고 확정을 누르세요.');}


function transitionView(){
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const outgoing=$('#app');if(!outgoing||!outgoing.childElementCount||outgoing.offsetWidth===0)return;
 // Snapshot the old screen before replacement; reveal the fully laid-out new screen underneath.
 const cover=document.createElement('div');cover.className='view-transition';cover.setAttribute('aria-hidden','true');cover.inert=true;
 const copy=outgoing.cloneNode(true);copy.removeAttribute('id');copy.classList.add('transition-copy');
 copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));cover.append(copy);document.body.append(cover);
 document.querySelectorAll('.view-transition').forEach(el=>{if(el!==cover)el.remove();});
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const animation=cover.animate([{opacity:1},{opacity:0}],{duration:220,easing:'ease-out'});animation.onfinish=()=>cover.remove();}));
 setTimeout(()=>cover.remove(),400);
}

function syncBattleItems(){if(!game.itemsUnlocked)return;let changed=false;const snap=battle.combat.snapshot();for(const entry of snap.mons){if(entry.name[0]!=='p')continue;const mon=battle.combat.lookup(entry.name).mon,key=game.heldItems[mon.id];if(key&&window.ITEM_DATA[key]?.consumed&&!entry.item){delete game.heldItems[mon.id];changed=true;}}if(changed)saveGame();}

window.addEventListener?.('beforeunload',event=>{if(view==='battle'&&!battle?.result){event.preventDefault();event.returnValue='';}});
if(typeof initAccountUI==='function')initAccountUI();
render();
