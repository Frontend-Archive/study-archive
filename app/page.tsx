import Link from "next/link";
import { ArchiveExplorer } from "@/components/ArchiveExplorer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArchiveSessions, MEMBERS } from "@/lib/archive";
import { TOPICS } from "@/lib/topics";

export const dynamic = "force-static";

export default async function Home() {
  const sessions = await getArchiveSessions();
  const published = sessions.flatMap((session) => session.articles).filter((article) => article.status === "published");
  return <main>
    <SiteHeader />
    <section className="hero" id="top"><p className="eyebrow">Frontend study · Since 2026</p><h1 className="home-title">Frontend <span className="title-accent">Archive</span></h1><p className="hero-copy">네 명의 프론트엔드 개발자가 매달 공유한 발표와 글을 회차·멤버·주제별로 모았습니다.</p><div className="hero-actions" aria-label="빠른 탐색"><a href="#archive">최신 기록 보기 <span aria-hidden="true">↓</span></a><a href="/feed.xml">RSS 구독 <span aria-hidden="true">↗</span></a></div><div className="stats" aria-label="아카이브 현황"><div><strong>{String(sessions.length).padStart(2, "0")}</strong><span>Sessions</span></div><div><strong>{String(published.length).padStart(2, "0")}</strong><span>Articles</span></div><div><strong>{String(MEMBERS.length).padStart(2, "0")}</strong><span>Members</span></div></div></section>
    <section className="archive-section" id="archive"><div className="section-heading"><div><p className="eyebrow">The ongoing record</p><h2>회차별 아카이브</h2></div><p>제목과 태그, 사람을 따라<br />우리의 배움을 발견하세요.</p></div><ArchiveExplorer sessions={sessions} members={MEMBERS} topics={TOPICS} /></section>
    <section className="members-section" id="members"><div className="section-heading light"><div><p className="eyebrow">Four perspectives</p><h2>함께 쌓는 사람들</h2></div><p>같은 주제도 서로 다른 질문에서 시작됩니다.</p></div><div className="member-grid">{MEMBERS.map((member, index) => { const count = sessions.flatMap((session) => session.articles).filter((article) => article.author === member.name && article.status === "published").length; return <Link href={`/members/${member.slug}`} className="member-card" key={member.slug}><span>0{index + 1}</span><h3>{member.name}</h3><p>{count}개의 기록</p><i aria-hidden="true">→</i></Link>; })}</div></section>
    <SiteFooter />
  </main>;
}
