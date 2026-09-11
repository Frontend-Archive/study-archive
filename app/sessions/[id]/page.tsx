import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleRow } from "@/components/ArticleRow";
import {
  ArchivePager,
  DetailSectionLabel,
  PageHero,
} from "@/components/EditorialPrimitives";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDate, getArchiveSessions } from "@/lib/archive";

export async function generateStaticParams() {
  return (await getArchiveSessions()).map((session) => ({
    id: String(session.id),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = (await getArchiveSessions()).find(
    (item) => item.id === Number(id),
  );
  if (!session) return {};

  const description = `${formatDate(session.date)}에 진행한 프론트엔드 스터디 ${session.id}회차 발표 기록`;
  const title = `${session.title} — Frontend Archive`;
  return {
    title,
    description,
    openGraph: { title, description, images: [] },
    twitter: { card: "summary", title, description, images: [] },
  };
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessions = await getArchiveSessions();
  const session = sessions.find((item) => item.id === Number(id));
  if (!session) notFound();

  const previous = sessions.find((item) => item.id === session.id - 1);
  const next = sessions.find((item) => item.id === session.id + 1);

  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-[1280px] px-5 pt-7 pb-20 layout:px-8 layout:pt-8 layout:pb-[120px]">
        <PageHero
          eyebrow="Session archive"
          back={{ href: "/#archive", label: "← 모든 회차" }}
          divider={false}
          title={session.title}
          meta={
            <>
              <span>{formatDate(session.date)}</span>
              <span>
                {session.type === "on-line" ? "온라인" : "오프라인"}
              </span>
            </>
          }
        />
        <section
          className="mt-8 layout:mt-10"
          aria-labelledby="articles-title"
        >
          <DetailSectionLabel
            id="articles-title"
            label="ARTICLES"
            summary={
              <>
              {
                session.articles.filter(
                  (article) => article.status === "published",
                ).length
              }{" "}
              / {session.articles.length}
              </>
            }
          />
          {session.articles.map((article) => (
            <ArticleRow
              key={article.author}
              article={article}
              sessionId={session.id}
              date={session.date}
              variant="detail"
            />
          ))}
        </section>
        <ArchivePager
          previous={
            previous
              ? {
                  href: `/sessions/${previous.id}`,
                  eyebrow: "PREVIOUS",
                  label: `← ${previous.id}회차`,
                }
              : undefined
          }
          next={
            next
              ? {
                  href: `/sessions/${next.id}`,
                  eyebrow: "NEXT",
                  label: `${next.id}회차 →`,
                }
              : undefined
          }
        />
      </article>
      <SiteFooter />
    </main>
  );
}
