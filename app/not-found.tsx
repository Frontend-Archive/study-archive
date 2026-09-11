import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col justify-center px-[8vw] py-[10vh]">
      <span className="font-numeral text-[22vw] leading-[0.7] italic text-accent">
        404
      </span>
      <h1 className="mt-[50px] mb-[18px] font-editorial text-[clamp(38px,5vw,70px)] leading-[1.05] font-semibold tracking-[-0.05em]">
        기록 사이에서
        <br />길을 잃었어요.
      </h1>
      <p className="text-muted">찾으려는 페이지가 없거나 이동되었습니다.</p>
      <Link
        className="mt-5 self-start border-b border-current pb-1 text-[12px]"
        href="/"
      >
        아카이브로 돌아가기 →
      </Link>
    </main>
  );
}
