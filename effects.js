/* Movement animation. Battle effects use downloaded PNG frames in sprite-effects.js. */
window.animateMovement=async function(from,to){
 const board=document.querySelector('.board');
 const tile=board?.querySelector(`[data-x="${from.x}"][data-y="${from.y}"]`);
 const destination=board?.querySelector(`[data-x="${to.x}"][data-y="${to.y}"]`);
 const sprite=tile?.querySelector('img:not(.move-ghost)');
 if(!sprite||!destination)return;window.GameAudio?.play('step',{volume:.45,rate:1.02});window.GameAudio?.later('step-alt',220,{volume:.35,rate:1.08});
 const a=sprite.getBoundingClientRect(),b=board.getBoundingClientRect(),start=tile.getBoundingClientRect(),end=destination.getBoundingClientRect();
 const moving=sprite.cloneNode(true);moving.className='moving-pokemon';
 Object.assign(moving.style,{left:`${a.left-b.left}px`,top:`${a.top-b.top}px`,width:`${a.width}px`,height:`${a.height}px`});
 const shadow=tile.querySelector('.unit-shadow'),movingShadow=shadow?.cloneNode(true);
 if(movingShadow){const r=shadow.getBoundingClientRect();movingShadow.className='moving-shadow';Object.assign(movingShadow.style,{left:`${r.left-b.left}px`,top:`${r.top-b.top}px`,width:`${r.width}px`,height:`${r.height}px`});shadow.style.visibility='hidden';board.append(movingShadow);}
 sprite.style.visibility='hidden';board.append(moving);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const frames=[{transform:'translate(0,0)'},{transform:`translate(${end.left-start.left}px,${end.top-start.top}px)`}],timing={duration:(reduced?100:520)/(window.getBattlePlaybackRate?.()||1),easing:'cubic-bezier(.25,.7,.3,1)',fill:'forwards'};
 try{await Promise.all([moving.animate(frames,timing).finished,movingShadow?.animate(frames,timing).finished]);}
 finally{moving.remove();movingShadow?.remove();sprite.style.visibility='';if(shadow)shadow.style.visibility='';}
};
