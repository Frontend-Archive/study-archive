import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleRow } from "@/components/ArticleRow";
import {
  DetailSectionLabel,
  Eyebrow,
  PageTitle,
  RoundBadge,
} from "@/components/EditorialPrimitives";
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
      <article className="mx-auto max-w-[1280px] px-5 pt-[52px] pb-20 layout:px-8 layout:pt-[68px] layout:pb-[120px]">
        <Link
          className="mb-12 inline-block border-b border-current pb-1 text-[12px]"
          href="/#archive"
        >
          ← 모든 기록
        </Link>
        <header className="border-b border-ink py-6 pb-[52px] layout:py-8 layout:pb-16">
          <Eyebrow>Topic archive</Eyebrow>
          <PageTitle className="mt-6 mb-7 max-w-[980px] layout:mt-[18px]">
            <span className="text-accent not-italic">{topic.label}</span> 기록
          </PageTitle>
          <p className="ml-0 max-w-[500px] leading-[1.7] text-muted layout:ml-auto">
            {topic.description}
          </p>
        </header>
        <section
          className="mt-[52px] layout:mt-[70px]"
          aria-labelledby="topic-records-title"
        >
          <DetailSectionLabel
            id="topic-records-title"
            label="TOPIC RECORDS"
            summary={`${String(records.length).padStart(2, "0")} ARTICLES`}
          />
          {records.length > 0 ? (
            records.map(({ session, article }) => (
              <div className="relative" key={`${session.id}-${article.author}`}>
                <RoundBadge href={`/sessions/${session.id}`}>
                  {session.date.replaceAll("-", ".")} · ROUND{" "}
                  {String(session.id).padStart(2, "0")}
                </RoundBadge>
                <ArticleRow
                  article={article}
                  sessionId={session.id}
                  date={session.date}
                  variant="detail"
                  className="layout:pr-[220px]"
                />
              </div>
            ))
          ) : (
            <div className="border-b border-line px-5 py-[90px] text-center">
              <span
                className="font-numeral text-[56px] leading-none italic text-accent"
                aria-hidden="true"
              >
                ∅
              </span>
              <h2 className="mt-[22px] mb-[10px] font-editorial text-[26px] leading-[1.3] font-medium">
                아직 이 주제에 담긴 기록이 없어요.
              </h2>
              <p className="text-muted">
                새로운 글이 분류되면 이곳에서 만날 수 있습니다.
              </p>
              <Link
                className="mt-7 inline-block border-b border-current pb-1 text-[12px]"
                href="/#archive"
              >
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
