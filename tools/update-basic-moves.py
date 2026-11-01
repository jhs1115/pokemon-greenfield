from pathlib import Path
p=Path('engine.js');s=p.read_text(encoding='utf-8');s=s.replace(' function normalizeMove(move){', ''' // Small, fixed starter footprints; their upgrades still use the normal five-tile rules.
 const BASIC_MOVE_RULES={
  1:{range:1,impact:'front',width:0},10:{range:1,impact:'front',width:0},33:{range:1,impact:'front',width:0},64:{range:1,impact:'front',width:0},122:{range:1,impact:'front',width:0},
  22:{range:2,impact:'ray',width:0},55:{range:2,impact:'ray',width:0},98:{range:2,impact:'ray',width:0},81:{range:3,impact:'ray',width:0},
  52:{range:2,impact:'single',mask:[[0,0],[0,-1],[0,1]]},84:{range:2,impact:'single',mask:[[0,0],[-1,0],[1,0]]},93:{range:2,impact:'single',mask:[[0,0],[-1,-1],[1,1]]},
  16:{range:1,impact:'front',width:1},145:{range:1,impact:'front',width:1},45:{range:1,impact:'front',width:1},39:{range:1,impact:'front',width:1},43:{range:2,impact:'single'},47:{range:2,impact:'single'},28:{range:1,impact:'front',width:1},
  71:{range:2,impact:'single'},40:{range:3,impact:'single'},73:{range:3,impact:'single'}
 };
 function normalizeMove(move){''')
s=s.replace('  return m;','  return BASIC_MOVE_RULES[m.id]?{...m,...BASIC_MOVE_RULES[m.id],basicMove:true}:m;')
s=s.replace('root.BattleEngine={normalizeMove,', 'root.BattleEngine={BASIC_MOVE_RULES,normalizeMove,')
p.write_text(s,encoding='utf-8')
p=Path('app.js');s=p.read_text(encoding='utf-8').replace("ray:'직선 5칸'", "ray:`직선 ${m.range}칸`").replace("single:'단일 지점'", "single:m.mask?`${m.mask.length}칸`:'단일 지점'")
p.write_text(s,encoding='utf-8')
p=Path('tests/engine.test.cjs');s=p.read_text(encoding='utf-8').replace("if(move.impact==='ray')assert.deepEqual", "if(move.impact==='ray'&&!E.BASIC_MOVE_RULES[raw.id])assert.deepEqual")
s+='''
for(const [id,length]of [[22,2],[55,2],[98,2],[81,3]])assert.equal(E.attackTiles({x:0,y:3},{x:1,y:3},{...D.moves[id],...moves[id]}).length,length);
for(const id of [1,10,33,64,71,40,73,52,84,93,16,145,45,39,43,47,28]){const m={...D.moves[id],...(moves[id]||expanded(D.moves[id]))};for(let y=0;y<7;y++)for(let x=0;x<10;x++)assert(E.attackTiles({x:4,y:3},{x,y},m).length<=3);}
assert.equal(E.normalizeMove({...D.moves[55],...moves[55]}).range,2);
assert.equal(E.normalizeMove({...D.moves[85],...moves[85]}).range,4);
console.log('Basic moves: short reach, one-to-three hit tiles; upgraded moves retain five-tile patterns: passed.');
''';p.write_text(s,encoding='utf-8')
p=Path('tests/turn-sequence.test.cjs');s=p.read_text(encoding='utf-8');s=s.replace("fixture();enemy().hp=1;battle.combat.sim.sides[1].active[0].hp=1;\",context);\n await vm.runInContext(\"resolveTurn({kind:'attack',destination:{x:3,y:3},target:{x:6,y:3},move:0})", "fixture();enemy().hp=1;battle.combat.sim.sides[1].active[0].hp=1;\",context);\n await vm.runInContext(\"resolveTurn({kind:'attack',destination:{x:3,y:3},target:{x:6,y:3},move:2})")
p.write_text(s,encoding='utf-8')
