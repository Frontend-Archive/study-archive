import type { ArchiveSession } from "./archive";
import { getTopicsForTags, isTopicSlug, type TopicSlug } from "./topics";

export type ArchiveFilters = {
  query: string;
  author: string;
  tag: string;
  topic: TopicSlug | "";
};

export function normalizeSearch(value: string) {
  return value.toLocaleLowerCase("ko-KR").replace(/\s+/g, "");
}

export function parseTopicFilter(value: string | null): TopicSlug | "" {
  return value && isTopicSlug(value) ? value : "";
}

export function filterArchiveSessions(
  sessions: ArchiveSession[],
  filters: ArchiveFilters,
): ArchiveSession[] {
  const normalizedQuery = normalizeSearch(filters.query);
  return sessions
    .map((session) => ({
      ...session,
      articles: session.articles.filter((article) => {
        if (filters.author && article.author !== filters.author) return false;
        if (article.status === "pending") {
          return !normalizedQuery && !filters.tag && !filters.topic;
        }
        if (filters.tag && !article.tags.includes(filters.tag)) return false;
        if (
          filters.topic &&
          !getTopicsForTags(article.tags).some(
            (topic) => topic.slug === filters.topic,
          )
        ) {
          return false;
        }
        return (
          !normalizedQuery ||
          normalizeSearch(`${article.title}${article.tags.join("")}`).includes(
            normalizedQuery,
          )
        );
      }),
    }))
    .filter((session) => session.articles.length > 0);
}
