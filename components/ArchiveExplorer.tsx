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
    const readyFrame = window.requestAnimationFrame(() => {
      panelRef.current?.setAttribute("data-hydrated", "true");
    });
    window.addEventListener("popstate", sync);
    return () => {
      window.cancelAnimationFrame(readyFrame);
      window.removeEventListener("popstate", sync);
    };
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
      <div className="filter-panel" role="search" ref={panelRef}>
        <label className="search-field">
          <span className="sr-only">제목 또는 태그 검색</span>
          <i aria-hidden="true">⌕</i>
          <input
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => update("q", event.target.value)}
            placeholder="어떤 배움을 찾고 있나요?"
          />
        </label>
        <label>
          <span>WRITER</span>
          <select
            value={author}
            onChange={(event) => update("author", event.target.value)}
          >
            <option value="">모든 멤버</option>
            {members.map((member) => (
              <option key={member.slug}>{member.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>TOPIC</span>
          <select
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
        <button type="button" onClick={reset} disabled={!active}>
          초기화
        </button>
      </div>
      {activeFilters.length > 0 && (
        <div className="filter-chips" aria-label="적용 중인 검색 조건">
          {activeFilters.map((item) => (
            <button
              type="button"
              className="filter-chip"
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
      <div className="result-summary">
        <span>
          {active
            ? `${count}개의 기록을 찾았습니다`
            : "최근 기록부터 천천히 거슬러 올라가 보세요."}
        </span>
        <span>{String(filtered.length).padStart(2, "0")} SESSIONS</span>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      </div>
      {filtered.length ? (
        <div className="timeline">
          {filtered.map((session) => (
            <article className="session" key={session.id}>
              <div className="session-meta">
                <span className="session-number">
                  {String(session.id).padStart(2, "0")}
                </span>
                <time dateTime={session.date}>
                  {session.date.replaceAll("-", ".")}
                </time>
                <span>{session.type === "on-line" ? "ONLINE" : "OFFLINE"}</span>
                <SessionLink id={session.id} />
              </div>
              <div className="article-list">
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
        <div className="empty-state">
          <span>∅</span>
          <h3>아직 만나는 기록이 없어요.</h3>
          <p>위 조건을 하나씩 지우거나 모든 기록으로 돌아가 보세요.</p>
          <button onClick={reset}>모든 기록 보기</button>
        </div>
      )}
    </>
  );
}
