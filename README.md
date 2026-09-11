# Frontend Archive Web

프론트엔드 스터디의 회차별 글과 멤버별 학습 흐름을 보여주는 공개 아카이브입니다. 콘텐츠는 [`Frontend-Archive/archive`](https://github.com/Frontend-Archive/archive)의 Markdown만을 원본으로 사용합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run check
npm run test:e2e
```

## 배포

운영 배포 대상은 Vercel 프로젝트입니다. `npm run build`는 Next.js 표준 빌드라 별도 어댑터나 빌드 설정 없이 Vercel이 저장소를 그대로 빌드합니다.

1. Vercel에 이 저장소를 연결합니다. 프레임워크 프리셋은 Next.js입니다.
2. Vercel 프로젝트 환경 변수에 `NEXT_PUBLIC_SITE_URL`을 실제 운영 도메인으로 설정합니다. 빌드 시점에 메타데이터와 사이트맵·RSS의 절대 URL로 쓰이며, 기본값은 `lib/site.ts`에 있습니다.
3. Vercel의 deploy hook URL을 웹 저장소의 `DEPLOY_HOOK_URL` GitHub Secret에 저장합니다.
4. 아카이브 저장소의 dispatch 대상 저장소를 이 웹 저장소로 지정하고 `BLOG_DISPATCH_TOKEN`을 설정합니다.
5. `archives/**` 변경이 `archive-updated`를 보내면 `redeploy.yml`이 새 배포를 시작합니다.

제품 결정과 운영 원칙은 [`docs/`](./docs/)에서 확인할 수 있습니다.
