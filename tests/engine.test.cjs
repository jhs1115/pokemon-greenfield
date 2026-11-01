const assert=require('node:assert/strict');
const E=require('../engine.js');
const D=require('../data/reference.json');
assert.equal(E.effectiveness(10,[12],D),2);
assert.equal(E.effectiveness(13,[5],D),0);
assert.equal(E.effectiveness(10,[12,7],D),4);
assert.equal(E.effectiveness(10,[11,16],D),0.25);
assert.deepEqual(E.order([{name:'fast',speed:100,priority:0},{name:'quick',speed:10,priority:1}],()=>0.5).map(a=>a.name),['quick','fast']);
assert.deepEqual(E.order([{name:'slow',speed:10,priority:0},{name:'fast',speed:100,priority:0}],()=>0.5).map(a=>a.name),['fast','slow']);
assert.equal(E.path({x:0,y:0},{x:3,y:0},{x:1,y:0}),null);
assert.equal(E.path({x:0,y:0},{x:0,y:3},{x:1,y:0}),null);
assert.equal(E.path({x:0,y:0},{x:1,y:1},{x:1,y:0}).length,1);
assert.deepEqual(E.path({x:3,y:3},{x:3,y:3},{x:7,y:3}),[]);
for(const dx of [-1,0,1])for(const dy of [-1,0,1]) assert.ok(E.path({x:3,y:3},{x:3+dx,y:3+dy},{x:7,y:3})!==null);
assert.equal(E.path({x:3,y:3},{x:5,y:3},{x:7,y:3}),null);
assert.equal(E.path({x:0,y:0},{x:-1,y:0},{x:7,y:3}),null);
assert.equal(E.path({x:0,y:0},{x:1,y:0},{x:1,y:0}),null);
assert.equal(E.range({x:0,y:0},{x:2,y:1},{range:3,shape:'line'}),false);
assert.equal(E.range({x:0,y:0},{x:2,y:1},{range:3,shape:'area'}),true);
const moves=require('../moves.js');
const center={x:4,y:3};
assert.equal(E.attackTiles({x:0,y:3},center,moves[85]).length,5);
assert.deepEqual(E.attackTiles(center,{x:5,y:3},moves[33]),[{x:5,y:2},{x:5,y:3},{x:5,y:4}]);
assert.deepEqual(E.attackTiles(center,{x:4,y:2},moves[33]),[{x:3,y:2},{x:4,y:2},{x:5,y:2}]);
assert.equal(E.attackTiles(center,{x:5,y:4},moves[33]).length,0);
assert.equal(E.attackTiles({x:4,y:3},{x:0,y:0},moves[85]).length,3);
assert.equal(E.attackTiles(center,{x:5,y:3},moves[55]).length,5);
assert.equal(E.attackTiles(center,{x:5,y:3},moves[53]).length,5);
assert.ok(E.attackTiles({x:0,y:0},{x:2,y:2},moves[85]).some(p=>p.x===3&&p.y===2));
for(const m of Object.values(moves))for(const origin of [{x:0,y:0},center,{x:9,y:6}]){
 for(let y=0;y<7;y++)for(let x=0;x<10;x++){
  const cells=E.attackTiles(origin,{x,y},m);
  assert.ok(cells.every(p=>p.x>=0&&p.x<10&&p.y>=0&&p.y<7));
  assert.equal(new Set(cells.map(p=>`${p.x},${p.y}`)).size,cells.length);
  assert.ok(!cells.some(p=>p.x===origin.x&&p.y===origin.y));
 }
}
const mon={types:[13],battleStats:{2:40,3:40,4:40,5:40}};
assert.equal(E.damage(mon,{...mon,types:[5]},{type:13,power:40,damageClass:3},D),0);
assert.ok(E.damage(mon,{...mon,types:[11]},{type:13,power:40,damageClass:3},D)>E.damage(mon,{...mon,types:[1]},{type:13,power:40,damageClass:3},D));
const neutral={types:[1],battleStats:{2:100,3:100,4:100,5:100}},physical={type:2,power:100,damageClass:2},special={...physical,damageClass:3};
const crit={critical:true};
for(const move of [physical,special]){
 const base=E.damage(neutral,neutral,move,D);
 assert.equal(E.damage(neutral,neutral,move,D,crit),Math.floor(base*1.5));
 const weakened={...neutral,statStages:{2:-6,4:-6}},boostedDefense={...neutral,statStages:{3:6,5:6}};
 assert.ok(E.damage(weakened,boostedDefense,move,D)<base);
 assert.equal(E.damage(weakened,boostedDefense,move,D,crit),E.damage(neutral,neutral,move,D,crit));
 const boostedAttack={...neutral,statStages:{2:2,4:2}},weakenedDefense={...neutral,statStages:{3:-2,5:-2}};
 assert.ok(E.damage(boostedAttack,weakenedDefense,move,D,crit)>E.damage(neutral,neutral,move,D,crit));
 assert.equal(E.damage(boostedAttack,{...neutral,statStages:{3:4,5:4}},move,D,crit),E.damage(boostedAttack,neutral,move,D,crit));
}
assert.equal(E.damage(mon,{...mon,types:[5]},{type:13,power:100,damageClass:3},D,crit),0);
assert.deepEqual(E.criticalTiles({x:0,y:3},center,moves[85]),[center]);
assert.ok(E.isCritical({x:0,y:3},center,center,moves[85]));
assert.ok(!E.isCritical({x:0,y:3},center,{x:5,y:3},moves[85]));
assert.ok(!E.isCritical({x:0,y:0},{x:9,y:6},{x:9,y:6},moves[85]));
assert.equal(E.stageMultiplier(-6),0.25);
assert.equal(E.stageMultiplier(6),4);
assert.deepEqual(E.attackTiles(center,center,{range:0,impact:'self',damageClass:1}),[center]);
assert.equal(E.range(center,{x:5,y:3},{range:0,impact:'self'}),false);
assert.deepEqual(E.criticalTiles(center,center,{range:0,impact:'self',damageClass:1}),[]);
assert.equal(E.damage(mon,mon,{type:13,power:0,damageClass:1},D,crit),0);
for(let i=1;i<=151;i++)assert.ok(require('node:fs').statSync(require('node:path').join(__dirname,`../assets/pokemon/${i}.png`)).size>50);
console.log('Battle engine and 151 sprite assets: all checks passed.');
// All base move definitions, including expanded moves, share the same five-tile limit.
const expanded=require('../expanded-moves.js');
for(const raw of Object.values(D.moves)){
 const move={...raw,...(moves[raw.id]||expanded(raw))};
 for(const origin of [{x:0,y:0},{x:4,y:3},{x:9,y:6}])for(let y=0;y<7;y++)for(let x=0;x<10;x++){
  const cells=E.attackTiles(origin,{x,y},move);
  assert.ok(cells.length<=5,`${raw.key} exceeds five tiles`);
  assert.equal(new Set(cells.map(p=>`${p.x},${p.y}`)).size,cells.length);
 }
 if(move.impact==='ray'&&!E.BASIC_MOVE_RULES[raw.id])assert.deepEqual(E.attackTiles({x:0,y:3},{x:1,y:3},move),[1,2,3,4,5].map(x=>({x,y:3})));
}
assert.deepEqual(E.attackTiles({x:0,y:3},{x:4,y:3},{range:4,impact:'square',size:1}),[{x:4,y:3},{x:5,y:3},{x:3,y:3},{x:4,y:4},{x:4,y:2}]);
console.log('All 937 move footprints: maximum five tiles; square-to-cross and five-tile rays: passed.');

