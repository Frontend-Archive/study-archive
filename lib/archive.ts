import { load } from "js-yaml";
import { z } from "zod";

/**
 * 핵심 콘텐츠 파이프라인
 *
 * GitHub Markdown 목록 조회 -> 원문 다운로드 -> frontmatter 파싱
 * -> 외부 입력 검증 -> 화면용 ArchiveSession[] 정규화
 *
 * 페이지는 이 파일의 getArchiveSessions()만 호출한다. 외부 저장소 접근을 한
 * 경계로 모아 두면 수집 방법이 바뀌어도 화면 코드는 영향을 받지 않는다.
 */

export type MeetingType = "on-line" | "off-line";
export type PublishedArticle = { status: "published"; author: string; title: string; url: string; tags: string[] };
export type PendingArticle = { status: "pending"; author: string; title: ""; url: ""; tags: [] };
export type Article = PublishedArticle | PendingArticle;
export type ArchiveSession = { id: number; date: string; title: string; type: MeetingType; articles: Article[] };
export type Member = { name: string; slug: string };

export const MEMBERS: Member[] = [
  { name: "권시현", slug: "kwon-sihyeon" },
  { name: "민준경", slug: "min-jungyeong" },
  { name: "염승준", slug: "yeom-seungjun" },
  { name: "최승원", slug: "choi-seungwon" },
];

// 이 스키마는 아직 신뢰할 수 없는 "원본 모양"만 검사한다. published/pending
// 판별처럼 서비스 의미가 필요한 규칙은 parseArchiveMarkdown()에서 적용한다.
const articleSourceSchema = z.object({ author: z.string().min(1), title: z.string(), url: z.string(), tags: z.array(z.string()) }).strict();
const archiveSourceSchema = z.object({ id: z.number().int().positive(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), title: z.string(), type: z.enum(["on-line", "off-line"]), articles: z.array(articleSourceSchema).length(MEMBERS.length) }).strict();

// GitHub가 단일 원본이고 jsDelivr는 같은 main 브랜치에 접근하는 예비 전송
// 경로다. fallback을 별도 데이터 원본으로 취급하지 않는 것이 중요하다.
const GITHUB_API = "https://api.github.com/repos/Frontend-Archive/archive/contents/archives?ref=main";
const JSDELIVR_API = "https://data.jsdelivr.com/v1/package/gh/Frontend-Archive/archive@main/flat";

function validDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

export function parseArchiveMarkdown(filename: string, source: string): ArchiveSession {
  // 1) Markdown 본문은 복제하지 않고 YAML frontmatter만 콘텐츠 계약으로 쓴다.
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`${filename}: YAML frontmatter를 찾을 수 없습니다.`);

  // 2) Zod로 필드 타입, 필수값, 배열 길이와 허용 enum을 먼저 검사한다.
  const parsed = archiveSourceSchema.parse(load(frontmatter[1]));

  // 3) 파일명-날짜-제목-발표자 순서처럼 필드 사이의 도메인 관계를 검사한다.
  if (!validDate(parsed.date)) throw new Error(`${filename}: 유효하지 않은 날짜입니다.`);
  if (filename !== `${parsed.date.slice(0, 4)}${parsed.date.slice(5, 7)}.md`) throw new Error(`${filename}: 파일명과 date가 일치하지 않습니다.`);
  if (parsed.title !== `스터디 ${parsed.id}회차`) throw new Error(`${filename}: title과 id가 일치하지 않습니다.`);
  const authors = parsed.articles.map((article) => article.author);
  if (authors.some((author, index) => author !== MEMBERS[index].name)) throw new Error(`${filename}: 발표자 순서가 올바르지 않습니다.`);

  // 4) 원본의 빈 슬롯을 UI가 안전하게 분기할 수 있는 판별 유니온으로 바꾼다.
  const articles = parsed.articles.map<Article>((article) => {
    const empty = article.title === "" && article.url === "" && article.tags.length === 0;
    if (empty) return { author: article.author, title: "", url: "", status: "pending", tags: [] };
    if (!article.title || !article.url || article.tags.length === 0) throw new Error(`${filename}: 글은 title, url, tags를 함께 작성해야 합니다.`);
    const url = z.string().url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "HTTP(S) URL만 허용합니다.").parse(article.url);
    return { ...article, url, status: "published" };
  });
  return { ...parsed, articles };
}

