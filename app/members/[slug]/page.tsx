import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleRow } from "@/components/ArticleRow";
import {
  ArchivePager,
  DetailSectionLabel,
  Eyebrow,
  PageHero,
  RoundBadge,
} from "@/components/EditorialPrimitives";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArchiveSessions, getMember, MEMBERS } from "@/lib/archive";
import { getMemberArchiveSummary } from "@/lib/members";

export function generateStaticParams() {
  return MEMBERS.map((member) => ({ slug: member.slug }));
}

function formatMonth(value: string) {
  return value.slice(0, 7).replace("-", ".");
}

function getActivityPeriod(
  firstPublishedDate: string | null,
  latestPublishedDate: string | null,
) {
  if (!firstPublishedDate || !latestPublishedDate) return "기록 전";
  const firstMonth = formatMonth(firstPublishedDate);
  const latestMonth = formatMonth(latestPublishedDate);
  return firstMonth === latestMonth
    ? firstMonth
    : `${firstMonth}—${latestMonth}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const member = getMember((await params).slug);
  if (!member) return {};

  const sessions = await getArchiveSessions();
  const summary = getMemberArchiveSummary(sessions, member);
  const title = `${member.name}의 기록 — Frontend Archive`;
  const description = `${member.name}님이 ${summary.records.length}번의 만남에서 남긴 ${summary.publishedCount}개의 프론트엔드 학습 기록`;

  return {
    title,
    description,
    openGraph: { title, description, images: [] },
    twitter: { card: "summary", title, description, images: [] },
  };
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const member = getMember((await params).slug);
  if (!member) notFound();

  const sessions = await getArchiveSessions();
  const summary = getMemberArchiveSummary(sessions, member);
  const memberIndex = MEMBERS.findIndex((item) => item.slug === member.slug);
  const previousMember = MEMBERS[memberIndex - 1];
  const nextMember = MEMBERS[memberIndex + 1];
  const activityPeriod = getActivityPeriod(
    summary.firstPublishedDate,
    summary.latestPublishedDate,
  );
  const latestInterest =
    summary.latestTopics.map((topic) => topic.label).join(" · ") || "기록 전";
  const memberDescription = summary.publishedCount
    ? `전체 ${summary.records.length}회차 중 ${summary.publishedCount}개의 글을 게시했습니다. 활동 기간은 ${activityPeriod}입니다.`
    : `전체 ${summary.records.length}회차 중 아직 게시된 글이 없습니다.`;

  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-[1280px] px-5 pt-7 pb-20 layout:px-8 layout:pt-8 layout:pb-[120px]">
        <PageHero
          eyebrow="Member trajectory"
          back={{ href: "/#members", label: "← 모든 멤버" }}
          index={String(memberIndex + 1).padStart(2, "0")}
          title={
            <>
              <span className="text-accent not-italic">{member.name}</span>의 기록
            </>
          }
          description={memberDescription}
        />

        <section
          className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-ink py-3 text-[12px] layout:py-[14px]"
          aria-label="멤버 활동 요약"
        >
          <span className="flex items-baseline gap-2">
            <span className="text-muted">게시 기록</span>
            <strong className="font-numeral text-[15px] font-medium">
              {String(summary.publishedCount).padStart(2, "0")}
            </strong>
          </span>
          <span className="flex items-baseline gap-2">
            <span className="text-muted">최근 관심사</span>
            <strong className="font-medium text-accent">{latestInterest}</strong>
          </span>
          <span className="flex items-baseline gap-2">
            <span className="text-muted">활동 기간</span>
            <strong className="font-numeral text-[15px] font-medium text-accent">
              {activityPeriod}
            </strong>
          </span>
        </section>

        <section
          className="grid grid-cols-1 gap-12 pt-8 pb-5 layout:grid-cols-[minmax(210px,0.7fr)_minmax(0,1.3fr)] layout:gap-[6vw] layout:pt-10 wide:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.25fr)] wide:gap-[9vw]"
          aria-labelledby="member-topics-title"
        >
          <div>
            <Eyebrow>Topic footprint</Eyebrow>
            <h2
              className="mt-[13px] mb-6 max-w-[380px] break-keep font-editorial text-[26px] leading-[1.08] font-semibold tracking-[-0.055em] layout:text-[clamp(26px,2.6vw,36px)]"
              id="member-topics-title"
            >
              관심사가 남긴 흔적
            </h2>
            <p className="m-0 max-w-[390px] break-keep text-sm leading-[1.75] text-muted">
              기록에 등장한 관심사를 최근 순서로 엮었습니다. 주제를 선택하면
              이 멤버의 관련 기록만 모아볼 수 있습니다.
            </p>
          </div>

          {summary.topics.length > 0 ? (
            <ol className="m-0 list-none border-b border-ink p-0">
              {summary.topics.map(({ topic }) => (
                <li className="border-t border-ink" key={topic.slug}>
                  <Link
                    className="group grid min-h-[78px] grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-x-[14px] py-[18px] layout:grid-cols-[minmax(0,1fr)_auto_22px] layout:py-[19px]"
                    href={`/?author=${encodeURIComponent(member.name)}&topic=${topic.slug}#archive`}
                    aria-label={`${topic.label} 관련 기록 보기`}
                  >
                    <strong className="font-editorial text-xl leading-[1.35] font-medium transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-accent motion-reduce:transition-none">
                      {topic.label}
                    </strong>
                    <span className="font-label text-[9px] leading-none tracking-[0.08em] text-muted layout:text-[10px]">
                      관련 기록 보기
                    </span>
                    <span
                      className="justify-self-end font-numeral text-xl leading-none text-accent transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex min-h-[210px] flex-col items-center justify-center border-y border-ink text-center">
              <span
                className="font-numeral text-5xl leading-none italic text-accent"
                aria-hidden="true"
              >
                ∅
              </span>
              <p className="mt-[18px] text-muted">
                첫 기록이 게시되면 관심사의 흐름이 이곳에 나타납니다.
              </p>
            </div>
          )}
        </section>

        <section
          className="mt-[76px] layout:mt-[100px]"
          aria-labelledby="member-log-title"
        >
          <DetailSectionLabel
            id="member-log-title"
            label="LEARNING LOG"
            summary={`${String(summary.publishedCount).padStart(2, "0")} / ${String(summary.records.length).padStart(2, "0")} PUBLISHED`}
          />
          {summary.records.map(({ session, article }) => (
            <div
              className="relative"
              data-testid="member-record"
              key={session.id}
            >
              <RoundBadge href={`/sessions/${session.id}`}>
                ROUND {String(session.id).padStart(2, "0")}
              </RoundBadge>
              <ArticleRow
                article={article}
                sessionId={session.id}
                date={session.date}
                showDate
                variant="detail"
                className="layout:pr-[140px]"
              />
            </div>
          ))}
        </section>

        <ArchivePager
          variant="member"
          previous={
            previousMember
              ? {
                  href: `/members/${previousMember.slug}`,
                  eyebrow: "PREVIOUS MEMBER",
                  label: `← ${previousMember.name}`,
                  ariaLabel: `이전 멤버 ${previousMember.name}`,
                }
              : undefined
          }
          next={
            nextMember
              ? {
                  href: `/members/${nextMember.slug}`,
                  eyebrow: "NEXT MEMBER",
                  label: `${nextMember.name} →`,
                  ariaLabel: `다음 멤버 ${nextMember.name}`,
                }
              : undefined
          }
        />
      </article>
      <SiteFooter />
    </main>
  );
}
