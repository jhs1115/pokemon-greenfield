const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const events=[];
const context=vm.createContext({
 window:{ABILITY_DATA:require('../data/abilities.json'),PKMN:require('@pkmn/sim'),NativeCombat:require('../native-combat.js'),POKE_DATA:require('../data/reference.json'),TRAINING_DATA:require('../data/training.json'),PROGRESSION_DATA:require('../data/progression.json'),STORY_STAGES:[{name:'1-1',enemy:[7,16,19],levels:[20,20,20]}],getExpandedMoveRule:require('../expanded-moves.js'),createGameModel:require('../game-state.js'),BattleEngine:require('../engine.js'),MOVE_RULES:require('../moves.js'),
  animateMovement:async(from,to)=>events.push(`move:${from.x}->${to.x}`),
  playMoveEffect:async({side})=>events.push(`attack:${side}`)},
 document:{querySelector:()=>({}),querySelectorAll:()=>[]},
 moveClassName:m=>({1:"변화",2:"물리",3:"특수"})[m.damageClass],moveClassBadge:()=>"",showMoveName:()=>{},showExperienceNotice:()=>{},showAbilityNotices:()=>{},describeCombat:()=>[{text:'used',side:'e'}],showBattleNotes:()=>{},localStorage:{getItem:()=>null,setItem:()=>{}},setTimeout:callback=>callback(),console
});
let source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
source=source.replace(/render\(\);\s*$/,'');
vm.runInContext(source,context);
vm.runInContext("render=()=>{};function fixture(){game=G.normalize({owned:[25,1,4],team:[25,1,4],records:{25:G.freshRecord(25,20),1:G.freshRecord(1,20),4:G.freshRecord(4,20)}});game.moveSets[25]=[84,98,85,21];startBattle();enemy().moves=sets[7].map(id=>({...moveFor(id),remaining:D.moves[id].pp}));battle.combat=window.NativeCombat.create(battle,D,E,moveFor,[1,2,3,4]);}fixture();aiCommand=()=>({kind:'attack',destination:{x:6,y:3},target:{x:3,y:3},move:0});",context);
vm.runInContext("{const own=makeMon(7,true,20),fire=makeMon(4,true,20),water=makeMon(7,true,20);if(!(enemyMoveValue(moveFor(55),own,fire,true,false)>enemyMoveValue(moveFor(55),own,water,true,false)))throw Error('AI type advantage');const hurt={...own,hp:1};if(!(enemyMoveValue(moveFor(105),hurt,fire,true,false)>0)||enemyMoveValue(moveFor(105),own,fire,true,false)!==0)throw Error('AI healing threshold');fire.status='par';if(enemyMoveValue(moveFor(86),own,fire,true,false)!==0)throw Error('AI duplicate status');}",context);
(async()=>{
 await vm.runInContext("resolveTurn({kind:'attack',destination:{x:3,y:3},target:{x:6,y:3},move:0})",context);
 assert.deepEqual(events,['move:2->3','move:7->6','attack:p','attack:e']);
 assert.equal(vm.runInContext('battle.turn',context),2);
 assert.equal(vm.runInContext('battle.mode',context),'idle');
 events.length=0;
 vm.runInContext("fixture();enemy().hp=1;battle.combat.sim.sides[1].active[0].hp=1;",context);
 await vm.runInContext("resolveTurn({kind:'attack',destination:{x:3,y:3},target:{x:6,y:3},move:2})",context);
 assert.deepEqual(events,['move:2->3','move:7->6','attack:p']);
 events.length=0;
 vm.runInContext("fixture();enemy().actionSpeed=999;battle.combat.sim.sides[1].active[0].storedStats.spe=999;aiCommand=()=>({kind:'attack',destination:{x:6,y:3},target:{x:2,y:3},move:0});",context);
 await vm.runInContext("resolveTurn({kind:'attack',destination:{x:3,y:3},target:{x:6,y:3},move:0})",context);
 assert.deepEqual(events,['move:7->6','move:2->3','attack:e','attack:p']);
 vm.runInContext("stage=0;fixture();game.coins=30;game.clears=Array(10).fill(0);game.claimed=[];battle.foes.forEach(p=>p.hp=1);battle.combat.sim.sides[1].pokemon.forEach(p=>p.hp=1);aiCommand=()=>({kind:'wait',destination:{...battle.enemyPos}});",context);
 for(let i=0;i<3;i++)await vm.runInContext("resolveTurn({kind:'attack',destination:{x:3,y:3},target:{x:7,y:3},move:2})",context);
 assert.equal(vm.runInContext('battle.result',context),'win');
 assert.equal(vm.runInContext('game.coins',context),35);
 await vm.runInContext("resolveTurn({kind:'wait',destination:{x:3,y:3}})",context);
 assert.equal(vm.runInContext('game.coins',context),35);
 console.log('Complete action order, faster opponent, and knockout cancellation: passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
