from pathlib import Path
p=Path('audio.js');s=p.read_text(encoding='utf8');a=s.index('const DEFAULTS=');b=s.index('function mountAudioControls')
s=s[:a]+'''const DEFAULTS={music:.06,effects:.18,muted:false};
function createAudioManager(env){
 const doc=env.document,clamp=n=>Math.max(0,Math.min(1,Number(n)||0));let prefs={...DEFAULTS};
 try{const old=JSON.parse(env.localStorage.getItem('greenfield-audio-v1'));if(old){prefs={music:Number.isFinite(old.music)?clamp(old.music):DEFAULTS.music,effects:Number.isFinite(old.effects)?clamp(old.effects):DEFAULTS.effects,muted:old.muted===true};if((old.version||0)<4){prefs.music=old.music===0?0:DEFAULTS.music;prefs.effects=old.effects===0?0:DEFAULTS.effects;}}}catch{}
 let unlocked=false,context=null,bus=null,currentScene='title',fadeTimer=null,voice=null,lastDing=0,request=0;
 const buffers=new Map();
 const music=doc.createElement('audio');music.id='game-music';music.src='assets/audio/quiet-village.mp3';music.loop=true;music.preload='none';music.volume=0;music.hidden=true;music.setAttribute('aria-hidden','true');doc.body.append(music);
 const available=()=>unlocked&&!prefs.muted&&!doc.hidden;
 function save(){try{env.localStorage.setItem('greenfield-audio-v1',JSON.stringify({...prefs,version:4}));}catch{}}
 function stopVoices(){request++;if(voice){const old=voice;voice=null;try{old.gain.gain.cancelScheduledValues(context.currentTime);old.gain.gain.setTargetAtTime(0,context.currentTime,.012);old.source.stop(context.currentTime+.05);}catch{}}}
 function fadeMusic(){if(fadeTimer)env.clearInterval(fadeTimer);if(!available()||prefs.music===0){music.pause();music.volume=0;return;}music.play().catch(()=>{});fadeTimer=env.setInterval(()=>{const target=Math.min(.35,prefs.music*.65),next=music.volume+(target-music.volume)*.12;music.volume=Math.abs(next-target)<.0003?target:clamp(next);if(music.volume===target){env.clearInterval(fadeTimer);fadeTimer=null;}},40);}
 async function unlock(){if(!context){const C=env.AudioContext||env.webkitAudioContext;if(C){context=new C();bus=context.createGain();bus.gain.value=prefs.muted?0:prefs.effects;const limiter=context.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=12;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.15;bus.connect(limiter);limiter.connect(context.destination);}}unlocked=true;if(context?.state==='suspended')await context.resume().catch(()=>{});fadeMusic();}
 async function sample(src){if(buffers.has(src))return buffers.get(src);const loading=env.fetch(src).then(r=>{if(!r.ok)throw Error('Audio '+r.status);return r.arrayBuffer();}).then(b=>context.decodeAudioData(b)).then(buffer=>{let peak=.001;for(let c=0;c<buffer.numberOfChannels;c++){const data=buffer.getChannelData(c);for(let i=0;i<data.length;i++)peak=Math.max(peak,Math.abs(data[i]));}return {buffer,gain:Math.min(1,.5/peak)};});buffers.set(src,loading);try{return await loading;}catch{buffers.delete(src);return null;}}
 async function file(src){if(!available()||!context||prefs.effects===0||!src)return;stopVoices();const own=request,decoded=await sample(src);if(!decoded||own!==request||!available())return;const source=context.createBufferSource(),gain=context.createGain(),now=context.currentTime;source.buffer=decoded.buffer;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(decoded.gain,now+.01);const duration=Math.min(2.5,decoded.buffer.duration);gain.gain.setValueAtTime(decoded.gain,now+Math.max(.011,duration-.05));gain.gain.linearRampToValueAtTime(0,now+duration);source.connect(gain);gain.connect(bus);voice={source,gain};source.onended=()=>{if(voice?.source===source)voice=null;source.disconnect();gain.disconnect();};source.start(now);source.stop(now+duration);}
 function play(key){if(key!=='ding'||Date.now()-lastDing<220)return;lastDing=Date.now();return file('assets/audio/sfx/confirm.ogg');}
 function cast(move){const sounds=env.MOVE_SOUNDS||{},fallback=({10:52,11:55,12:75,13:84,15:58,4:40,14:94,6:317})[move.type]||(move.damageClass===1?45:33);return file(sounds[move.id]?.src||sounds[fallback]?.src);}
 function setPrefs(changes){prefs={music:changes.music===undefined?prefs.music:clamp(changes.music),effects:changes.effects===undefined?prefs.effects:clamp(changes.effects),muted:changes.muted===undefined?prefs.muted:!!changes.muted};if(bus)bus.gain.setTargetAtTime(prefs.muted?0:prefs.effects,context.currentTime,.025);if(prefs.muted||prefs.effects===0)stopVoices();save();fadeMusic();return {...prefs};}
 function scene(name){currentScene=name;const src=name.startsWith('battle:')?'assets/audio/pokemon-trainer-battle.mp3':'assets/audio/quiet-village.mp3';if(music.getAttribute('src')===src)return;music.pause();music.volume=0;music.src=src;music.currentTime=0;fadeMusic();}
 function visibility(){if(doc.hidden){stopVoices();music.pause();music.volume=0;if(fadeTimer)env.clearInterval(fadeTimer);}else fadeMusic();}
 doc.addEventListener('visibilitychange',visibility);
 const silent=()=>{};return {unlock,play,cast,setPrefs,scene,visibility,music,getPrefs:()=>({...prefs}),getState:()=>({unlocked,voices:voice?1:0,scene:currentScene,track:music.src,context:context?.state||'locked'}),later:silent,result:silent,celebrate:silent,duck:silent};
}
''' +s[b:]
s=s.replace('확인음 <output','효과음 <output').replace('<p><a href="https://opengameart.org/content/mystical-piano" target="_blank" rel="noreferrer">배경음 · Mystical Piano (CC0)</a></p><p>확인음 · 짧은 사인파 차임 자체 제작</p>','<p><a href="https://opengameart.org/content/quiet-village-collection" target="_blank" rel="noreferrer">메뉴 · Quiet Village (CC0)</a></p><p><a href="https://github.com/CTorresDex/pokemon-showdown-music" target="_blank" rel="noreferrer">전투 · 포켓몬 레드·그린 트레이너전 / Game Freak</a></p><p><a href="https://github.com/Pokemon-Tectonic-Team/Pokemon-Essentials-Chasm-Engine/tree/main/Audio/SE/Anim" target="_blank" rel="noreferrer">기술음 · Pokémon Essentials Chasm / PRSFX 공유 자료</a></p><p>원작 음원 권리: Nintendo · Creatures · GAME FREAK. 확인음: Kenney (CC0).</p>')
p.write_text(s,encoding='utf8')
for file in ['index.html','tests/campaign-preview.html','tests/visual-scenes.html']:
 p=Path(file);s=p.read_text(encoding='utf8').replace('journey-19','journey-20');needle='<script src="audio.js';
 if file.startswith('tests/'):
  # Fixtures use base href so paths remain root relative.
  pass
 if needle in s:s=s.replace(needle,'<script src="assets/audio/move-sounds.js?v=journey-20"></script>\n'+needle)
 p.write_text(s,encoding='utf8')
