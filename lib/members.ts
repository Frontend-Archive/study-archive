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
