from pathlib import Path
p=Path('native-combat.js');s=p.read_text(encoding='utf8').replace("const paralyzed=p.status==='par'&&sim.randomChance(1,8);","const paralyzed=p.status==='par'?sim.randomChance(1,8):undefined;");p.write_text(s,encoding='utf8')
p=Path('app.js');s=p.read_text(encoding='utf8');s=s.replace('isEnemy?G.defaultMoves(id,level):','isEnemy?enemyMoveIds(id,level):')
a=s.index('function aiCommand(){');b=s.index('const pause=',a)
s=s[:a]+'''function enemyMoveIds(id,level){
 const moves=[...new Set(G.levelMoves(id,level))].map(moveFor),p=species(id);
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
 if(native.boosts){const target=self?p:def,good=Object.entries(native.boosts).filter(([key,v])=>{const index=({atk:2,def:3,spa:4,spd:5,spe:6})[key],current=target.statStages?.[index]||0;return self?v>0&&current<2:v<0&&current>-2;});
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
''' +s[b:];p.write_text(s,encoding='utf8')
