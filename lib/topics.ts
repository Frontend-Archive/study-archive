import type { ArchiveSession, PublishedArticle } from "./archive";

export type TopicSlug =
  | "web-language"
  | "react-framework"
  | "architecture-patterns"
  | "performance-reliability"
  | "product-ux"
  | "tooling-ai"
  | "other";

export type Topic = {
  slug: TopicSlug;
  label: string;
  description: string;
  tags: readonly string[];
};

export const TOPICS: readonly Topic[] = [
  {
    slug: "web-language",
    label: "웹·언어",
    description: "웹 플랫폼과 JavaScript, TypeScript, CSS의 동작 원리를 탐구한 기록",
    tags: ["JS", "TS", "CSS", "CS", "Websocket", "i18n"],
  },
  {
    slug: "react-framework",
    label: "React·프레임워크",
    description: "React 생태계와 프론트엔드 프레임워크를 깊이 살펴본 기록",
    tags: [
      "React",
      "Next.js",
      "TanStack Query",
      "useQuery",
      "Context API",
      "Compound 패턴",
    ],
  },
  {
    slug: "architecture-patterns",
    label: "아키텍처·패턴",
    description: "유지 가능한 구조와 설계 패턴을 고민한 기록",
    tags: [
      "디자인패턴",
      "FSD",
      "라우팅 설계",
      "SDK 설계",
      "피처 플래그",
      "프록시 패턴",
      "아키텍처",
      "계층형 아키텍처",
      "팩토리 패턴",
      "프로토타입 패턴",
      "Command 패턴",
      "Middleware 패턴",
    ],
  },
  {
    slug: "performance-reliability",
    label: "성능·안정성",
    description: "더 빠르고 신뢰할 수 있는 제품을 만들기 위한 기록",
    tags: ["Sentry", "유지보수", "성능 개선"],
  },
  {
    slug: "product-ux",
    label: "제품·UX",
    description: "사용자 경험과 제품 성과를 함께 개선한 기록",
    tags: ["UX", "퍼널"],
  },
  {
    slug: "tooling-ai",
    label: "도구·AI",
    description: "개발 도구와 AI로 일하는 방식을 확장한 기록",
    tags: [
      "npm",
      "오픈소스 분석",
      "라이브러리",
      "Claude Code",
      "AI 생산성",
      "개발환경 자동화",
    ],
  },
] as const;

export const OTHER_TOPIC: Topic = {
  slug: "other",
  label: "기타",
  description: "새롭게 발견된 주제를 모아 둔 기록",
  tags: [],
};

export const ALL_TOPICS: readonly Topic[] = [...TOPICS, OTHER_TOPIC];

export function getTopic(slug: string): Topic | undefined {
  if (slug === OTHER_TOPIC.slug) return OTHER_TOPIC;
  return TOPICS.find((topic) => topic.slug === slug);
}

export function getTopicsForTags(tags: readonly string[]): Topic[] {
  const matched = TOPICS.filter((topic) =>
    tags.some((tag) => topic.tags.includes(tag)),
  );
  const hasUnknownTag = tags.some(
    (tag) => !TOPICS.some((topic) => topic.tags.includes(tag)),
  );
  return hasUnknownTag ? [...matched, OTHER_TOPIC] : matched;
}

export function getTopicsForArticle(article: PublishedArticle): Topic[] {
  return getTopicsForTags(article.tags);
}

export function getTopicRecords(
  sessions: ArchiveSession[],
  topicSlug: TopicSlug,
) {
  return sessions.flatMap((session) =>
    session.articles
      .filter(
        (article): article is PublishedArticle =>
          article.status === "published" &&
          getTopicsForTags(article.tags).some(
            (topic) => topic.slug === topicSlug,
          ),
      )
      .map((article) => ({ session, article })),
  );
}

export function isTopicSlug(value: string): value is TopicSlug {
  return Boolean(getTopic(value));
}
