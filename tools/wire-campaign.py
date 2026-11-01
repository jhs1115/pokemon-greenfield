from pathlib import Path
p=Path('game-state.js');s=p.read_text(encoding='utf-8').replace('heldItems:{},itemsUnlocked:', 'heldItems:{},gymVisits:{...(raw.gymVisits||{})},itemsUnlocked:')
s=s.replace('  function claimItemUnlock(', "  function rewardRocket(state,battleId){if(state.rocketCleared||!state.rocketPending||state.claimed.includes(battleId))return {total:0,base:0,first:0,item:null};state.rocketCleared=true;state.rocketPending=false;state.claimed.push(battleId);state.coins+=4;return {total:4,base:4,first:0,item:null};}\n  function claimItemUnlock(")
s=s.replace('return {claimItemUnlock,', 'return {rewardRocket,claimItemUnlock,');p.write_text(s,encoding='utf-8')
p=Path('app.js');s=p.read_text(encoding='utf-8').replace('const img=id=>`assets/pokemon/${id}.png`','const img=id=>`assets/pokemon/animated/${id}.gif`')
s=s.replace("function navigate(next){", "function navigate(next){if(view!==next)transitionView();")
s=s.replace("return {...p,level,abilityId:","return {...p,level,heldItem:isEnemy?'':(game.heldItems[id]||''),abilityId:")
s=s.replace('function startBattle(tutorial=false){', 'function startBattle(tutorial=false,encounter=null){')
s=s.replace('const chapter=chapters[stage];battle={','const chapter=encounter||chapters[stage];battle={encounter:chapter,ambush:!!encounter,')
s=s.replace('G.gainExperience(game,mon.id,enemy(),!!chapters[stage].trainer,participants.length)', 'G.gainExperience(game,mon.id,enemy(),!!b.encounter.trainer,1,allocation.weight)')
s=s.replace('const participants=b.participants.filter(i=>b.party[i].hp>0),events=[];for(const i of participants){', 'const allocations=G.experienceShares(game,b.party,b.participants),events=[];for(const allocation of allocations){const i=allocation.index;')
s=s.replace("window.GameAudio?.scene(view);", "window.GameAudio?.scene(view==='battle'?('battle:'+((battle?.encounter?.gym)|| (battle?.encounter?.rocket?'rocket':'wild'))):view);")
s=s.replace("if(view==='leader')return renderLeader();", "if(view==='leader')return renderLeader();if(view==='rocket')return renderRocket();")
s=s.replace("chapters[stage].name+(chapters[stage].leader?' · '+chapters[stage].leader:'')", "b.encounter.name+(b.encounter.leader?' · '+b.encounter.leader:'')")
s=s.replace('<div class="arena">','<div class="arena arena-${b.encounter.theme||\'forest\'}">')
s=s.replace("b.result==='win'&&stage<9?'다음 전투':'다시 시작'", "b.result==='win'?(b.ambush?'지도':game.rocketPending&&stage===14?'로켓단 습격':stage%10===9?'지역 지도':'다음 전투'):'다시 시작'")
s=s.replace("${b.reward?`<p class=\"reward-total\">", "${b.reward?.item?`<p class=\"reward-item\"><img src=\"assets/items/${b.reward.item}.png\" alt=\"\">${window.ITEM_DATA[b.reward.item].name} ×1</p>`:''}${b.reward?`<p class=\"reward-total\">")
old="if(b.result==='win'&&stage<9)stage++;beginStage();"
new="if(b.result==='win'){if(b.ambush){mapChapter=1;navigate('story');return;}if(stage===14&&game.rocketPending){beginRocket();return;}if(stage%10===9){mapChapter=Math.floor(stage/10);navigate('story');return;}if(stage<39)stage++;}beginStage();"
s=s.replace(old,new)
s=s.replace("b.reward=G.reward(game,stage,b.id);", "b.reward=b.ambush?G.rewardRocket(game,b.id):G.reward(game,stage,b.id);")
s=s.replace('const beforeResidual=', "syncBattleItems();\nconst beforeResidual=")
s=s.replace("b.move=null;render();}\nfunction openTeam", "b.move=null;render();if(b.result==='win'&&!b.ambush&&stage===9&&!game.itemUnlockSeen){await pause(700);if(ownToken===token)navigate('home');}}\nfunction openTeam")
s+='''
function transitionView(){if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;let cover=document.querySelector('.view-transition');if(!cover){cover=document.createElement('div');cover.className='view-transition';document.body.append(cover);}cover.getAnimations?.().forEach(a=>a.cancel());cover.animate([{opacity:0,backdropFilter:'blur(0px)'},{opacity:.85,backdropFilter:'blur(10px)',offset:.3},{opacity:0,backdropFilter:'blur(0px)'}],{duration:520,easing:'ease-in-out'}).finished.then(()=>cover.remove()).catch(()=>{});}
function syncBattleItems(){if(!game.itemsUnlocked)return;let changed=false;const snap=battle.combat.snapshot();for(const entry of snap.mons){if(entry.name[0]!=='p')continue;const mon=battle.combat.lookup(entry.name).mon,key=game.heldItems[mon.id];if(key&&window.ITEM_DATA[key]?.consumed&&!entry.item){delete game.heldItems[mon.id];changed=true;}}if(changed)saveGame();}
'''
p.write_text(s,encoding='utf-8')
p=Path('native-combat.js');s=p.read_text(encoding='utf-8').replace("ability:m.abilityKey||'No Ability',moves:","ability:m.abilityKey||'No Ability',item:m.heldItem||'',moves:").replace('status:p.status,speed:', 'status:p.status,item:p.item,speed:');p.write_text(s,encoding='utf-8')
# Mark chapters/themes in actual page CSS from every render, without changing saved state.
p=Path('app.js');s=p.read_text(encoding='utf-8').replace("function render(){window.GameAudio", "function render(){document.body.dataset.view=view;window.GameAudio");p.write_text(s,encoding='utf-8')
