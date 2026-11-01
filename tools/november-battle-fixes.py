from pathlib import Path
p=Path('native-combat.js');s=p.read_text(encoding='utf8');needle=" const team=(mons,side)=>"
a=''' // One paralysis roll controls both tile movement and the attack (custom 12.5%).
 let mobility=null;
 const dex=sim.dex,conditions=dex.conditions,par={...conditions.get('par'),onBeforeMove(pokemon){
  const blocked=mobility?.[pokemon.name]?.paralyzed??this.randomChance(1,8);
  if(blocked){this.add('cant',pokemon,'par');return false;}
 }};
 sim.dex=Object.create(dex);sim.dex.conditions=Object.create(conditions);
 sim.dex.conditions.get=name=>(typeof name==='string'?name:name?.id)==='par'?par:conditions.get(name);
 function prepareMovement(own,other){mobility={};for(const [i,c]of [own,other].entries()){
  const p=sim.sides[i].active[0];if(!p||c.kind==='switch')continue;
  const paralyzed=p.status==='par'&&sim.randomChance(1,8);
  mobility[p.name]={canMove:!['slp','frz'].includes(p.status)&&!paralyzed,paralyzed};
 }return Object.fromEntries(Object.entries(mobility).map(([key,value])=>[key,value.canMove]));}
'''
assert needle in s;s=s.replace(needle,a+needle).replace('return {sim,snapshot,lookup,turn','return {sim,snapshot,lookup,prepareMovement,turn').replace('final:snapshot(),logs:sim.log.slice(start)};','final:snapshot(),logs:sim.log.slice(start)};')
# Reset the cached roll after the attack phase, retaining it for every action of this turn.
s=s.replace("sim.makeChoices(choice('p',own),choice('e',other));const preSwitch", "sim.makeChoices(choice('p',own),choice('e',other));mobility=null;const preSwitch")
p.write_text(s,encoding='utf8')
p=Path('app.js');s=p.read_text(encoding='utf8');s=s.replace("const movers=E.order(","const mobility=b.combat.prepareMovement(command,opponent);\nconst movers=E.order(")
s=s.replace("const steps=E.path(b[key],a.command.destination,other);","const actorName=(a.side==='p'?'p'+b.active:'e'+b.enemy);\n const steps=mobility[actorName]===false?[]:E.path(b[key],a.command.destination,other);")
s=s.replace('showAbilityNotices(record.logs);','').replace('showAbilityNotices(turn.residual);','')
s=s.replace('syncBattleItems();','showAbilityNotices(turn.logs);\nsyncBattleItems();',1)
s=s.replace('!!b.encounter.trainer,1,allocation.weight)','!!b.encounter.trainer,1,allocation.weight*(b.encounter.chapter>=3?1.5:1))')
s=s.replace("?'로켓단 습격':stage%10", "?'확인':stage%10")
s=s.replace('function transitionView(){}', '''function transitionView(){
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const outgoing=$('#app');if(!outgoing||!outgoing.childElementCount||outgoing.offsetWidth===0)return;
 // Snapshot the old screen before replacement; reveal the fully laid-out new screen underneath.
 const cover=document.createElement('div');cover.className='view-transition';
 const copy=outgoing.cloneNode(true);copy.removeAttribute('id');copy.classList.add('transition-copy');
 copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));cover.append(copy);document.body.append(cover);
 document.querySelectorAll('.view-transition').forEach(el=>{if(el!==cover)el.remove();});
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const animation=cover.animate([{opacity:1},{opacity:0}],{duration:220,easing:'ease-out'});animation.onfinish=()=>cover.remove();}));
 setTimeout(()=>cover.remove(),400);
}''')
p.write_text(s,encoding='utf8')
p=Path('battle-feedback.js');s=p.read_text(encoding='utf8').replace("'<small>특성 발동</small><b></b>'","'<b></b>'");p.write_text(s,encoding='utf8')
p=Path('styles.css');s=p.read_text(encoding='utf8');s+='''
/* Stable original tile proportions and aligned region headings. */
.battle-wrapper{width:min(960px,100%)}.battle-wrapper .game-shell{width:100%}
.battle-wrapper .board{height:auto;min-height:0;max-height:none;grid-template-rows:repeat(7,auto)}
.battle-wrapper .tile{aspect-ratio:1.45;min-height:0}
.tile>img,.tile>img.move-ghost{width:110%;left:-5%;height:auto;max-height:155%;object-fit:contain}
.chapter-nav{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);min-height:48px;align-items:center}
.chapter-nav>b{text-align:center;grid-column:2}.chapter-nav>:last-child{justify-self:end}.chapter-nav>:first-child{justify-self:start}
.view-transition{display:block!important;position:fixed;inset:0;z-index:1100;pointer-events:none;overflow:hidden;background:none;backdrop-filter:none;filter:none}
.transition-copy{width:100%;min-height:100dvh;display:grid;place-items:center;padding:18px;background:#e4eee3}.transition-copy:has(.battle-wrapper){background:#263d2b;padding:12px 18px}
.rocket-intro .leader-intro-portrait{animation:rocket-arrival .3s ease-out both}
@keyframes rocket-arrival{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:none}}
@media(max-width:700px){.chapter-nav{gap:5px}.chapter-nav b{font-size:16px}.battle-wrapper .tile{aspect-ratio:1.15}.transition-copy{padding:12px 7px}}
@media(prefers-reduced-motion:reduce){.rocket-intro .leader-intro-portrait{animation:none}}
''';p.write_text(s,encoding='utf8')
