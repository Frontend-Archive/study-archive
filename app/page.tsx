import Link from "next/link";
import { ArchiveExplorer } from "@/components/ArchiveExplorer";
import {
  Eyebrow,
  HeroAction,
  PageTitle,
  SectionHeading,
} from "@/components/EditorialPrimitives";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArchiveSessions, MEMBERS } from "@/lib/archive";
import { TOPICS } from "@/lib/topics";

export const dynamic = "force-static";

export default async function Home() {
  const sessions = await getArchiveSessions();
  const published = sessions
    .flatMap((session) => session.articles)
    .filter((article) => article.status === "published");

  return (
    <main>
      <SiteHeader />
      <section
        className="mx-auto max-w-[1280px] px-5 pt-8 pb-9 layout:px-8 layout:pt-10 layout:pb-10"
        id="top"
      >
        <Eyebrow>Frontend study · Since 2026</Eyebrow>
        <PageTitle variant="home" className="mt-4 mb-5 max-w-[1000px]">
          Frontend <span className="text-accent not-italic">Archive</span>
        </PageTitle>
        <p className="m-0 max-w-[600px] break-keep text-[16px] leading-[1.7]">
          네 명의 프론트엔드 개발자가 매달 공유한 발표와 글을
          회차·멤버·주제별로 모았습니다.
        </p>
        <div
          className="mt-6 flex max-w-[600px] flex-wrap gap-3"
          aria-label="빠른 탐색"
        >
          <HeroAction href="#archive" variant="solid">
            최신 기록 보기 <span aria-hidden="true">↓</span>
          </HeroAction>
          <HeroAction href="/feed.xml">
            RSS 구독 <span aria-hidden="true">↗</span>
          </HeroAction>
        </div>
        <div
          className="mt-8 flex max-w-[600px] flex-wrap gap-x-10 gap-y-3 border-t border-ink pt-4 layout:mt-10"
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
              <strong className="font-numeral text-[clamp(28px,3vw,44px)] leading-none font-medium">
                {value}
              </strong>
              <span className="mt-1 block text-[11px] tracking-[0.08em] text-muted uppercase layout:mt-0">
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
