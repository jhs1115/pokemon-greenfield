(function(root){
'use strict';
const PK=root.PKMN||(typeof require==='function'?require('@pkmn/sim'):null);
const STATS={atk:2,def:3,spa:4,spd:5,spe:6};
function create(state,data,geometry,moveFor,seed){
 const {Battle,Dex}=PK;
 Dex.data.Items.expshare={name:'Exp. Share',num:230,gen:2,isNonstandard:'Past'};
 Dex.data.Moves.greenfieldwait={num:-1000,name:'Greenfield Wait',pp:100,noPPBoosts:true,target:'self',type:'Normal',category:'Status',accuracy:true,priority:0,flags:{},onHit(){return true;}};
 const commands={};let records=[];
 const lookup=name=>{const side=name[0],index=+name.slice(1);return {side,index,mon:(side==='p'?state.party:state.foes)[index]};};
 function footprint(source,target,move){const side=source.side.id==='p1'?'p':'e',c=commands[side];if(!c||source.side===target?.side)return true;const origin=side==='p'?state.pos:state.enemyPos,def=side==='p'?state.enemyPos:state.pos,m=move.num>0&&data.moves[move.num]?moveFor(move.num):null;if(!m)return true;const aim=c.target||def;return geometry.range(origin,aim,m)&&geometry.attackTiles(origin,aim,m).some(t=>t.x===def.x&&t.y===def.y);}
 const format={...Dex.formats.get('gen9customgame'),id:'greenfield',name:'Greenfield',ruleset:[],onModifyMove(move,pokemon,target){if(move.category==='Status')return;const side=pokemon.side.id==='p1'?'p':'e',c=commands[side],m=data.moves[move.num]&&moveFor(move.num);if(c?.target&&m){const origin=side==='p'?state.pos:state.enemyPos,def=side==='p'?state.enemyPos:state.pos;move.willCrit=geometry.isCritical(origin,c.target,def,m);}},onTryHit(target,source,move){if(!footprint(source,target,move)){this.add('-miss',source,target);return null;}}};
 const sim=new Battle({formatid:'gen9customgame',format,...(seed?{seed}:{})});
 // One paralysis roll controls both tile movement and the attack (custom 12.5%).
 let mobility=null;
 const dex=sim.dex,conditions=dex.conditions,par={...conditions.get('par'),onBeforeMove(pokemon){
  const blocked=mobility?.[pokemon.name]?.paralyzed??this.randomChance(1,8);
  if(blocked){this.add('cant',pokemon,'par');return false;}
 }};
 sim.dex=Object.create(dex);sim.dex.conditions=Object.create(conditions);
 sim.dex.conditions.getByID=id=>id==='par'?par:conditions.getByID(id);
 sim.dex.conditions.get=name=>(typeof name==='string'?name:name?.id)==='par'?par:conditions.get(name);
 function prepareMovement(own,other){mobility={};for(const [i,c]of [own,other].entries()){
  const p=sim.sides[i].active[0];if(!p||c.kind==='switch')continue;
  const paralyzed=p.status==='par'?sim.randomChance(1,8):undefined;
  mobility[p.name]={canMove:!['slp','frz'].includes(p.status)&&!paralyzed,paralyzed};
 }return Object.fromEntries(Object.entries(mobility).map(([key,value])=>[key,value.canMove]));}
 const team=(mons,side)=>mons.map((m,i)=>({name:side+i,species:data.pokemon.find(p=>p.id===m.id).key,level:m.level,ability:m.abilityKey||'No Ability',item:m.heldItem||'',moves:[...m.moves.map(v=>data.moves[v.id].key),'greenfieldwait'],nature:'Serious',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0},ivs:{hp:31,atk:31,def:31,spa:31,spd:31,spe:31},pokeball:'pokeball'}));
 sim.setPlayer('p1',{name:'Player',team:team(state.party,'p')});sim.setPlayer('p2',{name:'Opponent',team:team(state.foes,'e')});
 for(const side of sim.sides)for(const p of side.pokemon){const mon=lookup(p.name).mon;if(mon.art||p.maxhp!==mon.maxHP){p.hp=mon.hp;p.maxhp=mon.maxHP;p.baseMaxhp=mon.maxHP;}for(const slot of p.moveSlots){slot.pp=slot.maxpp=slot.id==='greenfieldwait'?100:(mon.moves.find(m=>Dex.moves.get(data.moves[m.id].key).id===slot.id)?.pp||slot.maxpp);}p.baseMoveSlots=p.moveSlots.map(v=>({...v}));}
 function snapshot(){return {active:sim.sides.map(s=>s.active[0]?.name),mons:sim.sides.flatMap(s=>s.pokemon.map(p=>({name:p.name,hp:p.hp,maxHP:p.maxhp,status:p.status,item:p.item,speed:p.getActionSpeed(),volatiles:Object.keys(p.volatiles),boosts:{...p.boosts},types:p.getTypes().map(t=>(['Normal','Fighting','Flying','Poison','Ground','Rock','Bug','Ghost','Steel','Fire','Water','Grass','Electric','Psychic','Ice','Dragon','Dark','Fairy'].indexOf(t)+1)),species:p.species.num,moves:p.moveSlots.filter(m=>m.id!=='greenfieldwait').map(m=>({id:Dex.moves.get(m.id).num,pp:m.pp,maxpp:m.maxpp,disabled:m.disabled})),request:p.isActive&&!p.fainted?p.getMoveRequestData():null})))};}
 const run=sim.actions.runMove.bind(sim.actions);
 sim.actions.runMove=(...args)=>{const start=sim.log.length,before=snapshot(),actor=args[1].name,move=Dex.moves.get(args[0]);const value=run(...args);if(move.id!=='greenfieldwait')records.push({actor,move:move.num,before,after:snapshot(),logs:sim.log.slice(start),logEnd:sim.log.length});return value;};
 function choice(side,c){const s=sim.sides[side==='p'?0:1],p=s.active[0];if(c.kind==='switch')return 'switch '+(s.pokemon.findIndex(p=>p.name==='p'+c.index)+1);const req=p.getMoveRequestData(),desired=c.kind==='attack'?Dex.moves.get(data.moves[lookup(p.name).mon.moves[c.move]?.id]?.key||'').id:'greenfieldwait';let n=req.moves.findIndex(m=>m.id===desired&&!m.disabled&&m.pp!==0);if(n<0)n=req.moves.findIndex(m=>!m.disabled&&m.pp!==0);return 'move '+(n+1);}
 return {sim,snapshot,lookup,prepareMovement,turn(own,other){commands.p=own;commands.e=other;records=[];const start=sim.log.length;sim.makeChoices(choice('p',own),choice('e',other));mobility=null;const preSwitch=snapshot(),residual=sim.log.slice(records.at(-1)?.logEnd||start);let guard=0;while(sim.requestState==='switch'&&!sim.ended&&guard++<6)sim.makeChoices();return {records,preSwitch,residual,final:snapshot(),logs:sim.log.slice(start)};},apply(snap,active=false){for(const p of snap.mons){const mon=lookup(p.name).mon;mon.actionSpeed=p.speed;mon.hp=p.hp;mon.maxHP=p.maxHP;mon.status=p.status;mon.volatiles=p.volatiles;mon.statStages=Object.fromEntries(Object.entries(STATS).map(([k,v])=>[v,p.boosts[k]]));mon.accuracyStage=p.boosts.accuracy;mon.evasionStage=p.boosts.evasion;mon.types=p.types.filter(Boolean).map(Number);mon.appearance=p.species===mon.id?null:p.species;mon.moves=p.moves.filter(m=>data.moves[m.id]).map(m=>({...moveFor(m.id),remaining:m.pp,pp:m.maxpp,disabled:m.disabled||(p.request?.moves?.length>0&&!p.request.moves.some(r=>r.id===Dex.moves.get(data.moves[m.id].key).id&&!r.disabled))}));if(p.request?.moves?.length===1&&p.request.moves[0].id==='struggle')mon.moves=[{...moveFor(165),remaining:1,pp:1}];mon.nativeRequest=p.request;}
 if(active){state.active=+snap.active[0].slice(1);state.enemy=+snap.active[1].slice(1);}},syncGrowth(){for(const s of sim.sides)for(const p of s.pokemon){const mon=lookup(p.name).mon;if(mon.level!==p.level||mon.id!==p.baseSpecies.num){p.level=p.set.level=mon.level;p.set.species=data.pokemon.find(v=>v.id===mon.id).key;p.baseSpecies=Dex.species.get(p.set.species);p.setSpecies(p.baseSpecies);p.maxhp=p.baseMaxhp=mon.maxHP;p.hp=mon.hp;p.setAbility(mon.abilityKey||'noability');const old=new Map(p.moveSlots.map(v=>[v.id,v]));p.moveSlots=mon.moves.map(v=>{const move=Dex.moves.get(data.moves[v.id].key),prior=old.get(move.id);return {move:move.name,id:move.id,pp:prior?Math.min(prior.pp,move.pp):move.pp,maxpp:move.pp,target:move.target,disabled:false,used:false};});p.moveSlots.push({move:'Greenfield Wait',id:'greenfieldwait',pp:100,maxpp:100,target:'self',disabled:false,used:false});p.baseMoveSlots=p.moveSlots.map(v=>({...v}));}}},canSwitch(index){const s=sim.sides[0];return !s.active[0].trapped&&!s.activeRequest?.active?.[0]?.trapped&&s.pokemon.some(p=>p.name==='p'+index&&!p.fainted);}};
}
root.NativeCombat={create};if(typeof module==='object')module.exports=root.NativeCombat;
})(typeof window==='object'?window:globalThis);
