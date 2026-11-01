(function(root){
 const families={
  1:['impact','cross_impact','speed_dust','slam_hit','slam_hit_2'],2:['slam_hit','impact','cross_impact','claw_slash'],3:['air_slash','air_wave','whirlwind','whirlwind_2'],
  4:['poison_bubble','toxic_bubble','purple_droplet','purple_swipe'],5:['speed_dust','slam_hit_2','impact','circle_impact'],6:['slam_hit_2','cross_impact','speed_dust','impact'],
  7:['claw_slash','fury_swipes','green_sparkle','leaf'],8:['shadow_ball','purple_swipe','hollow_orb','purple_scratch'],9:['slash','cross_impact','claw_slash','air_slash'],
  10:['small_ember','fire','fire_plume','spinning_fire'],11:['water_orb','water_impact','water_column','blue_burst','bubble','bubble_burst'],12:['leaf','razor_leaf','vine','vine_2','spinning_green_orbs'],
  13:['electricity','lightning','spark_0','spark_1','spark_2'],14:['pink_orb','hollow_orb','ring','blue_star'],15:['blue_burst','blue_star','water_impact','bluegreen_orb'],
  16:['shadow_ball','spinning_fire','blue_burst','cross_impact'],17:['fang_attack','fangs','sharp_teeth','purple_scratch'],18:['yellow_star','blue_star','green_sparkle','pink_orb']
 };
 function getExpandedMoveRule(m){
  const id=m.id,assets=families[m.type]||families[1],size=1;
  let rule={range:3,impact:'cross',size:1};
  const k=m.key;
  if(m.damageClass===1&&m.target===7)rule={range:0,impact:'self'};
  else if(/growl|roar|screech|sing|supersonic|metal-sound|snarl|disarming-voice/.test(k))rule={range:3,impact:'cone'};
  else if(/tail-whip|leer|sweet-scent|charm/.test(k))rule={range:2,impact:'front',width:1};
  else if(/earthquake|magnitude|self-destruct|explosion|discharge|petal-blizzard|bulldoze/.test(k))rule={range:0,impact:'burst',size:k==='explosion'?4:3};
  else if(/beam|cannon|gun|pulse|breath|lance/.test(k))rule={range:/hyper|solar|hydro/.test(k)?5:4,impact:'ray',width:/cannon|pulse/.test(k)?1:0};
  else if(/punch|kick|bite|fang|tackle|scratch|claw|slash|cut|chop|slap/.test(k))rule={range:/kick|slash/.test(k)?2:1,impact:/slash|cut/.test(k)?'cone':'front',width:1};
  else if(/flame|heat-wave|blizzard|powder|spore|smog|bubble/.test(k))rule={range:/blizzard|heat-wave/.test(k)?4:3,impact:'cone'};
  else if(/bomb|ball|meteor|rock-slide|avalanche/.test(k))rule={range:4,impact:/meteor|avalanche/.test(k)?'diamond':'square',size:/meteor/.test(k)?2:1};
  else if(/whirl|spin|vortex|hurricane|twister|fire-spin/.test(k))rule={range:4,impact:'ring',size:1+id%2};
  else if(/sting|needle|spike|seed|shuriken|pin-missile/.test(k))rule={range:4,impact:'diagonal',size:1};
  else if(/wave|surf|muddy-water/.test(k))rule={range:4,impact:'ray',width:1};
  else if(m.damageClass===1)rule={range:3,impact:'cross',size:1};
  else rule=[{range:3,impact:'cross',size:1},{range:4,impact:'diagonal',size:1},{range:3,impact:'square',size:1},{range:4,impact:'ray',width:0},{range:2,impact:'cone'},{range:3,impact:'ray',width:1},{range:4,impact:'diamond',size:2},{range:3,impact:'ring',size:1}][id%8];
  return {...rule,fxVariant:id,fxAssets:[assets[id%assets.length],assets[Math.floor(id/assets.length)%assets.length],assets[(id+2)%assets.length]]};
 }
 root.getExpandedMoveRule=getExpandedMoveRule;
 if(typeof module!=='undefined')module.exports=getExpandedMoveRule;
})(typeof window!=='undefined'?window:globalThis);
