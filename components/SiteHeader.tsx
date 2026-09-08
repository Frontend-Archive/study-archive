import Link from "next/link";
export function SiteHeader() { return <header className="site-header"><Link className="wordmark" href="/" aria-label="Frontend Archive 홈">FA<span>®</span></Link><nav aria-label="주요 메뉴"><Link href="/#archive">Archive</Link><Link href="/#members">Members</Link><Link href="/about">About</Link></nav></header>; }
