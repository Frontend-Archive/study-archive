# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

프로젝트 문서와 커밋 메시지, 사용자 대상 문자열은 모두 한국어다. 새 코드도 같은 언어 기준을 따른다.

## 명령어

```bash
npm run dev          # vinext 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드 → dist/server/index.js
npm run lint         # eslint (dist, .next 제외)
npm run typecheck    # tsc --noEmit
npm run test         # vitest run (tests/**/*.test.ts, node 환경)
npm run test:render  # 빌드 산출물 HTML 검증 (build 선행 필수)
npm run test:e2e     # playwright (chromium + iPhone 13 프로젝트)
npm run check        # lint → typecheck → test → build → test:render
```

단일 테스트 실행:

```bash
npx vitest run tests/archive.test.ts -t "테스트 이름"
npx playwright test tests/e2e/archive.spec.ts --project=chromium
node --test tests/rendered-html.test.mjs
```

`npm run check`가 CI(`.github/workflows/ci.yml`)에서 그대로 실행되는 게이트다. `test:render`는 `dist/server/index.js`를 직접 import 하므로 빌드 없이 단독 실행하면 실패한다.

## 아키텍처

### 콘텐츠 파이프라인이 이 저장소의 핵심이다

이 저장소에는 콘텐츠가 없다. 모든 글 데이터는 빌드 시점에 외부 저장소 `Frontend-Archive/archive`의 `archives/YYYYMM.md`를 네트워크로 가져와 만들어진다. DB는 없고 `db/` 디렉터리는 비어 있다.

흐름은 `lib/archive.ts` 하나에 모여 있다.

1. GitHub Contents API로 `archives/` 파일 목록을 조회한다. 403/429(레이트 리밋)일 때만 jsDelivr로 폴백하고, 그 외 실패는 예외를 던져 빌드를 중단시킨다.
2. 각 파일의 YAML frontmatter를 Zod strict 스키마로 파싱한 뒤, 스키마로 표현할 수 없는 도메인 규칙을 별도로 검사한다. 파일명과 `date` 일치, `title === "스터디 {id}회차"`, 발표자 4명의 고정 순서, 회차 ID 중복 여부다.
3. `getArchiveSessions()`는 모듈 레벨 Promise 하나를 캐시해 빌드 중 중복 요청을 막는다.

### 썸네일은 별도의 빌드 단계다

`scripts/fetch-thumbnails.mjs`가 `prebuild`로 실행되어 각 글 원문의 `og:image`를 내려받아 `public/thumbnails/`에 저장하고, `lib/thumbnails.json`에 원문 URL과 파일명을 매핑한다. 외부 주소를 그대로 쓰지 않는 이유는 티스토리가 만료 시각과 서명이 붙은 CDN 주소를 주기 때문이다.

이 단계는 실패해도 빌드를 멈추지 않는다. 아래의 빌드 실패 규칙은 아카이브 마크다운에만 적용되며, 썸네일은 보조 정보라 없으면 주소에서 뽑은 기하 도형(`components/ThumbnailMark.tsx`)으로 대체된다. 이미 받아 둔 파일과 이미지가 없다고 확인된 URL은 `scripts/thumbnail-cache.json`에 기록되어 다시 요청하지 않는다. 두 파일과 내려받은 이미지는 모두 커밋한다.

원본이 규칙을 어기면 화면에서 조용히 빼지 않고 빌드를 실패시킨다(`docs/02-content-domain.md`, ADR-002). 이 동작을 완화하는 방향으로 바꾸지 않는다.

### 외부 타입과 도메인 타입의 분리

`Article`은 `PublishedArticle | PendingArticle` 유니언이다. 미작성 슬롯은 `title`, `url`, `tags`가 **함께** 비어 있을 때만 `pending`으로 정규화되고, 일부만 빈 상태는 에러다. 화면 코드는 `article.status`로 좁혀 쓰고 빈 문자열을 직접 검사하지 않는다.

