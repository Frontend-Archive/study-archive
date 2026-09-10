import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://frontend-archive-study.sunny-grass-6556.chatgpt.site";
const title = "Frontend Archive — 배운 것을 시간으로 엮습니다";
const description = "프론트엔드 스터디 구성원이 매 회차 공유한 글과 학습의 흐름을 기록하는 공개 아카이브";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), title, description,
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  keywords: ["프론트엔드", "개발자 스터디", "기술 블로그", "아카이브"],
  openGraph: { type: "website", locale: "ko_KR", siteName: "Frontend Archive", title, description, images: [{ url: "/og.png", width: 1733, height: 907, alt: "Frontend Archive" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