for(const [id,length]of [[22,2],[55,2],[98,2],[81,5]])assert.equal(E.attackTiles({x:0,y:3},{x:1,y:3},{...D.moves[id],...(moves[id]||expanded(D.moves[id]))}).length,length);
for(const id of [1,10,33,64,71,40,52,84,93,16,145]){const m={...D.moves[id],...(moves[id]||expanded(D.moves[id]))};for(let y=0;y<7;y++)for(let x=0;x<10;x++)assert(E.attackTiles({x:4,y:3},{x,y},m).length<=3);}
assert.equal(E.normalizeMove({...D.moves[55],...moves[55]}).range,2);
assert.equal(E.normalizeMove({...D.moves[85],...moves[85]}).range,4);
console.log('Basic moves: short reach, one-to-three hit tiles; upgraded moves retain five-tile patterns: passed.');

for(const id of [45,39,43,47,28,81,73]){const move=E.normalizeMove({...D.moves[id],...(moves[id]||expanded(D.moves[id]))});assert(move.range>=3);assert(E.range({x:2,y:3},{x:5,y:3},move));assert(E.attackTiles({x:2,y:3},{x:5,y:3},move).some(p=>p.x===5&&p.y===3));}
assert.equal(E.normalizeMove({...D.moves[45],...expanded(D.moves[45])}).impact,'cone');
assert.equal(E.normalizeMove({...D.moves[39],...expanded(D.moves[39])}).impact,'cross');
assert.equal(E.normalizeMove({...D.moves[33],...moves[33]}).range,1);
console.log('Opponent status moves regain reach of at least three tiles; early attack ranges stay short: passed.');
