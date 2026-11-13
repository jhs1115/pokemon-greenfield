const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const D=require('../data/reference.json'),book=require('../story-scenes'),w={POKE_DATA:D,TRAINING_DATA:require('../data/training.json'),PROGRESSION_DATA:require('../data/progression.json'),ABILITY_DATA:require('../data/abilities.json'),ITEM_DATA:require('../items'),PKMN:require('@pkmn/sim'),NativeCombat:require('../native-combat'),createGameModel:require('../game-state'),BattleEngine:require('../engine'),MOVE_RULES:require('../moves'),getExpandedMoveRule:require('../expanded-moves'),GameAudio:{cast:async()=>{},play(){},celebrate(){},later(){},result(){}},animateMovement:async()=>{},playMoveEffect:async()=>{}};
for(const f of ['stages.js','late-stages.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),{window:w});
const c=vm.createContext({window:w,document:{querySelector:()=>({}),querySelectorAll:()=>[]},setTimeout:callback=>callback(),clearTimeout(){},showMoveName(){},describeCombat:()=>[],moveClassName:()=>'',moveClassBadge:()=>'',localStorage:{setItem(){}},console});vm.runInContext(fs.readFileSync('app.js','utf8').replace(/render\(\);\s*$/,''),c);vm.runInContext('render=()=>{};showExperienceNotice=()=>{};showBattleNotes=()=>{};showAbilityNotices=()=>{};',c);
(async()=>{
 for(const index of [22,27,37,43,46]){
  const encounter=w.STORY_STAGES[index];assert.equal(encounter.waves.length,index===46?4:[37,43].includes(index)?3:2);for(const wave of encounter.waves){assert.equal(wave.enemy.length,3);assert(wave.moves.every(m=>m.length===4));assert.equal(wave.levels.length,3);}
  c.testStage=index;vm.runInContext("game=G.normalize({economyVersion:1,coins:0,owned:[9,6],team:[9,6],records:{9:G.freshRecord(9,100),6:G.freshRecord(6,100)},tutorial:{done:true},clears:Array(70).fill(1),rocketCleared:true,itemsUnlocked:true});stage=testStage;game.clears[stage]=0;game.moveSets[9]=[129];startBattle();battle.pos={x:4,y:3};aiCommand=()=>({kind:'wait',destination:{...battle.enemyPos}});",c);
  async function defeatTrainer(){vm.runInContext('for(const m of battle.foes)m.hp=1;for(const p of battle.combat.sim.sides[1].pokemon)p.hp=1;',c);for(let turns=0;turns<8&&!vm.runInContext('battle.result',c);turns++)await vm.runInContext("resolveTurn({kind:'attack',move:0,destination:{...battle.pos},target:{...battle.enemyPos}})",c);assert.equal(vm.runInContext('battle.result',c),'win');}
  for(let wave=0;wave<encounter.waves.length;wave++){
   await defeatTrainer();
   if(wave===encounter.waves.length-1){assert.equal(vm.runInContext('game.clears[stage]',c),1);assert(vm.runInContext('game.coins>0',c));assert(!vm.runInContext('hasNextTrainer(battle)',c));break;}
   assert.equal(vm.runInContext('game.clears[stage]',c),0);assert.equal(vm.runInContext('game.coins',c),0);assert(vm.runInContext('resultNeedsConfirmation(battle)',c));
   vm.runInContext("{const lead=battle.combat.sim.sides[0].active[0];lead.hp=17;lead.status='slp';lead.statusState={id:'slp',target:lead,time:2,startTime:3};lead.moveSlots[0].pp=2;battle.combat.apply(battle.combat.snapshot(),true);nextTrainer();}",c);
   assert.equal(vm.runInContext('battle.encounter.waveIndex',c),wave+1);assert.equal(vm.runInContext('battle.ambush',c),false);assert.equal(vm.runInContext('battle.foes.length',c),3);assert.equal(vm.runInContext('player().hp',c),17);assert.equal(vm.runInContext('player().status',c),'slp');assert.equal(vm.runInContext('player().moves[0].remaining',c),2);
   vm.runInContext("{const nextLead=battle.combat.sim.sides[0].active[0];nextLead.hp=nextLead.maxhp;nextLead.status='';nextLead.statusState={};nextLead.moveSlots[0].pp=20;battle.combat.apply(battle.combat.snapshot(),true);}",c);
  }
  vm.runInContext('startBattle();',c);assert.equal(vm.runInContext('battle.encounter.waveIndex||0',c),0,'retry starts from the first trainer');assert.equal(vm.runInContext('battle.foes.length',c),3);
 }
 assert.equal(book.scenes['before-20'].backdrop,'coast');assert(book.scenes['before-20'].lines.some(l=>l.backdrop==='harbor'));assert(book.scenes['before-20'].lines.some(l=>l.sound==='ship-horn'));
 const warehouse=book.scenes['before-22'].lines;assert(warehouse.findIndex(l=>l.backdrop==='warehouse-dark')<warehouse.findIndex(l=>l.backdrop==='warehouse'));
 for(const key of ['after-22','before-26','after-27','after-29'])assert(book.scenes[key]);assert(book.gymLines.surge.some(([,text])=>text.includes('electronic')));assert(!book.scenes['before-20'].lines.some(l=>l.text.includes('노랑시티')));
 console.log('Chapter 3: user dialogue/backdrop/light/horn, chapters 3–5 two/three/four trainers of three, preserved HP/status/PP, no premature clears/rewards, final reward and full retry: passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
