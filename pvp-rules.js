(function(root){
'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
function createPvpRules({D,T,P,A,I,G,E,N,moveFor}){
 const validPoint=p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.x<10&&p.y>=0&&p.y<7;
 function prepareTeam(raw,selection){const save=G.normalize(raw);if(!Array.isArray(selection)||selection.length!==6)throw Error('SIX_REQUIRED');const ids=new Set(),items=new Set();return selection.map(entry=>{
  const id=Number(entry.id),item=entry.item||'';if(!save.owned.includes(id))throw Error('NOT_OWNED');if(ids.has(id))throw Error('DUPLICATE_POKEMON');ids.add(id);
  if(item){if(!I[item]||I[item].stone||I[item].mint||I[item].ticket||!(save.inventory[item]>0||Object.values(save.heldItems).includes(item)))throw Error('ITEM_NOT_OWNED');if(items.has(item))throw Error('DUPLICATE_ITEM');items.add(item);}
  return {id,item,nature:G.effectiveNature(save.records[id]),ability:G.ability(save,id),moves:[...save.moveSets[id]]};
 });}
 function mon(entry){const species=D.pokemon.find(p=>p.id===entry.id);if(!species)throw Error('INVALID_SPECIES');const stats=G.battleStats(entry.id,50,entry.nature);
  return {...copy(species),level:50,natureKey:entry.nature||'Serious',heldItem:entry.item||'',abilityId:entry.ability,abilityKey:A.abilities[entry.ability]?.key||'noability',battleStats:stats,statStages:{2:0,3:0,4:0,5:0,6:0},hp:stats[1],maxHP:stats[1],moves:entry.moves.map(id=>({...moveFor(id),remaining:D.moves[id].pp}))};
 }
 function create(match){const picks1=match.picks1||[0,1,2],picks2=match.picks2||[0,1,2];const state={party:picks1.map(i=>mon(match.team1[i])),foes:picks2.map(i=>mon(match.team2[i])),active:0,enemy:0,pos:{x:2,y:3},enemyPos:{x:7,y:3},turn:1,revealed:[[true,false,false],[true,false,false]]};const combat=N.create(state,D,E,moveFor,match.seed);state.combat=combat;combat.apply(combat.snapshot());
  const frame=()=>copy({party:state.party,foes:state.foes,active:state.active,enemy:state.enemy,pos:state.pos,enemyPos:state.enemyPos,turn:state.turn,revealed:state.revealed,snapshot:combat.snapshot()});
  function command(side,input){const list=side===0?state.party:state.foes,index=side===0?state.active:state.enemy,origin=side===0?state.pos:state.enemyPos,blocked=side===0?state.enemyPos:state.pos,p=list[index],native=combat.sim.sides[side];if(!input)return {kind:'wait',destination:{...origin}};if(input.kind==='wait'){const destination=input.destination||origin;if(!validPoint(destination)||E.path(origin,destination,blocked)===null)throw Error('INVALID_TARGET');if(['slp','frz'].includes(p.status)&&(destination.x!==origin.x||destination.y!==origin.y))throw Error('CANNOT_MOVE');return {kind:'wait',destination:{...destination}};}
   if(input.kind==='switch'){if(!Number.isInteger(input.index)||input.index<0||input.index>2||input.index===index||list[input.index].hp<=0||native.active[0].trapped||native.activeRequest?.active?.[0]?.trapped)throw Error('INVALID_SWITCH');return {kind:'switch',index:input.index};}
   if(input.kind!=='attack'||!Number.isInteger(input.move)||!p.moves[input.move]||p.moves[input.move].remaining<=0||p.moves[input.move].disabled)throw Error('INVALID_MOVE');const destination=input.destination,target=input.target;
   if(!validPoint(destination)||!validPoint(target)||E.path(origin,destination,blocked)===null||!E.range(destination,target,p.moves[input.move]))throw Error('INVALID_TARGET');if(['slp','frz'].includes(p.status)&&(destination.x!==origin.x||destination.y!==origin.y))throw Error('CANNOT_MOVE');
   return {kind:'attack',move:input.move,destination:{...destination},target:{...target}};
  }
  function turn(first,second){const commands=[command(0,first),command(1,second)],event={kind:'turn',turn:state.turn,before:frame(),switches:[],movements:[]};
   for(const [i,c]of commands.entries())if(c.kind==='switch'){state.revealed[i][c.index]=true;if(i===0)state.active=c.index;else state.enemy=c.index;const key=i===0?'pos':'enemyPos';state[key]=E.spawnPosition(i,i===0?state.enemyPos:state.pos);event.switches.push({side:i,index:c.index,position:{...state[key]}});}
   const allowed=combat.prepareMovement(...commands),movers=E.order(commands.map((c,i)=>({side:i,c,speed:combat.sim.sides[i].active[0].getActionSpeed(),priority:0})),()=>combat.sim.random(0,65536)/65536);
   for(const {side,c}of movers){if(c.kind==='switch')continue;const key=side===0?'pos':'enemyPos',other=side===0?state.enemyPos:state.pos,index=side===0?state.active:state.enemy,name=(side===0?'p':'e')+index;if(allowed[name]===false)continue;const steps=E.path(state[key],c.destination,other);if(steps?.length){const from={...state[key]},to={...steps.at(-1)};state[key]=to;event.movements.push({side,from,to});}}
   const attackPositions=[{...state.pos},{...state.enemyPos}],previous=[state.active,state.enemy],result=combat.turn(...commands);for(const record of result.records){const side=record.actor[0]==='p'?0:1;const positions=record.before.positions||attackPositions;record.origin=positions[side];record.target=commands[side].target||positions[side];record.defenderPos=positions[1-side];}combat.apply(result.final,true);for(const r of result.records)for(const snap of [r.before,r.after])for(let side=0;side<2;side++)state.revealed[side][+snap.active[side].slice(1)]=true;state.revealed[0][state.active]=true;state.revealed[1][state.enemy]=true;if(state.pos.x===state.enemyPos.x&&state.pos.y===state.enemyPos.y)state.enemyPos={x:state.pos.x===7?8:7,y:3};
   const alive=[state.party.some(p=>p.hp>0),state.foes.some(p=>p.hp>0)];let winner=alive[0]&&!alive[1]?'p1':alive[1]&&!alive[0]?'p2':!alive[0]&&!alive[1]?'draw':null;if(state.turn>=100&&!winner)winner='draw';
   state.turn++;event.records=result.records;event.logs=result.logs;event.residual=result.residual;event.snapshot=result.final;event.after=frame();event.commands=commands;event.winner=winner;event.delayMs=Math.min(24000,600+result.records.reduce((n,r)=>n+Math.max(0,(r.hitFrames?.length||1)-1)*700,0)+event.switches.length*400+event.movements.length*660+event.records.length*2700+(event.residual.length?850:0));return event;
  }
  return {state,combat,frame,command,turn};
 }
 function replay(match){const game=create(match);for(const entry of match.history||[])game.turn(entry[0],entry[1]);return game;}
 function resolve(match){const game=replay(match);if(!match.state){const event={kind:'start',logs:game.combat.sim.log.slice(),after:game.frame(),delayMs:1300};return {state:event.after,event,commands:null,winner:null,delayMs:event.delayMs};}
  const event=game.turn(match.pending1,match.pending2);return {state:event.after,event,commands:event.commands,winner:event.winner,delayMs:event.delayMs};
 }
 function publicMatch(match,uid,afterVersion=0){const own=match.player1===uid?0:match.player2===uid?1:-1;if(own<0)throw Error('NOT_PARTICIPANT');const opponent=1-own,seen=match.state?.revealed?.[opponent]||[true,false,false];
  const result={id:match.id,own,phase:match.phase,round:match.round,version:match.version,deadline:match.deadline,startsAt:match.starts_at,serverNow:new Date().toISOString(),winner:match.winner,team1:match.team1.map(m=>({id:m.id})),team2:match.team2.map(m=>({id:m.id})),picked:!!(own===0?match.picks1:match.picks2),submitted:!!(own===0?match.pending1:match.pending2),ready:[!!match.pending1,!!match.pending2],picks1:own===0?match.picks1:null,picks2:own===1?match.picks2:null,state:copy(match.state),events:copy((match.events||[]).filter(e=>e.version>afterVersion))};
  const opponentName=own===0?'e':'p',opponentParty=own===0?'foes':'party';
  const safeLogs=lines=>lines.filter(line=>line.startsWith('|-')||/^\|(move|cant|switch|drag|replace|faint|turn|upkeep|win|tie)\|/.test(line));
  function redact(value){if(!value||typeof value!=='object')return;
   if(Array.isArray(value[opponentParty]))value[opponentParty]=value[opponentParty].map((mon,i)=>seen[i]?{...mon,moves:[],heldItem:'',abilityKey:'',abilityId:0,revealed:true}:{id:null,name:'???',level:50,hp:0,maxHP:1,types:[],moves:[],statStages:{2:0,3:0,4:0,5:0,6:0},volatiles:[],revealed:false});
   if(Array.isArray(value.mons))value.mons=value.mons.map(m=>{if(!m.name?.startsWith(opponentName))return m;const i=+m.name.slice(1);return seen[i]?{...m,moves:[],request:null,item:'',revealed:true}:{name:m.name,revealed:false};});
   if(Array.isArray(value.logs))value.logs=safeLogs(value.logs);if(Array.isArray(value.residual))value.residual=safeLogs(value.residual);
   if(Array.isArray(value.revealed))delete value.revealed;
   for(const [key,v]of Object.entries(value)){if(key==='commands'){delete value[key];continue;}if(Array.isArray(v))v.forEach(redact);else if(v&&typeof v==='object')redact(v);}
  }
  redact(result.state);result.events.forEach(redact);return result;
 }

 return {prepareTeam,create,replay,resolve,publicMatch};
}
root.createPvpRules=createPvpRules;if(typeof module==='object')module.exports={createPvpRules};
})(typeof window==='object'?window:globalThis);
