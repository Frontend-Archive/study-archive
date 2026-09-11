# Frontend Archive 구현 과정 기록

## 1. 문서 목적

이 문서는 Frontend Archive 공개 MVP가 요구사항에서 실제 배포 가능한 결과물로 바뀐 과정을 추적한다. 무엇을 만들었는지만 나열하지 않고, 각 단계에서 어떤 입력을 확인했고 어떤 판단을 내렸으며 어떤 산출물과 검증 결과를 남겼는지 기록한다.

- 작업 기간: 2026-09-08 ~ 2026-09-09
- 공개 사이트: [frontend-archive-study.junbox98221.chatgpt.site](https://frontend-archive-study.junbox98221.chatgpt.site)
- 콘텐츠 원본: [Frontend-Archive/archive](https://github.com/Frontend-Archive/archive)
- 제품 범위: 공개 읽기 전용 MVP

## 2. 출발점과 핵심 결정

### 출발점

초기 요구사항은 스터디 구성원이 회차마다 공유한 블로그 글을 한 번 발표하고 끝내지 않고, 나중에도 회차·작성자·태그를 기준으로 다시 찾을 수 있는 아카이브를 만드는 것이었다. 기존 `Frontend-Archive/archive` 저장소에는 6개 회차, 4명의 발표 슬롯 24개, 게시된 글 22개와 미작성 슬롯 2개가 Markdown으로 관리되고 있었다.

### 구현 전에 확정한 결정

1. 학습 기록이 시간에 따라 쌓이는 모습을 최우선 가치로 둔다.
2. 기존 GitHub Markdown을 유일한 콘텐츠 원본으로 유지한다.
3. 사이트는 공개 읽기 전용으로 만들고 DB, 인증, 관리자 화면은 도입하지 않는다.
4. 회차 상세와 멤버 상세를 독립 URL로 제공한다.
5. 검색과 필터 상태는 URL 쿼리로 표현해 새로고침, 뒤로 가기, 링크 공유를 지원한다.
6. 원본 데이터가 잘못되면 조용히 누락하지 않고 빌드를 실패시킨다.
7. 디자인은 장식보다 활자, 간격, 정렬에 집중한 에디토리얼 아카이브 방향을 따른다.

## 3. 단계별 진행 과정과 산출물

### 1단계: 제품과 성공 기준 정의

입력으로 사용자, 사용 맥락, 기존 저장소 구조, 이번 주 안에 공개 MVP를 배포한다는 제약을 정리했다. 이를 바탕으로 문제, 제품 약속, 핵심 흐름, MVP 범위와 비목표를 분리했다.

주요 산출물:

- [`00-product-brief.md`](./00-product-brief.md): 문제, 사용자, 핵심 가치, 성공 기준
- [`01-prd.md`](./01-prd.md): 사용자 시나리오, 기능·반응형·접근성·SEO 요구사항

### 2단계: 콘텐츠 계약과 사용자 경험 설계

기존 `archives/*.md` frontmatter 구조를 확인하고 외부 입력 타입과 정규화된 도메인 타입을 분리했다. 홈, 회차, 멤버, 소개 페이지의 정보 구조와 검색 쿼리 계약도 이 단계에서 정했다.

주요 산출물:

- [`02-content-domain.md`](./02-content-domain.md): 파일명, 회차 ID, 날짜, 진행 방식, 발표 슬롯과 오류 정책
- [`03-ux-design.md`](./03-ux-design.md): 라우트, 핵심 화면, 반응형 동작, 색상·타이포그래피·모션 원칙
- [`04-technical-adr.md`](./04-technical-adr.md): 단일 원본, 무DB 구조, 검증·재배포 경계와 Definition of Done

### 3단계: 프로젝트 기반 구성

TypeScript strict mode를 사용하는 App Router 구조와 Tailwind CSS 기반 디자인 토큰을 구성했다. 정적 페이지 생성과 Sites 배포 환경을 함께 만족시키기 위해 `vinext` 기반 런타임을 사용했고, ESLint·TypeScript·Vitest·Playwright·프로덕션 빌드를 실행할 수 있는 명령을 마련했다.

주요 산출물:

- `package.json`, `package-lock.json`
- TypeScript, ESLint, Vite, Vitest, Playwright, PostCSS 설정
- App Router 진입점과 Cloudflare Worker 진입점

### 4단계: 데이터 수집과 검증 계층 구현

`getArchiveSessions()`를 외부 콘텐츠 접근의 유일한 경계로 만들었다. GitHub API에서 Markdown 목록과 원문을 읽고 YAML frontmatter를 파싱한 뒤 Zod와 도메인 규칙으로 검증한다.

구현한 규칙:

- 회차 ID 중복, 잘못된 날짜·URL·진행 방식은 오류 처리한다.
- `title`, `url`, `tags`가 모두 비어 있을 때만 `pending` 슬롯으로 허용한다.
- 세 필드 중 일부만 채워진 슬롯은 불완전 데이터로 간주해 빌드를 실패시킨다.
- 회차는 최신순, 멤버의 발표 기록은 오래된 순으로 정렬한다.
- 원문 태그 표기는 유지하고 검색 비교값만 공백 제거와 소문자 변환을 적용한다.
- GitHub API 제한 응답 시 동일 공개 원본의 jsDelivr CDN을 대체 읽기 경로로 사용한다.

주요 산출물:

- [`archive.ts`](../lib/archive.ts): 수집, 파싱, 검증, 정규화, 집계
- [`search.ts`](../lib/search.ts): 한글·영문 검색과 작성자·태그 조합 필터

### 5단계: 핵심 화면 구현

먼저 실제 회차 하나를 끝까지 표시하는 세로 슬라이스를 만들고, 검증한 패턴을 전체 회차로 확장했다. 이후 홈의 누적 현황과 타임라인, 게시 글과 미작성 슬롯, URL 기반 검색·필터, 회차 상세, 멤버별 시간순 기록, 소개와 404 페이지를 완성했다.

구현 결과:

- `/`: 제품 소개, 누적 통계, 검색·작성자·태그 필터, 회차 타임라인
- `/sessions/[id]`: 회차 날짜·진행 방식과 네 명의 발표 상태
- `/members/[slug]`: 멤버별 누적 발표 기록
- `/about`: 스터디와 콘텐츠 운영 방식
- `/robots.txt`, `/sitemap.xml`: 검색 엔진 탐색 지원

디자인은 따뜻한 종이색 배경, 짙은 잉크색 본문, 코발트색 포인트와 세로 시간축을 사용했다. 360px, 768px, 1440px에서 정보 우선순위를 유지하도록 반응형 레이아웃을 구성했고, 키보드 포커스와 `prefers-reduced-motion`도 반영했다.

### 6단계: 공유 이미지와 메타데이터 구성

페이지 제목과 설명, Open Graph 메타데이터, 사이트맵을 추가했다. 사이트의 색·활자·타임라인 언어를 반영한 전용 OG 이미지를 생성해 [`public/og.png`](../public/og.png)에 포함했다.

### 7단계: 자동·브라우저 검증과 수정

데이터 규칙, 검색 조합, 정렬, 렌더링 결과와 핵심 브라우저 흐름을 자동화했다. 로컬 브라우저에서는 데스크톱과 모바일 크기로 직접 확인했다.

검증 과정에서 발견하고 수정한 문제:

- 날짜가 실행 환경의 시간대에 따라 하루 다르게 표시되던 문제를 UTC 기반 형식화로 수정했다.
- GitHub API rate limit 때문에 빌드가 불안정해질 수 있는 문제에 공개 CDN fallback을 추가했다.
- URL 검색 상태와 클라이언트 초기화 시점이 어긋날 수 있는 문제를 hydration 이후 상태 동기화로 수정했다.

최종 검증 결과:

- ESLint 통과
- TypeScript typecheck 통과
- Vitest 단위 테스트 6개 통과
- 프로덕션 빌드 통과
- 렌더링 HTML 테스트 2개 통과
- Playwright E2E 4개 통과: Chromium 데스크톱, WebKit 모바일
- 원본과 동일한 6회차, 4명, 게시 글 22개, 미작성 슬롯 2개 확인

시각 검수 자료:

- [`home-desktop.png`](../artifacts/home-desktop.png)
- [`home-mobile.png`](../artifacts/home-mobile.png)

### 8단계: CI, 배포, 콘텐츠 갱신 경로 준비

모든 push와 pull request에서 lint, typecheck, 단위 테스트, 프로덕션 빌드를 검사하는 GitHub Actions를 추가했다. 콘텐츠 저장소의 `archive-updated` 이벤트를 받은 웹 저장소가 호스팅 deploy hook을 호출하는 워크플로도 마련했다.

사이트는 Sites를 통해 처음 공개 배포했다. 자동 재배포는 코드 구성이 완료된 상태이고, 실제 운영 연결을 위해서는 `DEPLOY_HOOK_URL`과 원본 저장소의 dispatch 대상·토큰을 설정해야 한다.

### 9단계: Vercel 배포로 이전 (2026-09-12)

운영 배포를 Vercel로 옮기면서 런타임을 표준 Next.js로 되돌렸다. `vinext`는 Next.js API를 Vite 위에 다시 구현한 Cloudflare용 프레임워크라 산출물이 Worker 번들이었고, Vercel이 그대로 받을 수 없었다. 플랫폼과 프레임워크를 일치시키는 쪽을 택해 `next`를 설치하고 `vinext`, `@vitejs/plugin-rsc`, `@cloudflare/vite-plugin`, `@openai/sites-vite-plugin`, `wrangler`를 제거했다.

- `vite.config.ts`, `worker/index.ts`, `.openai/hosting.json`, 사용되지 않던 `app/chatgpt-auth.ts`를 삭제했다.
- 스크립트를 `next dev`·`next build`·`next start`로 바꿨다.
- `app/feed.xml/route.ts`에 `force-static`을 명시했다. Next.js의 라우트 핸들러 기본값은 요청마다 실행이라, 선언하지 않으면 이 라우트만 동적으로 남는다.
- `test:render`가 Worker 번들을 직접 import 하던 방식을 `next start`로 띄운 프로덕션 서버에 HTTP 요청하는 방식으로 바꿨다. 검증 항목 11개는 그대로다.

`app/` 소스는 App Router 규약을 그대로 쓰고 있었으므로 페이지 코드 변경은 없었다. 필터를 `history.pushState`로 URL에 반영하는 `ArchiveExplorer`의 동작도 실제 Next.js 라우터에서 그대로 확인했다.

## 4. 사용한 Codex 스킬과 영향

| 스킬 | 사용 목적 | 구현에 미친 영향 |
| --- | --- | --- |
| `sites:sites-building` | 웹 프로젝트 구조와 Sites 호환 구현 절차 적용 | App Router 사용 경험을 유지하면서 Sites에서 빌드 가능한 `vinext`·Vite·Worker 구성을 선택하고, 초기에 실제 브라우저에서 확인 가능한 세로 슬라이스를 우선 만들었다. |
| `imagegen` | 전용 Open Graph 이미지 생성 | 기존 UI의 종이색·잉크색·코발트색과 에디토리얼 타임라인 분위기를 소셜 공유 이미지에도 일관되게 반영했다. |
| `browser:control-in-app-browser` | 실제 브라우저 기반 기능·반응형 QA | 1440px과 360px에서 레이아웃, 검색, 회차 이동, 메타데이터와 날짜를 검증했고, hydration 및 시간대 문제를 발견해 수정했다. |
| `sites:sites-hosting` | 빌드 결과 공개 배포와 접근 설정 | 배포 패키징, 버전 배포, 공개 접근 설정을 수행해 실제 공유 가능한 프로덕션 URL을 만들었다. |

스킬 외에도 GitHub 공개 원본과 워크플로를 읽어 데이터 계약을 확인했고, 로컬 명령으로 lint·typecheck·unit·build·render·E2E 검사를 반복 실행했다.

## 5. 최종 산출물 지도

| 분류 | 위치 | 역할 |
| --- | --- | --- |
| 제품 문서 | `docs/00-*.md` ~ `docs/04-*.md` | 제품, 요구사항, 데이터, UX, 기술 결정의 기준 |
| 데이터 계층 | `lib/archive.ts`, `lib/search.ts` | 외부 Markdown 검증·정규화·검색 |
| 공통 UI | `components/` | 탐색기, 글 행, 헤더, 푸터 |
| 페이지 | `app/` | 홈, 회차, 멤버, 소개, SEO, 404 |
| 공유 자산 | `public/og.png` | Open Graph 이미지 |
| 자동 테스트 | `tests/` | 도메인, 렌더링, 핵심 사용자 흐름 검증 |
| CI·재배포 | `.github/workflows/` | 품질 검사와 콘텐츠 변경 후 배포 호출 |
| 배포 설정 | `next.config.ts`, `.github/workflows/redeploy.yml` | Vercel 빌드 설정과 재배포 호출 |
| 시각 증거 | `artifacts/` | 데스크톱·모바일 최종 화면 캡처 |

## 6. 커밋 구성 원칙

최종 Git 이력은 결과를 한 번에 넣은 단일 커밋 대신 아래 순서로 나눈다. 각 커밋은 독립적인 작업 목적을 가지며 이후 발표나 회고에서 구현 흐름을 그대로 따라갈 수 있게 한다.

1. 프로젝트 기반과 개발 도구 구성
2. 제품·콘텐츠·UX·기술 문서 확정
3. 검증된 아카이브 데이터 계층 구현
4. 에디토리얼 아카이브 화면과 OG 자산 구현
5. 자동 테스트와 CI 품질 기준 추가
6. 배포·재배포 구성과 운영 안내 추가
7. 구현 과정 기록 추가

## 7. 현재 상태와 다음 운영 작업

MVP 기능, 테스트, 시각 QA, 공개 배포는 완료되었다. 운영자가 이어서 해야 하는 외부 설정은 다음과 같다.

1. Vercel에 이 저장소를 연결한다. 프레임워크 프리셋은 Next.js이고 빌드 설정은 기본값 그대로다.
2. Vercel 프로젝트 환경 변수에 `NEXT_PUBLIC_SITE_URL`을 실제 운영 도메인으로 설정한다. 코드에 남은 기본값은 이전 호스팅 주소라 이 설정이 없으면 메타데이터와 사이트맵이 잘못된 도메인을 가리킨다.
3. 웹 저장소 Secret에 Vercel deploy hook URL을 `DEPLOY_HOOK_URL`로 등록하고, 재배포가 Vercel로 나가는지 수동 `workflow_dispatch`로 한 번 확인한다.
4. `Frontend-Archive/archive`의 `notify-blog.yml`이 새 웹 저장소로 `archive-updated`를 보내도록 대상과 `BLOG_DISPATCH_TOKEN`을 설정한다.
5. 테스트 Markdown 변경으로 5분 이내 재배포 시작 여부를 확인한다.

이후 기능 확장은 첫 일주일의 실제 검색·필터·외부 링크 사용과 구성원 피드백을 확인한 다음 결정한다. 사용 근거가 생기기 전에는 DB, 인증, 다중 스터디 추상화를 추가하지 않는다.
