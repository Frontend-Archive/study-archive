"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ArchiveSession, Member } from "@/lib/archive";
import {
  filterArchiveSessions,
  parseTopicFilter,
  type ArchiveFilters,
} from "@/lib/search";
import type { Topic } from "@/lib/topics";
import { ArticleRow, SessionLink } from "./ArticleRow";

/**
 * 서버 컴포넌트가 빌드 시 수집한 전체 sessions를 넘기고, 이 컴포넌트는 추가
 * 네트워크 요청 없이 브라우저에서 검색한다. URL은 공유·새로고침·뒤로가기를
 * 위한 영속 상태이고 React state는 즉시 렌더링하기 위한 로컬 사본이다.
 */
export function ArchiveExplorer({
  sessions,
  members,
  topics,
}: {
  sessions: ArchiveSession[];
  members: Member[];
  topics: readonly Topic[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState(() => ({
    query: searchParams.get("q") ?? "",
    author: searchParams.get("author") ?? "",
    tag: searchParams.get("tag") ?? "",
    topic: parseTopicFilter(searchParams.get("topic")),
  }));
  const [announcement, setAnnouncement] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const { query, author, tag, topic } = filters;
  // 라우터가 들고 있는 검색 조건. 태그 링크처럼 Link로 들어온 이동은
  // popstate를 발생시키지 않으므로, 이 값이 바뀔 때마다 다시 맞춰야 한다.
  // 이것이 없으면 홈에서 태그를 눌렀을 때 주소만 바뀌고 목록은 그대로였다.
  const routerSearch = searchParams.toString();
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams(window.location.search);
      setFilters({
        query: params.get("q") ?? "",
        author: params.get("author") ?? "",
        tag: params.get("tag") ?? "",
        topic: parseTopicFilter(params.get("topic")),
      });
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [routerSearch]);
  useEffect(() => {
    const readyFrame = window.requestAnimationFrame(() => {
      panelRef.current?.setAttribute("data-hydrated", "true");
    });
    return () => window.cancelAnimationFrame(readyFrame);
  }, []);
  const update = (
    key: "q" | "author" | "tag" | "topic",
    value: string,
  ) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    setFilters((current) => ({
      ...current,
      [key === "q" ? "query" : key]:
        key === "topic" ? parseTopicFilter(value) : value,
    }) as ArchiveFilters);
    const url = `${pathname}${next.size ? `?${next}` : ""}#archive`;

    // 매 글자마다 방문 기록을 만들지 않도록 검색어는 replace한다. 명시적인
    // 필터 선택은 사용자가 뒤로가기로 되돌릴 수 있도록 push한다.
    if (key === "q") window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  };
  const reset = () => {
    setFilters({ query: "", author: "", tag: "", topic: "" });
    window.history.pushState(null, "", `${pathname}#archive`);
  };
  const filtered = useMemo(
    () => filterArchiveSessions(sessions, filters),
    [sessions, filters],
  );
  const active = Boolean(query || author || tag || topic);
  const count = filtered.reduce(
    (sum, session) => sum + session.articles.length,
    0,
  );
  const activeFilters = [
    query ? { key: "q" as const, label: `검색 “${query}”` } : null,
    author ? { key: "author" as const, label: `작성자 ${author}` } : null,
    tag ? { key: "tag" as const, label: `태그 #${tag}` } : null,
    topic
      ? {
          key: "topic" as const,
          label: `주제 ${topics.find((item) => item.slug === topic)?.label ?? topic}`,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncement(
        active ? `검색 결과 ${count}개입니다.` : "모든 기록을 표시합니다.",
      );
    }, 300);
    return () => window.clearTimeout(timer);
  }, [active, count]);
  return (
    <>
      <div
        className="grid grid-cols-1 gap-3 pt-6 pb-7 layout:grid-cols-2 layout:pt-7 wide:grid-cols-[minmax(280px,1fr)_180px_180px_auto]"
        role="search"
        ref={panelRef}
      >
        <label className="relative flex items-center border-b border-dark-control layout:col-[1/-1] wide:col-auto">
          <span className="sr-only">제목 또는 태그 검색</span>
          <i
            className="font-numeral text-[28px] leading-none font-normal text-accent-soft not-italic"
            aria-hidden="true"
          >
            ⌕
          </i>
          <input
            className="w-full rounded-none border-0 bg-transparent py-[10px] pr-1 pl-3 text-paper"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => update("q", event.target.value)}
            placeholder="어떤 배움을 찾고 있나요?"
          />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className="font-label text-[9px] leading-none font-bold tracking-[0.12em] text-dark-label">
            WRITER
          </span>
          <select
            className="w-full cursor-pointer rounded-none border-0 border-b border-dark-control bg-transparent px-1 py-[10px] text-paper [&>option]:bg-paper [&>option]:text-ink"
            value={author}
            onChange={(event) => update("author", event.target.value)}
          >
            <option value="">모든 멤버</option>
            {members.map((member) => (
              <option key={member.slug}>{member.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className="font-label text-[9px] leading-none font-bold tracking-[0.12em] text-dark-label">
            TOPIC
          </span>
          <select
            className="w-full cursor-pointer rounded-none border-0 border-b border-dark-control bg-transparent px-1 py-[10px] text-paper [&>option]:bg-paper [&>option]:text-ink"
            value={topic}
            onChange={(event) => update("topic", event.target.value)}
          >
            <option value="">모든 주제</option>
            {topics.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="min-h-10 cursor-pointer self-end justify-self-stretch border border-dark-control bg-transparent px-[17px] text-paper disabled:cursor-not-allowed disabled:opacity-35 layout:justify-self-end wide:justify-self-stretch"
          type="button"
          onClick={reset}
          disabled={!active}
        >
          초기화
        </button>
      </div>
      {activeFilters.length > 0 && (
        <div
          className="flex flex-wrap gap-2 pt-4 layout:pt-[18px]"
          aria-label="적용 중인 검색 조건"
        >
          {activeFilters.map((item) => (
            <button
              type="button"
              className="inline-flex min-h-[34px] cursor-pointer items-center gap-[10px] rounded-full border border-dark-control bg-transparent px-[11px] text-[11px] text-paper hover:border-accent-soft hover:text-accent-soft"
              key={item.key}
              onClick={() => update(item.key, "")}
              aria-label={`${item.label} 조건 제거`}
            >
              <span>{item.label}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-between pt-6 text-[12px] text-dark-muted">
        {active && <span>{count}개의 기록을 찾았습니다</span>}
        <span className="ml-auto">
          {String(filtered.length).padStart(2, "0")} SESSIONS
        </span>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      </div>
      {filtered.length ? (
        <div>
          {filtered.map((session) => (
            <article
              className="grid grid-cols-1 gap-7 border-b border-dark-line py-[46px] layout:grid-cols-[220px_1fr] layout:gap-0"
              key={session.id}
            >
              <div className="grid grid-cols-[auto_1fr_auto] items-end gap-[10px] font-label text-[11px] leading-[1.2] tracking-[0.09em] text-dark-muted layout:flex layout:flex-col layout:items-start">
                <span className="font-numeral text-[52px] leading-none italic text-paper layout:mb-[18px]">
                  {String(session.id).padStart(2, "0")}
                </span>
                <time dateTime={session.date}>
                  {session.date.replaceAll("-", ".")}
                </time>
                <span>{session.type === "on-line" ? "ONLINE" : "OFFLINE"}</span>
                <SessionLink id={session.id} />
              </div>
              <div>
                {session.articles.map((article) => (
                  <ArticleRow
                    key={article.author}
                    article={article}
                    sessionId={session.id}
                    date={session.date}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-b border-dark-line px-5 py-[100px] text-center">
          <span className="font-numeral text-[56px] leading-none italic text-accent-soft">
            ∅
          </span>
          <h3 className="mt-[22px] mb-[10px] font-editorial text-[26px] leading-[1.3] font-medium">
            아직 만나는 기록이 없어요.
          </h3>
          <p className="text-dark-muted">
            위 조건을 하나씩 지우거나 모든 기록으로 돌아가 보세요.
          </p>
          <button
            className="mt-5 min-h-10 cursor-pointer self-end border border-dark-control bg-transparent px-[17px] text-paper"
            onClick={reset}
          >
            모든 기록 보기
          </button>
        </div>
      )}
    </>
  );
}
