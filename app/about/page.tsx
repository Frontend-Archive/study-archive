import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "About — Frontend Archive", description: "Frontend Archive가 배움을 기록하고 이어가는 방식" };
export default function AboutPage() { return <main><SiteHeader /><article className="editorial-page"><p className="eyebrow">About the archive</p><h1 className="page-title"><span className="title-accent">아카이브</span> 소개</h1><div className="prose-grid"><p className="lead">Frontend Archive는 네 명의 프론트엔드 개발자가 매달 각자의 질문을 들고 모이는 스터디의 공개 기록입니다.</p><div><h2>왜 기록하나요?</h2><p>발표가 끝난 뒤 링크가 대화방에 묻히지 않도록, 회차와 사람의 흐름 속에서 다시 발견할 수 있게 합니다. 완성된 글뿐 아니라 준비 중인 자리도 그대로 남겨 스터디의 실제 시간을 보여줍니다.</p><h2>어떻게 운영하나요?</h2><p>모든 기록은 GitHub의 공개 Markdown에서 관리합니다. 이 사이트는 원본을 읽어 탐색 가능한 형태로 엮을 뿐, 글의 본문이나 소유권을 가져오지 않습니다.</p><a className="text-link" href="https://github.com/Frontend-Archive/archive" target="_blank" rel="noopener noreferrer">원본 저장소 살펴보기 ↗</a></div></div></article><SiteFooter /></main>; }
