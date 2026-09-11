import type { Metadata } from "next";
import { PageHero } from "@/components/EditorialPrimitives";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About — Frontend Archive",
  description: "Frontend Archive가 배움을 기록하고 이어가는 방식",
};

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-[1280px] px-5 pt-7 pb-20 layout:px-8 layout:pt-8 layout:pb-[120px]">
        <PageHero
          eyebrow="About the archive"
          title={
            <>
              <span className="text-accent not-italic">아카이브</span> 소개
            </>
          }
        />
        <div className="grid grid-cols-1 gap-[52px] pt-8 wide:grid-cols-2 wide:gap-[10vw]">
          <p className="m-0 break-keep font-editorial text-[23px] leading-[1.55] font-medium text-muted layout:text-[27px]">
            Frontend Archive는 네 명의 프론트엔드 개발자가 매달 각자의 질문을
            들고 모이는 스터디의 공개 기록입니다.
          </p>
          <div className="max-w-[520px]">
            <h2 className="mb-3 font-editorial text-[22px] leading-[1.4] font-semibold">
              왜 기록하나요?
            </h2>
            <p className="leading-[1.8] text-muted">
              발표가 끝난 뒤 링크가 대화방에 묻히지 않도록, 회차와 사람의
              흐름 속에서 다시 발견할 수 있게 합니다. 완성된 글뿐 아니라 준비
              중인 자리도 그대로 남겨 스터디의 실제 시간을 보여줍니다.
            </p>
            <h2 className="mt-12 mb-3 font-editorial text-[22px] leading-[1.4] font-semibold">
              어떻게 운영하나요?
            </h2>
            <p className="leading-[1.8] text-muted">
              모든 기록은 GitHub의 공개 Markdown에서 관리합니다. 이 사이트는
              원본을 읽어 탐색 가능한 형태로 엮을 뿐, 글의 본문이나 소유권을
              가져오지 않습니다.
            </p>
            <a
              className="mt-7 inline-block border-b border-current pb-1 text-[12px]"
              href="https://github.com/Frontend-Archive/archive"
              target="_blank"
              rel="noopener noreferrer"
            >
              원본 저장소 살펴보기 ↗
            </a>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
