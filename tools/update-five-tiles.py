from pathlib import Path
p=Path('engine.js');s=p.read_text(encoding='utf-8')
s=s.replace(' function range(origin,target,move){', ''' function normalizeMove(move){
  if(move.tileLimit&&move.tileLimit!==5)return {...move};
  const m={...move,range:Math.min(5,move.range||0),tileLimit:5};
  if(m.impact==='square')m.impact='cross';
  if(['cross','diamond','diagonal'].includes(m.impact))m.size=1;
  if(m.impact==='ray'){m.range=5;m.width=0;}
  if(m.impact==='cone')m.range=3;
  if(m.impact==='ring')m.size=2;
  if(m.impact==='burst')m.size=1;
  return m;
 }
 function range(origin,target,move){
  move=normalizeMove(move);''')
s=s.replace(' function attackTiles(origin,target,move){',' function attackTiles(origin,target,move){\n  move=normalizeMove(move);')
s=s.replace("const tiles=[],add=(x,y)=>{if(inside({x,y})&&(x!==origin.x||y!==origin.y))tiles.push({x,y});};", "const tiles=[],seen=new Set(),add=(x,y)=>{const key=x+','+y;if(inside({x,y})&&(move.impact==='burst'||x!==origin.x||y!==origin.y)&&!seen.has(key)){seen.add(key);tiles.push({x,y});}};")
s=s.replace("  else if(move.impact==='burst'){", "  else if(move.impact==='burst'&&move.tileLimit===5){for(const [x,y]of [[0,0],[0,-1],[1,0],[0,1],[-1,0]])add(origin.x+x,origin.y+y);}\n  else if(move.impact==='ring'&&move.tileLimit===5){for(const [x,y]of [[0,0],[0,-2],[2,0],[0,2],[-2,0]])add(target.x+x,target.y+y);}\n  else if(move.impact==='cone'&&move.tileLimit===5){const dx=Math.sign(target.x-origin.x),dy=Math.sign(target.y-origin.y);for(const [depth,offset]of [[1,0],[2,-1],[2,0],[2,1],[3,0]])add(origin.x+dx*depth-dy*offset,origin.y+dy*depth+dx*offset);}\n  else if(move.impact==='burst'){")
s=s.replace('  return tiles;','  return tiles.slice(0,move.tileLimit);')
s=s.replace('root.BattleEngine={distance,','root.BattleEngine={normalizeMove,distance,')
p.write_text(s,encoding='utf-8')
p=Path('app.js');s=p.read_text(encoding='utf-8').replace('return window.MOVE_RULES[id]?','return E.normalizeMove(window.MOVE_RULES[id]?').replace('...window.getExpandedMoveRule(m)};','...window.getExpandedMoveRule(m)});')
s=s.replace("ray:m.width?'폭 3칸 직선':'직선'", "ray:'직선 5칸'").replace("cone:'부채꼴'", "cone:'부채꼴 5칸'").replace("cross:'십자'", "cross:'십자 5칸'")
s=s.replace('b.message=`${atk.name}의 ${m.name}!`;render();',"b.message=m.name;b.messages=[];render();")
s=s.replace(' if(attempted)await window.playMoveEffect(', ' if(attempted)showMoveName(m.name,pos);\n if(attempted)await window.playMoveEffect(')
p.write_text(s,encoding='utf-8')
p=Path('battle-feedback.js');s=p.read_text(encoding='utf-8').replace(" if(!notes.length)add(`${actor.name}의 ${move.name}!`,'neutral',record.actor[0]);return notes;", " return notes;")
s+='''
function showMoveName(name,position){
 const board=$('.board'),tile=board?.querySelector(`[data-x="${position.x}"][data-y="${position.y}"]`);if(!tile)return;
 board.querySelectorAll('.move-name-label').forEach(el=>el.remove());
 const el=document.createElement('span');el.className='move-name-label';el.textContent=name;el.setAttribute('role','status');tile.append(el);setTimeout(()=>el.remove(),2000);
}
''';p.write_text(s,encoding='utf-8')
p=Path('styles.css');s=p.read_text(encoding='utf-8');s+='''
.move-name-label{position:absolute;bottom:108%;left:50%;transform:translateX(-50%);z-index:70;pointer-events:none;white-space:nowrap;font-size:20px;line-height:1.4;padding:5px 13px;border-radius:12px;background:#f7edcb;color:#304b38;border:2px solid #a7bc83;box-shadow:0 4px 12px #17332466;animation:move-name-appear .2s ease-out both}.tile:has(.move-name-label){z-index:35}@keyframes move-name-appear{from{opacity:0;translate:0 7px}to{opacity:1;translate:0 0}}@media(max-width:700px){.move-name-label{font-size:15px;padding:4px 8px}}
''';p.write_text(s,encoding='utf-8')
p=Path('index.html');s=p.read_text(encoding='utf-8').replace('journey-7','journey-8');p.write_text(s,encoding='utf-8')
p=Path('tests/turn-sequence.test.cjs');s=p.read_text(encoding='utf-8').replace('showExperienceNotice:()=>{},','showMoveName:()=>{},showExperienceNotice:()=>{},');p.write_text(s,encoding='utf-8')
p=Path('tests/engine.test.cjs');s=p.read_text(encoding='utf-8').replace('center,moves[85]).length,9','center,moves[85]).length,5').replace('{x:0,y:0},moves[85]).length,4','{x:0,y:0},moves[85]).length,3').replace('moves[55]).length,4','moves[55]).length,5').replace('moves[53]).length,16','moves[53]).length,5').replace('p=>p.x===3&&p.y===3','p=>p.x===3&&p.y===2')
p.write_text(s,encoding='utf-8')
