(function(root){
/* FRLG leader species/moves: pret/pokefirered trainer_parties.h. Levels follow this campaign. */
root.STORY_STAGES.push(...[{"name":"5-1","chapter":5,"enemy":[48,49,44,70],"levels":[34,35,34,35],"theme":"marsh"},{"name":"5-2","chapter":5,"enemy":[111,102,114,46],"levels":[35,36,35,36],"theme":"marsh"},{"name":"5-3","chapter":5,"enemy":[84,85,128,115],"levels":[35,36,35,36],"theme":"marsh"},{"name":"5-4","chapter":5,"enemy":[24,42,89,97],"levels":[36,37,36,37],"theme":"marsh","rocket":true,"trainer":true,"portrait":"rocket_grunt_m"},{"name":"5-5","chapter":5,"enemy":[113,108,83,22],"levels":[36,37,36,37],"theme":"marsh"},{"name":"5-6","chapter":5,"enemy":[147,148,55,119],"levels":[37,38,37,38],"theme":"marsh"},{"name":"5-7","chapter":5,"enemy":[24,110,89,53],"levels":[37,38,37,38],"theme":"marsh","rocket":true,"trainer":true,"portrait":"rocket_grunt_m"},{"name":"5-8","chapter":5,"enemy":[112,105,127,123],"levels":[38,39,38,39],"theme":"marsh"},{"name":"5-9","chapter":5,"enemy":[45,71,49,73],"levels":[38,39,38,39],"theme":"marsh"},{"enemy":[109,89,109,110],"moves":[[120,124,108,92],[107,124,151,92],[120,124,108,92],[33,124,108,92]],"name":"5-10","chapter":5,"levels":[39,40,39,42],"leader":"독수","portrait":"leader_koga","gym":"poison","theme":"marsh","trainer":true},{"name":"6-1","chapter":6,"enemy":[64,93,97,122],"levels":[41,42,41,42],"theme":"city"},{"name":"6-2","chapter":6,"enemy":[82,101,137,125],"levels":[42,43,42,43],"theme":"city"},{"name":"6-3","chapter":6,"enemy":[67,106,107,57],"levels":[42,43,42,43],"theme":"city"},{"name":"6-4","chapter":6,"enemy":[20,42,97,110],"levels":[43,44,43,44],"theme":"city","rocket":true,"trainer":true,"portrait":"rocket_grunt_m"},{"name":"6-5","chapter":6,"enemy":[65,94,124,49],"levels":[43,44,43,44],"theme":"city"},{"name":"6-6","chapter":6,"enemy":[128,143,112,115],"levels":[44,45,44,45],"theme":"city"},{"name":"6-7","chapter":6,"enemy":[103,97,80,121],"levels":[44,45,44,45],"theme":"city"},{"name":"6-8","chapter":6,"enemy":[53,89,110,42,97],"levels":[45,46,45,46,45],"theme":"city","rocket":true,"trainer":true,"portrait":"rocket_grunt_m"},{"name":"6-9","chapter":6,"enemy":[123,127,125,126],"levels":[45,46,45,46],"theme":"city"},{"enemy":[64,122,49,65],"moves":[[60,115,248,347],[112,60,226,347],[60,16,141,48],[94,105,248,347]],"name":"6-10","chapter":6,"levels":[45,44,45,48],"leader":"초련","portrait":"leader_sabrina","gym":"psychic","theme":"city","trainer":true},{"name":"7-1","chapter":7,"enemy":[72,73,86,87],"levels":[48,49,48,49],"theme":"island"},{"name":"7-2","chapter":7,"enemy":[77,78,58,59],"levels":[49,50,49,50],"theme":"island"},{"name":"7-3","chapter":7,"enemy":[75,95,112,105],"levels":[49,50,49,50],"theme":"island"},{"name":"7-4","chapter":7,"enemy":[24,89,110,97],"levels":[50,51,50,51],"theme":"island","rocket":true,"trainer":true,"portrait":"rocket_grunt_m"},{"name":"7-5","chapter":7,"enemy":[126,136,38,78],"levels":[50,51,50,51],"theme":"island"},{"name":"7-6","chapter":7,"enemy":[103,114,123,127],"levels":[51,52,51,52],"theme":"island"},{"name":"7-7","chapter":7,"enemy":[53,42,89,110,97],"levels":[51,52,51,52,51],"theme":"island","rocket":true,"trainer":true,"portrait":"rocket_grunt_m"},{"name":"7-8","chapter":7,"enemy":[139,141,142,131],"levels":[52,53,52,53],"theme":"island"},{"name":"7-9","chapter":7,"enemy":[59,38,136,126,78],"levels":[52,53,52,53,52],"theme":"island"},{"enemy":[58,77,78,59],"moves":[[44,46,36,126],[23,340,83,126],[23,340,83,126],[44,46,36,126]],"name":"7-10","chapter":7,"levels":[49,48,49,53],"leader":"강연","portrait":"leader_blaine","gym":"fire","theme":"island","trainer":true}]);

/* Modest story difficulty increase: keep the first five encounters unchanged. */
for(const encounter of root.STORY_STAGES){const bonus=encounter.chapter>=5?2:encounter.name==='1-1'||encounter.name==='1-2'||encounter.name==='1-3'||encounter.name==='1-4'||encounter.name==='1-5'?0:1;encounter.levels=encounter.levels.map(level=>Math.min(100,level+bonus));}
root.ROCKET_AMBUSH.levels=root.ROCKET_AMBUSH.levels.map(level=>level+1);

/* Practical gym loadouts supersede the base FRLG moves above; species stay unchanged. */
root.GYM_LOADOUTS={"9":[[157,89,111,205],[157,89,20,103]],"19":[[57,58,105,115],[56,94,58,105]],"29":[[87,521,113,269],[85,98,447,86],[85,447,411,417]],"39":[[438,389,398,79],[437,246,73,282],[572,188,585,235]],"49":[[188,53,92,114],[441,282,425,174],[188,85,261,114],[188,53,261,114]],"59":[[94,247,605,347],[94,115,113,86],[405,94,79,483],[94,411,247,105]],"69":[[53,242,46,261],[394,667,528,261],[394,667,528,14],[394,245,370,234]]};
for(const [index,loadout] of Object.entries(root.GYM_LOADOUTS)){const i=+index,boss=root.STORY_STAGES[i],floor=Math.max(...root.STORY_STAGES[i-1].levels);boss.moves=loadout;boss.levels=boss.enemy.map((_,n)=>Math.min(100,floor+5+Math.round(n*3/Math.max(1,boss.enemy.length-1))));}

/* Leaders prepare specialized natures and held items; Brock always has Sturdy. */
for(const [index] of Object.entries(root.GYM_LOADOUTS)){const boss=root.STORY_STAGES[+index];boss.heldItems=boss.enemy.map((_,n)=>n===boss.enemy.length-1?'sitrus-berry':'oran-berry');boss.natures=boss.enemy.map(id=>{const p=root.POKE_DATA?.pokemon.find(p=>p.id===id);return !p||p.stats[2]>=p.stats[4]?'Adamant':'Modest';});}root.STORY_STAGES[9].abilities=['sturdy','sturdy'];

/* Chapter three: two trainers of three Pokemon, a single stage reward. */
for(const [index,waves] of [[22,[
 {enemy:[24,20,88],levels:[24,24,25],moves:[[137,342,242,44],[158,98,162,116],[124,107,50,60]]},
 {enemy:[42,109,97],levels:[26,26,27],moves:[[314,109,141,44],[108,92,124,60],[60,95,50,115]]}
]],[27,[
 {enemy:[42,110,53],levels:[28,29,29],moves:[[314,109,141,44],[124,108,92,60],[163,44,252,103]]},
 {enemy:[24,89,97],levels:[29,30,31],moves:[[137,342,242,44],[124,107,60,50],[60,95,50,115]]}
]]]){const encounter=root.STORY_STAGES[index];Object.assign(encounter,waves[0]);encounter.waves=waves.map((wave,i)=>({...wave,heldItems:['oran-berry','oran-berry',i?'sitrus-berry':'oran-berry']}));encounter.heldItems=encounter.waves[0].heldItems;}

/* Erika pursues the leader while the player faces three separate grunts. */
root.STORY_STAGES[37].waves=[
 {enemy:[24,42,97],levels:[35,36,36],moves:[[137,342,242,44],[314,109,141,44],[60,95,50,115]],abilities:['intimidate','innerfocus','insomnia']},
 {enemy:[20,89,110],levels:[36,36,37],moves:[[158,98,162,116],[124,107,60,50],[124,108,92,60]],abilities:['guts','stickyhold','levitate']},
 {enemy:[53,42,97],levels:[37,37,38],moves:[[163,44,252,103],[314,109,141,44],[94,95,50,115]],abilities:['technician','innerfocus','insomnia']}
].map((wave,i)=>({...wave,heldItems:['oran-berry','oran-berry',i===2?'sitrus-berry':'oran-berry']}));
Object.assign(root.STORY_STAGES[37],root.STORY_STAGES[37].waves[0]);

/* The occupied safari is liberated through three- and four-trainer gauntlets. */
for(const [index,waves]of [[43,[
 {enemy:[24,42,89],levels:[38,39,39],moves:[[137,342,242,44],[314,109,141,44],[188,107,60,50]],abilities:['intimidate','innerfocus','stickyhold']},
 {enemy:[20,110,97],levels:[39,40,40],moves:[[158,98,162,116],[188,108,92,60],[94,95,50,115]],abilities:['guts','levitate','insomnia']},
 {enemy:[53,42,97],levels:[40,40,41],moves:[[163,44,252,103],[314,109,141,44],[94,95,50,115]],abilities:['technician','innerfocus','insomnia']}
]],[46,[
 {enemy:[24,20,42],levels:[40,40,41],moves:[[137,342,242,44],[158,98,162,116],[314,109,141,44]],abilities:['intimidate','guts','innerfocus']},
 {enemy:[89,110,53],levels:[41,41,42],moves:[[188,107,60,50],[188,108,92,60],[163,44,252,103]],abilities:['stickyhold','levitate','technician']},
 {enemy:[42,97,24],levels:[41,42,42],moves:[[314,109,141,44],[94,95,50,115],[137,342,242,44]],abilities:['innerfocus','insomnia','intimidate']},
 {enemy:[110,89,97],levels:[42,42,43],moves:[[188,108,92,60],[188,107,60,50],[94,95,50,115]],abilities:['levitate','stickyhold','insomnia']}
]]]){const encounter=root.STORY_STAGES[index];encounter.waves=waves.map((wave,i)=>({...wave,heldItems:['oran-berry','oran-berry',i===waves.length-1?'sitrus-berry':'oran-berry']}));Object.assign(encounter,encounter.waves[0]);}

/* Silph: three four-Pokemon grunts, followed by a distinct six-Pokemon executive. */
root.STORY_STAGES[53].waves=[
 {enemy:[20,24,42,97],levels:[45,45,46,46],moves:[[162,242,98,158],[137,398,242,89],[403,109,141,369],[94,95,247,411]],abilities:['guts','intimidate','innerfocus','insomnia']},
 {enemy:[89,110,53,42],levels:[46,47,47,47],moves:[[441,425,7,151],[188,53,261,114],[252,400,369,103],[403,141,109,92]],abilities:['stickyhold','levitate','technician','innerfocus']},
 {enemy:[24,110,97,89],levels:[47,48,48,49],moves:[[137,398,89,242],[188,85,53,114],[94,95,247,411],[441,425,7,151]],abilities:['intimidate','levitate','insomnia','stickyhold']}
].map(wave=>({...wave,heldItems:['oran-berry','oran-berry','sitrus-berry','sitrus-berry']}));
Object.assign(root.STORY_STAGES[53],root.STORY_STAGES[53].waves[0]);
Object.assign(root.STORY_STAGES[57],{
 portrait:'rocket-executive',enemy:[53,24,89,110,42,97],levels:[49,50,50,51,51,52],
 moves:[[252,400,369,103],[137,398,89,242],[441,425,7,151],[188,85,53,114],[403,141,109,369],[94,95,247,411]],
 abilities:['technician','intimidate','stickyhold','levitate','innerfocus','insomnia'],
 heldItems:['silk-scarf','sitrus-berry','poison-barb','sitrus-berry','sitrus-berry','sitrus-berry'],
 natures:['Jolly','Adamant','Adamant','Modest','Jolly','Modest']
});

/* Cinnabar's new script: two patrols, then a confirmation-paced three-trainer gauntlet. */
for(const [index,waves]of [[60,[
 {enemy:[24,82,42,97],levels:[50,50,51,51],moves:[[398,137,89,242],[85,430,86,113],[403,141,109,369],[94,95,247,411]]},
 {enemy:[89,110,53,68],levels:[51,51,52,52],moves:[[441,425,7,151],[188,85,53,114],[252,400,369,103],[238,157,282,339]]}
]],[62,[
 {enemy:[94,112,71,101],levels:[52,53,53,53],moves:[[247,188,95,85],[89,157,224,444],[438,188,79,14],[85,86,113,521]]},
 {enemy:[130,59,65,89],levels:[53,54,54,54],moves:[[127,423,89,349],[53,245,242,261],[94,247,411,105],[441,425,7,151]]}
]]]){const c=root.STORY_STAGES[index];Object.assign(c,{rocket:true,trainer:true,portrait:'rocket_grunt_m'});c.waves=waves.map(w=>({...w,heldItems:w.enemy.map(()=> 'sitrus-berry')}));Object.assign(c,c.waves[0]);}
root.STORY_STAGES[63].confirmWaves=true;
root.STORY_STAGES[63].waves=[
 {enemy:[112,82,94],levels:[53,53,53],moves:[[89,157,224,444],[85,430,86,113],[247,188,95,85]],portrait:'rocket_grunt_m'},
 {enemy:[68,71,101,78],levels:[55,55,55,55],moves:[[238,157,282,339],[438,188,79,14],[85,86,113,521],[394,528,667,14]],portrait:'rocket_grunt_m',intro:'seventh-wave-1'},
 {enemy:[149,131,65,143,130],levels:[55,56,57,58,59],moves:[[337,89,9,349],[57,58,85,94],[94,247,411,105],[34,242,89,156],[127,423,89,349]],portrait:'rocket-executive-seven',intro:'seventh-wave-2'}
].map(w=>({...w,heldItems:w.enemy.map(()=> 'sitrus-berry')}));
Object.assign(root.STORY_STAGES[63],root.STORY_STAGES[63].waves[0]);
/* Competitive singles archetypes adapted to tile combat; no EV investment. */
Object.assign(root.STORY_STAGES[63].waves[2],{
 moves:[[349,245,89,355],[56,573,85,182],[94,411,247,417],[174,34,242,156],[349,127,89,423]],
 abilities:['multiscale','waterabsorb','magicguard','thickfat','intimidate'],
 natures:['Adamant','Modest','Timid','Careful','Jolly'],
 heldItems:['leftovers','leftovers','focus-sash','chesto-berry','sitrus-berry']
});
/* Blaine now occupies 7-6; retain the remaining map encounters without a second gym. */
const oldFireGym=root.STORY_STAGES[69],oldSixth=root.STORY_STAGES[65];
root.STORY_STAGES[65]={...oldFireGym,name:'7-6'};
root.STORY_STAGES[69]={...oldSixth,name:'7-10'};
root.STORY_STAGES[64].levels=[54,55,54,55];
delete root.GYM_LOADOUTS[69];root.GYM_LOADOUTS[65]=root.STORY_STAGES[65].moves;
/* The obsolete 7-7 Rocket encounter is a normal route battle in the new script. */
for(const key of ['rocket','trainer','portrait'])delete root.STORY_STAGES[66][key];

/* Final Viridian chapter. Levels are deliberate; every Pokemon still has zero EVs. */
// Each grunt has a distinct roster; later patrols add varied offensive types.
const finalPatrols=[
 [
  {enemy:[24,20,42],levels:[68,69,69],moves:[[398,137,89,242],[162,242,98,38],[403,141,109,369]],abilities:['intimidate','guts','innerfocus'],natures:['Adamant','Jolly','Timid']},
  {enemy:[89,105,85],levels:[69,70,71],moves:[[441,425,7,151],[155,157,38,14],[413,65,98,14]],abilities:['stickyhold','lightningrod','earlybird'],natures:['Adamant','Adamant','Jolly']}
 ],[
  {enemy:[82,57,73],levels:[70,71,71],moves:[[85,430,86,113],[370,157,369,8],[57,188,58,92]],abilities:['sturdy','vitalspirit','liquidooze'],natures:['Modest','Jolly','Timid']},
  {enemy:[76,71,97],levels:[71,72,73],moves:[[89,444,389,38],[438,188,79,14],[94,95,247,411]],abilities:['sturdy','chlorophyll','insomnia'],natures:['Adamant','Adamant','Modest']}
 ],[
  {enemy:[110,127,91,26,78],levels:[73,74,74,75,75],moves:[[188,85,53,114],[404,370,89,14],[333,350,420,504],[85,411,447,86],[394,528,667,14]],abilities:['levitate','moldbreaker','skilllink','static','flashfire'],natures:['Modest','Jolly','Adamant','Timid','Jolly']},
  {enemy:[31,123,103,128,80],levels:[74,75,75,76,77],moves:[[414,188,58,85],[404,332,98,14],[94,412,79,247],[34,89,157,428],[57,94,58,303]],abilities:['sheerforce','technician','chlorophyll','intimidate','regenerator'],natures:['Modest','Jolly','Modest','Jolly','Bold']}
 ]
];
for(let i=0;i<3;i++){const waves=finalPatrols[i].map(w=>({...w,heldItems:w.enemy.map(()=> 'sitrus-berry')}));root.STORY_STAGES.push({name:'8-'+(i+1),chapter:8,theme:'city',rocket:true,trainer:true,portrait:'rocket_grunt_m',silentRetry:true,waves,...waves[0]});}
const revenge={...root.STORY_STAGES[63].waves[2],enemy:[149,131,65,143,130,36],levels:[76,77,78,79,80,81],moves:[...root.STORY_STAGES[63].waves[2].moves,[347,585,135,86]],abilities:[...root.STORY_STAGES[63].waves[2].abilities,'magicguard'],natures:[...root.STORY_STAGES[63].waves[2].natures,'Bold'],heldItems:[...root.STORY_STAGES[63].waves[2].heldItems,'leftovers']};
delete revenge.intro;
root.STORY_STAGES.push({...revenge,name:'8-4',chapter:8,theme:'city',rocket:true,trainer:true,silentRetry:true});
root.STORY_STAGES.push({name:'8-5',chapter:8,theme:'city',rocket:true,trainer:true,leader:'비주기',gym:'ground',portrait:'giovanni',silentRetry:true,sendOutScene:'mewtwo-sendout',sendOutIndex:5,
 enemy:[53,34,112,115,94,150],levels:[82,83,84,85,86,95],
 moves:[[252,163,400,369],[414,188,58,85],[89,444,224,419],[252,34,389,409],[247,188,411,417],[540,58,396,105]],
 abilities:['technician','sheerforce','rockhead','scrappy','cursedbody','pressure'],
 natures:['Jolly','Modest','Adamant','Adamant','Timid','Timid'],heldItems:['silk-scarf','life-orb','eviolite','leftovers','life-orb','leftovers']
});

/* Reserved slots retain the existing chapter*10 save addresses; not shown on maps. */
for(let n=6;n<=10;n++)root.STORY_STAGES.push({name:'8-'+n,chapter:8,reserved:true,theme:'city',enemy:[20],levels:[80]});
root.STORY_STAGES.push({name:'9-1',chapter:9,chapterEnd:true,theme:'city',music:'mewtwo',rescueReward:true,silentRetry:true,enemy:[150],levels:[100],moves:[[540,53,58,396]],abilities:['pressure'],natures:['Timid'],heldItems:['leftovers'],startBoosts:{atk:1,def:2,spa:1,spd:2,spe:1},defenseThreshold:.7,fatigueThreshold:.3,criticalImmune:true});

if(typeof module==='object'&&module.exports)module.exports={STORY_STAGES:root.STORY_STAGES,ROCKET_AMBUSH:root.ROCKET_AMBUSH};
})(typeof module==='object'&&module.exports?{...JSON.parse(JSON.stringify(require('./stages.js'))),POKE_DATA:require('./data/reference.json')}:typeof window==='object'?window:{});
