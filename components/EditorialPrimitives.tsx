import type { ReactNode } from "react";
import Link from "next/link";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Eyebrow({
  children,
  className,
  tone = "accent",
}: {
  children: ReactNode;
  className?: string;
  tone?: "accent" | "muted";
}) {
  return (
    <p
      className={joinClasses(
        "font-label text-[11px] leading-[1.2] font-bold tracking-[0.13em] uppercase",
        tone === "accent" ? "text-accent" : "text-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function PageTitle({
  children,
  variant = "page",
  className,
}: {
  children: ReactNode;
  variant?: "home" | "page";
  className?: string;
}) {
  const size =
    variant === "home"
      ? "text-[42px] layout:text-[clamp(46px,6vw,72px)]"
      : "text-[clamp(36px,10vw,40px)] layout:text-[clamp(40px,5vw,64px)]";

  return (
    <h1
      className={joinClasses(
        "break-keep font-editorial leading-[1.1] font-semibold tracking-[-0.045em]",
        size,
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  tone: "dark" | "light";
}) {
  const border = tone === "dark" ? "border-dark-line" : "border-ink";
  const copy = tone === "dark" ? "text-dark-muted" : "text-muted";

  return (
    <div
      className={joinClasses(
        "flex items-end justify-between border-b pb-8",
        border,
      )}
    >
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 font-editorial text-[clamp(42px,6vw,78px)] leading-none font-semibold tracking-[-0.055em]">
          {title}
        </h2>
      </div>
      <p
        className={joinClasses(
          "hidden text-sm leading-[1.6] layout:block",
          copy,
        )}
      >
        {description}
      </p>
    </div>
  );
}

export function DetailSectionLabel({
  id,
  label,
  summary,
}: {
  id: string;
  label: ReactNode;
  summary: ReactNode;
}) {
  return (
    <div className="flex justify-between border-b border-ink pb-[14px] font-label text-[10px] leading-none font-bold tracking-[0.12em]">
      <span id={id}>{label}</span>
      <span>{summary}</span>
    </div>
  );
}

type PagerItem = {
  href: string;
  eyebrow: ReactNode;
  label: ReactNode;
  ariaLabel?: string;
};

export function ArchivePager({
  previous,
  next,
  variant = "session",
}: {
  previous?: PagerItem;
  next?: PagerItem;
  variant?: "session" | "member";
}) {
  const strongClassName = joinClasses(
    "font-editorial text-lg leading-[1.2] font-medium",
    variant === "member"
      ? "transition-colors duration-200 group-hover:text-accent motion-reduce:transition-none"
      : undefined,
  );

  return (
    <nav
      className="mt-[60px] grid grid-cols-2 border-t border-ink layout:mt-20"
      aria-label={variant === "member" ? "멤버 이동" : "회차 이동"}
    >
      {previous ? (
        <Link
          className="group flex flex-col gap-3 py-6"
          href={previous.href}
          aria-label={previous.ariaLabel}
        >
          <span className="font-label text-[9px] leading-none tracking-[0.1em] text-muted">
            {previous.eyebrow}
          </span>
          <strong className={strongClassName}>{previous.label}</strong>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          className="group flex flex-col gap-3 py-6 text-right"
          href={next.href}
          aria-label={next.ariaLabel}
        >
          <span className="font-label text-[9px] leading-none tracking-[0.1em] text-muted">
            {next.eyebrow}
          </span>
          <strong className={strongClassName}>{next.label}</strong>
        </Link>
      )}
    </nav>
  );
}

export function RoundBadge({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="z-1 mt-6 inline-block font-label text-[9px] leading-none font-bold tracking-[0.1em] text-accent layout:absolute layout:top-7 layout:right-12 layout:mt-0"
    >
      {children}
    </Link>
  );
}
