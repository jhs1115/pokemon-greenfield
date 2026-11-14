(function(root){
 'use strict';
 const enabled=b=>!!b.encounter?.trainer&&!b.tutorial&&!b.pvp;
 const duration=()=>root.battleDuration?root.battleDuration(2100):2100;
 function markup(b){
  if(!b.trainerIntro)return '';
  const portrait=b.encounter.portrait||'rocket_grunt_m';
  return `<div class="trainer-entrance" aria-hidden="true" style="--entry-time:${duration()}ms;--entry-x:${(b.enemyPos.x+.5)*10}%;--entry-y:${(b.enemyPos.y+.5)/7*100}%"><img class="entry-trainer" src="assets/trainers/${portrait}.png" alt=""><img class="entry-ball" src="assets/items/poke-ball.png" alt=""><span class="entry-flash"></span></div>`;
 }
 function play(){return new Promise(resolve=>root.setTimeout(resolve,duration()));}
 root.TrainerEntrance={enabled,markup,play,duration};
 if(typeof module==='object'&&module.exports)module.exports=root.TrainerEntrance;
})(typeof window==='object'?window:globalThis);
