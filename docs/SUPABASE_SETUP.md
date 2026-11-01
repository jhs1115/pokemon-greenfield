# Supabase 연결

GitHub 저장소 `pokemon-greenfield`가 기준 소스입니다. URL/공개 키가 비어 있으면 기존 기기 저장 모드로 동작합니다. 설정하면 게임 시작 → 로그인 → 계정별 파일 1~3으로 전환됩니다.

1. Supabase Dashboard에서 New project를 만듭니다. DB 비밀번호는 보관하고 브라우저 코드에 넣지 않습니다.
2. 프로젝트의 SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다. 직접 쓰기 권한 없이 RLS와 저장 RPC가 함께 생성됩니다.
3. Connect 창에서 Project URL과 Publishable key를 확인합니다. 키별 목록은 Settings → API Keys에 있습니다. Legacy anon public key도 지원합니다.
4. `supabase-config.js`의 `url`과 `publishableKey`에 해당 **공개 값**을 설정합니다. `sb_secret_`, service_role, DB 비밀번호는 넣지 않습니다. 이 파일은 정적 브라우저용 공개 설정입니다.
5. Authentication → URL Configuration에서 실제 게임 주소를 Site URL로, 개발 주소와 실제 주소를 Redirect URLs로 등록합니다. GitHub Pages가 `/저장소명/` 경로라면 그 경로까지 포함합니다. 예: `http://127.0.0.1:8765/pokemon-greenfield/`.
6. 이메일/비밀번호 가입을 활성화하고 이메일 확인을 유지합니다. 회원가입 → 인증 메일 확인 → 로그인 → 슬롯 생성 순서로 확인합니다. 비밀번호 찾기의 이메일 링크도 같은 게임 페이지로 돌아옵니다.
7. 같은 계정으로 다른 브라우저에서 로그인해 파일이 보이는지, 다른 계정에는 보이지 않는지 확인합니다.

## 저장 동작

- 계정당 슬롯 1~3, 브라우저의 계정 정보에 따라 본인 파일만 읽습니다.
- 진행 변경은 650ms로 모아 RPC에 저장합니다. 로컬 대기열은 계정별로 분리하고 네트워크 실패 시 유지합니다. 온라인 복귀/재시도 버튼으로 재전송합니다.
- 파일 선택에 기존 기기 저장이 있고 클라우드 슬롯이 비어 있을 때만 ‘기기 파일 가져오기’가 나옵니다. 원래 기기 저장은 지우지 않습니다.
- 두 기기가 같은 슬롯을 수정하면 서버의 revision이 다른 요청을 거절합니다. 최신 파일을 불러오기 전에 해당 기기의 진행을 별도 로컬 백업으로 남깁니다.
- 로그아웃은 대기 중인 저장이 끝나야 진행됩니다. 저장 실패 시 계정이 바뀌어 다른 사용자에게 대기 저장이 전송되지 않습니다.

## 현재 범위와 다음 단계

현재 구현은 이메일 계정과 **스토리 진행 저장**입니다. 클라이언트가 보내는 게임 진행 스냅샷을 저장하므로 코인/아이템/경험치의 조작 방지까지 보장하지 않습니다. 교환/PVP를 구현하기 전에는 서버가 소유 포켓몬 인스턴스 UUID, 재화, 보상 지급과 교환 트랜잭션을 관리하도록 별도 테이블/서버 명령으로 옮겨야 합니다. 현재 JSON 저장을 그대로 교환의 재산 원장으로 사용하지 않습니다. 교환/PVP는 아직 구현하지 않았습니다.

## 검증

`npm test`는 기존 게임 테스트와 클라우드 큐/충돌/계정 분리, PGlite의 실제 PostgreSQL RLS/권한/원자적 revision 테스트를 포함합니다. 로컬 PostgreSQL 테스트는 Supabase Auth/메일 배달 테스트를 대체하지 않습니다. `tests/account-preview.html`은 외부 요청 없는 UI 테스트용 가짜 어댑터이며 실제 플레이에 사용하지 않습니다.

SDK: @supabase/supabase-js 2.118.0 (MIT), `assets/vendor/SUPABASE-LICENSE.txt`. `npm run build:supabase`로 로컬 번들을 다시 생성합니다.

공식 문서: https://supabase.com/docs/guides/auth/passwords / https://supabase.com/docs/guides/database/postgres/row-level-security / https://supabase.com/docs/guides/getting-started/api-keys / https://supabase.com/docs/guides/auth/redirect-urls
