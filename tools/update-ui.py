from pathlib import Path
p=Path('native-combat.js');s=p.read_text(encoding='utf-8-sig').replace("Object.keys(data.types).find(id=>Dex.types.get(t).num===+id)","(['Normal','Fighting','Flying','Poison','Ground','Rock','Bug','Ghost','Steel','Fire','Water','Grass','Electric','Psychic','Ice','Dragon','Dark','Fairy'].indexOf(t)+1)")
p.write_text(s,encoding='utf-8')
p=Path('app.js');s=p.read_text(encoding='utf-8-sig')
s=s.replace("function navigate(next){", "function navigate(next){if(view==='battle'&&['manage','training','scout'].includes(next))return;")
s=s.replace("battle.foes=[dummy];}render();}","battle.foes=[dummy];}battle.combat=window.NativeCombat.create(battle,D,E,moveFor);render();}")
s=s.replace("if(view==='tutorial')return renderTutorial();", "if(view==='tutorial')return renderTutorial();if(view==='leader')return renderLeader();")
s=s.replace("<div class=\"hud-types\">${badges(p.types)}</div>","<div class=\"hud-types\">${badges(p.types)}${statusBadges(p)}</div>")
start=s.index('<button id="edit-team"');end=s.index('</div><div class="skill-list">',start);s=s[:start]+s[end:]
s=s.replace(" $('#edit-team').onclick=()=>navigate('manage');bindMenuHeader();"," bindMenuHeader();")
s=s.replace("${b.tutorial?'다음':b.result", "${b.tutorial?'확인':b.result")
s=s.replace("view='tutorial';render();return;}if(b.result==='win'&&stage<9)stage++;startBattle();", "view='scout';render();return;}if(b.result==='win'&&stage<9)stage++;beginStage();")
s=s.replace('<div class="game-shell"><div class="top-hud">','<div class="game-shell"><div class="battle-instruction" role="status">${battleInstruction()}</div><div class="top-hud">')
s=s.replace("||m.remaining<=0?'disabled'", "||m.remaining<=0||m.disabled?'disabled'")
start=s.index('for(const a of actions){\n if(ownToken!==token)return;',s.index('async function resolveTurn'))
end=s.index('if(ownToken!==token)return;\nb.acting=null;',start)
s=s[:start]+'''const turn=b.combat.turn(command,opponent);
for(const record of turn.records){
 if(ownToken!==token)return;
 b.combat.apply(record.before);const aSide=record.actor[0],atk=b.combat.lookup(record.actor).mon,c=aSide==='p'?command:opponent,pos=aSide==='p'?b.pos:b.enemyPos,defPos=aSide==='p'?b.enemyPos:b.pos,m=moveFor(record.move),target=c.target||pos;
 b.acting=aSide;b.message=`${atk.name}의 ${m.name}!`;render();await pause(160);
 const attempted=record.logs.some(l=>l.startsWith('|move|')),failed=record.logs.some(l=>/\\|(?:-fail|-miss|-immune|cant)\\|/.test(l));
 if(attempted)await window.playMoveEffect({move:m,origin:pos,target,tiles:E.attackTiles(pos,target,m),hit:!failed,critical:record.logs.some(l=>l.startsWith('|-crit|')),defenderPos:m.impact==='self'?pos:defPos,side:aSide});
 if(ownToken!==token)return;
 b.combat.apply(record.after);b.message=combatMessage(record.logs,atk.name,m.name);log(b.message);render();await pause(650);
}
b.combat.apply(turn.preSwitch);
for(let i=0;i<b.foes.length;i++)if(b.foes[i].hp<=0&&!b.experiencePaid.includes(i)){const prior=b.enemy;b.enemy=i;grantKnockoutExperience();b.enemy=prior;}
// Apply active replacements without overwriting experience-driven level/species updates.
const previousActive=b.active,previousEnemy=b.enemy;
b.active=+turn.final.active[0].slice(1);b.enemy=+turn.final.active[1].slice(1);
if(previousActive!==b.active){b.pos={x:2,y:3};if(!b.participants.includes(b.active))b.participants.push(b.active);}
if(previousEnemy!==b.enemy){b.enemyPos={x:7,y:3};b.participants=[b.active];}
if(b.pos.x===b.enemyPos.x&&b.pos.y===b.enemyPos.y)b.enemyPos.x=8;
b.combat.syncGrowth();
''' + s[end:]
# Final snapshot request flags needed after native upkeep; use preSwitch contains upkeep, forcedswitch apply manually retained, update requests.
s=s.replace("b.combat.syncGrowth();", "for(const entry of turn.final.mons){const mon=b.combat.lookup(entry.name).mon;mon.nativeRequest=entry.request;mon.volatiles=entry.volatiles;}b.combat.syncGrowth();")
s=s.replace("function openTeam(){navigate('manage');}",'''function openTeam(){if(view!=='battle')navigate('manage');}
function statusBadges(mon){const names={par:'마비',brn:'화상',psn:'독',tox:'맹독',slp:'잠듦',frz:'얼음'};return `${mon.status?`<span class="status-badge ${mon.status}">${names[mon.status]||mon.status}</span>`:''}${mon.volatiles?.includes('confusion')?'<span class="status-badge">혼란</span>':''}`;}
function battleInstruction(){const b=battle;return b.message&&b.busy?b.message:b.result?'':b.busy?'행동 중…':b.mode==='idle'?'포켓몬을 클릭해 이동시키세요!':b.mode==='move'?'이동할 칸을 선택하세요. 현재 칸을 누르면 제자리입니다.':b.mode==='skill'?'사용할 기술을 선택하세요.':'목표 칸을 선택하고 확정을 누르세요.';}
function combatMessage(lines,name,move){const text=lines.join('\\n');if(text.includes('|cant|')){const reason=lines.find(l=>l.startsWith('|cant|'))?.split('|')[3];return ({slp:'잠들어 움직일 수 없다!',frz:'얼어서 움직일 수 없다!',par:'몸이 저려 움직일 수 없다!',flinch:'풀죽어서 움직일 수 없다!',recharge:'반동으로 움직일 수 없다!'})[reason]||'지금은 기술을 쓸 수 없다!';}if(text.includes('|-miss|'))return '빗나갔다!';if(text.includes('|-fail|'))return '실패! 기술의 발동 조건을 만족하지 못했다.';if(text.includes('|-immune|'))return '효과가 없다!';if(text.includes('|-crit|'))return '급소에 맞았다!';const status=lines.find(l=>l.startsWith('|-status|'));if(status)return ({par:'마비되었다!',brn:'화상을 입었다!',psn:'독에 걸렸다!',tox:'맹독에 걸렸다!',slp:'잠들었다!',frz:'얼어붙었다!'})[status.split('|')[3]]||'상태가 변했다!';return `${name}의 ${move}!`;}
''')
p.write_text(s,encoding='utf-8')
p=Path('index.html');s=p.read_text(encoding='utf-8');s=s.replace('<script src="journey.js', '<script src="assets/vendor/pkmn-sim.js"></script><script src="native-combat.js"></script><script src="dialogue.js"></script><script src="data/move-descriptions.js"></script><script src="journey.js');s=s.replace('journey-4','journey-5');p.write_text(s,encoding='utf-8')
