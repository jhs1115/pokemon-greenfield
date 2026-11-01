from pathlib import Path
p=Path('engine.js');s=p.read_text(encoding='utf-8').replace("if(move.impact==='self')return dx===0&&dy===0;", "if(move.impact==='self'||move.impact==='burst')return dx===0&&dy===0;")
s=s.replace("  if(directional(move)){", "  if(move.mask){for(const [dx,dy]of move.mask)add(target.x+dx,target.y+dy);}\n  else if(move.impact==='burst'){for(let y=-move.size;y<=move.size;y++)for(let x=-move.size;x<=move.size;x++)if(Math.abs(x)+Math.abs(y)<=move.size+1)add(origin.x+x,origin.y+y);}\n  else if(move.impact==='diamond'){for(let y=-move.size;y<=move.size;y++)for(let x=-move.size;x<=move.size;x++)if(Math.abs(x)+Math.abs(y)<=move.size)add(target.x+x,target.y+y);}\n  else if(move.impact==='diagonal'){add(target.x,target.y);for(let n=1;n<=move.size;n++)for(const [x,y]of [[1,1],[1,-1],[-1,1],[-1,-1]])add(target.x+x*n,target.y+y*n);}\n  else if(move.impact==='ring'){add(target.x,target.y);for(let y=-move.size;y<=move.size;y++)for(let x=-move.size;x<=move.size;x++)if(Math.max(Math.abs(x),Math.abs(y))===move.size)add(target.x+x,target.y+y);}\n  else if(directional(move)){")
p.write_text(s,encoding='utf-8')
p=Path('moves.js');s=p.read_text(encoding='utf-8').replace("52:{range:3,impact:'single'", "52:{range:3,impact:'cross',size:1").replace("71:{range:3,impact:'single'", "71:{range:3,impact:'diagonal',size:1")
# 28 visual recipes stay intact; other moves get semantic range rules in expanded-moves.
p.write_text(s,encoding='utf-8')
p=Path('expanded-moves.js');s=p.read_text(encoding='utf-8');start=s.index('  let rule=');end=s.index('  return {...rule',start)
s=s[:start]+'''  let rule={range:3,impact:'cross',size:1};
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
''' + s[end:];p.write_text(s,encoding='utf-8')
p=Path('app.js');s=p.read_text(encoding='utf-8').replace("single:'단일 지점'", "single:'단일 지점',diagonal:'대각선',diamond:'마름모',ring:'고리',burst:'주변 확산'")
s=s.replace("if(m.impact==='self')return {...origin};", "if(m.impact==='self'||m.impact==='burst')return {...origin};")
p.write_text(s,encoding='utf-8')
