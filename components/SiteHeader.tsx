import Link from "next/link";

const navLinkClassName =
  "relative after:absolute after:bottom-[-5px] after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:content-[''] hover:after:origin-left hover:after:scale-x-100 motion-reduce:after:transition-none";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-[1280px] items-center justify-between border-b border-ink p-5 layout:px-8 layout:py-6">
      <Link
        className="font-label text-[30px] leading-none font-black tracking-[-0.07em]"
        href="/"
        aria-label="Frontend Archive 홈"
      >
        FA
        <span className="ml-[3px] align-top text-[10px] text-accent">®</span>
      </Link>
      <nav
        className="flex gap-[10px] text-[10px] tracking-[0.08em] uppercase layout:gap-7 layout:text-[12px]"
        aria-label="주요 메뉴"
      >
        <Link className={navLinkClassName} href="/#archive">
          Archive
        </Link>
        <Link className={navLinkClassName} href="/#members">
          Members
        </Link>
        <Link className={navLinkClassName} href="/about">
          About
        </Link>
      </nav>
    </header>
  );
}
