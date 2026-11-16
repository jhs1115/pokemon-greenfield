(function(){
'use strict';
const book=window.KANTO_STORY;let current=null,archiveChapter=0;const starterPage=book.scenes.opening.lines.findIndex(l=>l.choice==='starter');
const gymKeys={웅이:'brock',이슬이:'misty',마티스:'surge',민화:'erika',독수:'koga',초련:'sabrina',강연:'blaine',비주기:'giovanni'};
function progress(){
 const state=game.story||(game.story={version:1,seen:[],cursors:{},scoutGiftAvailable:false}),revision='rocket-authored-chapters-six-seven-v1';
 if(!state.seen.includes(revision)){
  const rewritten=new Set([53,57,60,62,63].flatMap(i=>['before-'+i,'after-'+i]));
  state.seen=state.seen.filter(key=>!rewritten.has(key));
  for(const key of rewritten)delete state.cursors[key];
  state.seen.push(revision);
 }
 return state;
}
function has(key){return progress().seen.includes(key);}
function open(key,spec,done,options={}){const state=progress();current={key,spec,done,options,page:options.repeat||options.replay?0:Math.min(state.cursors[key]||0,spec.lines.length-1),lastNpc:spec.npc||null};view='dialogue';render();return true;}
function finish(){const active=current;if(!active)return;if(active.key==='after-80'&&!active.options.replay)G.claimMewtwo(game);if(active.key==='after-94'&&!active.options.replay)G.claimChampionship(game);if(active.key==='before-90'&&!active.options.replay&&!has('league-green-badge'))progress().seen.push('league-green-badge');if(!active.options.replay){const state=progress();if(!state.seen.includes(active.key))state.seen.push(active.key);delete state.cursors[active.key];saveGame();}current=null;active.done();}
function opening(replay=false){if(current&&view==='dialogue')return renderScene();const spec=book.scenes.opening,returnChapter=mapChapter,returnStage=selectedStage;
 open('opening',spec,()=>{if(!replay){const first=!game.tutorial.done;G.completeTutorial(game);if(first)progress().scoutGiftAvailable=false;saveGame();}mapChapter=replay?returnChapter:0;selectedStage=replay?returnStage:0;view='story';render();},{opening:true,replay});
 if(!game.starter&&!replay){current.page=Math.min(current.page,starterPage);renderScene();}
 if(game.starter&&!replay&&current.page<=starterPage){current.page=starterPage+1;renderScene();}
}
function skip(){if(!current)return;if(current.options.opening&&!game.starter){current.page=starterPage;current.options.skipAfterChoice=true;renderScene();return;}finish();}
function next(){if(!current)return;if(current.page>=current.spec.lines.length-1){finish();return;}current.page++;if(!current.options.replay&&!current.options.repeat){progress().cursors[current.key]=current.page;saveGame();}renderScene();}
const backgroundAssets=Object.freeze({
  "league-exterior": "assets/world/league/league-exterior-v1.png",
  "league-lobby": "assets/world/league/league-lobby-v1.png",
  "league-ice": "assets/world/league/league-ice-v1.png",
  "league-fighting": "assets/world/league/league-fighting-v1.png",
  "league-ghost": "assets/world/league/league-ghost-v1.png",
  "league-dragon": "assets/world/league/league-dragon-v1.png",
  "league-champion": "assets/world/league/league-champion-v1.png",
  "league-confrontation": "assets/world/league/league-confrontation-v3.png",
  "league-intercept": "assets/world/league/league-intercept-v2.png",
  "league-arrest": "assets/world/league/league-arrest-v1.png",
  "league-reunion": "assets/world/league/league-reunion-v2.png",
  "league-bright-ruins": "assets/world/league/league-bright-ruins-v2.png",
  "league-blue-portrait": "assets/world/league/league-blue-portrait-v1.png",
  "league-applause": "assets/world/league/league-applause-v2.png",
  "league-hall-of-fame": "assets/world/league/league-hall-of-fame-v1.png",
  "league-ending": "assets/world/league/league-ending-v2.png",
  "saffron-city": "assets/world/routes/chapter-6-v5.png",
  "silph-alert": "assets/world/story-v1/silph-exterior-v1.png",
  "silph-office": "assets/world/story-v1/silph-office-v1.png",
  "silph-lobby": "assets/world/story-v1/silph-lobby-v1.png",
  "cinnabar-coast": "assets/world/story-v1/cinnabar-coast-v1.png",
  "cinnabar-courtyard": "assets/world/story-v1/cinnabar-courtyard-v1.png",
  "gym-psychic": "assets/world/story-v1/gym-psychic-v1.png",
  "gym-fire": "assets/world/story-v1/gym-fire-v1.png",
  "viridian-street": "assets/world/story-v1/viridian-street-v1.png",
  "rocket-hq-hall": "assets/world/story-v1/rocket-hq-hall-v1.png",
  "rocket-hq-ante": "assets/world/story-v1/rocket-hq-ante-v1.png",
  "gym-ground": "assets/world/story-v1/gym-ground-v1.png",
  "viridian-ruins": "assets/world/story-v1/viridian-gym-ruins-v1.png",
  "mewtwo-ruins": "assets/world/routes/chapter-9-v1.png",
  "mewtwo-eye": "assets/world/story-v1/mewtwo-eye-v1.png",
  "rescue-dawn": "assets/world/story-v1/mewtwo-rescue-dawn-v1.png",
  "rescue-hands": "assets/world/story-v1/mewtwo-hands-v1.png",
  "mewtwo-control-neck": "assets/world/story-v1/mewtwo-control-neck-v1.png",
  "mewtwo-control-break": "assets/world/story-v1/mewtwo-control-neck-break-v1.png",
  "mewtwo-rest": "assets/world/story-v1/mewtwo-rest-v2.png",
  "mewtwo-awake": "assets/world/story-v1/mewtwo-awake-v3.png",
  "collar-release": "assets/world/story-v1/control-device-release-v1.png",
  "pallet-town": "assets/world/story-v1/pallet-town-v1.png",
  "road": "assets/world/story-v1/forest-path-v1.png",
  "forest": "assets/world/story-v1/forest-path-v1.png",
  "coast": "assets/world/story-v1/cerulean-coast-v1.png",
  "cerulean-pier": "assets/world/story-v1/cerulean-pier-v1.png",
  "ferry-deck": "assets/world/story-v1/ferry-deck-v1.png",
  "vermilion-port": "assets/world/story-v1/vermilion-port-v1.png",
  "celadon-arrival": "assets/world/story-v1/celadon-arrival-v1.png",
  "blossom-street": "assets/world/story-v1/blossom-street-v1.png",
  "rocket-hideout": "assets/world/story-v1/rocket-hideout-v1.png",
  "safari-fog": "assets/world/story-v1/safari-mist-v1.png",
  "shop": "assets/world/story-v1/scout-reception-v1.png",
  "gym-rock": "assets/world/story-v1/gym-rock-v1.png",
  "gym-water": "assets/world/story-v1/gym-water-v1.png",
  "gym-electric": "assets/world/story-v1/gym-electric-v1.png",
  "gym-grass": "assets/world/story-v1/gym-grass-v1.png",
  "gym-poison": "assets/world/story-v1/gym-poison-v1.png",
  "lab": "assets/world/oak-laboratory-v2.png",
  "restaurant": "assets/world/flower-restaurant-v1.png",
  "warehouse": "assets/world/port-warehouse-v1.png",
  "warehouse-dark": "assets/world/port-warehouse-v1.png",
  "ruined-city": "assets/world/fuchsia-ruins-v1.png"
});
function background(kind){if(kind==='black')return '<div class="story-black-frame"></div>';if(backgroundAssets[kind])return `<img src="${backgroundAssets[kind]}" alt="" decoding="async">`;if(kind==='ruined-city')return '<img src="assets/world/fuchsia-ruins-v1.png" alt="">';if(kind==='safari-fog')return '<img src="assets/world/routes/chapter-5-v5.png" alt="">';if(kind==='restaurant')return '<img src="assets/world/flower-restaurant-v1.png" alt="">';if(kind==='warehouse'||kind==='warehouse-dark')return '<img src="assets/world/port-warehouse-v1.png" alt="">';if(kind==='coast')return '<img src="assets/world/routes/chapter-2-v5.png" alt="">';if(kind==='lab')return '<img src="assets/world/oak-laboratory-v2.png" alt="">';if(kind==='shop')return sceneArt('interiors',0);if(kind==='lounge')return sceneArt('interiors',2);if(kind==='training')return sceneArt('interiors',1);if(kind==='river')return sceneArt('interiors',3);if(kind==='blossom-street')return '<img src="assets/world/routes/chapter-4-v5.png" alt="">';if(kind==='garden')return sceneArt('home-scenes',2);if(kind==='harbor')return '<img src="assets/world/pvp-home-v2.png" alt="">';if(kind==='hideout')return sceneArt('gyms',0);if(kind.startsWith('gym-'))return sceneArt('gyms',({rock:0,water:1,electric:2,grass:3,poison:3,psychic:2,fire:0})[kind.slice(4)]||0);return sceneArt('home-scenes',0);}
function finalPartner(){const id=game.starter||4;return id<=3?3:id<=6?6:id<=9?9:id;}
function speakerName(line){return line.speakerName&&line.speakerName!=='???'?line.speakerName:line.speaker==='player'?'나':line.speaker==='news'?'아나운서':line.speaker==='narrator'?'':book.cast[line.speaker]?.name||'등장인물';}
function renderScene(){if(!current){view='story';render();return;}const {key,spec,page,options}=current,line=spec.lines[page],speaker=line.speaker;
 if(book.cast[speaker])current.lastNpc=speaker;
 const npc=Object.prototype.hasOwnProperty.call(line,'actor')?line.actor:current.lastNpc,choosing=line.choice==='starter'&&!game.starter,partner=species(game.starter||game.team.find(Boolean)||4).name,text=line.text.replaceAll('{partnerFinal}',species(finalPartner()).name).replaceAll('{partner}',partner),backdrop=spec.lines.slice(0,page+1).reverse().find(l=>l.backdrop)?.backdrop||spec.backdrop;
 let shell=$('#story-cinema');
 if(!shell||shell.dataset.scene!==key){$('#app').innerHTML=`<section id="story-cinema" class="story-cinema" data-scene="${key}" aria-label="${escapeHTML(spec.title)}"><div class="story-backdrop" aria-hidden="true"></div><div class="story-scene-shade" aria-hidden="true"></div><div class="story-petals" aria-hidden="true"><i style="--petal:0"></i><i style="--petal:1"></i><i style="--petal:2"></i><i style="--petal:3"></i><i style="--petal:4"></i><i style="--petal:5"></i><i style="--petal:6"></i><i style="--petal:7"></i></div><header class="story-scene-header"><span>${escapeHTML(spec.title)}</span><button id="story-skip" class="outline">장면 건너뛰기</button></header><div class="story-actors" aria-hidden="true">${Object.entries(book.cast).map(([id,c])=>`<img class="story-actor offstage" data-story-actor="${id}" src="assets/trainers/${c.src}" alt="">`).join('')}</div><div class="story-partner" aria-hidden="true"></div><div class="rescue-cinema" aria-hidden="true"></div><div class="story-choices" id="story-choices"></div><div class="story-dialogue" aria-live="off"><b id="story-speaker"></b><p id="story-line"></p><div class="story-dialogue-actions"><small>Enter</small><button id="story-next" class="primary" aria-label="대화 계속">다음 <span aria-hidden="true">▸</span></button></div></div></section>`;shell=$('#story-cinema');$('#story-skip').textContent=options.replay?'이야기 닫기':'장면 건너뛰기';$('#story-skip').onclick=skip;}
 if(shell.dataset.backdrop!==backdrop){const old=shell.dataset.backdrop;$('.story-backdrop').innerHTML=old&&['before-80','after-80'].includes(key)?`<div class="story-backdrop-layer">${background(old)}</div><div class="story-backdrop-layer arriving">${background(backdrop)}</div>`:background(backdrop);shell.dataset.backdrop=backdrop;}
 shell.dataset.shot=line.shot||'';shell.dataset.clueTone=line.clueTone||'';const music=spec.lines.slice(0,page+1).reverse().find(l=>l.music)?.music||spec.music;if(music)window.GameAudio?.scene?.(music);else if(!options.battleCutscene)window.GameAudio?.scene?.('dialogue');
 shell.dataset.injured=String(!!spec.injured);shell.dataset.duo=String(!!(line.actors||spec.actors));shell.dataset.fallen=String(!!line.fallen);shell.dataset.rampage=String(!!line.rampage);shell.dataset.explosion=String(!!line.explosion);shell.dataset.line=String(page);shell.dataset.speaker=speaker;shell.dataset.thought=String(!!line.thought);shell.classList.toggle('choosing-starter',choosing);shell.classList.toggle('receiving-item',!!line.itemGift);shell.classList.toggle('receiving-unlock',!!line.unlock);
 document.querySelectorAll('[data-story-actor]').forEach(el=>{const shown=npc!==null&&((line.actors||spec.actors)?(line.actors||spec.actors).includes(el.dataset.storyActor):el.dataset.storyActor===npc);el.classList.toggle('offstage',!shown);el.classList.toggle('speaking',shown&&speaker===el.dataset.storyActor);el.classList.toggle('listening',shown&&speaker!==el.dataset.storyActor);});
 $('#story-speaker').textContent=speakerName(line);
 const partnerArea=$('.story-partner'),partnerId=Object.prototype.hasOwnProperty.call(line,'scenePokemon')?line.scenePokemon:game.starter;if(partnerId&&partnerArea.dataset.pokemon!==String(partnerId)){partnerArea.dataset.pokemon=partnerId;partnerArea.innerHTML=`<img src="${img(partnerId)}" alt="">`;}
 partnerArea.hidden=!partnerId||choosing||speaker==='news'||!!(line.actors||spec.actors);partnerArea.classList.toggle('scene-legendary',partnerId===150);partnerArea.classList.toggle('listening',speaker!=='player');
 $('#story-choices').innerHTML=choosing?[4,7,1].map(id=>`<button data-story-starter="${id}" aria-label="${species(id).name}와 함께하기"><img src="${img(id)}" alt=""><b>${species(id).name}</b><small>Lv.5</small></button>`).join(''):'';
 document.querySelectorAll('[data-story-starter]').forEach(btn=>btn.onclick=()=>{if(game.starter)return;G.chooseStarter(game,+btn.dataset.storyStarter);savedTeam=game.team;progress().cursors.opening=starterPage+1;saveGame();if(current.options.skipAfterChoice){finish();return;}current.page=starterPage+1;renderScene();});
 if(partnerId===150&&line.shot)partnerArea.innerHTML=`<img src="assets/pokemon/150.png" alt="">`;
 $('.rescue-cinema').innerHTML=rescueMarkup(line);
 if(line.badgeGift&&!options.replay&&!has('league-green-badge')){progress().seen.push('league-green-badge');saveGame();}
 if(line.hallRegistration){if(!options.replay&&G.claimChampionship(game))saveGame();$('#story-choices').innerHTML='<div class="hall-party">'+(game.hallOfFame?.team||[]).map((p,i)=>`<img style="--hall-x:${[34,40.3,46.7,53.2,59.7,66.1][i]}%;--hall-order:${i}" src="${img(p.id,p.shiny)}" alt="${species(p.id).name}">`).join('')+'</div>';}
 if(line.recruitMewtwo){if(!options.replay&&G.claimMewtwo(game))saveGame();$('#story-choices').innerHTML='<div class="mewtwo-recruit-card"><img src="assets/pokemon/150.png" alt=""><b>뮤츠</b><span>Lv.85</span></div>';}else if(!line.hallRegistration&&['before-80','after-80'].includes(key))$('#story-choices').innerHTML='';
 if(line.sound&&shell.dataset.soundPage!==key+':'+page){shell.dataset.soundPage=key+':'+page;window.GameAudio?.storySound?.(line.sound);}
 const button=$('#story-next');button.hidden=choosing;button.innerHTML=(page===spec.lines.length-1?options.opening?'길을 나선다':'계속':'다음')+' <span aria-hidden="true">▸</span>';button.onclick=next;
 $('.story-dialogue').onclick=e=>{if(e.target.closest('button'))return;activeDialogue?.advance();};
 if(line.itemGift){const itemKey=typeof line.itemGift==='string'?line.itemGift:'exp-share',count=line.itemCount||2,name=window.ITEM_DATA[itemKey].name;$('#story-choices').innerHTML=`<div class="story-item-gift"><img src="assets/items/${itemKey}.png" alt="${name}"><b>${name} ×${count}</b></div>`;}if(line.unlock)$('#story-choices').innerHTML='<div class="story-unlock-gift">마을 · 스카우트<br>잠금 해제!</div>';
 typeDialogue($('#story-line'),text,choosing?null:button,null,null,{rich:true});
}
function rescueMarkup(line){
 if(!line.shot)return '';
 const partner=line.rescuePartner?`<img class="rescue-starter" src="${img(finalPartner())}" alt="">`:'';
 const rays=['charge','break','join'].includes(line.shot)?'<div class="rescue-rays"></div>':'';
 const fragments=line.shot==='break'?'<div class="collar-fragments"><i></i><i></i><i></i><i></i></div>':'';

 const impact=line.shot==='break'?'<div class="rescue-impact"><i></i><b></b></div>':'';
 const hands=impact+(line.shot==='burst'?'<div class="rescue-burst"><i></i><b></b></div>':'');
 return partner+rays+fragments+hands;
}
function beforeStage(index,done){const c=chapters[index],key='before-'+index;
 if(c.league){
  if(index===94&&game.clears[index]>0&&!game.champion)return open('after-94',book.scenes['after-94'],()=>{view='story';render();});
  const repeat=has(key)||(game.gymVisits[index]||0)>0||game.clears[index]>0;
  return open(repeat?'league-retry-'+index:key,book.scenes[repeat?'league-retry-'+index:key],()=>{game.gymVisits[index]=(game.gymVisits[index]||0)+1;saveGame();startBattle();},{repeat});
 }
 if(c.rescueReward&&game.clears[index]>0&&!has('mewtwo-rescue-reward'))return open('after-80',book.scenes['after-80'],()=>{view='story';render();});
 if(c.silentRetry){if(has(key)||(c.leader&&game.gymVisits[index])){startBattle();return true;}if(book.scenes[key])return open(key,book.scenes[key],()=>{if(c.leader){game.gymVisits[index]=(game.gymVisits[index]||0)+1;saveGame();}startBattle();});}
 if(c.leader){const actor=gymKeys[c.leader],repeat=(game.gymVisits[index]||game.clears[index]||0)>0;const lines=repeat?[{speaker:actor,text:''}]:book.gymLines[actor].map(([speaker,text],i)=>({speaker,text,thought:actor==='misty'&&i===1||!!book.gymThoughts?.[actor]?.includes(i)}));
  if(repeat)lines[0].text=({brock:'또 시계 풀어?',misty:'재도전은 환영이지. 간다!',surge:'재도전 man?!? 이번에도 전력으로 간다 bro!!',erika:'재도전... 또 기대되게 만드는군요.',koga:'이 늙은이를 또 상대할 건가? 나야 좋다!',sabrina:'좋습니다. 준비됐나요?'})[actor]||'준비됐나? 다시 겨뤄 보자.';
  return open('gym-'+index+(repeat?'-repeat':''),{title:c.leader+'의 체육관',backdrop:'gym-'+c.gym,npc:actor,lines},()=>{game.gymVisits[index]=(game.gymVisits[index]||0)+1;saveGame();startBattle();},{repeat});
 }
 if(c.rocket&&index>=50&&index<70&&book.scenes[key])return open(key,book.scenes[key],()=>startBattle(),{repeat:has(key)});
 if(book.scenes[key]&&!has(key))return open(key,book.scenes[key],c.rocket?()=>startBattle():done);
 if(c.rocket)return open(key+'-repeat',{title:c.rocketBase?'로켓단의 지하 거점':'로켓단',backdrop:c.chapter<=5?(c.rocketBase?'rocket-hideout':c.chapter===5?'safari-fog':c.name==='3-3'?'warehouse':'vermilion-port'):(c.rocketBase?'hideout':'harbor'),npc:'rocket',lines:[{speaker:'rocket',text:'여기서 또 마주치다니! 이번에는 그냥 보내 주지 않겠다!'}]},()=>startBattle(),{repeat:true});
 return false;
}
function battleScene(key,done){if(!book.scenes[key]||has(key))return false;return open(key,book.scenes[key],done,{battleCutscene:true});}
function trainerWave(key,done){return key&&book.scenes[key]?open(key,book.scenes[key],done,{repeat:true}):false;}
function gymStage(ch){const i=chapters.findIndex(c=>c.chapter===ch+1&&(c.leader||c.chapterEnd));return i<0?ch*10+9:i;}
function ambush(done){return open('ambush',book.scenes.ambush,done,{repeat:has('ambush')});}
function hasAfterBattle(index,options={}){if(options.ambush)return !!book.scenes['after-ambush']&&!has('after-ambush');return index===9||!!book.scenes['after-'+index]&&!has('after-'+index);}
function afterBattle(index,done,options={}){if(options.ambush){if(!has('after-ambush'))return open('after-ambush',book.scenes['after-ambush'],done);return false;}if(index===9&&has('after-9'))return open('after-9-repeat',{title:'다시 얻은 승리',backdrop:'gym-rock',npc:'brock',lines:[{speaker:'brock',text:'역시 강하군! 내가 인정하는 트레이너 답다!'}]},done,{repeat:true});const key='after-'+index;if(book.scenes[key]&&!has(key))return open(key,book.scenes[key],index===2?()=>{view='home';render();}:done);return false;}
function itemUnlock(){
 if(current)return true;if(!game.clears[9]||game.itemUnlockSeen)return false;
 if(!has('after-9'))return open('after-9',book.scenes['after-9'],()=>itemUnlock());
 if(!G.claimItemUnlock(game))return false;saveGame();
 return open('item-gift',book.scenes['item-gift'],()=>{game.itemUnlockSeen=true;saveGame();view='home';render();});
}
function beforeMenu(name){if(!book.scenes[name]||has('menu-'+name)||name==='scout'&&!G.villageUnlocked(game)||name!=='scout'&&!has('opening'))return false;return open('menu-'+name,book.scenes[name],()=>{view=name;render();});}
const secrets=[];
function secretsHTML(chapter){return secrets.filter(s=>s.chapter===chapter&&game.clears[s.stage]>0).map(s=>`<button class="secret-route secondary" data-secret="${s.key}">${has(s.key)?'✓ ':''}${s.name}</button>`).join('');}
function bindSecrets(){document.querySelectorAll('[data-secret]').forEach(b=>b.onclick=()=>{const s=secrets.find(s=>s.key===b.dataset.secret),claimed=has(s.key);open(s.key,book.scenes[s.key],()=>{if(!claimed){game.inventory[s.item]=(game.inventory[s.item]||0)+1;saveGame();toast(`${window.ITEM_DATA[s.item].name} ×1`);}view='story';render();},{replay:claimed});});}
function archive(chapter=archiveChapter){archiveChapter=chapter;view='story-archive';render();}
function replayOrder(key){if(key==='opening')return -1;if(key==='item-gift')return 92;if(key==='ambush')return 145;if(key==='after-ambush')return 146;if(key.startsWith('menu-'))return {scout:95,manage:96,training:97}[key.slice(5)];const secret=secrets.find(s=>s.key===key);if(secret)return secret.stage*10+5;const stage=key.match(/^(before|after)-(\d+)$/);if(stage)return +stage[2]*10+(stage[1]==='after'?1:0);return gymStage(+key.split('-').at(-1))*10;}
function renderArchive(){const visible=CHAPTER_NAMES.map((name,ch)=>({name,ch})).filter(({ch})=>ch===0||game.clears[gymStage(ch-1)]>0||game.clears[ch*10-1]>0);$('#app').innerHTML=`<div class="menu-shell story-archive">${menuHeader('지난 이야기')}<button id="archive-map" class="secondary">지도로</button><nav class="archive-chapters" aria-label="지난 이야기 챕터">${visible.map(({name,ch})=>`<button data-archive-chapter="${ch}" class="${ch===archiveChapter?'primary':'secondary'}">${ch+1}챕터의 ${escapeHTML(name)}</button>`).join('')}</nav>${visible.filter(({ch})=>ch===archiveChapter).map(({name,ch})=>{const entries=Object.entries(book.scenes).filter(([key])=>{if(key==='opening')return ch===0;if(key==='ambush'||key==='after-ambush')return ch===1&&game.rocketCleared;const m=key.match(/^(?:before|after)-(\d+)$/);return m&&Math.floor(+m[1]/10)===ch&&(has(key)||game.clears[+m[1]]>0);});if(ch===0&&has('item-gift'))entries.push(['item-gift',book.scenes['item-gift']]);if(ch===0)for(const key of ['scout'])if(has('menu-'+key))entries.push(['menu-'+key,book.scenes[key]]);const bossIndex=gymStage(ch),boss=chapters[bossIndex],actor=gymKeys[boss.leader];if(!book.scenes['before-'+bossIndex]&&(game.clears[bossIndex]||has('gym-'+bossIndex)))entries.push(['archive-gym-'+ch,{title:boss.leader+'의 체육관',backdrop:'gym-'+boss.gym,npc:actor,lines:book.gymLines[actor].map(([speaker,text],i)=>({speaker,text,thought:actor==='misty'&&i===1||!!book.gymThoughts?.[actor]?.includes(i)}))}]);for(const s of secrets.filter(s=>s.chapter===ch&&has(s.key)))entries.push([s.key,book.scenes[s.key]]);return `<section><h2>${ch+1}장 · ${name}</h2><div class="archive-scenes">${entries.sort((a,b)=>replayOrder(a[0])-replayOrder(b[0])).map(([key,spec])=>`<button class="secondary" data-replay-scene="${key}">${ch+1}챕터의 ${escapeHTML(spec.title)}</button>`).join('')||'<small>아직 지나온 이야기가 없습니다.</small>'}</div></section>`;}).join('')}</div>`;bindMenuHeader();document.querySelectorAll('[data-archive-chapter]').forEach(b=>b.onclick=()=>archive(+b.dataset.archiveChapter));$('#archive-map').onclick=()=>{view='story';render();};document.querySelectorAll('[data-replay-scene]').forEach(b=>b.onclick=()=>{const key=b.dataset.replayScene;let spec=book.scenes[key]||book.scenes[key.replace(/^menu-/,'')];if(!spec){const ch=+key.split('-').at(-1),boss=chapters[gymStage(ch)],actor=gymKeys[boss.leader];spec={title:boss.leader+'의 체육관',backdrop:'gym-'+boss.gym,npc:actor,lines:book.gymLines[actor].map(([speaker,text],i)=>({speaker,text,thought:actor==='misty'&&i===1||!!book.gymThoughts?.[actor]?.includes(i)}))};}open(key,spec,()=>archive(archiveChapter),{replay:true});});}
window.StoryUI={speakerName,battleScene,trainerWave,backgroundAssets,archive,renderArchive,secretsHTML,bindSecrets,opening,render:renderScene,beforeStage,afterBattle,hasAfterBattle,itemUnlock,beforeMenu,ambush,has,replayOpening:()=>opening(true)};
})();
