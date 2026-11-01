const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const D=require('../data/reference.json'),T=require('../data/training.json'),P=require('../data/progression.json'),A=require('../data/abilities.json'),E=require('../engine'),rules=require('../moves'),expand=require('../expanded-moves');
const elements=new Map(),element=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',classList:{add(){}},focus(){},setSelectionRange(){},insertAdjacentHTML(){}});return elements.get(key);};
const context=vm.createContext({window:{POKE_DATA:D,TRAINING_DATA:T,PROGRESSION_DATA:P,ABILITY_DATA:A,PKMN:require('@pkmn/sim'),NativeCombat:require('../native-combat'),createGameModel:require('../game-state'),BattleEngine:E,MOVE_RULES:rules,getExpandedMoveRule:expand,STORY_STAGES:[]},document:{querySelector:element,querySelectorAll:()=>[],body:{append(){}}},localStorage:{setItem(){}},console,setTimeout:()=>0,clearTimeout(){},typeDialogue:(el,text)=>el.textContent=text});
for(const f of ['journey.js','menus.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
vm.runInContext(fs.readFileSync('app.js','utf8').replace(/render\(\);\s*$/,''),context);vm.runInContext('render=()=>{};game=G.normalize({owned:[4,12],team:[4,12]});trainingPokemon=4;renderTraining();',context);
assert(element('#app').innerHTML.includes('id="ability-select" disabled'));
assert(!element('#app').innerHTML.includes('숨겨진 특성'));
vm.runInContext('trainingPokemon=12;renderTraining();',context);assert(!element('#app').innerHTML.includes('id="ability-select" disabled'));assert(element('#app').innerHTML.includes('색안경 · 숨겨진 특성'));
vm.runInContext("G.setAbility(game,12,110);renderTraining();",context);assert(element('#app').innerHTML.includes('value="110" selected'));

const legal=[...new Set(Object.values(T.learnsets).flatMap(v=>v.moves))].map(id=>D.moves[id]).filter(m=>m.damageClass!==1);let area=0;const shapes=new Set();for(const raw of legal){const m={...raw,...(rules[raw.id]||expand(raw))};shapes.add(m.impact);let max=0;for(let x=0;x<10;x++)for(let y=0;y<7;y++)max=Math.max(max,E.attackTiles({x:4,y:3},{x,y},m).length);if(max>1)area++;}
assert(area/legal.length>.9);assert(shapes.size>=9);console.log(`Training ability UI and hidden option persistence: passed. Area moves: ${area}/${legal.length}; distinct geometries: ${shapes.size}.`);
