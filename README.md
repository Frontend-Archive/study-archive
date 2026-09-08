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

1. Vercel 프로젝트에서 이 저장소를 연결하고 `NEXT_PUBLIC_SITE_URL`을 실제 도메인으로 설정합니다.
2. Vercel Deploy Hook을 만든 뒤 웹 저장소의 `VERCEL_DEPLOY_HOOK_URL` GitHub Secret에 저장합니다.
3. 아카이브 저장소의 dispatch 대상 저장소를 이 웹 저장소로 지정하고 `BLOG_DISPATCH_TOKEN`을 설정합니다.
4. `archives/**` 변경이 `archive-updated`를 보내면 `redeploy.yml`이 새 배포를 시작합니다.

제품 결정과 운영 원칙은 [`docs/`](./docs/)에서 확인할 수 있습니다.