type GithubEntry = { name: string; type: string; download_url: string | null };
type SourceFile = { name: string; url: string };

// 홈·회차·멤버·주제·RSS가 같은 빌드에서 모두 이 함수를 호출한다. 진행 중인
// Promise 자체를 저장해 한 프로세스 안에서 목록과 원문을 중복 요청하지 않는다.
let archiveRequest: Promise<ArchiveSession[]> | undefined;

async function listArchiveFiles(): Promise<SourceFile[]> {
  const headers: HeadersInit = { Accept: "application/vnd.github+json", "User-Agent": "frontend-archive-web" };
  if (process.env.ARCHIVE_GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.ARCHIVE_GITHUB_TOKEN}`;
  const listing = await fetch(GITHUB_API, { headers });
  // 디렉터리의 다른 문서는 무시하고 월별 회차 파일만 다음 단계로 전달한다.
  if (listing.ok) return ((await listing.json()) as GithubEntry[]).filter((entry) => entry.type === "file" && /^\d{6}\.md$/.test(entry.name) && entry.download_url).map((entry) => ({ name: entry.name, url: entry.download_url! }));

  // rate limit 계열만 예비 경로로 전환한다. 404 같은 구성 오류까지 숨기면
  // 원인을 찾기 어려워지므로 그대로 실패시킨다.
  if (listing.status !== 403 && listing.status !== 429) throw new Error(`아카이브 목록을 가져오지 못했습니다: ${listing.status}`);
  const fallback = await fetch(JSDELIVR_API);
  if (!fallback.ok) throw new Error(`아카이브 대체 목록을 가져오지 못했습니다: ${fallback.status}`);
  const data = (await fallback.json()) as { files: Array<{ name: string }> };
  return data.files.filter((file) => /^\/archives\/\d{6}\.md$/.test(file.name)).map((file) => ({ name: file.name.split("/").at(-1)!, url: `https://cdn.jsdelivr.net/gh/Frontend-Archive/archive@main${file.name}` }));
}

async function loadArchiveSessions(): Promise<ArchiveSession[]> {
  const files = await listArchiveFiles();

  // 파일 사이에 의존성이 없으므로 병렬로 내려받되, 하나라도 핵심 데이터 계약을
  // 위반하면 Promise.all을 실패시켜 잘못된 새 배포가 생성되지 않게 한다.
  const sessions = await Promise.all(files.map(async (file) => {
    const response = await fetch(file.url);
    if (!response.ok) throw new Error(`${file.name}을 가져오지 못했습니다: ${response.status}`);
    return parseArchiveMarkdown(file.name, await response.text());
  }));
  const ids = new Set<number>();
  for (const session of sessions) {
    if (ids.has(session.id)) throw new Error(`중복 회차 ID: ${session.id}`);
    ids.add(session.id);
  }
  // ISO 날짜 문자열은 사전순과 시간순이 같으므로 Date 객체 변환 없이 최신순으로
  // 정렬할 수 있다. 멤버 화면의 오래된순 재정렬은 lib/members.ts가 담당한다.
  return sessions.sort((a, b) => b.date.localeCompare(a.date));
}

export function getArchiveSessions(): Promise<ArchiveSession[]> {
  archiveRequest ??= loadArchiveSessions();
  return archiveRequest;
}

export function getMember(slug: string) { return MEMBERS.find((member) => member.slug === slug); }
export function formatDate(value: string) { return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
