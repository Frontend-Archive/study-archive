"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ArchiveSession, Member } from "@/lib/archive";
import { normalizeSearch } from "@/lib/search";
import { ArticleRow, SessionLink } from "./ArticleRow";
export function ArchiveExplorer({
  sessions,
  members,
  tags,
}: {
  sessions: ArchiveSession[];
  members: Member[];
  tags: string[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState(() => ({
    query: searchParams.get("q") ?? "",
    author: searchParams.get("author") ?? "",
    tag: searchParams.get("tag") ?? "",
  }));
  const panelRef = useRef<HTMLDivElement>(null);
  const { query, author, tag } = filters;
  useEffect(() => {
    panelRef.current?.setAttribute("data-hydrated", "true");
    const sync = () => {
      const params = new URLSearchParams(window.location.search);
      setFilters({
        query: params.get("q") ?? "",
        author: params.get("author") ?? "",
        tag: params.get("tag") ?? "",
      });
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const update = (key: "q" | "author" | "tag", value: string) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    setFilters((current) => ({
      ...current,
      [key === "q" ? "query" : key]: value,
    }));
    const url = `${pathname}${next.size ? `?${next}` : ""}#archive`;
    if (key === "q") window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  };
  const reset = () => {
    setFilters({ query: "", author: "", tag: "" });
    window.history.pushState(null, "", `${pathname}#archive`);
  };
  const filtered = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    return sessions
      .map((session) => ({
        ...session,
        articles: session.articles.filter((article) => {
          if (author && article.author !== author) return false;
          if (article.status === "pending") return !normalizedQuery && !tag;
          if (tag && !article.tags.includes(tag)) return false;
          return (
            !normalizedQuery ||
            normalizeSearch(
              `${article.title}${article.tags.join("")}`,
            ).includes(normalizedQuery)
          );
        }),
      }))
      .filter((session) => session.articles.length > 0);
  }, [sessions, query, author, tag]);
  const active = Boolean(query || author || tag);
  const count = filtered.reduce(
    (sum, session) => sum + session.articles.length,
    0,
  );
  return (
    <>
      <div className="filter-panel" role="search" ref={panelRef}>
        <label className="search-field">
          <span className="sr-only">제목 또는 태그 검색</span>
          <i aria-hidden="true">⌕</i>
          <input
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
            value={tag}
            onChange={(event) => update("tag", event.target.value)}
          >
            <option value="">모든 주제</option>
            {tags.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={reset} disabled={!active}>
          초기화
        </button>
      </div>
      <div className="result-summary" aria-live="polite">
        <span>
          {active
            ? `${count}개의 기록을 찾았습니다`
            : "최근 기록부터 천천히 거슬러 올라가 보세요."}
        </span>
        <span>{String(filtered.length).padStart(2, "0")} SESSIONS</span>
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
          <p>검색어나 필터를 바꾸고 다시 살펴보세요.</p>
          <button onClick={reset}>모든 기록 보기</button>
        </div>
      )}
    </>
  );
}
