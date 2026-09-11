import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleRow } from "@/components/ArticleRow";
import {
  ArchivePager,
  DetailSectionLabel,
  Eyebrow,
  PageTitle,
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
      <article className="mx-auto max-w-[1280px] px-5 pt-[52px] pb-20 layout:px-8 layout:pt-[68px] layout:pb-[120px]">
        <Link
          className="mb-12 inline-block border-b border-current pb-1 text-[12px]"
          href="/#archive"
        >
          ← 모든 회차
        </Link>
        <header className="grid min-h-0 grid-cols-1 items-end gap-[30px] border-b border-ink pb-9 layout:min-h-[220px] layout:grid-cols-2 layout:gap-0 wide:grid-cols-[1fr_2fr]">
          <div>
            <Eyebrow className="mt-[18px]" tone="muted">
              Session archive
            </Eyebrow>
            <span
              className="mt-5 block font-numeral text-[56px] leading-[0.85] font-medium tracking-[-0.055em] text-accent layout:text-[clamp(64px,8vw,88px)]"
              aria-hidden="true"
            >
              {String(session.id).padStart(2, "0")}
            </span>
          </div>
          <div>
            <PageTitle className="m-0 max-w-[1000px]">
              {session.title}
            </PageTitle>
            <p className="mt-[18px] text-muted">
              {formatDate(session.date)} ·{" "}
              {session.type === "on-line" ? "온라인" : "오프라인"}
            </p>
          </div>
        </header>
        <section
          className="mt-[52px] layout:mt-[70px]"
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
