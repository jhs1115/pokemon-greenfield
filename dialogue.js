let activeDialogue=null;
function typeDialogue(element,text,button,onDone,key,options={}){
 if(!element)return;clearInterval(activeDialogue?.timer);
 const runs=options.rich?Array.from(text.matchAll(/\[([^\]]+)\]|([^\[]+)|\[/g),m=>({text:m[1]||m[2]||'[',clue:!!m[1]})):[{text,clue:false}];
 const letters=runs.flatMap(run=>Array.from(run.text,ch=>({ch,clue:run.clue})));let i=0,done=false;
 const escape=s=>s.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const paint=count=>{const visible=letters.slice(0,count);if(!options.rich){element.textContent=visible.map(l=>l.ch).join('');return;}let html='',clue=false;for(const l of visible){if(l.clue!==clue){html+=l.clue?'<span class="story-clue">':'</span>';clue=l.clue;}html+=escape(l.ch);}element.innerHTML=html+(clue?'</span>':'');};
 const finish=()=>{if(done)return;done=true;clearInterval(session.timer);paint(letters.length);onDone?.();};
 const advance=()=>{if(!done){finish();return;}button?.click();};
 const session={element,finish,advance,timer:null};activeDialogue=session;element.textContent='';
 if(button){const action=button.onclick;button.onclick=e=>{if(!done){finish();return;}action?.(e);};}
 session.timer=setInterval(()=>{if(!element.isConnected){clearInterval(session.timer);return;}paint(++i);if(i%3===0)dialogueTick();if(i>=letters.length)finish();},26);
 return session;
}
function dialogueTick(){}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.target.closest?.('#sound-controls')&&activeDialogue?.element.isConnected&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName||'')){e.preventDefault();e.stopImmediatePropagation();activeDialogue.advance();}},true);
