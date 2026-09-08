import Link from "next/link";
export default function NotFound() { return <main className="not-found"><span>404</span><h1>기록 사이에서<br />길을 잃었어요.</h1><p>찾으려는 페이지가 없거나 이동되었습니다.</p><Link href="/">아카이브로 돌아가기 →</Link></main>; }
