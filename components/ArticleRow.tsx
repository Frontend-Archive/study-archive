import Link from "next/link";
import { MEMBERS, type Article } from "@/lib/archive";
import thumbnails from "@/lib/thumbnails.json";
import { ThumbnailMark } from "./ThumbnailMark";

/**
 * 원문의 og:image를 빌드 시점에 내려받아 둔 것이 있으면 쓰고, 없으면 주소에서
 * 뽑은 기하 도형으로 채운다. 노션과 일부 블로그는 글마다 다른 이미지를
 * 제공하지 않아 전체의 절반 정도가 도형으로 채워진다.
 */
function ArticleThumbnail({
  url,
  frameClassName,
}: {
  url: string;
  frameClassName: string;
}) {
  const file = (thumbnails as Record<string, string>)[url];
  const box = `col-start-1 row-start-1 row-span-2 h-11 w-11 shrink-0 border layout:col-start-2 layout:row-span-1 layout:h-16 layout:w-16 ${frameClassName}`;

  if (file) {
    return (
      // 이 저장소에는 Cloudflare Images 바인딩이 없어 최적화 엔드포인트를 쓸
      // 수 없다. 대신 빌드 때 160px로 받아 두므로 그대로 내보내도 가볍다.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`${box} object-cover`}
        src={`/thumbnails/${file}`}
        alt=""
        width={160}
        height={160}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <span className={`${box} flex items-center justify-center p-1.5`} aria-hidden="true">
      <ThumbnailMark seed={url} className="h-full w-full" />
    </span>
  );
}

function ArticleMeta({
  author,
  sessionId,
  date,
  showDate,
  linkClassName,
}: {
  author: string;
  sessionId: number;
  date: string;
  showDate: boolean;
  linkClassName: string;
}) {
  if (showDate) {
    return (
      <Link className={linkClassName} href={`/sessions/${sessionId}`}>
        {date.replaceAll("-", ".")}
        <span className="sr-only"> {sessionId}회차 보기</span>
      </Link>
    );
  }
  const member = MEMBERS.find((item) => item.name === author);
  return member ? (
    <Link className={linkClassName} href={`/members/${member.slug}`}>
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
    "grid min-h-[76px] grid-cols-[44px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-b py-[17px] layout:grid-cols-[90px_64px_minmax(0,1fr)] layout:gap-x-4",
    variant === "detail"
      ? "border-line layout:grid-cols-[120px_64px_minmax(0,1fr)]"
      : "border-dark-row",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const thumbnailFrame =
    variant === "detail"
      ? "border-line bg-paper text-accent"
      : "border-dark-line bg-dark-row text-accent-soft";
  const authorColor =
    variant === "detail" ? "text-muted" : "text-dark-muted";
  const iconColor =
    variant === "detail" ? "text-accent" : "text-accent-soft";
  const tagColor = variant === "detail" ? "text-muted" : "text-dark-tag";
  const tagHover =
    variant === "detail" ? "hover:text-accent" : "hover:text-paper";
  const metaLinkClassName = `inline-block border-b py-[5px] ${
    variant === "detail"
      ? "border-line hover:border-accent hover:text-accent"
      : "border-dark-line hover:border-accent-soft hover:text-accent-soft"
  }`;
  const meta = (
    <span
      className={`col-start-2 row-start-1 text-[12px] layout:col-start-1 ${authorColor}`}
    >
      <ArticleMeta
        author={article.author}
        sessionId={sessionId}
        date={date}
        showDate={showDate}
        linkClassName={metaLinkClassName}
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
        <span
          className={`col-start-1 row-start-1 row-span-2 h-11 w-11 shrink-0 border layout:col-start-2 layout:row-span-1 layout:h-16 layout:w-16 ${thumbnailFrame}`}
          aria-hidden="true"
        />
        <span className="col-start-2 row-start-2 flex items-center justify-between gap-4 layout:col-start-3 layout:row-start-1">
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
  return (
    <div className={rowClassName} data-testid="article-row">
      {meta}
      <ArticleThumbnail url={article.url} frameClassName={thumbnailFrame} />
      <span className="col-start-2 row-start-2 flex min-w-0 flex-col gap-2 layout:col-start-3 layout:row-start-1">
        <a
          className="group/article grid grid-cols-[minmax(0,1fr)_16px] items-center gap-[10px] transition-colors duration-150 hover:text-accent-soft motion-reduce:transition-none layout:grid-cols-[minmax(0,1fr)_24px] layout:gap-4"
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong className="break-keep font-editorial text-base leading-[1.45] font-medium decoration-1 underline-offset-[5px] group-hover/article:underline layout:text-lg">
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
