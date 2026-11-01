const assert=require('node:assert/strict');
const PK=require('@pkmn/sim');global.PKMN=PK;
const N=require('../native-combat'),D=require('../data/reference.json');
const byKey=k=>Object.values(D.moves).find(m=>m.key===k).id;
const mf=id=>({...D.moves[id],range:99,impact:'single'});
function setup(own,foe,ids=[25,7],seed=[1,2,3,4]){const mk=(id,moves)=>({...D.pokemon.find(p=>p.id===id),level:50,hp:200,maxHP:200,moves:moves.map(key=>({...mf(byKey(key)),remaining:40}))});const state={party:[mk(ids[0],own)],foes:[mk(ids[1],foe)],active:0,enemy:0,pos:{x:2,y:3},enemyPos:{x:3,y:3}};const geo={range:()=>true,attackTiles:()=>[state.enemyPos,state.pos],isCritical:()=>false};const combat=N.create(state,D,geo,mf,seed);const turn=(a=0,b=0)=>combat.turn({kind:'attack',move:a,target:state.enemyPos},{kind:'attack',move:b,target:state.pos});return {state,combat,turn,geo};}
let x=setup(['sucker-punch'],['growl']);assert(x.turn().logs.some(l=>l.startsWith('|-fail|')),'Sucker Punch must fail against status moves');
x=setup(['sucker-punch'],['tackle']);assert(x.turn().logs.some(l=>l.startsWith('|-damage|p2')),'Sucker Punch must hit pending attacks');
x=setup(['sucker-punch'],['quick-attack'],[7,25]);assert(x.turn().logs.some(l=>l.startsWith('|-fail|')),'Sucker Punch fails after opponent acts');
x=setup(['upper-hand'],['tackle']);assert(x.turn().logs.some(l=>l.startsWith('|-fail|')),'Upper Hand requires positive priority');
x=setup(['upper-hand'],['quick-attack']);let r=x.turn();assert(r.logs.some(l=>l.includes('|flinch')),'Upper Hand flinches priority attack');assert(!r.logs.some(l=>l.startsWith('|-damage|p1')));
x=setup(['thunder-wave'],['tackle']);r=x.turn();assert(r.final.mons.find(m=>m.name==='e0').status==='par');
x=setup(['spore'],['tackle']);r=x.turn();assert.equal(r.final.mons.find(m=>m.name==='e0').status,'slp');assert(r.logs.some(l=>l.includes('|cant|')&&l.includes('|slp')));
x=setup(['confuse-ray'],['tackle']);assert(x.turn().final.mons.find(m=>m.name==='e0').volatiles.includes('confusion'));
x=setup(['toxic'],['tackle'],[24,7]);r=x.turn();assert.equal(r.final.mons.find(m=>m.name==='e0').status,'tox');assert(r.final.mons.find(m=>m.name==='e0').hp<200,'toxic residual damage');
x=setup(['protect'],['tackle']);assert(!x.turn().logs.some(l=>l.startsWith('|-damage|p1')));
x=setup(['growl'],['tackle']);assert.equal(x.turn().final.mons.find(m=>m.name==='e0').boosts.atk,-1);
x=setup(['scratch'],['tackle']);x.geo.attackTiles=()=>[];r=x.turn();assert(r.logs.some(l=>l.startsWith('|-miss|')));assert(r.final.mons.every(m=>m.hp===200),'tile miss must prevent damage');
let hit=0,miss=0;for(let i=1;i<=30;i++){x=setup(['zap-cannon'],['splash'],[25,7],[i,2,3,4]);r=x.turn();if(r.logs.some(l=>l.startsWith('|-miss|')))miss++;else{hit++;assert.equal(r.final.mons.find(m=>m.name==='e0').status,'par');}}
assert(hit&&miss,'accuracy should produce both hits and misses');
x=setup(['solar-beam'],['splash']);r=x.turn();assert(!r.logs.some(l=>l.startsWith('|-damage|p2')));r=x.turn();assert(r.logs.some(l=>l.startsWith('|-damage|p2')),'charge move attacks next turn');
x=setup(['hyper-beam'],['splash']);x.turn();r=x.turn();assert(r.logs.some(l=>l.includes('|recharge')),'recharge is enforced');
// Field conditions and CC survive between turns, and crits bypass bad attack/good defense boosts.
x=setup(['rain-dance'],['splash']);x.turn();assert.equal(x.combat.sim.field.weather,'raindance');
function critDamage(critical,stages){const v=setup(['scratch'],['splash'],[25,7]);v.geo.isCritical=()=>critical;if(stages){v.combat.sim.sides[0].active[0].boosts.atk=-6;v.combat.sim.sides[1].active[0].boosts.def=6;}const res=v.turn();return 200-res.final.mons.find(m=>m.name==='e0').hp;}
assert.equal(critDamage(true,true),critDamage(true,false));assert(critDamage(true,true)>critDamage(false,true));
console.log('Native combat: conditional attacks, priority/flinch, paralysis, sleep, confusion, toxic/residual, protect, boosts, geometry misses, accuracy, secondary effects, charge/recharge, weather, critical-stage rules: passed.');
// Abilities use species-specific real options and trigger real engine events.
x=setup(['tackle'],['tackle'],[130,7]);x.state.party[0].abilityKey='intimidate';x.combat=N.create(x.state,D,x.geo,mf,[1,2,3,4]);assert.equal(x.combat.snapshot().mons.find(m=>m.name==='e0').boosts.atk,-1);assert(x.combat.sim.log.some(l=>l.includes('|-ability|')&&l.includes('Intimidate')));
x=setup(['thunderbolt'],['splash'],[25,134]);x.state.foes[0].abilityKey='volt-absorb';x.combat=N.create(x.state,D,x.geo,mf,[1,2,3,4]);r=x.combat.turn({kind:'attack',move:0,target:x.state.enemyPos},{kind:'attack',move:0,target:x.state.pos});assert(!r.logs.some(l=>l.startsWith('|-damage|p2')),'ability immunity must apply');
const abilities=require('../data/abilities.json');for(let id=1;id<=151;id++){assert(abilities.pokemon[id].some(a=>!a.hidden));for(const a of abilities.pokemon[id])assert(PK.Dex.abilities.get(abilities.abilities[a.id].key).exists);}
console.log('Species ability coverage, entry Intimidate and ability immunity: passed.');
function categoryDamage(key,boosts){const v=setup([key],['splash'],[25,7]);Object.assign(v.combat.sim.sides[0].active[0].boosts,boosts);const t=v.turn();return 200-t.final.mons.find(m=>m.name==='e0').hp;}
assert(categoryDamage('tackle',{atk:2})>categoryDamage('tackle',{}));
assert.equal(categoryDamage('tackle',{spa:2}),categoryDamage('tackle',{}));
assert(categoryDamage('water-gun',{spa:2})>categoryDamage('water-gun',{}));
assert.equal(categoryDamage('water-gun',{atk:2}),categoryDamage('water-gun',{}));
console.log('Physical damage uses Attack; special damage uses Special Attack independently: passed.');
x=setup(['scratch'],['splash']);x.state.foes[0].heldItem='oran-berry';x.state.foes[0].hp=90;x.combat=N.create(x.state,D,x.geo,mf,[1,2,3,4]);r=x.combat.turn({kind:'attack',move:0,target:x.state.enemyPos},{kind:'attack',move:0,target:x.state.pos});assert(r.logs.some(l=>l.includes('|-enditem|')&&l.includes('Oran Berry')));assert.equal(r.final.mons.find(m=>m.name==='e0').item,'');
function heldDamage(item){const v=setup(['flamethrower'],['splash'],[6,1]);v.state.party[0].heldItem=item;v.combat=N.create(v.state,D,v.geo,mf,[1,2,3,4]);const t=v.combat.turn({kind:'attack',move:0,target:v.state.enemyPos},{kind:'attack',move:0,target:v.state.pos});return 200-t.final.mons.find(m=>m.name==='e0').hp;}
assert(heldDamage('charcoal')>heldDamage(''));
x=setup(['splash'],['splash']);x.state.party[0].heldItem='leftovers';x.state.party[0].hp=100;x.combat=N.create(x.state,D,x.geo,mf,[1,2,3,4]);r=x.combat.turn({kind:'attack',move:0,target:x.state.enemyPos},{kind:'attack',move:0,target:x.state.pos});assert(r.final.mons.find(m=>m.name==='p0').hp>100);
console.log('Held items: berry consumption/heal, type boost and end-of-turn Leftovers: passed.');

