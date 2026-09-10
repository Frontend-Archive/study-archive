import Link from "next/link";
import { MEMBERS, type Article } from "@/lib/archive";
import { getTopicsForTags } from "@/lib/topics";

function ArticleMeta({
  author,
  sessionId,
  date,
  showDate,
}: {
  author: string;
  sessionId: number;
  date: string;
  showDate: boolean;
}) {
  if (showDate) {
    return (
      <Link className="article-meta-link" href={`/sessions/${sessionId}`}>
        {date.replaceAll("-", ".")}
        <span className="sr-only"> {sessionId}회차 보기</span>
      </Link>
    );
  }
  const member = MEMBERS.find((item) => item.name === author);
  return member ? (
    <Link className="article-meta-link" href={`/members/${member.slug}`}>
      {author}
    </Link>
  ) : (
    author
  );
}

export function ArticleRow({
  article,
  sessionId,
  date,
  showDate = false,
}: {
  article: Article;
  sessionId: number;
  date: string;
  showDate?: boolean;
}) {
  const meta = (
    <span className="article-author">
      <ArticleMeta
        author={article.author}
        sessionId={sessionId}
        date={date}
        showDate={showDate}
      />
    </span>
  );
  if (article.status === "pending") {
    return (
      <div
        className="article-row is-pending"
        aria-label={`${article.author}, 글 준비 중`}
      >
        {meta}
        <span className="pending-main">
          <strong>다음 기록을 준비하고 있어요</strong>
          <small>PREPARING</small>
        </span>
      </div>
    );
  }
  const topics = getTopicsForTags(article.tags);
  return (
    <div className="article-row">
      {meta}
      <span className="article-main">
        <a
          className="article-title-link"
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>{article.title}</strong>
          <i aria-hidden="true">↗</i>
          <span className="sr-only"> 새 탭에서 원문 열기</span>
        </a>
        <span className="tag-line" aria-label="태그">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}#archive`}
              aria-label={`${tag} 태그로 기록 보기`}
            >
              #{tag}
            </Link>
          ))}
        </span>
        <span className="topic-line" aria-label="주제">
          {topics.map((topic) => (
            <Link key={topic.slug} href={`/topics/${topic.slug}`}>
              {topic.label}
            </Link>
          ))}
        </span>
      </span>
    </div>
  );
}

export function SessionLink({ id }: { id: number }) {
  return (
    <Link className="session-link" href={`/sessions/${id}`}>
      회차 전체 보기 <span aria-hidden="true">→</span>
    </Link>
  );
}
