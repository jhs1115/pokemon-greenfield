let activeDialogue=null;
function typeDialogue(element,text,button,onDone,key){
 if(!element)return;clearInterval(activeDialogue?.timer);
 const letters=Array.from(text);let i=0,done=false;
 const finish=()=>{if(done)return;done=true;clearInterval(session.timer);element.textContent=text;onDone?.();};
 const advance=()=>{if(!done){finish();return;}button?.click();};
 const session={element,finish,advance,timer:null};activeDialogue=session;element.textContent='';
 if(button){const action=button.onclick;button.onclick=e=>{if(!done){finish();return;}action?.(e);};}
 session.timer=setInterval(()=>{if(!element.isConnected){clearInterval(session.timer);return;}element.textContent=letters.slice(0,++i).join('');if(i%3===0)dialogueTick();if(i>=letters.length)finish();},26);
 return session;
}
function dialogueTick(){}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.target.closest?.('#sound-controls')&&activeDialogue?.element.isConnected&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName||'')){e.preventDefault();e.stopImmediatePropagation();activeDialogue.advance();}},true);
