(function(root){
 'use strict';
 const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 const inside=p=>p.x>=0&&p.x<10&&p.y>=0&&p.y<7;
 const directional=m=>['front','ray','cone'].includes(m.impact);
 // Small, fixed starter footprints; their upgrades still use the normal nine-tile rules.
 const BASIC_MOVE_RULES={
  1:{range:1,impact:'front',width:0},10:{range:1,impact:'front',width:0},33:{range:1,impact:'front',width:0},64:{range:1,impact:'front',width:0},122:{range:1,impact:'front',width:0},
  22:{range:2,impact:'ray',width:0},55:{range:2,impact:'ray',width:0},98:{range:2,impact:'ray',width:0},81:{range:3,impact:'ray',width:0},
  52:{range:2,impact:'single',mask:[[0,0],[0,-1],[0,1]]},84:{range:2,impact:'single',mask:[[0,0],[-1,0],[1,0]]},93:{range:2,impact:'single',mask:[[0,0],[-1,-1],[1,1]]},
  16:{range:1,impact:'front',width:1},145:{range:1,impact:'front',width:1},45:{range:1,impact:'front',width:1},39:{range:1,impact:'front',width:1},43:{range:2,impact:'single'},47:{range:2,impact:'single'},28:{range:1,impact:'front',width:1},
  71:{range:2,impact:'single'},40:{range:3,impact:'single'},73:{range:3,impact:'single'}
 };
 // Authored footprints follow the action, rather than move ID modulo patterns.
 function signatureGeometry(m){
  const k=m.key||'';if(!k||m.impact==='self'||m.id===157)return m;
  const local=(label,cells,reach)=>({...m,impact:'cone',range:reach,localMask:cells,geometryLabel:label});
  const area=(label,cells)=>({...m,impact:'single',mask:cells,geometryLabel:label});
  if(m.damageClass===1){
   if(/powder|spore|mist|haze|smoke/.test(k))return area('안개 지대',[[0,0],[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1]]);
   if(/wave|glare|hypnosis|confuse/.test(k))return area('교란 교차',[[0,0],[-1,-1],[1,-1],[-1,1],[1,1]]);
   return m;
  }
  if([32,90,329].includes(m.id))return m;
  if(/punch|hammer|palm/.test(k))return local('정면 충격',[[1,0],[2,0],[2,-1],[2,1]],2);
  if(/kick|stomp|rolling|rollout/.test(k))return local('쐐기 돌파',[[1,-1],[1,0],[1,1],[2,0],[3,0]],3);
  if(/slash|claw|cut|chop|blade|scythe/.test(k))return local('초승달 베기',[[1,-1],[1,0],[1,1],[2,-2],[2,-1],[2,1],[2,2]],2);
  if(/bite|fang|crunch|jaw/.test(k))return local('집게 물기',[[1,0],[1,-1],[1,1],[2,-1],[2,1]],2);
  if(/beam|cannon|gun|lance/.test(k))return local('집중 포격',[[1,0],[2,0],[2,-1],[2,1],[3,0],[3,-1],[3,1],[4,0]],4);
  if(/pulse|breath/.test(k))return local('맥동 파동',[[1,0],[2,-1],[2,0],[2,1],[3,-1],[3,0],[3,1]],3);
  if(/surf|wave|muddy-water/.test(k))return local('넓은 파도',[[1,-1],[1,0],[1,1],[2,-1],[2,0],[2,1],[3,-1],[3,0],[3,1]],3);
  if(/earthquake|magnitude|bulldoze|self-destruct|explosion|discharge|petal-blizzard/.test(k))return {...m,impact:'burst',range:0,mask:null,geometryLabel:'주변 충격파'};
  if(/whirl|spin|vortex|hurricane|twister/.test(k))return area('회오리 고리',[[0,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]]);
  if(/thunder|lightning|zap|bolt/.test(k))return area('번개 갈래',[[0,0],[-1,0],[1,0],[0,-1],[0,1],[-2,0],[2,0],[0,-2],[0,2]]);
  if(/blizzard|ice|freeze|frost/.test(k))return area('얼음 결정',[[0,0],[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]]);
  if(/flame|fire|heat|burn/.test(k))return local('불꽃 부채',[[1,0],[2,-1],[2,0],[2,1],[3,-2],[3,-1],[3,0],[3,1],[3,2]],3);
  if(/bomb|meteor|avalanche/.test(k))return area('폭발 충격',[[0,0],[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]);
  if(/ball|orb|sphere/.test(k))return area('구체 확산',[[0,0],[-1,0],[1,0],[0,-1],[0,1]]);
  if(/sting|needle|spike|seed|shuriken|missile/.test(k))return local('갈래 투사',[[1,0],[2,-1],[2,0],[2,1],[3,-1],[3,1]],3);
  if(/wing|gust|air|aerial/.test(k))return local('날개 바람',[[1,-1],[1,0],[1,1],[2,-2],[2,0],[2,2]],2);
  if(/leaf|petal|razor/.test(k))return local('잎새 부채',[[1,0],[2,-1],[2,0],[2,1],[3,-2],[3,0],[3,2]],3);
  if(/psychic|psyshock|extrasensory/.test(k))return area('염동 교차',[[0,0],[-1,-1],[1,-1],[-1,1],[1,1],[-1,0],[1,0]]);
  if(/rock|stone|tomb/.test(k))return area('바위 낙하',[[0,0],[-1,0],[1,0],[-1,-1],[0,-1],[1,-1]]);
  if(/sludge|acid|poison|venom/.test(k))return area('독성 비산',[[0,0],[-1,0],[1,0],[0,1],[-1,1],[1,1]]);
  if(/tackle|slam|head|rush|charge|impact/.test(k))return local('돌진 충격',[[1,0],[2,-1],[2,0],[2,1],[3,0]],3);
  return m;
 }
 function normalizeMove(move){
  if(move.geometryVersion===2)return {...move};
  // Footprint cap, distinct from selectable reach. Starter attacks stay compact.
  const m={...move,geometryVersion:2,range:Math.min(5,move.range||0),tileLimit:9};
  if(['square','ring','burst','diagonal','diamond'].includes(m.impact))m.size=1;
  if(m.impact==='cross')m.size=(m.power||0)>=80?2:1;
  if(m.impact==='ray'){if([32,90,329].includes(m.id)){m.range=5;m.width=0;}else {m.impact='cone';m.range=3;}}
  if(m.impact==='cone')m.range=3;
  if(m.impact==='front'){m.width=1;m.depth=(m.power||0)>=60?2:1;m.range=m.depth;}
  if(m.damageClass===1&&!['self','burst'].includes(m.impact)){if(m.id===81){m.impact='ray';m.range=5;m.width=0;}if(m.impact==='front'){m.impact='cross';m.size=1;}m.range=Math.max(3,m.range);return signatureGeometry(m);}
  return BASIC_MOVE_RULES[m.id]?{...m,...BASIC_MOVE_RULES[m.id],basicMove:true}:signatureGeometry(m);
 }
 function range(origin,target,move){
  move=normalizeMove(move);
  if(!inside(target))return false;
  if(!move.impact)return distance(origin,target)<=move.range&&(move.shape!=='line'||origin.x===target.x||origin.y===target.y);
  const dx=target.x-origin.x,dy=target.y-origin.y;
  if(move.impact==='self'||move.impact==='burst')return dx===0&&dy===0;
  if(directional(move))return (dx===0)!==(dy===0)&&Math.abs(dx)+Math.abs(dy)<=move.range;
  return Math.max(Math.abs(dx),Math.abs(dy))<=move.range;
 }
 function attackTiles(origin,target,move){
  move=normalizeMove(move);
  if(!range(origin,target,move))return [];
  if(move.impact==='self')return [{...origin}];
  const tiles=[],seen=new Set(),add=(x,y)=>{const key=x+','+y;if(inside({x,y})&&(move.impact==='burst'||x!==origin.x||y!==origin.y)&&!seen.has(key)){seen.add(key);tiles.push({x,y});}};
  if(move.localMask){const dx=Math.sign(target.x-origin.x),dy=Math.sign(target.y-origin.y);for(const [depth,offset]of move.localMask)add(origin.x+dx*depth-dy*offset,origin.y+dy*depth+dx*offset);}
  else if(move.mask){for(const [dx,dy]of move.mask)add(target.x+dx,target.y+dy);}
  else if(move.impact==='burst'&&move.tileLimit===5){for(const [x,y]of [[0,0],[0,-1],[1,0],[0,1],[-1,0]])add(origin.x+x,origin.y+y);}
  else if(move.impact==='ring'&&move.tileLimit===5){for(const [x,y]of [[0,0],[0,-2],[2,0],[0,2],[-2,0]])add(target.x+x,target.y+y);}
  else if(move.impact==='cone'&&move.tileLimit===5){const dx=Math.sign(target.x-origin.x),dy=Math.sign(target.y-origin.y);for(const [depth,offset]of [[1,0],[2,-1],[2,0],[2,1],[3,0]])add(origin.x+dx*depth-dy*offset,origin.y+dy*depth+dx*offset);}
  else if(move.impact==='burst'){for(let y=-move.size;y<=move.size;y++)for(let x=-move.size;x<=move.size;x++)if(Math.abs(x)+Math.abs(y)<=move.size+1)add(origin.x+x,origin.y+y);}
  else if(move.impact==='diamond'){for(let y=-move.size;y<=move.size;y++)for(let x=-move.size;x<=move.size;x++)if(Math.abs(x)+Math.abs(y)<=move.size)add(target.x+x,target.y+y);}
  else if(move.impact==='diagonal'){add(target.x,target.y);for(let n=1;n<=move.size;n++)for(const [x,y]of [[1,1],[1,-1],[-1,1],[-1,-1]])add(target.x+x*n,target.y+y*n);}
  else if(move.impact==='ring'){add(target.x,target.y);for(let y=-move.size;y<=move.size;y++)for(let x=-move.size;x<=move.size;x++)if(Math.max(Math.abs(x),Math.abs(y))===move.size)add(target.x+x,target.y+y);}
  else if(directional(move)){
   const dx=Math.sign(target.x-origin.x),dy=Math.sign(target.y-origin.y);
   for(let depth=1;depth<=(move.impact==='front'?(move.depth||1):move.range);depth++){
    const width=move.impact==='cone'?depth-1:(move.width||0);
    for(let offset=-width;offset<=width;offset++)add(origin.x+dx*depth-dy*offset,origin.y+dy*depth+dx*offset);
   }
  }else if(move.impact==='square'){
   for(let y=-move.size;y<=move.size;y++)for(let x=-move.size;x<=move.size;x++)add(target.x+x,target.y+y);
  }else if(move.impact==='cross'){
   add(target.x,target.y);for(let n=1;n<=move.size;n++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])add(target.x+dx*n,target.y+dy*n);
  }else add(target.x,target.y);
  return tiles.slice(0,move.tileLimit);
 }
 function effectiveness(type,types,data){return types.reduce((v,t)=>v*(data.efficacy[`${type}-${t}`]??1),1);}
 function criticalTiles(origin,target,move){return move.damageClass===1?[]:attackTiles(origin,target,move).filter(p=>p.x===target.x&&p.y===target.y);}
 function isCritical(origin,target,position,move){return criticalTiles(origin,target,move).some(p=>p.x===position.x&&p.y===position.y);}
 function stageMultiplier(stage=0){const s=Math.max(-6,Math.min(6,Math.trunc(stage)||0));return s>=0?(2+s)/2:2/(2-s);}
 function damage(attacker,defender,move,data,{critical=false}={}){
  if(move.damageClass===1)return 0;
  const factor=effectiveness(move.type,defender.types,data);
  if(!factor)return 0;
  const fixed={49:20,69:attacker.level||20,82:40,101:attacker.level||20,162:Math.max(1,Math.floor(defender.hp/2))};
  if(fixed[move.id])return fixed[move.id];
  if(!move.power)return 0;
  const physical=move.damageClass===2;
  const attackStat=physical?2:4,defenseStat=physical?3:5;
  const attackStage=attacker.statStages?.[attackStat]||0,defenseStage=defender.statStages?.[defenseStat]||0;
  const atk=Math.max(1,Math.floor(attacker.battleStats[attackStat]*stageMultiplier(critical?Math.max(0,attackStage):attackStage)));
  const def=Math.max(1,Math.floor(defender.battleStats[defenseStat]*stageMultiplier(critical?Math.min(0,defenseStage):defenseStage)));
  return Math.max(1,Math.floor((Math.floor((2*(attacker.level||20)/5+2)*move.power*atk/def/50)+2)*(attacker.types.includes(move.type)?1.5:1)*factor*(critical?1.5:1)));
 }
 function order(actions,random=Math.random){return actions.map(a=>({...a,tie:random()})).sort((a,b)=>(b.priority??0)-(a.priority??0)||b.speed-a.speed||a.tie-b.tie);}
 function path(start,end,blocked,budget=1){
  const queue=[{...start,steps:[]}],seen=new Set([`${start.x},${start.y}`]);
  while(queue.length){const p=queue.shift();if(p.x===end.x&&p.y===end.y)return p.steps;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const n={x:p.x+dx,y:p.y+dy},key=`${n.x},${n.y}`;
    if(n.x<0||n.x>9||n.y<0||n.y>6||seen.has(key)||n.x===blocked.x&&n.y===blocked.y||p.steps.length>=budget)continue;
    seen.add(key);queue.push({...n,steps:[...p.steps,n]});}}
  return null;
 }
 function spawnPosition(side,occupied){const pos={x:side===0?2:7,y:3};if(occupied&&pos.x===occupied.x&&pos.y===occupied.y)pos.x=side===0?1:8;return pos;}
 root.BattleEngine={spawnPosition,BASIC_MOVE_RULES,normalizeMove,distance,range,attackTiles,criticalTiles,isCritical,stageMultiplier,directional,effectiveness,damage,order,path};
 if(typeof module!=='undefined')module.exports=root.BattleEngine;
})(typeof window!=='undefined'?window:globalThis);
