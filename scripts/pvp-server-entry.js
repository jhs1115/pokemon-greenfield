import {Battle,Dex} from '@pkmn/sim';
globalThis.PKMN={Battle,Dex};
const D=require('../data/reference.json'),T=require('../data/training.json'),P=require('../data/progression.json'),A=require('../data/abilities.json'),I=require('../items.js');
const E=require('../engine.js'),definitions=require('../moves.js'),expanded=require('../expanded-moves.js'),N=require('../native-combat.js'),G=require('../game-state.js')(D,T,P,A,I);
function moveFor(id){const m={...D.moves[id],meta:T.meta[id]||{statChanges:[]}};const fx={1:'tackle',2:'slam',3:'gust',4:'sludge',5:'slam',6:'slam',7:'scratch',8:'shadow',9:'slash',10:'embers',11:'watergun',12:'leaves',13:'shock',14:'confusion',15:'watergun',16:'shadow',17:'bite',18:'stars'}[m.type]||'tackle';const fallback=m.damageClass===1?{range:m.target===7?0:3,impact:m.target===7?'self':'single',fx:m.meta.healing>0?'drain':fx}:{range:3,impact:m.power>=100?'square':'single',size:1,fx};return E.normalizeMove(definitions[id]?{...m,...fallback,...definitions[id]}:{...m,...fallback,...expanded(m)});}
export const Rules=require('../pvp-rules.js').createPvpRules({D,T,P,A,I,E,N,G,moveFor});
