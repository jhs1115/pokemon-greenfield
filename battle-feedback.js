function describeCombat(record,actor,move){
 const notes=[],seen=new Set(),defaultSide=record.actor[0]==='p'?'e':'p';
 const add=(text,kind='neutral',side=defaultSide)=>{const key=text+side;if(!seen.has(key)){seen.add(key);notes.push({text,kind,side});}};
 const stats={atk:'공격력',def:'방어력',spa:'특수공격',spd:'특수방어',spe:'스피드',accuracy:'명중률',evasion:'회피율'};
 for(const line of record.logs){const a=line.split('|'),target=a[2]?.match(/: ([pe]\d+)/)?.[1],side=target?.[0]||defaultSide;
  if(a[1]==='-supereffective'){const defender=record.before.mons.find(m=>m.name===target);const factor=defender?E.effectiveness(move.type,defender.types,D):2;add(factor>=4?'효과가 매우 굉장했다!':'효과가 굉장했다!','super',side);}
  if(a[1]==='-resisted')add('효과가 별로였다...','resisted',side);
  if(a[1]==='-immune')add('효과가 없다!','immune',side);
  if(a[1]==='-crit')add('급소에 맞았다!','critical',side);
  if(a[1]==='-miss')add('빗나갔다!','miss',defaultSide);
  if(a[1]==='-fail')add('실패!','fail',record.actor[0]);
  if(a[1]==='-boost'||a[1]==='-unboost')add(`${withParticle(stats[a[3]]||a[3])}${a[1]==='-unboost'?' 다운됐다!':' 올라갔다!'}${+a[4]>=2?' ×'+a[4]:''}`,a[1]==='-unboost'?'debuff':'buff',side);
  if(a[1]==='-status')add(({par:'마비되었다!',brn:'화상을 입었다!',psn:'독에 걸렸다!',tox:'맹독에 걸렸다!',slp:'잠들었다!',frz:'얼어붙었다!'})[a[3]]||'상태가 변했다!','status',side);
  if(a[1]==='-curestatus')add('상태이상이 회복됐다!','heal',side);
  if(a[1]==='-heal')add('HP 회복!','heal',side);
  if(a[1]==='-damage'){const before=record.before.mons.find(v=>v.name===target),after=record.after?.mons.find(v=>v.name===target),delta=before&&after?before.hp-after.hp:0;const source=a.find(v=>v.startsWith('[from] '))?.slice(7);if(source)add(({'psn':'독 피해!','brn':'화상 피해!','confusion':'혼란으로 자신을 공격했다!','Leech Seed':'씨뿌리기 피해!','recoil':'반동 피해!'})[source]||'지속 피해!','status',side);else if(delta>0)add('−'+delta+' HP','damage',side);}
  if(a[1]==='-weather'&&a[2]!=='none')add(({'RainDance':'비가 내리기 시작했다!','SunnyDay':'햇살이 강해졌다!','Sandstorm':'모래바람이 불기 시작했다!','Snow':'눈이 내리기 시작했다!'})[a[2]]||'날씨가 변했다!','status',record.actor[0]);
  if(a[1]==='-activate'&&/protect/i.test(a[3]))add('공격을 막았다!','buff',side);
  if(a[1]==='-start'&&a[3]==='confusion')add('혼란에 빠졌다!','status',side);
  if(a[1]==='-start'&&/taunt|encore|Disable|Leech Seed|Substitute/i.test(a[3]))add(({'Taunt':'도발당했다!','Encore':'앙코르에 걸렸다!','Disable':'기술이 봉인됐다!','Leech Seed':'씨앗이 심어졌다!','Substitute':'대타출동!'})[a[3]]||'효과 발동!','status',side);
  if(a[1]==='cant')add(({slp:'잠들어 움직일 수 없다!',frz:'얼어서 움직일 수 없다!',par:'몸이 저려 움직일 수 없다!',flinch:'풀죽어서 움직일 수 없다!',recharge:'반동으로 움직일 수 없다!'})[a[3]]||'기술을 쓸 수 없다!','fail',side);
 }
 return notes;
}
function showBattleNotes(notes){const board=$('.board');if(!board)return;for(const [i,n]of notes.entries()){const pos=n.side==='p'?battle.pos:battle.enemyPos,tile=board.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"]`);if(!tile)continue;const el=document.createElement('span');el.className='tile-combat-text '+n.kind;el.textContent=n.text;el.style.setProperty('--note-offset',i*22+'px');tile.append(el);setTimeout(()=>el.remove(),1800);}}
function showAbilityNotices(lines){const notices=[];for(const line of lines){const a=line.split('|');let key=null,owner=null;if(a[1]==='-ability'){key=a[3];owner=a[2];}else{const from=a.find(v=>v.startsWith('[from] ability: '));if(from){key=from.slice(16);owner=a.find(v=>v.startsWith('[of] '))?.slice(5)||a[2];}}if(!key)continue;const native=window.PKMN.Dex.abilities.get(key),entry=Object.values(A.abilities).find(v=>window.PKMN.Dex.abilities.get(v.key).id===native.id),name=owner?.match(/: ([pe]\d+)/)?.[1],mon=name?battle.combat.lookup(name).mon:null,side=name?.[0]||'p';const text=`${mon?.name||'포켓몬'}의 ${entry?.name||key}`;if(!notices.some(n=>n.text===text&&n.side===side))notices.push({text,side});}
 const started=battle.id;for(const [i,{text,side}]of notices.entries())setTimeout(()=>{if(view!=='battle'||battle.id!==started)return;const id='ability-banner-'+side;$('#'+id)?.remove();const el=document.createElement('div');el.id=id;el.className='ability-banner '+(side==='e'?'opponent':'own');el.setAttribute('role','status');el.innerHTML='<b></b>';el.querySelector('b').textContent=text;$('.battle-wrapper')?.append(el);setTimeout(()=>el.remove(),2100);},i*750);
}
let evolutionQueue=[],evolutionPlaying=false;
function queueEvolution(from,to){evolutionQueue.push({from,to});playNextEvolution();}
async function playNextEvolution(){if(evolutionPlaying||!evolutionQueue.length)return;if(view==='battle'&&battle?.busy){setTimeout(playNextEvolution,350);return;}evolutionPlaying=true;const {from,to}=evolutionQueue.shift(),overlay=document.createElement('div');overlay.className='evolution-scene';window.GameAudio?.duck(4800);window.GameAudio?.play('magic',{volume:.45,maxDuration:1.4});overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','포켓몬 진화');overlay.innerHTML=`<div class="evolution-stars"></div><h2>어라? ${species(from).name}의 모습이…!</h2><div class="evolution-orbit"><img class="evolution-before" src="${img(from)}" alt="${species(from).name}"><img class="evolution-after" src="${img(to)}" alt="${species(to).name}"><span></span></div><p>진화 중…</p>`;document.body.append(overlay);await new Promise(r=>setTimeout(r,4300));overlay.classList.add('evolution-complete');window.GameAudio?.celebrate('evolve');overlay.querySelector('h2').textContent='축하합니다!';overlay.querySelector('p').textContent=`${withParticle(species(from).name)} ${withParticle(species(to).name,"direction")} 진화했다!`;const button=document.createElement('button');button.className='primary';button.textContent='확인';overlay.append(button);await new Promise(r=>button.onclick=r);overlay.remove();evolutionPlaying=false;playNextEvolution();}

function showMoveName(name,position){
 const board=$('.board'),tile=board?.querySelector(`[data-x="${position.x}"][data-y="${position.y}"]`);if(!tile)return;
 board.querySelectorAll('.move-name-label').forEach(el=>el.remove());
 const el=document.createElement('span');el.className='move-name-label';el.textContent=name;el.setAttribute('role','status');tile.append(el);setTimeout(()=>el.remove(),2000);
}
