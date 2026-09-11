/**
 * 글 원문의 og:image를 빌드 시점에 내려받아 사이트가 직접 서빙한다.
 *
 * 외부 og:image를 그대로 참조하지 않는 이유는 두 가지다. 티스토리가 주는
 * 주소는 만료 시각과 서명이 붙은 CDN 링크라 그대로 두면 몇 주 뒤 깨지고,
 * 원본이 수백 KB라 목록에 그대로 붙이면 첫 화면 로딩이 나빠진다.
 *
 * 이 스크립트는 실패해도 빌드를 멈추지 않는다. 썸네일은 본문이 아니라
 * 보조 정보이므로, 외부 블로그가 응답하지 않으면 해당 글만 기하 도형으로
 * 대체된다. 원본 데이터 오류가 빌드를 실패시켜야 한다는 ADR-002는 아카이브
 * 마크다운에 적용되는 규칙이고 여기에는 해당하지 않는다.
 *
 * 이미 받아 둔 파일은 다시 받지 않는다. 새 글이 추가될 때만 네트워크를 쓴다.
 *
 * 실행 흐름:
 * Markdown의 글 URL 수집 -> 원문 HTML의 og:image 탐색 -> 이미지 형식·크기 검증
 * -> public 파일 저장 -> 글 URL과 파일명을 연결하는 manifest 생성
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ARCHIVE_LISTING =
  "https://api.github.com/repos/Frontend-Archive/archive/contents/archives?ref=main";
const THUMBNAIL_DIR = path.join(process.cwd(), "public", "thumbnails");
const MANIFEST_PATH = path.join(process.cwd(), "lib", "thumbnails.json");
const CACHE_PATH = path.join(process.cwd(), "scripts", "thumbnail-cache.json");
/** og:image가 없다고 확인된 글을 다시 확인하기까지의 기간. */
const RECHECK_DAYS = 14;
const REQUEST_TIMEOUT = 15000;
const MAX_BYTES = 2_000_000;
const USER_AGENT = "Mozilla/5.0 (compatible; frontend-archive-web/1.0)";

/** og:image로 쓸 수 없는 값. 글마다 다른 그림이 아니라서 썸네일 구실을 못 한다. */
function isUselessImage(value) {
  return (
    value === "[object Object]" ||
    value.includes("notion.com/images/meta/") ||
    value.startsWith("data:")
  );
}

/**
 * 다음 CDN은 경로의 리사이즈 규격을 바꿔도 서명이 유효하다. 800px 원본 대신
 * 160px 정사각을 받아 용량을 10분의 1로 줄인다.
 */
function preferSmallVariant(imageUrl) {
  return imageUrl.replace(
    /(img\d*\.daumcdn\.net\/thumb\/)R\d+x\d+\//,
    "$1C160x160/",
  );
}

function extractImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && !isUselessImage(match[1])) return match[1];
  }
  return null;
}

async function get(url, accept) {
  return fetch(url, {
    headers: { "user-agent": USER_AGENT, accept },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });
}

