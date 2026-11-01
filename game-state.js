(function(root){
 function createGameModel(data,training,progression=root.PROGRESSION_DATA,abilityData=root.ABILITY_DATA,itemData=root.ITEM_DATA){
  const ITEMS=itemData||(typeof require==='function'?require('./items.js'):{});
  const P=progression,pokemon=new Map(data.pokemon.filter(p=>p.id<=151).map(p=>[p.id,p]));
  const valid=id=>Number.isInteger(id)&&pokemon.has(id),info=id=>P.pokemon[id];
  const learnable=id=>(training.learnsets[id]?.moves||[]).filter(m=>data.moves[m]);
  const threshold=(id,level)=>P.growth[info(id).growth][Math.max(1,Math.min(100,level))];
  const levelMoves=(id,level)=>info(id).levelMoves.filter(m=>m.level<=level).map(m=>m.move).filter(m=>data.moves[m]);
  const defaultMoves=(id,level=5)=>[...new Set(levelMoves(id,level))].slice(-4);
  const isFinal=id=>!info(id).evolutions.length;
  const abilityOptions=id=>abilityData?.pokemon[id]||[];
  const defaultAbility=id=>abilityOptions(id).find(a=>!a.hidden)?.id||0;
  const ability=(state,id)=>isFinal(id)&&abilityOptions(id).some(a=>a.id===state.abilitySets?.[id])?state.abilitySets[id]:defaultAbility(id);
  function setAbility(state,id,value){if(!state.owned.includes(id)||!isFinal(id)||!abilityOptions(id).some(a=>a.id===value))throw new Error('최종 진화 후 특성을 선택할 수 있습니다');state.abilitySets[id]=value;}
  function completeTutorial(state){state.tutorial={step:'done',done:true};if(!state.tutorialRewardClaimed){state.coins+=10;state.tutorialRewardClaimed=true;return 10;}return 0;}
  const freshRecord=(id,level=5)=>({level,exp:threshold(id,level),known:[...new Set(levelMoves(id,level))]});
  function trainable(state,id){
   if(isFinal(id))return [...new Set([...learnable(id),...state.records[id].known,...levelMoves(id,state.records[id].level)])];
   const record=state.records[id];return [...new Set([...levelMoves(id,record.level),...record.known])].filter(m=>data.moves[m]);
  }
  function normalize(raw={}){
   const owned=[...new Set((Array.isArray(raw.owned)?raw.owned:[]).filter(valid))];
   const records={};for(const id of owned){const r=raw.records?.[id]||freshRecord(id);const level=Math.max(5,Math.min(100,Math.floor(r.level)||5));records[id]={level,exp:Math.max(threshold(id,level),Math.min(threshold(id,100),Math.floor(r.exp)||0)),known:[...new Set([...(r.known||[]),...levelMoves(id,level)])].filter(m=>data.moves[m])};}
   const selected=[...new Set((raw.team||owned.slice(0,3)).filter(id=>owned.includes(id)))].slice(0,3);while(selected.length<3)selected.push(null);
   const state={version:2,starter:valid(raw.starter)?raw.starter:owned[0]||null,coins:Number.isFinite(raw.coins)?Math.max(0,Math.floor(raw.coins)):0,owned,team:selected,records,abilitySets:{...(raw.abilitySets||{})},tutorialRewardClaimed:raw.tutorialRewardClaimed===true||(raw.tutorial?.done===true&&raw.tutorialRewardClaimed===undefined),moveSets:{},pending:[],scoutRevealAt:Number(raw.scoutRevealAt)||0,clears:Array.from({length:40},(_,i)=>Math.max(0,Math.floor(Number(raw.clears?.[i])||0))),claimed:(raw.claimed||[]).filter(v=>typeof v==='string').slice(-100),tutorial:raw.tutorial&&typeof raw.tutorial==='object'?raw.tutorial:{step:owned.length?'done':'intro',done:!!owned.length},updatedAt:raw.updatedAt||null,inventory:Object.fromEntries(Object.entries(raw.inventory||{}).filter(([key,n])=>ITEMS[key]&&Number.isInteger(n)&&n>0).map(([key,n])=>[key,Math.min(n,999)])),heldItems:{},gymVisits:{...(raw.gymVisits||{})},itemsUnlocked:raw.itemsUnlocked===true,itemUnlockSeen:raw.itemUnlockSeen===true,rocketCleared:raw.rocketCleared===true,rocketPending:raw.rocketPending===true};
   for(const id of owned){const item=raw.heldItems?.[id];if(ITEMS[item])state.heldItems[id]=item;}
   if(state.clears[14]>0&&!state.rocketCleared)state.rocketPending=true;
   for(const id of owned){const allowed=new Set(trainable(state,id)),list=[...new Set((raw.moveSets?.[id]||defaultMoves(id,records[id].level)).filter(m=>allowed.has(m)))].slice(0,4);state.moveSets[id]=list.length?list:defaultMoves(id,records[id].level);}
   const pool=new Set(scoutPool(state));state.pending=[...new Set((raw.pending||[]).filter(id=>pool.has(id)))].slice(0,3);return state;
  }
  function chooseStarter(state,id){if(![1,4,7].includes(id)||state.owned.length)throw new Error('스타팅을 선택하세요');state.starter=id;state.owned=[id];state.team=[id,null,null];state.records[id]=freshRecord(id);state.moveSets[id]=defaultMoves(id);state.tutorial={step:'praise',done:false};}
  function scoutPool(state){const chains=new Set(state.owned.map(id=>info(id).chain));return [...pokemon.keys()].filter(id=>{const p=info(id),base=!p.parent||p.parent>151,late=isFinal(id)&&Object.values(pokemon.get(id).stats).reduce((a,b)=>a+b,0)>=450;return base&&!p.legendary&&!p.mythical&&!chains.has(p.chain)&&(!late||state.clears[9]>0);});}
  function scout(state,random=Math.random){if(state.pending.length)return state.pending;if(state.coins<10)throw new Error('코인이 부족합니다');const pool=scoutPool(state);if(!pool.length)throw new Error('현재 영입할 포켓몬이 없습니다');const picks=[];while(picks.length<3&&pool.length){const weights=pool.map(id=>isRare(id)?.2:1),total=weights.reduce((a,b)=>a+b,0);let roll=Math.min(.999999,Math.max(0,random()))*total,index=weights.length-1;for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<0){index=i;break;}}picks.push(pool.splice(index,1)[0]);}state.coins-=10;state.pending=picks;return picks;}
  const scoutLevel=state=>state.clears[19]>0?12:state.clears[9]>0?8:5;
  const isRare=id=>[1,4,7,147].some(base=>info(base).chain===info(id)?.chain);
  function recruit(state,id){if(!state.pending.includes(id))throw new Error('후보를 선택하세요');if(!state.owned.includes(id)){state.owned.push(id);state.records[id]=freshRecord(id,scoutLevel(state));state.moveSets[id]=defaultMoves(id,scoutLevel(state));}state.pending=[];}
  function setTeam(state,slot,id){if(!Number.isInteger(slot)||slot<0||slot>2||!state.owned.includes(id))throw new Error('선출할 수 없습니다');const current=state.team.indexOf(id);if(current>=0)[state.team[slot],state.team[current]]=[state.team[current],state.team[slot]];else state.team[slot]=id;}
  function setMove(state,id,slot,move){if(!state.owned.includes(id)||!trainable(state,id).includes(move)||!Number.isInteger(slot)||slot<0||slot>3)throw new Error('현재 배울 수 없는 기술입니다');const list=state.moveSets[id],current=list.indexOf(move);if(current>=0){if(slot<list.length)[list[slot],list[current]]=[list[current],list[slot]];return;}if(slot<list.length)list[slot]=move;else list.push(move);}
  function removeMove(state,id,slot){const list=state.moveSets[id];if(list?.length>1)list.splice(slot,1);}
  const unlocked=(state,stage)=>stage>=0&&stage<40&&(stage===0||state.clears[stage-1]>0)&&(stage!==15||state.rocketCleared);
  function reward(state,stage,battleId,random=Math.random){if(!unlocked(state,stage)||state.claimed.includes(battleId))return {total:0,base:0,first:0,item:null};const chapter=Math.floor(stage/10)+1,boss=stage%10===9,base=state.clears[stage]>0&&(state.clears[stage]+1)%3===0?chapter:0,first=state.clears[stage]===0?(boss?5+(chapter-1)*3:chapter+1):0;state.coins+=base+first;state.clears[stage]++;state.claimed.push(battleId);state.claimed=state.claimed.slice(-100);if(stage===14&&!state.rocketCleared)state.rocketPending=true;let item=null;if(state.itemsUnlocked&&random()<.2+chapter*.025){const pool=['oran-berry','cheri-berry','chesto-berry','pecha-berry','rawst-berry','aspear-berry','persim-berry',...(chapter>=2?['sitrus-berry','silk-scarf','miracle-seed','charcoal','mystic-water','magnet','hard-stone','sharp-beak']:[]),...(chapter>=3?['leftovers','moon-stone','fire-stone','thunder-stone','water-stone','leaf-stone']:[])];item=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];state.inventory[item]=(state.inventory[item]||0)+1;}return {base,first,total:base+first,item};}
  function rewardRocket(state,battleId){if(state.rocketCleared||!state.rocketPending||state.claimed.includes(battleId))return {total:0,base:0,first:0,item:null};state.rocketCleared=true;state.rocketPending=false;state.claimed.push(battleId);state.coins+=4;return {total:4,base:4,first:0,item:null};}
  function claimItemUnlock(state){if(!state.clears[9])return false;if(!state.itemsUnlocked){state.itemsUnlocked=true;state.inventory['exp-share']=(state.inventory['exp-share']||0)+2;}return !state.itemUnlockSeen;}
  function equipItem(state,id,key){if(!state.itemsUnlocked||!state.owned.includes(id))throw new Error('웅이를 클리어하면 도구를 사용할 수 있습니다');if(key&&ITEMS[key]?.stone)throw new Error('진화의 돌은 도구 사용으로 사용하세요');const old=state.heldItems[id]||null;if(old===key)return;if(key&&(!ITEMS[key]||!(state.inventory[key]>0)))throw new Error('보유하지 않은 도구입니다');if(old)state.inventory[old]=(state.inventory[old]||0)+1;if(key){state.inventory[key]--;state.heldItems[id]=key;}else delete state.heldItems[id];}
  function useItem(state,id,key){if(!state.itemsUnlocked||!state.owned.includes(id))throw new Error('도구를 사용할 수 없습니다');const item=ITEMS[key];if(!item?.stone||!(state.inventory[key]>0))throw new Error('사용할 수 없는 도구입니다');const rule=info(id).evolutions.find(e=>e.trigger===3&&e.item===item.stone);if(!rule)throw new Error('이 포켓몬에게 사용할 수 없는 진화의 돌입니다');return evolve(state,id,rule.to);}
  function experienceShares(state,party,participants){const alive=party.map((p,i)=>p.hp>0?i:-1).filter(i=>i>=0),active=participants.filter(i=>alive.includes(i)),holders=state.itemsUnlocked?alive.filter(i=>state.heldItems[party[i].id]==='exp-share'):[];if(!active.length)return [];if(!holders.length)return active.map(index=>({index,weight:1/active.length}));return [...new Set([...active,...holders])].map(index=>({index,weight:(active.includes(index)?.5/active.length:0)+(holders.includes(index)?.5/holders.length:0)}));}

  function evolve(state,id,next){const rule=info(id).evolutions.find(e=>e.to===next);if(!state.owned.includes(id)||!rule||rule.level&&state.records[id].level<rule.level)throw new Error('진화 조건을 만족하지 않습니다');if(state.owned.includes(next))throw new Error('이미 보유한 진화형입니다');if(rule.trigger===3){const key=Object.keys(ITEMS).find(k=>ITEMS[k].stone===rule.item);if(!key||!(state.inventory[key]>0))throw new Error('해당 진화의 돌이 필요합니다. 3장부터 획득할 수 있습니다');state.inventory[key]--;}state.owned[state.owned.indexOf(id)]=next;state.team=state.team.map(v=>v===id?next:v);state.records[next]=state.records[id];if(state.heldItems[id]){state.heldItems[next]=state.heldItems[id];delete state.heldItems[id];}state.abilitySets[next]=defaultAbility(next);delete state.abilitySets[id];state.moveSets[next]=state.moveSets[id];delete state.records[id];delete state.moveSets[id];return next;}
  function gainExperience(state,id,foe,trainer=false,participants=1,share=1){
   const original=id,record=state.records[id],oldLevel=record.level,amount=Math.max(1,Math.floor(info(foe.id).baseExp*foe.level*(trainer?1.5:1)*share/(7*Math.max(1,participants)))),newMoves=[],evolved=[];
   record.exp=Math.min(threshold(id,100),record.exp+amount);
   while(record.level<100&&record.exp>=threshold(id,record.level+1)){
    record.level++;
    for(const m of info(id).levelMoves.filter(m=>m.level===record.level)){if(!record.known.includes(m.move))record.known.push(m.move);if(!state.moveSets[id].includes(m.move)){newMoves.push(m.move);if(state.moveSets[id].length<4)state.moveSets[id].push(m.move);}}
    const evolution=info(id).evolutions.find(e=>e.trigger===1&&e.level>0&&record.level>=e.level&&!e.relativeStats);
    if(evolution){const next=evolution.to;evolve(state,id,next);id=next;evolved.push(next);for(const m of info(id).levelMoves.filter(m=>m.level===record.level||m.level===0)){if(!record.known.includes(m.move))record.known.push(m.move);if(!state.moveSets[id].includes(m.move)){newMoves.push(m.move);if(state.moveSets[id].length<4)state.moveSets[id].push(m.move);}}}
   }
   return {oldId:original,id,amount,oldLevel,level:record.level,newMoves:[...new Set(newMoves)],evolved};
  }
  return {useItem,rewardRocket,claimItemUnlock,equipItem,experienceShares,scoutLevel,isRare,abilityOptions,defaultAbility,ability,setAbility,completeTutorial,normalize,defaultMoves,learnable,trainable,isFinal,threshold,freshRecord,levelMoves,chooseStarter,scoutPool,scout,recruit,setTeam,setMove,removeMove,unlocked,reward,evolve,gainExperience};
 }
 root.createGameModel=createGameModel;if(typeof module!=='undefined')module.exports=createGameModel;
})(typeof window!=='undefined'?window:globalThis);
