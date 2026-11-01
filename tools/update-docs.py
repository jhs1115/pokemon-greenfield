from pathlib import Path
p=Path('README.md');s=p.read_text(encoding='utf-8').replace('최종 진화 전은 레벨업 기술','최종 진화 전은 현재 레벨 이하의 레벨업 기술')
s=s.replace('본가의 모든 특수 효과를 완전히 구현한 상태는 아닙니다.', '전투 판정은 로컬 번들 `@pkmn/sim`(Pokémon Showdown 기반)의 9세대 규칙을 사용합니다. 타일 사거리·범위·모든 이동 후 공격·중심 급소는 이 게임의 커스텀 규칙입니다. 원작 애니메이션 전체를 복제한 것은 아니며, 기존 PNG 효과 파츠를 조합합니다.')
s=s.replace('- 스토리 1-1~1-9와 1-10 웅이, 일반/첫 클리어 코인 보상.', '- 풀숲 도트 지도에 연결된 1-1~1-10 경로와 웅이 대사 후 체육관전.\n- 신규 0코인, 튜토리얼 완료 10코인 1회. 실습 스카우트 1회 무료. 일반 첫 클리어 1코인/웅이 3코인, 누적 5회 단위 반복 보상 1코인. 기존 저장 잔액 유지.\n- 진화 전 기본 일반 특성 고정, 최종 진화 후 종별 일반/숨겨진 특성 선택 및 실제 전투 효과.\n- 능력치·상태이상·상성 메시지는 상단과 해당 타일, 특성 발동은 왼쪽 배너.\n- 한국어 기술 설명 툴팁, 한 글자 대사/엔터 완성, 메뉴 실습, 진화 실루엣/빛 연출.\n- 리프 원본 도트 안내인, 버튼 즉시 후보 공개, 둥근 Jua 글꼴 로컬 제공.')
s=s.replace('node tests/engine.test.cjs', 'node tests/native-combat.test.cjs\nnode tests/engine.test.cjs')
s=s.replace('- `app.js`, `engine.js`: 전투와 피해 계산', '- `app.js`, `native-combat.js`, `assets/vendor/pkmn-sim.js`: 타일 전투와 본가 판정 엔진\n- `battle-feedback.js`, `dialogue.js`: 전투 메시지/특성 배너/진화/대사\n- `engine.js`: 범위·이동·AI 평가용 대략 피해')
s += '''

## 전투 엔진 재빌드

배포된 로컬 번들은 빌드 없이 동작합니다. 소스를 수정해 다시 묶을 때만 아래를 실행합니다.

```powershell
npm ci
npm run build:sim
```

엔진: https://github.com/pkmn/ps (MIT, `assets/vendor/PKMN-LICENSE.txt`). 폰트: Google Fonts Jua (OFL, `assets/fonts/OFL.txt`). 능력/한국어 설명 CSV 출처는 PokéAPI이며 `scripts/prepare_abilities.py`, `scripts/prepare_descriptions.py`로 재생성합니다. 풀숲 지도는 `scripts/prepare_route.py`에서 코드로 그린 SVG입니다.
''';p.write_text(s,encoding='utf-8')
p=Path('docs/GAME_RULES.md');s=p.read_text(encoding='utf-8').replace('더미 연습 → 메뉴 안내', '더미 연습 → 무료 실습 영입 → 동료 선출 → 기술 설정 실습')
s=s.replace('각 클리어는 5코인, 최초 클리어 추가 보상은 1-1부터 10/12/14/16/18/20/22/24/26/30코인입니다.', '신규 파일은 0코인입니다. 메뉴 실습 스카우트 1회는 무료이며 튜토리얼 완료 시 10코인을 한 번 지급합니다. 스킵으로 완료해도 최초 1회만 지급해 진행이 막히지 않습니다. 일반 스테이지 최초 클리어는 1코인, 웅이 최초 클리어는 3코인입니다. 같은 스테이지의 누적 클리어 횟수가 5·10·15…일 때만 반복 보상 1코인을 지급하고 나머지 반복 클리어는 0코인입니다. 기존 파일의 코인을 소급 차감하지 않습니다.')
start=s.index('현재 일반 피해,');end=s.index('## 1차 출처',start)
s=s[:start]+'''전투 판정은 `@pkmn/sim` 0.10.12의 Pokémon Showdown 9세대 싱글 시뮬레이터를 로컬로 번들하여 사용합니다. 명중/회피, 마비/화상/독/맹독/수면/얼음/혼란/풀죽음, 랭크, 상태 지속 시간, 연속기, 확률 부가 효과, 반동/흡수, 날씨/필드/장판, 방어/대타, 충전/반동 턴, 조건부 공격기 등의 계산과 턴 간 상태를 엔진이 처리합니다. 기습은 아직 행동하지 않은 공격 선택 상대에게만 성공하며, 기선제압은 아직 행동하지 않은 우선도 +1 이상 공격기를 쓰려는 상대에게만 성공합니다. 실패/빗나감/무효도 메시지를 표시합니다.

타일 이동은 엔진 공격 턴을 실행하기 전에 끝납니다. 타격 범위를 벗어난 상대에게는 공격 효과를 적용하지 않으며, 급소는 랜덤 대신 타격 중심을 기준으로 판정합니다. 급소 방지 특성 등 실제 방어 효과는 엔진에서 계속 적용됩니다. 전투 계산을 먼저 기록한 뒤 실제 행동 순서대로 이동/기술/피해 연출을 재생합니다. 원작에는 타일 이동이 없으므로 이 부분은 독자 규칙입니다.

## 특성과 화면 연출

151종의 일반/숨겨진 특성은 PokéAPI의 종별 실제 목록을 사용합니다. 최종 진화 전은 첫 번째 일반 특성이 고정되고, 1세대 범위의 최종 진화 종은 트레이닝에서 해당 종의 일반/숨겨진 특성 중 선택할 수 있습니다. 진화하면 새 종의 기본 일반 특성으로 전환됩니다. 선택한 특성은 저장되며 실제 시뮬레이터에 전달합니다. 위협 같은 발동 공지가 있는 특성은 왼쪽 배너로, 효과/상성/랭크 변화는 상단 및 영향을 받은 타일에 작은 색상 메시지로 표시합니다. 항상 적용되지만 발동 공지가 없는 패시브 특성에는 불필요한 공지를 추가하지 않습니다.

진화는 원본 포켓몬 도트를 번갈아 흰 실루엣으로 보여주고 빛/별/회전 테두리 후 새 진화형을 공개합니다. 전투 중 성장 진화는 턴 정산이 끝난 후 연출됩니다. 리프 원본 도트를 스카우트 안내인으로 사용하며 후보는 버튼 클릭 즉시 공개하고 짧은 등장 애니메이션만 재생합니다. 원작 진화 화면을 그대로 추출한 영상은 아닙니다.

풀숲 지도는 사용자 스케치를 따라 10개 지점을 길로 연결한 코드 기반 픽셀 SVG입니다. 포켓몬/인물/기술 효과 파츠는 기존 다운로드 도트입니다. 폰트 Jua는 로컬 파일로 제공하여 외부 폰트 요청 없이 동작합니다. PVP는 공사중입니다.

''' + s[end:]
s += '\n- https://github.com/pkmn/ps — 브라우저용 Pokémon Showdown 시뮬레이터\n- https://github.com/google/fonts/tree/main/ofl/jua — Jua 글꼴/OFL\n';p.write_text(s,encoding='utf-8')
p=Path('assets/trainers/SOURCE.md');s=p.read_text(encoding='utf-8');s+='\n- Scout host (Leaf): https://github.com/pret/pokefirered/blob/master/graphics/trainers/front_pics/leaf_front_pic.png\n- Previous scout host (Gentleman source retained): https://github.com/pret/pokefirered/blob/master/graphics/trainers/front_pics/gentleman_front_pic.png\n';p.write_text(s,encoding='utf-8')
Path('.gitignore').write_text('node_modules/\ntools/npm/\n*.log\n',encoding='utf-8')
p=Path('menus.js');s=p.read_text(encoding='utf-8').replace('반복 5회마다 1 COIN','누적 5회마다 1 COIN');p.write_text(s,encoding='utf-8')
