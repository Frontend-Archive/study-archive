import { load } from "js-yaml";
import { z } from "zod";

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

const articleSourceSchema = z.object({ author: z.string().min(1), title: z.string(), url: z.string(), tags: z.array(z.string()) }).strict();
const archiveSourceSchema = z.object({ id: z.number().int().positive(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), title: z.string(), type: z.enum(["on-line", "off-line"]), articles: z.array(articleSourceSchema).length(MEMBERS.length) }).strict();
const GITHUB_API = "https://api.github.com/repos/Frontend-Archive/archive/contents/archives?ref=main";
const JSDELIVR_API = "https://data.jsdelivr.com/v1/package/gh/Frontend-Archive/archive@main/flat";

function validDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

export function parseArchiveMarkdown(filename: string, source: string): ArchiveSession {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`${filename}: YAML frontmatter를 찾을 수 없습니다.`);
  const parsed = archiveSourceSchema.parse(load(frontmatter[1]));
  if (!validDate(parsed.date)) throw new Error(`${filename}: 유효하지 않은 날짜입니다.`);
  if (filename !== `${parsed.date.slice(0, 4)}${parsed.date.slice(5, 7)}.md`) throw new Error(`${filename}: 파일명과 date가 일치하지 않습니다.`);
  if (parsed.title !== `스터디 ${parsed.id}회차`) throw new Error(`${filename}: title과 id가 일치하지 않습니다.`);
  const authors = parsed.articles.map((article) => article.author);
  if (authors.some((author, index) => author !== MEMBERS[index].name)) throw new Error(`${filename}: 발표자 순서가 올바르지 않습니다.`);

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
let archiveRequest: Promise<ArchiveSession[]> | undefined;

async function listArchiveFiles(): Promise<SourceFile[]> {
  const headers: HeadersInit = { Accept: "application/vnd.github+json", "User-Agent": "frontend-archive-web" };
  if (process.env.ARCHIVE_GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.ARCHIVE_GITHUB_TOKEN}`;
  const listing = await fetch(GITHUB_API, { headers });
  if (listing.ok) return ((await listing.json()) as GithubEntry[]).filter((entry) => entry.type === "file" && /^\d{6}\.md$/.test(entry.name) && entry.download_url).map((entry) => ({ name: entry.name, url: entry.download_url! }));
  if (listing.status !== 403 && listing.status !== 429) throw new Error(`아카이브 목록을 가져오지 못했습니다: ${listing.status}`);
  const fallback = await fetch(JSDELIVR_API);
  if (!fallback.ok) throw new Error(`아카이브 대체 목록을 가져오지 못했습니다: ${fallback.status}`);
  const data = (await fallback.json()) as { files: Array<{ name: string }> };
  return data.files.filter((file) => /^\/archives\/\d{6}\.md$/.test(file.name)).map((file) => ({ name: file.name.split("/").at(-1)!, url: `https://cdn.jsdelivr.net/gh/Frontend-Archive/archive@main${file.name}` }));
}

async function loadArchiveSessions(): Promise<ArchiveSession[]> {
  const files = await listArchiveFiles();
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
  return sessions.sort((a, b) => b.date.localeCompare(a.date));
}

export function getArchiveSessions(): Promise<ArchiveSession[]> {
  archiveRequest ??= loadArchiveSessions();
  return archiveRequest;
}

export function getMember(slug: string) { return MEMBERS.find((member) => member.slug === slug); }
export function formatDate(value: string) { return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
