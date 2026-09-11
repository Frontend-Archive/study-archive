import Link from "next/link";
import { ArchiveExplorer } from "@/components/ArchiveExplorer";
import {
  Eyebrow,
  PageTitle,
  SectionHeading,
} from "@/components/EditorialPrimitives";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArchiveSessions, MEMBERS } from "@/lib/archive";
import { TOPICS } from "@/lib/topics";

export const dynamic = "force-static";

const heroActionClassName =
  "inline-flex min-w-[170px] items-center justify-between gap-6 border border-ink px-[15px] py-[13px] text-[11px] tracking-[0.04em] transition-[background,color] duration-200 hover:bg-ink hover:text-paper motion-reduce:transition-none";

export default async function Home() {
  const sessions = await getArchiveSessions();
  const published = sessions
    .flatMap((session) => session.articles)
    .filter((article) => article.status === "published");

  return (
    <main>
      <SiteHeader />
      <section
        className="mx-auto max-w-[1280px] px-5 pt-14 pb-12 layout:px-8 layout:pt-[84px] layout:pb-16"
        id="top"
      >
        <Eyebrow>Frontend study · Since 2026</Eyebrow>
        <PageTitle
          variant="home"
          className="mt-[18px] mb-7 max-w-[1000px]"
        >
          Frontend <span className="text-accent not-italic">Archive</span>
        </PageTitle>
        <p className="m-0 max-w-[520px] break-keep text-[17px] leading-[1.75] layout:ml-auto">
          네 명의 프론트엔드 개발자가 매달 공유한 발표와 글을
          회차·멤버·주제별로 모았습니다.
        </p>
        <div
          className="mt-7 flex max-w-[520px] flex-wrap gap-3 layout:ml-auto"
          aria-label="빠른 탐색"
        >
          <a
            className={`${heroActionClassName} bg-ink text-paper`}
            href="#archive"
          >
            최신 기록 보기 <span aria-hidden="true">↓</span>
          </a>
          <a className={heroActionClassName} href="/feed.xml">
            RSS 구독 <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div
          className="mt-12 grid grid-cols-3 border-t border-ink pt-5 layout:mt-16"
          aria-label="아카이브 현황"
        >
          {[
            [String(sessions.length).padStart(2, "0"), "Sessions"],
            [String(published.length).padStart(2, "0"), "Articles"],
            [String(MEMBERS.length).padStart(2, "0"), "Members"],
          ].map(([value, label]) => (
            <div
              className="block layout:flex layout:items-baseline layout:gap-[14px]"
              key={label}
            >
              <strong className="font-numeral text-[clamp(36px,5vw,70px)] leading-none font-medium">
                {value}
              </strong>
              <span className="mt-2 block text-[11px] tracking-[0.08em] text-muted uppercase layout:mt-0">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="bg-ink px-5 py-[68px] text-paper layout:px-[max(32px,calc((100vw-1216px)/2))] layout:py-24"
        id="archive"
      >
        <SectionHeading
          eyebrow="The ongoing record"
          title="회차별 아카이브"
          description={
            <>
              제목과 태그, 사람을 따라
              <br />
              우리의 배움을 발견하세요.
            </>
          }
          tone="dark"
        />
        <ArchiveExplorer
          sessions={sessions}
          members={MEMBERS}
          topics={TOPICS}
        />
      </section>

      <section
        className="mx-auto max-w-[1280px] px-5 pt-[76px] pb-[90px] layout:px-8 layout:pt-[104px] layout:pb-[120px]"
        id="members"
      >
        <SectionHeading
          eyebrow="Four perspectives"
          title="함께 쌓는 사람들"
          description="같은 주제도 서로 다른 질문에서 시작됩니다."
          tone="light"
        />
        <div className="grid grid-cols-1 layout:grid-cols-2 wide:grid-cols-4">
          {MEMBERS.map((member, index) => {
            const count = sessions
              .flatMap((session) => session.articles)
              .filter(
                (article) =>
                  article.author === member.name &&
                  article.status === "published",
              ).length;
            const tabletBorders =
              index === 2
                ? "layout:border-t layout:border-l wide:border-t-0 wide:border-l-0"
                : index === 3
                  ? "border-t wide:border-t-0"
                  : "";

            return (
              <Link
                href={`/members/${member.slug}`}
                className={`group relative min-h-[190px] border-b border-line px-5 py-[26px] transition-[background,color] duration-200 hover:bg-accent hover:text-white motion-reduce:transition-none layout:min-h-[260px] layout:border-r layout:border-b-0 layout:first:border-l ${tabletBorders}`}
                key={member.slug}
              >
                <span className="font-label text-[11px] leading-none">
                  0{index + 1}
                </span>
                <h3 className="mt-[45px] mb-2 font-editorial text-[28px] leading-[1.2] font-semibold layout:mt-[72px]">
                  {member.name}
                </h3>
                <p className="text-[12px] text-muted group-hover:text-accent-pale">
                  {count}개의 기록
                </p>
                <i
                  className="absolute right-5 bottom-6 font-numeral text-2xl leading-none font-normal not-italic"
                  aria-hidden="true"
                >
                  →
                </i>
              </Link>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
