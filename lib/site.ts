/**
 * 메타데이터와 사이트맵·RSS의 절대 URL 기준값.
 *
 * 운영 배포는 Vercel 프로젝트 환경 변수 `NEXT_PUBLIC_SITE_URL`로 덮어쓰고,
 * 없으면 현재 운영 도메인을 쓴다. 값을 쓰는 쪽이 `${SITE_URL}/about`처럼
 * 이어 붙이므로 끝의 슬래시는 여기서 한 번만 떼어 낸다.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://study-archive-psi.vercel.app"
).replace(/\/+$/, "");
