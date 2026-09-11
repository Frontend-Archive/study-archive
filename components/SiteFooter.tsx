export function SiteFooter() {
  return (
    <footer className="mx-5 grid max-w-[1280px] grid-cols-[1fr_auto] gap-5 border-t border-ink px-0 pt-6 pb-9 text-[11px] tracking-[0.07em] uppercase layout:mx-auto layout:grid-cols-[1fr_1fr_auto] layout:px-8 layout:pt-[25px] layout:pb-[50px]">
      <p>Frontend Archive</p>
      <p className="hidden text-muted layout:block">
        배운 것을 남기고, 시간으로 엮습니다.
      </p>
      <nav className="flex gap-3 layout:gap-[18px]" aria-label="관련 링크">
        <a className="hover:text-accent" href="/feed.xml">
          RSS
        </a>
        <a
          className="hover:text-accent"
          href="https://github.com/Frontend-Archive/archive"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      </nav>
    </footer>
  );
}
