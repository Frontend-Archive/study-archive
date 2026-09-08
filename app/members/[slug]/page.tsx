import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleRow } from "@/components/ArticleRow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArchiveSessions, getMember, MEMBERS } from "@/lib/archive";

export function generateStaticParams() { return MEMBERS.map((member) => ({ slug: member.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const member = getMember((await params).slug); if (!member) return {}; const description = `${member.name}님이 스터디에서 공유한 프론트엔드 학습 기록`; return { title: `${member.name}의 기록 — Frontend Archive`, description, openGraph: { title: `${member.name}의 기록 — Frontend Archive`, description, images: [] }, twitter: { card: "summary", title: `${member.name}의 기록 — Frontend Archive`, description, images: [] } }; }
export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) { const member = getMember((await params).slug); if (!member) notFound(); const sessions = await getArchiveSessions(); const records = sessions.slice().reverse().map((session) => ({ session, article: session.articles.find((item) => item.author === member.name)! })); const published = records.filter(({ article }) => article.status === "published").length; return <main><SiteHeader /><article className="detail-page member-page"><Link className="back-link" href="/#members">← 모든 멤버</Link><header className="member-hero"><p className="eyebrow">Member trajectory</p><h1><em>{member.name}</em>의<br />배움이 쌓인 시간</h1><p>{sessions.length}번의 만남 중 {published}개의 기록을 남겼습니다.</p></header><section className="detail-list"><div className="detail-section-label"><span>LEARNING LOG</span><span>{String(published).padStart(2, "0")} ARTICLES</span></div>{records.map(({ session, article }) => <div className="member-record" key={session.id}><Link href={`/sessions/${session.id}`} className="round-badge">ROUND {String(session.id).padStart(2, "0")}</Link><ArticleRow article={article} sessionId={session.id} date={session.date} showDate /></div>)}</section></article><SiteFooter /></main>; }