### 태그와 주제는 다른 개념이다

원본 태그 표기는 절대 변경하지 않는다. 웹은 `lib/topics.ts`의 고정 매핑으로 태그를 6개 주제에 묶고, 어느 주제에도 매핑되지 않은 태그가 하나라도 있으면 `other`(기타) 주제를 함께 붙인다. 새 태그가 원본에 생기면 코드 변경 없이 자동으로 기타로 흘러가므로, 주제를 추가할 때는 `TOPICS` 배열만 수정하면 라우트·사이트맵·필터가 따라온다.

### 런타임

Next.js App Router 코드지만 Next.js로 빌드하지 않는다. `vinext` + `@vitejs/plugin-rsc` + `@cloudflare/vite-plugin` 조합으로 Cloudflare Worker 번들을 만들고, `worker/index.ts`가 진입점이다. Worker는 `/_vinext/image`만 가로채 Cloudflare Images로 최적화하고 나머지는 vinext 핸들러에 넘긴다. `next.config.ts`는 사실상 비어 있으며 실제 빌드 설정은 `vite.config.ts`에 있다.

페이지는 `export const dynamic = "force-static"`으로 빌드 시 정적 생성된다. 서버 컴포넌트가 `getArchiveSessions()`를 호출해 데이터를 내려주고, 클라이언트 컴포넌트는 `components/ArchiveExplorer.tsx` 하나뿐이다.

### 검색 상태는 URL이 소유한다

필터(`q`, `author`, `tag`, `topic`)는 URL 쿼리에 유지되어 새로고침·뒤로가기·링크 공유에서 복원된다. 필터링 로직 자체는 `lib/search.ts`의 순수 함수라 컴포넌트 없이 단위 테스트할 수 있다. 한글 검색은 `normalizeSearch()`로 소문자화 + 공백 제거 후 비교한다.

### 스타일 경계 (ADR-004)

- 색상·폰트·breakpoint는 `app/globals.css`의 Tailwind 4 `@theme` 토큰으로만 정의한다. 커스텀 breakpoint는 `layout`(43.8125rem)과 `wide`(53.1875rem)다.
- 전역 CSS에는 Tailwind import, 디자인 토큰, 전역 포커스 스타일만 둔다. 페이지 선택자, `@apply`, 런타임에 조합한 동적 Tailwind 클래스는 쓰지 않는다.
- 반복되는 표현은 `components/EditorialPrimitives.tsx`의 작은 컴포넌트와 고정 variant로 공유한다.

## 작업 계약 (docs/04-technical-adr.md)

- 한 번에 하나의 사용자 결과와 인수 조건만 구현한다.
- DB, 인증, 전역 상태 라이브러리, UI 프레임워크를 임의로 추가하지 않는다.
- 코드 변경과 같은 작업 안에서 관련 `docs/` 문서와 테스트를 함께 갱신한다.
- 모바일(360px부터 가로 스크롤 없음)과 데스크톱을 모두 확인한다.

## 환경 변수

`NEXT_PUBLIC_SITE_URL`은 메타데이터와 사이트맵·RSS의 절대 URL에 쓰인다. `ARCHIVE_GITHUB_TOKEN`은 선택이며 빌드 중 GitHub API 레이트 리밋을 올리는 용도다.

## 배포 경로가 두 갈래로 기록되어 있다

`README.md`와 `.github/workflows/redeploy.yml`은 Vercel deploy hook을 호출하도록 되어 있지만, 실제 빌드 타깃과 `docs/05-implementation-journey.md`의 공개 URL은 Cloudflare Worker 기반 OpenAI Sites 호스팅(`.openai/hosting.json`)을 가리킨다. 배포 관련 작업 전에 어느 쪽이 현재 운영 경로인지 사용자에게 확인한다.

원본 저장소의 `archives/**`가 바뀌면 `archive-updated` repository dispatch가 `redeploy.yml`을 깨워 재배포를 트리거한다.
