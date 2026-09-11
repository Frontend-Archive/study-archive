/**
 * 메타데이터와 사이트맵·RSS의 절대 URL 기준값.
 *
 * 운영 배포는 Vercel 프로젝트 환경 변수 `NEXT_PUBLIC_SITE_URL`로 덮어쓰고,
 * 없으면 현재 운영 도메인을 쓴다. 변수가 비어 있는 채로 정의된 경우에도
 * 기본값으로 돌아가야 한다. `??`만 쓰면 빈 문자열이 그대로 통과해
 * `new URL("")`이 빌드를 멈춘다.
 *
 * 값을 쓰는 쪽이 `${SITE_URL}/about`처럼 이어 붙이므로 끝의 슬래시는
 * 여기서 한 번만 떼어 낸다.
 */
const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (
  configured || "https://study-archive-psi.vercel.app"
).replace(/\/+$/, "");
