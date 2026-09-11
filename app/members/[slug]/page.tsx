import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleRow } from "@/components/ArticleRow";
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
      <article className="detail-page member-page">
        <Link className="back-link" href="/#members">
          ← 모든 멤버
        </Link>

        <header className="member-hero">
          <div className="member-hero-index">
            <p className="eyebrow">Member trajectory</p>
            <span aria-hidden="true">
              {String(memberIndex + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="member-hero-content">
            <h1 className="page-title">
              <span className="title-accent">{member.name}</span>의 기록
            </h1>
            <p>{memberDescription}</p>
          </div>
        </header>

        <section className="member-summary" aria-label="멤버 활동 요약">
          <div>
            <span>Published records</span>
            <strong>{String(summary.publishedCount).padStart(2, "0")}</strong>
            <p>게시 기록</p>
          </div>
          <div>
            <span>Latest interest</span>
            <strong className="member-latest-interest">{latestInterest}</strong>
            <p>최근 관심사</p>
          </div>
          <div>
            <span>Active period</span>
            <strong className="member-period">{activityPeriod}</strong>
            <p>활동 기간</p>
          </div>
        </section>

        <section className="member-topics" aria-labelledby="member-topics-title">
          <div className="member-topics-intro">
            <p className="eyebrow">Topic footprint</p>
            <h2 id="member-topics-title">관심사가 남긴 흔적</h2>
            <p>
              기록에 등장한 관심사를 최근 순서로 엮었습니다. 주제를 선택하면
              이 멤버의 관련 기록만 모아볼 수 있습니다.
            </p>
          </div>

          {summary.topics.length > 0 ? (
            <ol className="member-topic-list">
              {summary.topics.map(({ topic }) => (
                <li key={topic.slug}>
                  <Link
                    className="member-topic-link"
                    href={`/?author=${encodeURIComponent(member.name)}&topic=${topic.slug}#archive`}
                    aria-label={`${topic.label} 관련 기록 보기`}
                  >
                    <strong>{topic.label}</strong>
                    <span className="member-topic-action">관련 기록 보기</span>
                    <span className="member-topic-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="member-topic-empty">
              <span aria-hidden="true">∅</span>
              <p>첫 기록이 게시되면 관심사의 흐름이 이곳에 나타납니다.</p>
            </div>
          )}
        </section>

        <section
          className="detail-list member-log"
          aria-labelledby="member-log-title"
        >
          <div className="detail-section-label">
            <span id="member-log-title">LEARNING LOG</span>
            <span>
              {String(summary.publishedCount).padStart(2, "0")} /{" "}
              {String(summary.records.length).padStart(2, "0")} PUBLISHED
            </span>
          </div>
          {summary.records.map(({ session, article }) => (
            <div className="member-record" key={session.id}>
              <Link href={`/sessions/${session.id}`} className="round-badge">
                ROUND {String(session.id).padStart(2, "0")}
              </Link>
              <ArticleRow
                article={article}
                sessionId={session.id}
                date={session.date}
                showDate
              />
            </div>
          ))}
        </section>

        <nav className="pager member-pager" aria-label="멤버 이동">
          {previousMember ? (
            <Link
              href={`/members/${previousMember.slug}`}
              aria-label={`이전 멤버 ${previousMember.name}`}
            >
              <span>PREVIOUS MEMBER</span>
              <strong>← {previousMember.name}</strong>
            </Link>
          ) : (
            <span />
          )}
          {nextMember && (
            <Link
              href={`/members/${nextMember.slug}`}
              aria-label={`다음 멤버 ${nextMember.name}`}
            >
              <span>NEXT MEMBER</span>
              <strong>{nextMember.name} →</strong>
            </Link>
          )}
        </nav>
      </article>
      <SiteFooter />
    </main>
  );
}
