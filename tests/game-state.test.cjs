const assert=require('node:assert/strict');
const D=require('../data/reference.json'),T=require('../data/training.json'),P=require('../data/progression.json');
const G=require('../game-state.js')(D,T,P,require('../data/abilities.json'));
const state=G.normalize();assert.equal(state.coins,0);assert.equal(state.owned.length,0);
G.chooseStarter(state,4);assert.deepEqual(state.team,[4,null,null]);assert.equal(state.records[4].level,5);assert.deepEqual(state.moveSets[4],[10,45]);
assert.deepEqual(G.defaultMoves(1,5),[33,45]);assert.deepEqual(G.defaultMoves(7,5),[33,39]);
for(let id=1;id<=151;id++){assert.ok(G.learnable(id).length);assert.ok(G.defaultMoves(id,5).length<=4);}
const pool=G.scoutPool(state);assert.ok(pool.length>3);
assert.ok(pool.every(id=>!P.pokemon[id].legendary&&!P.pokemon[id].mythical&&(!P.pokemon[id].parent||P.pokemon[id].parent>151)));
for(const id of [144,145,146,150,151,131,143,115,127,123,128,142,5,6,8,9,2,3])assert.ok(!pool.includes(id));
const late=G.normalize({...state,clears:Array(10).fill(1)});assert.ok(G.scoutPool(late).includes(143));assert.ok(!G.scoutPool(late).includes(150));
G.completeTutorial(state);assert.equal(state.coins,10);G.completeTutorial(state);assert.equal(state.coins,10);const picks=[...G.scout(state,()=>.4)];assert.equal(state.coins,0);assert.equal(new Set(picks).size,3);
G.scout(state);assert.equal(state.coins,0);assert.deepEqual(state.pending,picks);
const resumed=G.normalize(JSON.parse(JSON.stringify(state)));assert.deepEqual(resumed.pending,picks);G.recruit(resumed,picks[1]);assert.equal(resumed.records[picks[1]].level,5);
assert.equal(resumed.pending.length,0);G.setTeam(resumed,1,picks[1]);assert.equal(resumed.team[1],picks[1]);assert.throws(()=>G.setTeam(resumed,0,152));
assert.throws(()=>G.setMove(resumed,4,0,53));assert.throws(()=>G.setMove(resumed,4,4,10));G.setMove(resumed,4,0,45);assert.equal(new Set(resumed.moveSets[4]).size,resumed.moveSets[4].length);
for(let i=0;i<8;i++)G.removeMove(resumed,4,0);assert.equal(resumed.moveSets[4].length,1);
assert.throws(()=>G.scout(G.normalize({coins:9})));
for(const[from,at,to]of [[1,16,2],[2,32,3],[4,16,5],[5,36,6],[7,16,8],[8,36,9],[10,7,11],[11,10,12]]){
 const s=G.normalize({owned:[from],team:[from],records:{[from]:G.freshRecord(from,at-1)}});s.records[from].exp=G.threshold(from,at)-1;
 const event=G.gainExperience(s,from,{id:19,level:2});assert.equal(event.id,to);assert.ok(s.owned.includes(to));assert.ok(s.team.includes(to));assert.equal(s.records[to].level,at);
}
const evolved=G.normalize({owned:[6],team:[6],records:{6:G.freshRecord(6,36)}});assert.ok(G.trainable(evolved,6).includes(63));G.setMove(evolved,6,0,63);
const pika=G.normalize({owned:[25],team:[25]});assert.throws(()=>G.evolve(pika,25,26),/진화의 돌/);pika.inventory['thunder-stone']=1;pika.itemsUnlocked=true;pika.inventory['exp-share']=1;G.equipItem(pika,25,'exp-share');assert.throws(()=>G.equipItem(pika,25,'thunder-stone'),/도구 사용/);assert.throws(()=>G.useItem(pika,25,'fire-stone'),/사용할 수 없는/);assert.equal(G.useItem(pika,25,'thunder-stone'),26);assert.equal(pika.inventory['thunder-stone'],0);assert.equal(pika.heldItems[26],'exp-share');assert.equal(pika.records[26].level,5);
const e=G.normalize();G.chooseStarter(e,1);const ev=G.gainExperience(e,1,{id:19,level:3});assert.equal(ev.amount,Math.floor(57*3/7));
const shared=G.normalize();G.chooseStarter(shared,1);assert.equal(G.gainExperience(shared,1,{id:19,level:3},false,2).amount,Math.floor(57*3/14));
assert.equal(G.unlocked(e,1),false);assert.equal(G.reward(e,1,'bad').total,0);assert.equal(G.reward(e,0,'first').total,2);assert.equal(G.reward(e,0,'first').total,0);assert.equal(G.reward(e,0,'repeat').total,0);
for(let i=1;i<10;i++)assert.ok(G.reward(e,i,'stage'+i).total>=1);assert.equal(e.clears[9],1);assert.ok(G.scoutPool(e).includes(143));
console.log('Starter Lv5 moves, scout exclusions/late unlocks, level-only recall, EXP sharing, exact evolution levels, and 10-stage rewards: passed.');

assert.throws(()=>G.setAbility(state,4,94));assert.equal(G.ability(state,4),G.defaultAbility(4));const final=G.normalize({owned:[6],team:[6]});G.setAbility(final,6,94);assert.equal(G.ability(final,6),94);assert.equal(G.ability(G.normalize(JSON.parse(JSON.stringify(final))),6),94);assert.throws(()=>G.setAbility(final,6,22));

const coinTest=G.normalize();G.chooseStarter(coinTest,4);
assert.deepEqual(Array.from({length:9},(_,i)=>G.reward(coinTest,0,'coin-'+i).total),[2,0,1,0,0,1,0,0,1]);
const beforeDuplicate=coinTest.coins;assert.equal(G.reward(coinTest,0,'coin-8').total,0);assert.equal(coinTest.coins,beforeDuplicate);
const bossReward=G.normalize({clears:Array(9).fill(1)});assert.equal(G.reward(bossReward,9,'boss-first').total,5);
assert.equal(G.normalize().coins,0);assert.equal(G.completeTutorial(coinTest),10);
console.log('Updated economy: first clear 2/5 coins, every third clear 1 coin, duplicate protection: passed.');
