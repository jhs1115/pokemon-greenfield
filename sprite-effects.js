/* Existing Emerald PNG frames, composed for this game's top-down tile battlefield. */
(function(){
 const manifest=window.EFFECT_SPRITES;
 const images={};
 const queue=Object.entries(manifest);
 function loadAsset(key,asset,attempt=0){return new Promise((resolve,reject)=>{
  const image=new Image();image.onload=()=>{images[key]=image;resolve();};
  image.onerror=()=>attempt<2?loadAsset(key,asset,attempt+1).then(resolve,reject):reject(new Error(`Effect image unavailable: ${key}`));
  image.src=asset.src+(attempt?`?retry=${attempt}`:'');
 });}
 const loading=Promise.all(Array.from({length:4},async()=>{while(queue.length){const [key,asset]=queue.shift();await loadAsset(key,asset);}}));
 loading.catch(error=>console.error(error));
 const durationByMove={thunder:1450,shock:1050,dash:900,slam:1100,vine:1100,tackle:900,leaves:1300,rush:1050,embers:1200,scratch:850,flamethrower:1500,slash:950,watergun:1300,bite:1050,surf:1600,stars:1350,gust:1300,wings:950,fireblast:1650,absorb:1200,acid:1200,drain:1400,sludge:1350,confusion:1200,psychic:1450,shadow:1350,flamewheel:1250,fang:1100};
 window.playMoveEffect=async function({move,origin,target,tiles,hit,critical=false,defenderPos,durationScale=1}){
  await loading;
  const board=document.querySelector('.board');if(!board)return;
  const canvas=document.createElement('canvas');canvas.className='battle-fx';canvas.dataset.effect=move.fx;canvas.setAttribute('aria-hidden','true');
  const rect=board.getBoundingClientRect();canvas.width=Math.round(rect.width/2);canvas.height=Math.round(rect.height/2);board.append(canvas);
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  const cw=canvas.width/10,ch=canvas.height/7;
  const center=p=>({x:(p.x+.5)*cw,y:(p.y+.5)*ch});
  const a=center(origin),z=center(target),victim=center(defenderPos),angle=Math.atan2(z.y-a.y,z.x-a.x),cells=tiles.map(center);
  const attacker=board.querySelector(`[data-x="${origin.x}"][data-y="${origin.y}"] img:not(.move-ghost)`);
  const defender=hit?board.querySelector(`[data-x="${defenderPos.x}"][data-y="${defenderPos.y}"] img:not(.move-ghost)`):null;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=Math.max(.2,Math.min(1,durationScale))*(reduced?350:move.fxVariant?1000+(move.fxVariant%7)*75:durationByMove[move.fx])/(window.getBattlePlaybackRate?.()||1),begin=performance.now();
  const clamp=v=>Math.max(0,Math.min(1,v));
  const phase=(t,start,end)=>(t-start)/(end-start);
  const mix=(p,q,t)=>({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t});
  const spread=(p,dx,dy)=>({x:p.x+dx*cw,y:p.y+dy*ch});
  let t=0,flashed=false;
  function sprite(key,p,q,size=1,rotation=0,alpha=1,stretch=1){
   if(q<0||q>1||alpha<=0)return;
   const meta=manifest[key],image=images[key];
   const frame=Math.min(meta.frames-1,Math.floor(q*meta.frames)),width=cw*size,height=width*meta.height/meta.width;
   ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(p.x),Math.round(p.y));ctx.rotate(rotation);ctx.scale(1,stretch);
   ctx.drawImage(image,frame*meta.width,0,meta.width,meta.height,-width/2,-height/2,width,height);ctx.restore();
  }
  function burst(key,p,start,end,size=1,rotation=0){
   const q=phase(t,start,end);sprite(key,p,q,size,rotation,clamp(q*10)*clamp((1-q)*8));
  }
  function projectile(key,start,end,count=1,size=.7,arc=0,spin=0,dest=z,from=a){
   for(let i=0;i<count;i++){
    const delay=i*.035,q=phase(t,start+delay,end+delay);if(q<0||q>1)continue;
    const p=mix(from,dest,q);p.y-=Math.sin(q*Math.PI)*arc*ch;
    sprite(key,p,(q*2+i*.23)%1,size,spin?q*spin+i:angle,clamp(q*12)*clamp((1-q)*12));
   }
  }
  function wave(key,start,end,size=1,width=0){
   const q=phase(t,start,end);if(q<0||q>1)return;
   const far=cells.reduce((v,p)=>Math.hypot(p.x-a.x,p.y-a.y)>Math.hypot(v.x-a.x,v.y-a.y)?p:v,z);
   const p=mix(a,far,q);
   for(let i=-width;i<=width;i++)sprite(key,{x:p.x-Math.sin(angle)*i*cw,y:p.y+Math.cos(angle)*i*ch},q,size,angle+Math.PI/2,Math.sin(q*Math.PI));
  }
  function impact(key='impact',size=1.3,start=.44,end=.86,p=z){burst(key,p,start,end,size);}
  function dust(start=.03,end=.4,count=3){
   for(let i=0;i<count;i++)burst('speed_dust',spread(a,-Math.cos(angle)*i*.22,-Math.sin(angle)*i*.22),start+i*.04,end+i*.04,.5+i*.06);
  }
  function charge(key='electricity',size=.8){burst(key,a,.02,.33,size);}
  const recipes={
   thunder(){
    charge('electricity',.9);
    burst('lightning',spread(z,0,-.55),.22,.64,2.6);
    burst('electricity',z,.37,.9,2.1);
    for(const [i,p]of cells.entries())if((i%2)===0)burst(i%4?'spark_1':'spark_2',p,.38+i*.017,.79+i*.017,.65);
   },
   shock(){charge('spark_0',.55);projectile('electricity',.15,.43,2,.55,0,4);burst('electricity',z,.38,.85,1.4);burst('spark_1',spread(z,-.3,0),.47,.96,.8);burst('spark_2',spread(z,.3,0),.5,.98,.8);},
   dash(){dust(.01,.32,5);projectile('cross_impact',.1,.36,2,.5);impact('cross_impact',1.8,.3,.62);},
   slam(){burst('glowy_red_orb',a,.02,.3,.6);impact('slam_hit',1.9,.27,.9);burst('speed_dust',spread(z,0,.35),.5,.95,1.2);},
   vine(){for(const [i,p]of cells.entries())burst('vine',p,.08+i*.07,.6+i*.07,1.2,angle-Math.PI/2);impact('vine_2',1.6,.43,.93);},
   tackle(){dust();impact('impact',1.6,.26,.7);for(const [i,p]of cells.entries())burst('circle_impact',p,.32+i*.07,.6+i*.07,.65);},
   leaves(){for(const [i,p]of cells.entries()){projectile('razor_leaf',.06+i*.025,.4+i*.025,1,.75,.2,8,p);burst('leaf',p,.42+i*.025,.78+i*.025,.55);}impact('green_sparkle',1.1,.55,.98);},
   rush(){dust(.02,.38,6);wave('speed_dust',.12,.45,.9,1);impact('slam_hit_2',2,.35,.88);},
   embers(){projectile('small_ember',.04,.48,3,.75,.35);impact('fire',1.5,.42,.98);},
   scratch(){burst('scratch',z,.1,.64,1.8);burst('claw_slash',spread(z,.15,-.1),.36,.92,1.3);},
   flamethrower(){charge('fire',.8);for(const [i,p]of cells.entries()){const delay=Math.hypot(p.x-a.x,p.y-a.y)/(cw*20);projectile('small_ember',.1+delay,.4+delay,1,.8,0,0,p);burst('fire_plume',p,.35+delay,.78+delay,1.35);} },
   slash(){burst('slash',z,.05,.68,2.1);burst('cross_impact',z,.4,.87,1.3);},
   watergun(){for(const [i,p]of cells.entries()){projectile('water_orb',.03,.32+i*.035,3,.48,0,0,p);burst('water_column',p,.32+i*.055,.81+i*.035,.8);}impact('water_impact',1.3,.55,.94);},
   bite(){const q=phase(t,.1,.8);sprite('sharp_teeth',spread(z,0,-.15-(1-clamp(q))*.5),clamp(q),1.45,0,q>=0&&q<=1?1:0);sprite('sharp_teeth',spread(z,0,.15+(1-clamp(q))*.5),clamp(q),1.45,Math.PI,q>=0&&q<=1?1:0);impact('fang_attack',1.3,.4,.95);},
   surf(){wave('water_column',.08,.85,1.4,1);for(const [i,p]of cells.entries()){const delay=Math.hypot(p.x-a.x,p.y-a.y)/(cw*12);burst('blue_burst',p,.2+delay,.65+delay,1.25);} },
   stars(){for(let i=0;i<7;i++){const dest=spread(z,Math.cos(i*2.4)*.7,Math.sin(i*2.4)*.6);projectile('yellow_star',.03+i*.025,.43+i*.03,1,.5,.5,9,dest);burst('blue_star',dest,.43+i*.03,.75+i*.025,.7);} },
   gust(){burst('whirlwind',z,.13,.95,2);for(const [i,p]of cells.entries())projectile('air_wave',.02+i*.02,.47+i*.02,1,.8,.15,0,p);},
   wings(){burst('air_slash',spread(z,-.3,0),.08,.64,1.5,-.5);burst('air_slash',spread(z,.3,0),.2,.77,1.5,Math.PI+.5);impact('cross_impact',1.1,.42,.9);},
   fireblast(){projectile('fire',.01,.36,1,1.1);for(const [i,p]of cells.entries())burst('fire_plume',p,.34+i*.018,.8+i*.018,1.45);burst('fire',z,.45,.98,2.7);},
   absorb(){burst('green_sparkle',z,.04,.51,1.4);for(let i=0;i<5;i++)projectile('bluegreen_orb',.3+i*.04,.72+i*.03,1,.28,.3,0,a,spread(z,Math.cos(i)*.3,Math.sin(i)*.3));burst('spinning_green_orbs',a,.64,.98,1.2);},
   acid(){projectile('purple_droplet',.03,.45,3,.65,.8);for(const [i,p]of cells.entries())burst('poison_bubble',p,.42+i*.03,.78+i*.03,1.05);},
   drain(){for(const [i,p]of cells.entries()){burst('green_sparkle',p,.02+i*.018,.47+i*.018,.75);projectile('spinning_green_orbs',.25+i*.02,.64+i*.02,1,.4,.35,5,a,p);}burst('bluegreen_orb',a,.64,.99,1.7);},
   sludge(){projectile('toxic_bubble',.03,.43,1,1.15,1.2);for(const [i,p]of cells.entries())burst('toxic_bubble',p,.38+i*.03,.72+i*.03,1.25);burst('purple_droplet',z,.5,.99,1.2);},
   confusion(){charge('pink_orb',.65);for(let i=0;i<3;i++)burst('ring',z,.15+i*.12,.67+i*.1,1.2+i*.4);burst('hollow_orb',z,.48,.95,1.4);},
   psychic(){burst('hollow_orb',a,.02,.35,1);for(const [i,p]of cells.entries())burst('pink_orb',p,.2+i*.025,.65+i*.025,.8);for(let i=0;i<3;i++)burst('ring',z,.25+i*.1,.72+i*.1,1.6+i*.6);burst('blue_star',z,.6,.99,1.6);},
   shadow(){charge('shadow_ball',.85);projectile('shadow_ball',.15,.48,1,1.15,0,3);burst('shadow_ball',z,.44,.78,2);burst('purple_swipe',z,.57,.99,2.1);},
   flamewheel(){burst('spinning_fire',a,.01,.42,1.4);wave('spinning_fire',.14,.61,1.6);for(const [i,p]of cells.entries())burst('fire',p,.4+i*.07,.9+i*.03,1.45);},
   fang(){burst('fangs',z,.1,.66,1.35,0);burst('fang_attack',z,.36,.91,1.75);burst('purple_scratch',z,.55,.99,1.25);}
  };
  function variantRecipe(){
   const id=move.fxVariant,[primary,secondary,accent]=move.fxAssets,variant=id%5;
   const scale=.65+(id%7)*.09,launch=.05+(id%3)*.025,arrival=.38+(id%4)*.035;
   if(move.impact==='self'){
    burst(primary,a,.04,.58,1.1+(id%4)*.15);
    for(let i=0;i<3+id%3;i++){const angle=i*2.4+t*(id%2?5:-5);burst(secondary,spread(a,Math.cos(angle)*.5,Math.sin(angle)*.4),.2+i*.03,.8+i*.025,.45);}
    burst(accent,a,.54,.98,1.35);return;
   }
   if(variant===0){projectile(primary,launch,arrival,1+id%3,scale,.25+(id%3)*.25);for(const[i,p]of cells.entries())burst(secondary,p,arrival+i*.018,.78+i*.014,scale+.4);}
   else if(variant===1){charge(accent,.6);projectile(primary,launch,arrival,2,scale,0,3,z);burst(secondary,z,arrival,.9,1.8+(id%3)*.3);}
   else if(variant===2){for(const[i,p]of cells.entries()){projectile(primary,launch+i*.022,arrival+i*.022,1,scale,.2,id%2?6:-6,p);burst(accent,p,arrival+i*.022,.76+i*.02,.65);}burst(secondary,z,.56,.98,1.3);}
   else if(variant===3){wave(primary,.1,.63,scale+.2,move.width||0);for(const[i,p]of cells.entries())burst(secondary,p,.35+i*.023,.8+i*.017,scale+.2);}
   else{for(let i=0;i<3+id%3;i++)projectile(primary,launch+i*.035,arrival+i*.035,1,scale,.6+(id%2)*.3,6,spread(z,Math.cos(i*2.4)*.35,Math.sin(i*2.4)*.35));burst(accent,z,.52,.97,1.65);}
  }
  attacker?.classList.add('casting');
  if(['dash','rush','tackle','slam','flamewheel'].includes(move.fx)&&attacker){attacker.style.setProperty('--lunge-x',`${Math.cos(angle)*25}px`);attacker.style.setProperty('--lunge-y',`${Math.sin(angle)*20}px`);attacker.classList.add('lunging');}
  try{
   await new Promise((resolve,reject)=>{
    function frame(now){
     if(!canvas.isConnected){resolve();return;}
     try{
      t=clamp((now-begin)/duration);canvas.dataset.phase=t<.3?'charge':t<.45?'travel':t<.8?'impact':'fade';ctx.clearRect(0,0,canvas.width,canvas.height);
      if(move.fxVariant)variantRecipe();else recipes[move.fx]();
      if(t>.46&&hit&&!flashed){flashed=true;defender?.classList.add('hit-flash');}
      if(critical){
       burst('cross_impact',victim,.46,.82,2);
       if(t>.46){const q=phase(t,.46,1);ctx.save();ctx.globalAlpha=Math.sin(q*Math.PI);ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#473442';ctx.fillStyle='#fff2bf';const yy=victim.y-ch*(.65+q*.25);ctx.strokeText('급소! ×1.5',victim.x,yy);ctx.fillText('급소! ×1.5',victim.x,yy);ctx.restore();}
      }
      if(t<1)requestAnimationFrame(frame);else resolve();
     }catch(error){reject(error);}
    }
    requestAnimationFrame(frame);
   });
  }finally{canvas.remove();attacker?.classList.remove('casting','lunging');defender?.classList.remove('hit-flash');}
 };
 window.SPRITE_EFFECT_NAMES=Object.keys(durationByMove);
})();
