export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Frontend Archive</p>
      <p>배운 것을 남기고, 시간으로 엮습니다.</p>
      <nav aria-label="관련 링크">
        <a href="/feed.xml">RSS</a>
        <a
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
