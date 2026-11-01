from pathlib import Path
p=Path('app.js');s=p.read_text(encoding='utf-8').replace('resetTransform(player());','')
start=s.index('function changeStages(');end=s.index('const pause=',start);s=s[:start]+s[end:]
s=s.replace('m=moveFor(record.move),target=',"m=D.moves[record.move]?moveFor(record.move):{id:0,name:'행동',impact:'self',range:0,damageClass:1},target=")
start=s.index('function combatMessage(');end=s.index('\nrender();',start);s=s[:start]+s[end:]
p.write_text(s,encoding='utf-8')
p=Path('tests/turn-sequence.test.cjs');s=p.read_text(encoding='utf-8');start=s.index(' vm.runInContext("fixture();applyStatusMove');end=s.index(" console.log(",start);s=s[:start]+s[end:];p.write_text(s,encoding='utf-8')
p=Path('native-combat.js');s=p.read_text(encoding='utf-8');s=s.replace("mon.nativeRequest=p.request;", "if(p.request?.moves?.length===1&&p.request.moves[0].id==='struggle')mon.moves=[{...moveFor(165),remaining:1,pp:1}];mon.nativeRequest=p.request;")
s=s.replace('p.maxhp=p.baseMaxhp=mon.maxHP;p.hp=mon.hp;',"p.maxhp=p.baseMaxhp=mon.maxHP;p.hp=mon.hp;p.setAbility(mon.abilityKey||'noability');const old=new Map(p.moveSlots.map(v=>[v.id,v]));p.moveSlots=mon.moves.map(v=>{const move=Dex.moves.get(data.moves[v.id].key),prior=old.get(move.id);return {move:move.name,id:move.id,pp:prior?Math.min(prior.pp,move.pp):move.pp,maxpp:move.pp,target:move.target,disabled:false,used:false};});p.moveSlots.push({move:'Greenfield Wait',id:'greenfieldwait',pp:100,maxpp:100,target:'self',disabled:false,used:false});p.baseMoveSlots=p.moveSlots.map(v=>({...v}));")
p.write_text(s,encoding='utf-8')
