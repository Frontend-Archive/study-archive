import { getArchiveSessions } from "@/lib/archive";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://frontend-archive-study.sunny-grass-6556.chatgpt.site";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const sessions = await getArchiveSessions();
  const items = sessions.flatMap((session) =>
    session.articles
      .filter((article) => article.status === "published")
      .map((article) => ({ session, article })),
  );
  const latestDate = sessions[0]?.date ?? "2026-01-01";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Frontend Archive</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>프론트엔드 스터디 구성원이 매 회차 공유한 학습 기록</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date(`${latestDate}T00:00:00Z`).toUTCString()}</lastBuildDate>
${items
  .map(
    ({ session, article }) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(article.url)}</link>
      <guid isPermaLink="false">${escapeXml(`${session.id}:${article.url}`)}</guid>
      <description>${escapeXml(`${article.author} · ${session.title} · ${article.tags.map((tag) => `#${tag}`).join(" ")}`)}</description>
      <dc:creator>${escapeXml(article.author)}</dc:creator>
      <pubDate>${new Date(`${session.date}T00:00:00Z`).toUTCString()}</pubDate>
${article.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
