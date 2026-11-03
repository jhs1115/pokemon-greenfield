# PVP 연결

GitHub Pages는 화면과 리소스를 제공하고, Supabase Edge Function `pvp`가 매칭과 전투를 판정합니다. GitHub에 올리는 것만으로 전투 서버가 배포되지는 않습니다.

## 1. SQL 실행

기존 계정 저장용 `supabase/schema.sql`을 실행한 프로젝트에서 진행합니다.

1. Supabase Dashboard → SQL Editor → New query.
2. 저장소의 `supabase/pvp.sql` 전체를 복사해서 Run.
3. `pvp_queue`, `pvp_matches` 테이블이 만들어집니다. RLS와 접근 제한은 SQL에 포함되어 있습니다. 공개 읽기 정책을 추가하지 마세요.

기존 저장 파일은 유지됩니다. 이 SQL은 다시 실행할 수 있습니다.

## 2. 전투 서버 배포

GitHub Desktop → Repository → Open in Terminal로 **pokemon-greenfield 저장소 폴더**에서 실행합니다. Node.js/npm이 필요합니다.

```powershell
npx --yes supabase login
npx --yes supabase functions deploy pvp --remote=cncoztfeuzruykxiykfj --use-api --no-verify-jwt
```

로그인은 본인 Supabase 계정으로 진행하세요. 토큰이나 비밀번호를 채팅에 보낼 필요가 없습니다. 위 명령은 Docker 없이 서버에서 번들링합니다. CLI 구버전에서 `--remote`를 인식하지 못하면 최신 CLI를 사용하거나 해당 옵션을 `--project-ref cncoztfeuzruykxiykfj`로 바꾸세요.

Dashboard → Edge Functions에서 `pvp` 배포를 확인합니다. 서비스 키는 Supabase의 서버 환경 변수로만 읽으며 HTML/JS 설정 파일에 넣지 않습니다. `--no-verify-jwt`는 게이트웨이의 구형 JWT 검사를 생략하는 설정이며, 함수 내부에서 매 요청의 사용자 토큰을 `auth.getUser()`로 검증합니다.

게임 규칙을 수정했다면 배포 전에 `npm ci`, `npm run build:pvp`로 `supabase/functions/pvp/rules.mjs`를 다시 만드세요. 현재 생성된 번들은 저장소에 포함되어 있습니다. `scripts/build-pvp.cjs`는 전투 엔진의 ESM/CommonJS 중복을 제거하고, 서버에서 사용하지 않는 Showdown 기술 습득·팀 적법성 테이블을 제외합니다. 보유/기술 검증은 기존 게임의 `game-state.js`와 `training.json`을 사용하며 전투 기술·특성·도구 판정 데이터는 유지합니다. API 배포를 위해 번들이 4,000,000바이트를 넘으면 빌드가 실패합니다. 2026-11-03 수정 번들은 약 3.49 MiB이며 기존 전체 엔진과 151종의 초기 상태/턴 판정 동등성을 확인했습니다.

## 3. 사이트 업데이트 / 실전 확인

GitHub Desktop에서 변경 파일을 Commit → Push origin 합니다. Pages 배포가 끝나면 새로고침하세요.

1. 서로 다른 계정 2개로 각각 로그인하고 저장 파일을 엽니다.
2. 각 저장 파일에 서로 다른 종의 보유 포켓몬이 최소 6마리 있어야 합니다.
3. PVP에서 6마리와 지닌 도구를 정하고 매칭 시작. 포켓몬과 도구는 중복 불가이며 스토리 도구를 소모하지 않습니다.
4. 각자 3마리를 순서대로 선출합니다. 첫 번째 포켓몬이 먼저 나옵니다. 선출 시간 만료 시 미확정 플레이어는 등록 순서의 앞 3마리로 선출됩니다.
5. 모든 포켓몬은 Lv.50. 턴마다 30초 동안 선택하고 양쪽 확정 또는 시간 만료 후 진행합니다. 미확정 행동은 제자리 대기로 처리하며 교체는 누르는 즉시 확정됩니다.
6. 상대의 6후보는 보이지만 선출한 3마리는 비공개입니다. 실제 출전한 포켓몬만 표시등과 HP가 나타나고, 이후에도 공개 상태가 유지됩니다.
7. 나가기 → 취소는 전투 유지, 확인은 기권. 상대 화면에는 승리 결과가 표시됩니다.

연결 전에는 매칭 화면에 서버 준비 메시지가 표시됩니다. 문제가 생기면 Dashboard → Edge Functions → pvp → Logs를 확인하세요. 브라우저에 서비스 키를 넣거나 테이블을 공개해서 해결하지 마세요.

## 구현과 검증 범위

`npm test`는 기존 게임 검사와 실제 PostgreSQL 호환 엔진(PGlite)에서 매칭·선출 비공개·타이머·권한·전투 판정을 검사합니다. `tests/pvp-preview.html`과 `tests/serve-pvp.cjs`는 테스트용 두 계정/메모리 DB를 사용하는 로컬 검증 도구이며 실제 계정 저장을 쓰지 않습니다.

턴 입력과 승패는 서버가 판정하며, 상대 선출과 미공개 HP는 서버 응답에서도 제외합니다. 보유 목록은 계정의 클라우드 저장 파일을 기준으로 검증합니다. 현재 스토리 저장 자체는 클라이언트가 생성하므로 재화·획득 이력까지 서버에서 검증하는 부정행위 방지 장부는 아직 포함하지 않습니다. PVP 보상과 교환은 이번 구현에 포함하지 않습니다.

장기 미접속 대전 정리, 랭킹, 전적 UI, 관전은 이후 확장 범위입니다. 시간 만료 처리는 접속 중인 클라이언트의 조회 요청 때 서버 시각을 기준으로 진행하므로 양쪽 모두 닫은 동안 별도 작업 프로세스가 돌지는 않습니다.
