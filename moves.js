(function(root){
 const definitions={
  157:{range:4,impact:'cross',size:1,fx:'slam'},
  84:{range:3,impact:'cross',size:1,fx:'shock'},
  85:{range:4,impact:'square',size:1,fx:'thunder'},
  98:{range:2,impact:'ray',width:0,fx:'dash'},
  21:{range:1,impact:'front',width:0,fx:'slam'},
  22:{range:3,impact:'ray',width:0,fx:'vine'},
  33:{range:1,impact:'front',width:1,fx:'tackle'},
  75:{range:3,impact:'cone',fx:'leaves'},
  36:{range:2,impact:'ray',width:1,fx:'rush'},
  52:{range:3,impact:'cross',size:1,fx:'embers'},
  10:{range:1,impact:'front',width:1,fx:'scratch'},
  53:{range:4,impact:'cone',fx:'flamethrower'},
  163:{range:1,impact:'front',width:1,fx:'slash'},
  55:{range:4,impact:'ray',width:0,fx:'watergun'},
  44:{range:1,impact:'front',width:0,fx:'bite'},
  57:{range:3,impact:'ray',width:1,fx:'surf'},
  129:{range:4,impact:'square',size:1,fx:'stars'},
  16:{range:3,impact:'cone',fx:'gust'},
  17:{range:1,impact:'front',width:1,fx:'wings'},
  126:{range:4,impact:'cross',size:2,fx:'fireblast'},
  71:{range:3,impact:'diagonal',size:1,fx:'absorb'},
  51:{range:3,impact:'cross',size:1,fx:'acid'},
  72:{range:3,impact:'square',size:1,fx:'drain'},
  188:{range:4,impact:'square',size:1,fx:'sludge'},
  93:{range:3,impact:'cross',size:1,fx:'confusion'},
  94:{range:4,impact:'square',size:1,fx:'psychic'},
  247:{range:4,impact:'cross',size:1,fx:'shadow'},
  172:{range:2,impact:'ray',width:0,fx:'flamewheel'},
  158:{range:1,impact:'front',width:0,fx:'fang'}
 };
 root.MOVE_RULES=definitions;
 if(typeof module!=='undefined')module.exports=definitions;
})(typeof window!=='undefined'?window:globalThis);
