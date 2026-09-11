import type {
  ArchiveSession,
  Article,
  Member,
  PublishedArticle,
} from "./archive";
import {
  ALL_TOPICS,
  getTopicsForArticle,
  type Topic,
  type TopicSlug,
} from "./topics";

/**
 * 최신순 원본 세션을 멤버 관점의 오래된순 학습 기록으로 재구성한다.
 * 원본 데이터에는 손대지 않고 게시 수, 활동 기간, 최근 관심사를 모두 파생해
 * 별도의 저장 데이터나 동기화 지점을 만들지 않는다.
 */

export type MemberRecord = {
  session: ArchiveSession;
  article: Article;
};

export type MemberTopic = {
  topic: Topic;
  lastPublishedDate: string;
};

export type MemberArchiveSummary = {
  records: MemberRecord[];
  publishedCount: number;
  firstPublishedDate: string | null;
  latestPublishedDate: string | null;
  latestTopics: Topic[];
  topics: MemberTopic[];
};

export function getMemberArchiveSummary(
  sessions: readonly ArchiveSession[],
  member: Member,
): MemberArchiveSummary {
  const records = sessions
    .flatMap<MemberRecord>((session) => {
      const article = session.articles.find(
        (item) => item.author === member.name,
      );
      return article ? [{ session, article }] : [];
    })
    .sort((a, b) => a.session.date.localeCompare(b.session.date));

  const publishedRecords = records.filter(
    (
      record,
    ): record is MemberRecord & { article: PublishedArticle } =>
      record.article.status === "published",
  );

  // 주제별 마지막 등장 날짜만 기억하면 멤버의 관심사를 최근 등장 순으로
  // 정렬할 수 있다. 같은 글의 중복 태그/주제는 Set으로 한 번만 반영한다.
  const topicDates = new Map<TopicSlug, string>();

  for (const { article, session } of publishedRecords) {
    const articleTopics = new Set(
      getTopicsForArticle(article).map((topic) => topic.slug),
    );
    for (const topicSlug of articleTopics) {
      topicDates.set(topicSlug, session.date);
    }
  }

  const topicOrder = new Map(
    ALL_TOPICS.map((topic, index) => [topic.slug, index]),
  );
  const topics = ALL_TOPICS.flatMap<MemberTopic>((topic) => {
    const lastPublishedDate = topicDates.get(topic.slug);
    return lastPublishedDate ? [{ topic, lastPublishedDate }] : [];
  }).sort(
    (a, b) =>
      b.lastPublishedDate.localeCompare(a.lastPublishedDate) ||
      (topicOrder.get(a.topic.slug) ?? 0) -
        (topicOrder.get(b.topic.slug) ?? 0),
  );
  const latestRecord = publishedRecords.at(-1);

  return {
    records,
    publishedCount: publishedRecords.length,
    firstPublishedDate: publishedRecords[0]?.session.date ?? null,
    latestPublishedDate: latestRecord?.session.date ?? null,
    latestTopics: latestRecord ? getTopicsForArticle(latestRecord.article) : [],
    topics,
  };
}
