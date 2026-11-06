from pathlib import Path
R=Path(__file__).resolve().parents[1]
def read(p):return (R/p).read_text(encoding='utf-8')
def write(p,s):(R/p).write_text(s,encoding='utf-8')
def edit(p,a,b):
 s=read(p)
 if a not in s:raise ValueError(p+': '+a[:80])
 write(p,s.replace(a,b))
edit('native-combat.js'," const run=sim.actions.runMove.bind(sim.actions);", ''' function hitFrames(record){const count=Number(record.logs.find(l=>l.startsWith('|-hitcount|'))?.split('|').at(-1))||1;if(count<=1)return [];const frames=[],frame=JSON.parse(JSON.stringify(record.before)),actorSide=record.actor[0];let skipPublic=false;for(let i=0;i<record.logs.length;i++){const log=record.logs[i];if(log.startsWith('|split|')){skipPublic=true;continue;}const parts=log.split('|');if(parts[1]!=='-damage')continue;const name=parts[2]?.match(/: ([pe]\\d+)$/)?.[1];if(name&&name[0]!==actorSide){const mon=frame.mons.find(m=>m.name===name);if(mon){mon.hp=Math.max(0,Number(parts[3].split('/')[0].split(' ')[0])||0);frames.push(JSON.parse(JSON.stringify(frame)));}}if(skipPublic){i++;skipPublic=false;}}
  // Substitute hits still animate even when the Pokemon's own HP does not change.
  while(frames.length<count)frames.push(JSON.parse(JSON.stringify(frames.at(-1)||record.before)));return frames.slice(0,count);}
 const run=sim.actions.runMove.bind(sim.actions);''')
