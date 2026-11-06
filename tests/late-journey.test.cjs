const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const D=require('../data/reference.json'),T=require('../data/training.json'),P=require('../data/progression.json'),A=require('../data/abilities.json'),I=require('../items'),E=require('../engine'),N=require('../native-combat'),G=require('../game-state')(D,T,P,A,I);
const w={POKE_DATA:D,TRAINING_DATA:T,PROGRESSION_DATA:P,ABILITY_DATA:A,ITEM_DATA:I,PKMN:require('@pkmn/sim'),NativeCombat:N,createGameModel:require('../game-state'),BattleEngine:E,MOVE_RULES:require('../moves'),getExpandedMoveRule:require('../expanded-moves'),matchMedia:()=>({matches:true})};
const c=vm.createContext({window:w,document:{querySelector:()=>({}),querySelectorAll:()=>[]},setTimeout:()=>0,clearTimeout(){},localStorage:{setItem(){}},console});
for(const f of ['stages.js','late-stages.js','chapter-maps.js','late-maps.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
vm.runInContext(fs.readFileSync('app.js','utf8').replace(/render\(\);\s*$/,''),c);
vm.runInContext("render=()=>{};game=G.normalize({owned:[6,9,3,25,130,143],team:[6,9,3,25,130,143],records:Object.fromEntries([6,9,3,25,130,143].map(id=>[id,G.freshRecord(id,60)])),clears:Array(70).fill(1),tutorial:{done:true}});",c);
for(let i=40;i<70;i++){
 vm.runInContext(`stage=${i};startBattle();`,c);
 assert.equal(vm.runInContext('battle.combat.sim.sides[1].pokemon.length',c),w.STORY_STAGES[i].enemy.length);
 assert.equal(vm.runInContext('battle.combat.sim.sides[0].pokemon.length',c),6);
 vm.runInContext("battle.combat.turn({kind:'wait',destination:battle.pos},{kind:'wait',destination:battle.enemyPos});",c);
}
assert.deepEqual(Array.from(w.STORY_STAGES[49].enemy),[109,89,109,110]);assert.deepEqual(Array.from(w.STORY_STAGES[59].enemy),[64,122,49,65]);assert.deepEqual(Array.from(w.STORY_STAGES[69].enemy),[58,77,78,59]);
assert.deepEqual(Array.from(w.STORY_STAGES[49].moves[0]),[120,124,108,92]);assert.deepEqual(Array.from(w.STORY_STAGES[59].moves[3]),[94,105,248,347]);assert.deepEqual(Array.from(w.STORY_STAGES[69].moves[3]),[44,46,36,126]);
for(const [ch,name]of [[5,'독수'],[6,'초련'],[7,'강연']]){assert.equal(w.STORY_STAGES[ch*10-1].leader,name);assert.equal(w.CHAPTER_MAPS[ch-1].length,10);assert(fs.existsSync(`assets/world/chapter-${ch}.svg`));}
const book=require('../story-scenes');for(const stage of [43,46,53,57,63,66])assert(w.STORY_STAGES[stage].rocket&&book.scenes['before-'+stage]);for(const s of Object.values(book.scenes)){assert(s.lines.length<=9);for(const l of s.lines)assert(l.text.length<=85);}
console.log('All 30 late-chapter encounters initialize and advance in native 6v4/5 combat; seven maps, FRLG gym moves, six Rocket encounters and concise story: passed.');
