import Link from "next/link";
import type { Article } from "@/lib/archive";
export function ArticleRow({ article, sessionId, date, showDate = false }: { article: Article; sessionId: number; date: string; showDate?: boolean }) {
  if (article.status === "pending") return <div className="article-row is-pending" aria-label={`${article.author}, 글 준비 중`}><span className="article-author">{article.author}</span><strong>다음 기록을 준비하고 있어요</strong><small>PREPARING</small></div>;
  return <a className="article-row" href={article.url} target="_blank" rel="noopener noreferrer"><span className="article-author">{showDate ? date.replaceAll("-", ".") : article.author}</span><span className="article-main"><strong>{article.title}</strong><span className="tag-line">{article.tags.map((tag) => `#${tag}`).join("  ")}</span></span><i aria-hidden="true">↗</i>{showDate && <span className="sr-only">{sessionId}회차</span>}</a>;
}
export function SessionLink({ id }: { id: number }) { return <Link className="session-link" href={`/sessions/${id}`}>회차 전체 보기 <span aria-hidden="true">→</span></Link>; }