edit('native-combat.js',"records.push({actor,move:move.num,before,after:snapshot(),logs:sim.log.slice(start),logEnd:sim.log.length});", "{const record={actor,move:move.num,before,after:snapshot(),logs:sim.log.slice(start),logEnd:sim.log.length};record.hitFrames=hitFrames(record);records.push(record);}")
edit('sprite-effects.js','critical=false,defenderPos})','critical=false,defenderPos,durationScale=1})')
edit('sprite-effects.js','const duration=(reduced?', 'const duration=Math.max(.2,Math.min(1,durationScale))*(reduced?')
edit('app.js','async function resolveTurn(command){', '''async function playRecordedMove(record,options,applyFrame){const frames=record.hitFrames?.length?record.hitFrames:[record.after];for(let i=0;i<frames.length;i++){await window.playMoveEffect({...options,hit:options.hit||frames.length>1,durationScale:frames.length>1?.36:1});if(view!=='battle')return;if(frames.length>1){applyFrame(frames[i]);render();await pause(65);}}}
async function applyBattleActive(snapshot){const b=battle,old=[b.active,b.enemy];b.combat.apply(snapshot,true);if(old[0]!==b.active&&!b.participants.includes(b.active))b.participants.push(b.active);if(old[1]!==b.enemy)b.participants=[b.active];if(old[0]!==b.active||old[1]!==b.enemy){render();for(const side of [0,1])if(old[side]!==[b.active,b.enemy][side]){const pos=side===0?b.pos:b.enemyPos;document.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"] img:not(.move-ghost)`)?.animate?.([{opacity:0,transform:'scale(.7)'},{opacity:1,transform:'scale(1)'}],{duration:battleDuration(220),easing:'ease-out'});}await pause(230);}}
async function resolveTurn(command){''')
edit('app.js','for(const record of turn.records){','for(const [recordIndex,record]of turn.records.entries()){')
edit('app.js',' b.combat.apply(record.before);const aSide=', ' await applyBattleActive(record.before);const aSide=')
edit('app.js',"if(attempted)await window.playMoveEffect({move:m,origin:pos,target,tiles:E.attackTiles(pos,target,m),hit:!failed,critical:record.logs.some(l=>l.startsWith('|-crit|')),defenderPos:m.impact==='self'?pos:defPos,side:aSide});", "if(attempted)await playRecordedMove(record,{move:m,origin:pos,target,tiles:E.attackTiles(pos,target,m),hit:!failed,critical:record.logs.some(l=>l.startsWith('|-crit|')),defenderPos:m.impact==='self'?pos:defPos,side:aSide},frame=>b.combat.apply(frame));")
edit('app.js','b.combat.apply(record.after);window.GameAudio?.result(record);', 'b.combat.apply(record.after);await applyBattleActive(turn.records[recordIndex+1]?.before||turn.final);window.GameAudio?.result(record);')
edit('app.js',"if(previousActive!==b.active){b.pos={x:2,y:3};", "if(previousActive!==b.active){")
edit('app.js',"if(previousEnemy!==b.enemy){window.GameAudio?.play('cry-'+enemy().id,{volume:.6});b.enemyPos={x:7,y:3};", "if(previousEnemy!==b.enemy){window.GameAudio?.play('cry-'+enemy().id,{volume:.6});")
edit('app.js',"b.pos={x:2,y:3};if(b.pos.x===b.enemyPos.x&&b.pos.y===b.enemyPos.y)b.pos={x:1,y:3};",'')
edit('app.js',"b.enemyPos={x:7,y:3};if(b.enemyPos.x===b.pos.x&&b.enemyPos.y===b.pos.y)b.enemyPos={x:8,y:3};",'')
edit('pvp-rules.js','if(state.active!==previous[0])state.pos={x:2,y:3};if(state.enemy!==previous[1])state.enemyPos={x:7,y:3};','')
edit('pvp-rules.js',"state.revealed[0][state.active]=true;state.revealed[1][state.enemy]=true;", "for(const r of result.records)for(const snap of [r.before,r.after])for(let side=0;side<2;side++)state.revealed[side][+snap.active[side].slice(1)]=true;state.revealed[0][state.active]=true;state.revealed[1][state.enemy]=true;")
edit('pvp-rules.js',"Math.min(11000,600+", "Math.min(24000,600+result.records.reduce((n,r)=>n+Math.max(0,(r.hitFrames?.length||1)-1)*700,0)+")
edit('pvp-ui.js','after:snapshot(raw.after),logs:logs(raw.logs)', 'after:snapshot(raw.after),hitFrames:(raw.hitFrames||[]).map(snapshot),logs:logs(raw.logs)')
edit('pvp-ui.js',"await window.playMoveEffect({move:m,origin,target,tiles:E.attackTiles(origin,target,m),hit:!failed,critical:record.logs.some(l=>l.startsWith('|-crit|')),defenderPos:m.impact==='self'?origin:defenderPos,side:record.actor[0]});", "await playRecordedMove(record,{move:m,origin,target,tiles:E.attackTiles(origin,target,m),hit:!failed,critical:record.logs.some(l=>l.startsWith('|-crit|')),defenderPos:m.impact==='self'?origin:defenderPos,side:record.actor[0]},frame=>applySnapshot(frame));")
# Restore stopped AudioContexts on every deliberate gesture, and keep samples audible at a modest level.
edit('audio.js','effects:.18','effects:.24')
edit('audio.js','<4){','<5){')
edit('audio.js','version:4','version:5')
edit('audio.js',"async function file(src,{maxDuration=2.5,loop=false,evolution=false}={}){if(!available()", "async function file(src,{maxDuration=2.5,loop=false,evolution=false}={}){if(context&&context.state!=='running')await context.resume().catch(()=>{});if(!available()")
edit('audio.js',"const silent=()=>{};return", "const silent=()=>{};return")
edit('audio.js',"root.document.addEventListener('pointerdown',unlock,{once:true});root.document.addEventListener('keydown',unlock,{once:true});", "root.document.addEventListener('pointerdown',unlock);root.document.addEventListener('keydown',unlock);")
edit('audio.js',"}else fadeMusic();}","}else {if(unlocked&&context?.state!=='running')context?.resume().catch(()=>{});fadeMusic();}}")
print('Immediate pivot snapshots, fixed switch position, per-hit playback and audio recovery updated')
