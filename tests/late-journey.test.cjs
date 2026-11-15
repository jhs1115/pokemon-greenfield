const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const D=require('../data/reference.json'),T=require('../data/training.json'),P=require('../data/progression.json'),A=require('../data/abilities.json'),I=require('../items'),E=require('../engine'),N=require('../native-combat'),G=require('../game-state')(D,T,P,A,I);
const w={POKE_DATA:D,TRAINING_DATA:T,PROGRESSION_DATA:P,ABILITY_DATA:A,ITEM_DATA:I,PKMN:require('@pkmn/sim'),NativeCombat:N,createGameModel:require('../game-state'),BattleEngine:E,MOVE_RULES:require('../moves'),getExpandedMoveRule:require('../expanded-moves'),matchMedia:()=>({matches:true})};
const c=vm.createContext({window:w,document:{querySelector:()=>({}),querySelectorAll:()=>[]},setTimeout:()=>0,clearTimeout(){},localStorage:{setItem(){}},console});
for(const f of ['stages.js','late-stages.js','chapter-maps.js','late-maps.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext(fs.readFileSync('app.js','utf8').replace(/render\(\);\s*$/,''),c);
vm.runInContext("render=()=>{};game=G.normalize({owned:[6,9,3,25,130,143],team:[6,9,3,25,130,143],records:Object.fromEntries([6,9,3,25,130,143].map(id=>[id,G.freshRecord(id,60)])),clears:Array(70).fill(1),tutorial:{done:true}});",c);
for(let i=40;i<75;i++){
 vm.runInContext(`stage=${i};startBattle();`,c);
 assert.equal(vm.runInContext('battle.combat.sim.sides[1].pokemon.length',c),w.STORY_STAGES[i].enemy.length);
 assert.equal(vm.runInContext('battle.combat.sim.sides[0].pokemon.length',c),6);
 vm.runInContext("battle.combat.turn({kind:'wait',destination:battle.pos},{kind:'wait',destination:battle.enemyPos});",c);
}
assert.deepEqual(Array.from(w.STORY_STAGES[49].enemy),[109,89,109,110]);assert.deepEqual(Array.from(w.STORY_STAGES[59].enemy),[64,122,49,65]);assert.deepEqual(Array.from(w.STORY_STAGES[65].enemy),[58,77,78,59]);
assert.deepEqual(Array.from(w.STORY_STAGES[49].moves[0]),[188,53,92,114]);assert.deepEqual(Array.from(w.STORY_STAGES[59].moves[3]),[94,411,247,105]);assert.deepEqual(Array.from(w.STORY_STAGES[65].moves[3]),[394,245,370,234]);
for(const [ch,name]of [[5,'독수'],[6,'초련'],[7,'강연']]){assert.equal(w.STORY_STAGES.find(s=>s.chapter===ch&&s.leader).leader,name);assert.equal(w.CHAPTER_MAPS[ch-1].length,ch===7?6:10);assert(fs.existsSync(`assets/world/chapter-${ch}.svg`));}
const book=require('../story-scenes');for(const stage of [43,46,53,57,60,62,63])assert(w.STORY_STAGES[stage].rocket&&book.scenes['before-'+stage]);for(const [key,s] of Object.entries(book.scenes).filter(([key])=>/^(?:before|after)-(?:4[0-9]|[56][0-9])$/.test(key)||key.startsWith('secret-'))){assert(s.lines.length<=(/^(?:before|after)-[456][0-9]$/.test(key)?26:9));for(const l of s.lines)assert(l.text.length<=85);}
console.log('All 30 late-chapter encounters initialize and advance in native 6v4/5 combat; seven maps, practical gym moves, six Rocket encounters, user-authored chapter five and concise later chapters: passed.');

const silph=w.STORY_STAGES[53],executive=w.STORY_STAGES[57];assert.deepEqual(Array.from(silph.waves,w=>w.enemy.length),[4,4,4]);assert.equal(executive.enemy.length,6);assert.equal(executive.portrait,'rocket-executive');assert(!executive.waves);assert(Math.max(...executive.levels)<Math.max(...w.STORY_STAGES[59].levels));
for(const encounter of [...silph.waves,executive]){for(const key of ['moves','levels','abilities','heldItems'])assert.equal(encounter[key].length,encounter.enemy.length);assert(encounter.moves.every(m=>m.length===4));for(const item of encounter.heldItems)assert(I[item]);for(const id of encounter.enemy)assert([20,24,42,53,89,97,110].includes(id));}
console.log('Silph gauntlet: three teams of four, executive six with distinct sprite, complete moves/abilities/items, and stronger subsequent gym: passed.');

assert.deepEqual(Array.from(w.STORY_STAGES[63].waves,w=>w.enemy.length),[3,4,5]);assert.deepEqual(Array.from(w.STORY_STAGES[63].waves[0].levels),[53,53,53]);assert.deepEqual(Array.from(w.STORY_STAGES[63].waves[1].levels),[55,55,55,55]);assert.deepEqual(Array.from(w.STORY_STAGES[63].waves[2].levels),[55,56,57,58,59]);assert(w.STORY_STAGES[63].confirmWaves);assert.notEqual(w.STORY_STAGES[63].waves[2].portrait,w.STORY_STAGES[57].portrait);assert.equal(w.STORY_STAGES[65].leader,'강연');assert(!w.STORY_STAGES[69].leader);assert(!w.STORY_STAGES[66].rocket);
console.log('Chapter seven exact 3/4/5 gauntlet, requested level sequence, unique executive, relocated single gym and cleared obsolete Rocket stage: passed.');

const competitive=w.STORY_STAGES[63].waves[2];assert.deepEqual(Array.from(competitive.abilities),['multiscale','waterabsorb','magicguard','thickfat','intimidate']);assert.deepEqual(Array.from(competitive.natures),['Adamant','Modest','Timid','Careful','Jolly']);assert.deepEqual(Array.from(competitive.heldItems),['leftovers','leftovers','focus-sash','chesto-berry','sitrus-berry']);assert(!competitive.evs);
vm.runInContext('stage=63;startBattle(false,{...chapters[63],...chapters[63].waves[2],waveIndex:2});',c);
const bossSim=vm.runInContext('battle.combat.sim',c),bossMons=vm.runInContext('battle.foes',c);for(let n=0;n<5;n++){const p=bossSim.sides[1].pokemon[n];assert.equal(p.ability,competitive.abilities[n]);assert.equal(p.set.nature,competitive.natures[n]);assert.equal(p.item,competitive.heldItems[n].replaceAll('-',''));assert(Object.values(p.set.evs).every(v=>v===0),'boss EVs remain zero');assert.equal(bossMons[n].abilityKey,competitive.abilities[n]);assert.equal(bossMons[n].natureKey,competitive.natures[n]);}
const dragon=bossSim.sides[1].active[0],attacker=bossSim.sides[0].active[0];dragon.hp=dragon.maxhp;const reduced=bossSim.actions.getDamage(attacker,dragon,'tackle');dragon.hp--;const normal=bossSim.actions.getDamage(attacker,dragon,'tackle');assert(normal>reduced*1.5,'Multiscale really reduces incoming damage only at full HP');assert.equal(bossSim.sides[1].pokemon[2].getItem().id,'focussash');
console.log('7-4 final executive: five competitive move/nature/ability/item sets reach the simulator, real full-HP Multiscale and Focus Sash, all EVs zero: passed.');

for(const i of [70,71])assert.deepEqual(Array.from(w.STORY_STAGES[i].waves,w=>w.enemy.length),[3,3]);assert.deepEqual(Array.from(w.STORY_STAGES[72].waves,w=>w.enemy.length),[5,5]);const revenge=w.STORY_STAGES[73];assert.equal(revenge.enemy.length,6);assert.equal(revenge.enemy[5],36);assert.equal(revenge.abilities[0],'multiscale');assert.equal(revenge.portrait,'rocket-executive-seven');assert(Math.min(...revenge.levels)>Math.max(...w.STORY_STAGES[63].waves[2].levels));const giovanni=w.STORY_STAGES[74];assert.equal(giovanni.enemy[0],53);assert.equal(giovanni.enemy[5],150);assert.equal(giovanni.levels[5],95);assert(Math.min(...giovanni.levels)>Math.max(...w.STORY_STAGES[65].levels));assert.equal(giovanni.sendOutIndex,5);assert.equal(giovanni.sendOutScene,'mewtwo-sendout');assert(w.STORY_STAGES.slice(70,75).every(s=>s.silentRetry));
const beforeEighth=G.normalize({clears:Array.from({length:70},(_,i)=>i<=65?1:0)});assert.equal(beforeEighth.clears.length,81);assert(G.unlocked(beforeEighth,70));assert(!G.unlocked(beforeEighth,71));assert.equal(G.levelCap(beforeEighth,8),100);G.reward(beforeEighth,70,'eighth-first',()=>1);assert.equal(beforeEighth.clears[70],1);assert(G.unlocked(beforeEighth,71));assert.equal(G.normalize(beforeEighth).clears[70],1);
console.log('Chapter eight: 2x3 / 2x3 / 2x5 patrols, six-Pokemon competitive revenge, Persian and Lv95 Mewtwo, no-EV defaults, 7-6 unlock and 75-slot save persistence: passed.');

vm.runInContext('stage=80;startBattle();',c);const rampage=vm.runInContext('battle',c),rampageMon=rampage.combat.sim.sides[1].active[0];assert.equal(rampage.foes[0].level,100);assert.deepEqual({...rampageMon.boosts},{atk:1,def:4,spa:1,spd:4,spe:1,accuracy:0,evasion:0});assert(Object.values(rampageMon.set.evs).every(v=>v===0));assert.equal(rampage.foes[0].moves.length,4);assert(rampage.foes[0].moves.every(m=>m.damageClass===3));assert.equal(new Set(rampage.foes[0].moves.map(m=>m.type)).size,4);assert.equal(rampage.encounter.music,'mewtwo');assert.equal(w.STORY_STAGES[80].chapterEnd,true);
const rescue=G.normalize({owned:[6,9,3],team:[6,9,3],clears:Array.from({length:81},(_,i)=>i<80?1:0)});assert(G.unlocked(rescue,80));assert(!G.claimMewtwo(rescue,()=>0));rescue.clears[80]=1;assert(G.claimMewtwo(rescue,()=>.6));assert.equal(rescue.records[150].level,85);assert.equal(rescue.records[150].nature,G.randomNature(()=>.6));assert.equal(rescue.owned.filter(id=>id===150).length,1);const record=JSON.stringify(rescue.records[150]);assert(!G.claimMewtwo(rescue,()=>0));assert.equal(JSON.stringify(rescue.records[150]),record);const reloaded=G.normalize(JSON.parse(JSON.stringify(rescue)));assert(!G.claimMewtwo(reloaded));assert.equal(reloaded.records[150].level,85);assert.equal(G.scoutChapter(reloaded),10);assert.equal(G.levelCapInfo(reloaded,10).unrestricted,true);assert.equal(G.levelCapInfo(reloaded,12).leagueUnlocked,true);
const preOwned=G.normalize({owned:[150],team:[150],records:{150:G.freshRecord(150,99,'Jolly',true)},clears:Array(81).fill(1)}),originalRecord=JSON.stringify(preOwned.records[150]);assert(G.claimMewtwo(preOwned));assert.equal(JSON.stringify(preOwned.records[150]),originalRecord);assert.equal(preOwned.owned.length,1);
console.log('Mewtwo rescue: Lv100 opening +4 defenses and +1 attack/special attack/speed, four special types, zero EVs, gated one-time Lv85 random-nature reward, legacy/duplicate preservation and league cap exemption: passed.');

// Chapter eight patrols must remain distinct across all six trainers, including reserve waves.
const patrols=Array.from(w.STORY_STAGES.slice(70,73)).flatMap(s=>Array.from(s.waves));
const patrolSpecies=patrols.flatMap(s=>Array.from(s.enemy));
assert.equal(new Set(patrolSpecies).size,22);
for(const wave of patrols){
 for(const key of ['moves','levels','abilities','heldItems','natures'])assert.equal(wave[key].length,wave.enemy.length);
 const encounter={...w.STORY_STAGES[70],...wave};
 w.patrolTestEncounter=encounter;vm.runInContext('stage=70;startBattle(false,window.patrolTestEncounter);',c);
 const b=vm.runInContext('battle.combat',c);
 assert.equal(b.sim.sides[1].pokemon.length,wave.enemy.length);
 for(let i=0;i<wave.enemy.length;i++){
  const mon=b.sim.sides[1].pokemon[i];
  assert.equal(mon.ability,wave.abilities[i]);
  assert.equal(mon.moveSlots.filter(m=>m.id!=='greenfieldwait').length,4);
  assert.deepEqual(mon.moveSlots.filter(m=>m.id!=='greenfieldwait').map(m=>w.PKMN.Dex.moves.get(m.id).num),Array.from(wave.moves[i]));
 }
}
console.log('Chapter eight: six distinct patrol teams, 22 unique species, four moves and active abilities for every reserve wave: passed.');
