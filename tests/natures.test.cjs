const assert=require('node:assert/strict'),PK=require('@pkmn/sim'),D=require('../data/reference.json'),T=require('../data/training.json'),P=require('../data/progression.json'),A=require('../data/abilities.json'),I=require('../items'),G=require('../game-state')(D,T,P,A,I),E=require('../engine'),N=require('../native-combat'),rules=require('../moves'),expanded=require('../expanded-moves');
const moveFor=id=>E.normalizeMove({...D.moves[id],...(rules[id]||expanded(D.moves[id]))});
assert.equal(Object.keys(G.natures).length,25);
for(const nature of Object.keys(G.natures)){
 const p=D.pokemon.find(p=>p.id===6),stats=G.battleStats(6,50,nature),mon={...p,natureKey:nature,level:50,maxHP:stats[1],hp:stats[1],moves:[{...moveFor(52),remaining:25}],battleStats:stats};
 const state={party:[mon],foes:[{...mon}],active:0,enemy:0,pos:{x:2,y:3},enemyPos:{x:7,y:3}};
 const sim=N.create(state,D,E,moveFor,[1,2,3,4]).sim.sides[0].active[0];
 assert.equal(sim.maxhp,stats[1]);for(const [id,key]of [[2,'atk'],[3,'def'],[4,'spa'],[5,'spd'],[6,'spe']])assert.equal(sim.storedStats[key],stats[id],nature+' '+key);
}
const s=G.normalize({owned:[4,7,1,25,16,19],team:[4,7,1,25,16,19],coins:100,itemsUnlocked:true,clears:Array(70).fill(1)});
assert.equal(s.records[4].nature,'Serious','legacy saves receive a stable neutral nature');G.buyItem(s,'adamant-mint');const cash=s.coins;G.useItem(s,4,'adamant-mint');assert.equal(s.inventory['adamant-mint'],0);assert.equal(s.records[4].nature,'Serious');assert.equal(G.effectiveNature(s.records[4]),'Adamant');assert.equal(G.normalize(JSON.parse(JSON.stringify(s))).records[4].mint,'Adamant');assert.equal(s.coins,cash);assert.throws(()=>G.equipItem(s,4,'adamant-mint'));
const starter=G.normalize();G.chooseStarter(starter,4,()=>.12);assert.equal(starter.records[4].nature,'Adamant');
const scout=G.normalize({coins:100});G.scout(scout,()=>.12);const pending=G.normalize(JSON.parse(JSON.stringify(scout)));assert.deepEqual(pending.pendingNatures,scout.pendingNatures);const id=pending.pending[0];G.recruit(pending,id);assert.equal(pending.records[id].nature,'Adamant');assert.deepEqual(pending.pendingNatures,{});
const Rules=require('../pvp-rules').createPvpRules({D,T,P,A,I,G,E,N,moveFor}),entries=s.owned.map(id=>({id,item:''})),team=Rules.prepareTeam(s,entries);assert.equal(team[0].nature,'Adamant');const match=Rules.create({team1:team,team2:team,seed:[1,2,3,4]});assert.equal(match.state.party[0].natureKey,'Adamant');assert.equal(match.combat.sim.sides[0].active[0].storedStats.atk,G.battleStats(4,50,'Adamant')[2]);s.inventory['adamant-mint']=1;assert.throws(()=>Rules.prepareTeam(s,entries.map((e,i)=>i===0?{...e,item:'adamant-mint'}:e)),/ITEM_NOT_OWNED/);
console.log('All 25 natures match native stats; random starter/scout, persisted candidates, mint consumption, legacy migration and fixed-50 PVP nature freeze: passed.');
