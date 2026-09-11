import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test, { after, before } from "node:test";

// 빌드 산출물을 배포와 같은 경로로 확인한다. `.next` 내부 파일을 직접 읽으면
// Next.js의 내부 구조에 의존하게 되므로, 프로덕션 서버를 띄워 HTTP로 요청한다.
// `npm run build`가 선행되어야 한다.
const port = 3100 + (process.pid % 500);
const origin = `http://localhost:${port}`;
let server;

async function waitForServer(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error("next start가 먼저 종료되었다. 빌드를 먼저 실행했는지 확인한다.");
    try {
      await fetch(origin, { headers: { accept: "text/html" } });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw new Error(`${timeoutMs}ms 안에 next start가 준비되지 않았다.`);
}

before(async () => {
  server = spawn("npx", ["next", "start", "--port", String(port)], { stdio: "ignore", detached: true });
  await waitForServer();
});

after(() => {
  if (server?.pid && server.exitCode === null) process.kill(-server.pid, "SIGTERM");
});

async function render(path = "/") {
  return fetch(`${origin}${path}`, { headers: { accept: "text/html" } });
}

function assertSingleH1(html) { assert.equal(html.match(/<h1\b/g)?.length, 1); }
test("홈을 제품 콘텐츠와 메타데이터로 렌더링한다", async () => { const response = await render(); assert.equal(response.status, 200); const html = await response.text(); assertSingleH1(html); assert.match(html, /Frontend <span[^>]*>Archive<\/span>/); assert.match(html, /회차·멤버·주제별로 모았습니다/); assert.match(html, /회차별 아카이브/); assert.match(html, /주제로 읽기/); assert.match(html, /src="\/thumbnails\/[0-9a-f]{16}\.(png|jpg|gif|webp|avif)"/); assert.match(html, /href="\/topics\/react-framework"/); assert.match(html, /rel="alternate"[^>]+application\/rss\+xml/); assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/); });
test("존재하지 않는 경로는 404다", async () => { const response = await render("/sessions/999"); assert.equal(response.status, 404); });
test("소개 페이지는 직접적인 제목을 렌더링한다", async () => { const response = await render("/about"); assert.equal(response.status, 200); const html = await response.text(); assertSingleH1(html); assert.match(html, /아카이브<\/span> 소개/); });
test("회차 페이지는 직접적인 제목을 렌더링한다", async () => { const response = await render("/sessions/6"); assert.equal(response.status, 200); const html = await response.text(); assertSingleH1(html); assert.match(html, /스터디 6회차<\/h1>/); });
test("주제 페이지는 고유 콘텐츠와 메타데이터를 렌더링한다", async () => { const response = await render("/topics/react-framework"); assert.equal(response.status, 200); const html = await response.text(); assertSingleH1(html); assert.match(html, /React·프레임워크<\/span> 기록/); assert.match(html, /React·프레임워크 기록 — Frontend Archive/); assert.match(html, /TOPIC RECORDS/); });
test("멤버 페이지는 활동 요약과 학습 궤적을 렌더링한다", async () => { const response = await render("/members/kwon-sihyeon"); assert.equal(response.status, 200); const html = await response.text(); assertSingleH1(html); assert.match(html, /권시현<\/span>의 기록/); assert.match(html, /권시현의 기록 — Frontend Archive/); assert.match(html, /\d+번의 만남에서 남긴 \d+개의 프론트엔드 학습 기록/); assert.match(html, /전체 \d+회차 중 \d+개의 글을 게시했습니다/); assert.match(html, /TOPIC FOOTPRINT/i); assert.match(html, /관심사가 남긴 흔적/); assert.match(html, /LEARNING LOG/); assert.match(html, /다음 멤버 민준경/); });
test("존재하지 않는 멤버는 404다", async () => { const response = await render("/members/not-a-member"); assert.equal(response.status, 404); });
test("RSS는 게시된 글만 XML로 제공한다", async () => { const response = await render("/feed.xml"); assert.equal(response.status, 200); assert.match(response.headers.get("content-type") ?? "", /application\/rss\+xml/); const xml = await response.text(); assert.match(xml, /<rss version="2.0"/); assert.match(xml, /<item>/); assert.match(xml, /<dc:creator>/); assert.doesNotMatch(xml, /다음 기록을 준비하고 있어요|PREPARING/); });
test("기타 주제는 기록이 없을 때 탐색 가능한 빈 상태를 제공한다", async () => { const response = await render("/topics/other"); assert.equal(response.status, 200); const html = await response.text(); assert.match(html, /아직 이 주제에 담긴 기록이 없어요/); assert.match(html, /전체 아카이브 보기/); });
test("존재하지 않는 주제는 404다", async () => { const response = await render("/topics/not-a-topic"); assert.equal(response.status, 404); });
test("사이트맵에 주제 페이지를 포함한다", async () => { const response = await render("/sitemap.xml"); assert.equal(response.status, 200); const xml = await response.text(); assert.match(xml, /\/topics\/react-framework/); assert.match(xml, /\/topics\/other/); assert.doesNotMatch(xml, /[^:]\/\/topics/); });
