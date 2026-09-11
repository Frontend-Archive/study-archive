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
      <Link
        className="inline-block border-b border-transparent py-[5px] hover:border-current hover:text-accent-soft"
        href={`/sessions/${sessionId}`}
      >
        {date.replaceAll("-", ".")}
        <span className="sr-only"> {sessionId}회차 보기</span>
      </Link>
    );
  }
  const member = MEMBERS.find((item) => item.name === author);
  return member ? (
    <Link
      className="inline-block border-b border-transparent py-[5px] hover:border-current hover:text-accent-soft"
      href={`/members/${member.slug}`}
    >
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
  variant = "archive",
  className,
}: {
  article: Article;
  sessionId: number;
  date: string;
  showDate?: boolean;
  variant?: "archive" | "detail";
  className?: string;
}) {
  const rowClassName = [
    "grid min-h-[76px] grid-cols-[68px_minmax(0,1fr)] items-center gap-4 border-b py-[17px] layout:grid-cols-[90px_minmax(0,1fr)]",
    variant === "detail"
      ? "border-line layout:grid-cols-[120px_minmax(0,1fr)]"
      : "border-dark-row",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const authorColor =
    variant === "detail" ? "text-muted" : "text-dark-muted";
  const iconColor =
    variant === "detail" ? "text-accent" : "text-accent-soft";
  const tagColor = variant === "detail" ? "text-muted" : "text-dark-tag";
  const tagHover =
    variant === "detail" ? "hover:text-accent" : "hover:text-paper";
  const topicColors =
    variant === "detail"
      ? "border-line text-muted hover:border-accent hover:text-accent"
      : "border-dark-line text-dark-muted hover:border-accent-soft hover:text-accent-soft";
  const meta = (
    <span className={`text-[12px] ${authorColor}`}>
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
        className={`${rowClassName} opacity-55`}
        data-testid="article-row"
        aria-label={`${article.author}, 글 준비 중`}
      >
        {meta}
        <span className="flex items-center justify-between gap-4">
          <strong className="break-keep font-editorial text-base leading-[1.45] font-medium layout:text-lg">
            다음 기록을 준비하고 있어요
          </strong>
          <small className="font-label text-[9px] leading-none tracking-[0.1em] text-dark-muted">
            PREPARING
          </small>
        </span>
      </div>
    );
  }
  const topics = getTopicsForTags(article.tags);
  return (
    <div className={rowClassName} data-testid="article-row">
      {meta}
      <span className="flex min-w-0 flex-col gap-2">
        <a
          className="grid grid-cols-[minmax(0,1fr)_16px] items-center gap-[10px] transition-[color,transform] duration-200 hover:translate-x-[5px] hover:text-accent-soft motion-reduce:transition-none layout:grid-cols-[minmax(0,1fr)_24px] layout:gap-4"
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong className="break-keep font-editorial text-base leading-[1.45] font-medium layout:text-lg">
            {article.title}
          </strong>
          <i className={`justify-self-end not-italic ${iconColor}`} aria-hidden="true">
            ↗
          </i>
          <span className="sr-only"> 새 탭에서 원문 열기</span>
        </a>
        <span
          className={`flex flex-wrap gap-x-3 gap-y-[6px] text-[11px] leading-[1.5] ${tagColor}`}
          aria-label="태그"
        >
          {article.tags.map((tag) => (
            <Link
              className={`${tagHover} hover:underline hover:underline-offset-[3px]`}
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}#archive`}
              aria-label={`${tag} 태그로 기록 보기`}
            >
              #{tag}
            </Link>
          ))}
        </span>
        <span
          className="mt-0.5 flex flex-wrap gap-x-3 gap-y-[6px] text-[11px] leading-[1.5] text-dark-tag"
          aria-label="주제"
        >
          {topics.map((topic) => (
            <Link
              className={`rounded-[999px] border px-[7px] py-[3px] text-[9px] tracking-[0.05em] ${topicColors}`}
              key={topic.slug}
              href={`/topics/${topic.slug}`}
            >
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
    <Link
      className="col-[1/-1] mt-[10px] justify-self-start border-b border-dark-control pb-[3px] text-[11px] tracking-normal text-paper layout:mt-auto"
      href={`/sessions/${id}`}
    >
      회차 전체 보기 <span aria-hidden="true">→</span>
    </Link>
  );
}