// The opponent receives the same entry abilities, immunities and turn status rules.
x=setup(['splash'],['splash'],[7,130]);x.state.foes[0].abilityKey='intimidate';x.combat=N.create(x.state,D,x.geo,mf,[1,2,3,4]);assert.equal(x.combat.snapshot().mons.find(m=>m.name==='p0').boosts.atk,-1);
for(const status of ['slp','frz']){x=setup(['splash'],['splash']);for(const side of x.combat.sim.sides)side.active[0].setStatus(status);const mobility=x.combat.prepareMovement({kind:'attack',move:0},{kind:'attack',move:0});assert.deepEqual(mobility,{p0:false,e0:false});}
let blocked=0;for(let i=1;i<=128;i++){
 x=setup(['splash'],['splash'],[7,7],[i,2,3,4]);x.combat.sim.sides[0].active[0].setStatus('par');let calls=0;x.combat.sim.randomChance=(n,d)=>{assert.equal(n,1);assert.equal(d,8);calls++;return i%8===0;};
 const mobility=x.combat.prepareMovement({kind:'attack',move:0},{kind:'attack',move:0}),result=x.turn();assert.equal(calls,1,'one shared paralysis roll');assert.equal(result.logs.some(l=>l.includes('|cant|p1')&&l.endsWith('|par')),!mobility.p0);if(!mobility.p0)blocked++;
}assert.equal(blocked,16);
console.log('Opponent Intimidate, two-sided sleep/freeze movement lock, and one 1-in-8 paralysis roll shared by movement and attack: passed.');
