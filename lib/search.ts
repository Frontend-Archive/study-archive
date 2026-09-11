import type { ArchiveSession } from "./archive";
import { getTopicsForTags, isTopicSlug, type TopicSlug } from "./topics";

/**
 * 검색은 서버 API가 아니라 브라우저에 전달된 세션 배열에서 수행한다.
 * 이 파일을 React와 분리된 순수 함수로 유지해 필터 규칙을 단위 테스트하고,
 * 데이터 규모가 커질 경우 같은 계약을 서버 검색으로 옮기기 쉽게 한다.
 */

export type ArchiveFilters = {
  query: string;
  author: string;
  tag: string;
  topic: TopicSlug | "";
};

export function normalizeSearch(value: string) {
  // "React Compiler"와 "reactcompiler"를 같은 검색어로 취급한다.
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

  // 원본 sessions를 변경하지 않고 회차별 articles만 새 배열로 좁힌다. 마지막
  // filter는 일치하는 글이 하나도 남지 않은 빈 회차를 결과에서 제거한다.
  return sessions
    .map((session) => ({
      ...session,
      articles: session.articles.filter((article) => {
        // 모든 활성 조건은 AND다. 앞 단계에서 탈락시키고 마지막에 텍스트 검색을
        // 적용하면 각 조건의 책임과 pending 예외가 분명해진다.
        if (filters.author && article.author !== filters.author) return false;
        if (article.status === "pending") {
          // 작성자 탐색에서는 미작성 이력도 의미가 있지만 제목·태그·주제로는
          // 검색할 내용이 없으므로 다른 조건이 켜지면 제외한다.
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
