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
import { ALL_TOPICS, getTopicsForTags, TOPICS } from "@/lib/topics";

export const dynamic = "force-static";

export default async function Home() {
  // 서버 컴포넌트가 빌드 시 GitHub 원본을 검증·정규화한다. 아래에서 같은
  // sessions를 통계 계산과 클라이언트 검색 양쪽에 전달하므로 별도 API가 없다.
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
        <div className="grid grid-cols-1 gap-7 layout:grid-cols-[minmax(0,1fr)_auto] layout:items-end layout:gap-10">
          <div>
            <Eyebrow>Frontend study · Since 2026</Eyebrow>
            <PageTitle variant="home" className="mt-4 mb-5 max-w-[1000px]">
              Frontend <span className="text-accent not-italic">Archive</span>
            </PageTitle>
            <p className="m-0 max-w-[600px] break-keep text-[16px] leading-[1.7]">
              네 명의 프론트엔드 개발자가 매달 공유한 발표와 글을
              회차·멤버·주제별로 모았습니다.
            </p>
          </div>
          <div
            className="flex max-w-[600px] flex-wrap gap-x-10 gap-y-3 layout:flex-col layout:flex-nowrap layout:items-end layout:gap-y-4"
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
        </div>
      </section>

      <section
        className="bg-ink px-5 py-[68px] text-paper layout:px-[max(32px,calc((100vw-1216px)/2))] layout:py-24"
        id="archive"
      >
        <SectionHeading
          title="회차별 아카이브"
          action={
            <a
              className="inline-flex shrink-0 items-center gap-2 border-b border-dark-control pb-1 text-[11px] tracking-[0.04em] text-paper hover:border-accent-soft hover:text-accent-soft"
              href="/feed.xml"
            >
              RSS 구독 <span aria-hidden="true">↗</span>
            </a>
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
        id="topics"
      >
        <SectionHeading
          eyebrow="Browse by topic"
          title="주제로 읽기"
          description="관심 있는 흐름을 골라 기록을 모아 보세요."
          tone="light"
        />
        <ol className="m-0 grid list-none grid-cols-1 gap-x-[6vw] p-0 layout:grid-cols-2">
          {ALL_TOPICS.map((topic) => {
            const count = sessions
              .flatMap((session) => session.articles)
              .filter(
                (article) =>
                  article.status === "published" &&
                  getTopicsForTags(article.tags).some(
                    (item) => item.slug === topic.slug,
                  ),
              ).length;

            return (
              <li className="border-b border-line" key={topic.slug}>
                <Link
                  className="group grid grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-x-4 py-[18px]"
                  href={`/topics/${topic.slug}`}
                >
                  <strong className="font-editorial text-lg leading-[1.35] font-medium decoration-1 underline-offset-[5px] transition-colors duration-150 group-hover:text-accent group-hover:underline motion-reduce:transition-none">
                    {topic.label}
                  </strong>
                  <span className="text-[11px] text-muted">
                    {String(count).padStart(2, "0")}개의 기록
                  </span>
                  <span
                    className="justify-self-end font-numeral text-lg leading-none text-muted transition-colors duration-150 group-hover:text-accent motion-reduce:transition-none"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        className="mx-auto max-w-[1280px] px-5 pb-[90px] layout:px-8 layout:pb-[120px]"
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