async function listArticleUrls() {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": USER_AGENT };
  if (process.env.ARCHIVE_GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.ARCHIVE_GITHUB_TOKEN}`;
  }
  const listing = await fetch(ARCHIVE_LISTING, { headers });
  if (!listing.ok) throw new Error(`아카이브 목록 ${listing.status}`);
  const files = (await listing.json()).filter(
    (entry) => entry.type === "file" && /^\d{6}\.md$/.test(entry.name),
  );
  // 이 스크립트는 Next/TypeScript 모듈을 불러오기 전 실행되는 독립 prebuild다.
  // 필요한 URL만 직접 읽고 Set으로 중복 요청을 제거한다.
  const urls = new Set();
  for (const file of files) {
    const source = await (await fetch(file.download_url)).text();
    for (const match of source.matchAll(/^\s*url:\s*["']?(https?:\/\/[^"'\s]+)["']?\s*$/gm)) {
      urls.add(match[1]);
    }
  }
  return [...urls];
}

const EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
};

function hashFor(articleUrl) {
  return createHash("sha1").update(articleUrl).digest("hex").slice(0, 16);
}

async function readCache() {
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function main() {
  await mkdir(THUMBNAIL_DIR, { recursive: true });

  let articleUrls;
  try {
    articleUrls = await listArticleUrls();
  } catch (error) {
    console.warn(`[thumbnails] 아카이브 목록을 읽지 못해 건너뜁니다: ${error.message}`);
    return;
  }

  const existing = new Set(await readdir(THUMBNAIL_DIR));
  const previous = await readCache();
  const cache = {};
  const manifest = {};
  const now = Date.now();
  const recheckAfter = RECHECK_DAYS * 24 * 60 * 60 * 1000;
  let downloaded = 0;
  let cached = 0;
  const skipped = [];

  for (const articleUrl of articleUrls) {
    const hash = hashFor(articleUrl);
    const alreadyHave = [...existing].find((name) => name.startsWith(`${hash}.`));

    if (alreadyHave) {
      manifest[articleUrl] = alreadyHave;
      cache[articleUrl] = { file: alreadyHave, checkedAt: new Date(now).toISOString() };
      cached += 1;
      continue;
    }

    // og:image가 없다고 확인된 글은 매 빌드마다 다시 찾아가지 않는다.
    // 블로그가 나중에 이미지를 붙일 수 있으므로 기간이 지나면 다시 본다.
    const seen = previous[articleUrl];
    if (seen && !seen.file && now - Date.parse(seen.checkedAt) < recheckAfter) {
      cache[articleUrl] = seen;
      skipped.push(`${articleUrl} — ${seen.reason ?? "이전 확인에서 이미지 없음"} (재확인 생략)`);
      continue;
    }

    try {
      const page = await get(articleUrl, "text/html");
      if (!page.ok) throw new Error(`HTTP ${page.status}`);

      const found = extractImage(await page.text());
      if (!found) throw new Error("쓸 수 있는 og:image 없음");

      const imageUrl = preferSmallVariant(new URL(found, articleUrl).href);
      const image = await get(imageUrl, "image/*");
      if (!image.ok) throw new Error(`이미지 HTTP ${image.status}`);

      // 확장자는 응답 타입에서 정한다. 원본 주소의 확장자와 실제 형식이
      // 다른 경우가 있어서, 주소를 믿으면 GIF를 png로 서빙하게 된다.
      const type = (image.headers.get("content-type") ?? "").split(";")[0].trim();
      const extension = EXTENSIONS[type];
      if (!extension) throw new Error(`지원하지 않는 형식 ${type || "알 수 없음"}`);

      const bytes = Buffer.from(await image.arrayBuffer());
      if (bytes.byteLength > MAX_BYTES) throw new Error(`${bytes.byteLength}바이트로 너무 큼`);

      const fileName = `${hash}.${extension}`;
      await writeFile(path.join(THUMBNAIL_DIR, fileName), bytes);
      manifest[articleUrl] = fileName;
      cache[articleUrl] = { file: fileName, checkedAt: new Date(now).toISOString() };
      downloaded += 1;
    } catch (error) {
      cache[articleUrl] = { checkedAt: new Date(now).toISOString(), reason: error.message };
      skipped.push(`${articleUrl} — ${error.message}`);
    }
  }

  const sortEntries = (value) => Object.fromEntries(Object.entries(value).sort());
  await writeFile(MANIFEST_PATH, `${JSON.stringify(sortEntries(manifest), null, 2)}\n`);
  await writeFile(CACHE_PATH, `${JSON.stringify(sortEntries(cache), null, 2)}\n`);

  console.log(
    `[thumbnails] 전체 ${articleUrls.length}개 · 새로 받음 ${downloaded} · 이미 있음 ${cached} · 도형으로 대체 ${skipped.length}`,
  );
  for (const line of skipped) console.log(`[thumbnails]   ${line}`);
}

await main();
