import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleRow } from "@/components/ArticleRow";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArchiveSessions } from "@/lib/archive";
import {
  ALL_TOPICS,
  getTopic,
  getTopicRecords,
} from "@/lib/topics";

export function generateStaticParams() {
  return ALL_TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const topic = getTopic((await params).slug);
  if (!topic) return {};
  const title = `${topic.label} 기록 — Frontend Archive`;
  return {
    title,
    description: topic.description,
    openGraph: { title, description: topic.description, images: [] },
    twitter: {
      card: "summary",
      title,
      description: topic.description,
      images: [],
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const topic = getTopic((await params).slug);
  if (!topic) notFound();

  const sessions = await getArchiveSessions();
  const records = getTopicRecords(sessions, topic.slug);

  return (
    <main>
      <SiteHeader />
      <article className="detail-page topic-page">
        <Link className="back-link" href="/#archive">
          ← 모든 기록
        </Link>
        <header className="topic-hero">
          <p className="eyebrow">Topic archive</p>
          <h1 className="page-title">
            <span className="title-accent">{topic.label}</span> 기록
          </h1>
          <p>{topic.description}</p>
        </header>
        <section className="detail-list" aria-labelledby="topic-records-title">
          <div className="detail-section-label">
            <span id="topic-records-title">TOPIC RECORDS</span>
            <span>{String(records.length).padStart(2, "0")} ARTICLES</span>
          </div>
          {records.length > 0 ? (
            records.map(({ session, article }) => (
              <div
                className="topic-record"
                key={`${session.id}-${article.author}`}
              >
                <Link
                  href={`/sessions/${session.id}`}
                  className="round-badge"
                >
                  {session.date.replaceAll("-", ".")} · ROUND{" "}
                  {String(session.id).padStart(2, "0")}
                </Link>
                <ArticleRow
                  article={article}
                  sessionId={session.id}
                  date={session.date}
                />
              </div>
            ))
          ) : (
            <div className="topic-empty-state">
              <span aria-hidden="true">∅</span>
              <h2>아직 이 주제에 담긴 기록이 없어요.</h2>
              <p>새로운 글이 분류되면 이곳에서 만날 수 있습니다.</p>
              <Link className="text-link" href="/#archive">
                전체 아카이브 보기 →
              </Link>
            </div>
          )}
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
