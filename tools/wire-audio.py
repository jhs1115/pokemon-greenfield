from pathlib import Path
p=Path('audio.js');s=p.read_text(encoding='utf-8').replace("function scene(name){if(name===currentScene)return;currentScene=name;stopVoices();fadeMusic();}","function scene(name){if(name===currentScene)return;const leavingBattle=currentScene==='battle'&&name!=='battle';currentScene=name;if(leavingBattle)stopVoices();fadeMusic();}")
p.write_text(s,encoding='utf-8')
p=Path('dialogue.js');s=p.read_text(encoding='utf-8');start=s.index('function dialogueTick(){');end=s.index("document.addEventListener('keydown'",start)
s=s[:start]+"function dialogueTick(){window.GameAudio?.play('dialogue',{volume:.12,rate:1.1,maxDuration:.05,cooldown:75});}\n"+s[end:]
s=s.replace("if(e.key==='Enter'&&activeDialogue", "if(e.key==='Enter'&&!e.target.closest?.('#sound-controls')&&activeDialogue")
p.write_text(s,encoding='utf-8')
p=Path('app.js');s=p.read_text(encoding='utf-8').replace("function render(){if(view===", "function render(){window.GameAudio?.scene(view);if(view===")
s=s.replace('b.combat.apply(record.after);const notes=', 'b.combat.apply(record.after);window.GameAudio?.result(record);const notes=')
s=s.replace("b.result=pAlive?'win':'lose';if(b.result", "b.result=pAlive?'win':'lose';window.GameAudio?.celebrate(b.result==='win'?'victory':'defeat');if(b.result")
p.write_text(s,encoding='utf-8')
p=Path('effects.js');s=p.read_text(encoding='utf-8').replace(' if(!sprite||!destination)return;', " if(!sprite||!destination)return;window.GameAudio?.play('step',{volume:.45,rate:1.02});window.GameAudio?.later('step-alt',220,{volume:.35,rate:1.08});")
p.write_text(s,encoding='utf-8')
p=Path('sprite-effects.js');s=p.read_text(encoding='utf-8').replace("const board=document.querySelector('.board');if(!board)return;", "const board=document.querySelector('.board');if(!board)return;window.GameAudio?.cast(move);")
p.write_text(s,encoding='utf-8')
p=Path('journey.js');s=p.read_text(encoding='utf-8').replace("function showExperienceNotice(events){if(!Array.isArray(events))events=[events];", "function showExperienceNotice(events){if(!Array.isArray(events))events=[events];if(events.some(event=>event.level>event.oldLevel))window.GameAudio?.celebrate('level');")
p.write_text(s,encoding='utf-8')
p=Path('battle-feedback.js');s=p.read_text(encoding='utf-8').replace("overlay.className='evolution-scene';", "overlay.className='evolution-scene';window.GameAudio?.duck(4800);window.GameAudio?.play('magic',{volume:.45,maxDuration:1.4});").replace("overlay.classList.add('evolution-complete');", "overlay.classList.add('evolution-complete');window.GameAudio?.celebrate('evolve');")
p.write_text(s,encoding='utf-8')
for name in ['index.html','tests/visual-scenes.html']:
 p=Path(name);s=p.read_text(encoding='utf-8').replace('journey-14','journey-15');s=s.replace('<script src="data/reference.js">','<script src="assets/audio/manifest.js"></script><script src="audio.js?v=journey-15"></script><script src="data/reference.js">');p.write_text(s,encoding='utf-8')
p=Path('styles.css');s=p.read_text(encoding='utf-8');s+='''
#sound-controls{position:fixed;left:14px;bottom:14px;z-index:650;color:#35553f;font-family:Jua,sans-serif}#sound-controls .sound-toggle{display:grid;place-items:center;width:42px;height:42px;border:1px solid #b5c59b;border-radius:50%;background:#edf0d7eb;color:#476945;font-size:27px;box-shadow:0 3px 15px #102b2440;backdrop-filter:blur(8px)}#sound-panel{position:absolute;left:0;bottom:54px;width:265px;padding:18px 19px;background:#f3efd9;border:2px solid #9fb68b;border-radius:17px;box-shadow:0 10px 35px #102b2455}#sound-panel[hidden]{display:none}#sound-panel header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}#sound-panel header b{font-size:22px}#sound-close{border:0;background:transparent;color:#64805e;font-size:25px;line-height:1;padding:0 3px}#sound-panel label{display:flex;justify-content:space-between;font-size:17px;margin-top:15px}#sound-panel output{font-size:15px;color:#83905f}#sound-panel input{width:100%;margin:10px 0 4px;accent-color:#718f58;cursor:pointer}.sound-actions{display:flex;gap:8px;margin-top:18px}.sound-actions button{flex:1;border:1px solid #c1c9a6;border-radius:8px;padding:9px 5px;font:inherit;font-size:14px;background:#e0e6c6;color:#48663e}#sound-mute[aria-pressed=true]{background:#71845f;color:#fff2cf}@media(max-width:600px){#sound-controls{left:8px;bottom:8px}#sound-controls .sound-toggle{width:36px;height:36px;font-size:24px}#sound-panel{bottom:46px}}
''';p.write_text(s,encoding='utf-8')
