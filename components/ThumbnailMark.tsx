/**
 * 원문에 쓸 만한 og:image가 없을 때 자리를 채우는 기하 도형.
 *
 * 제목 첫 글자를 쓰면 `[디자인 패턴]`처럼 같은 말로 시작하는 글이 모두 같은
 * 글자를 보여 주게 되어 구분이 되지 않는다. 대신 원문 주소에서 뽑은 해시로
 * 도형과 회전을 정해, 같은 글은 언제나 같은 모양을 갖고 다른 글끼리는 서로
 * 달라 보이게 한다.
 *
 * 색은 코발트 하나만 쓴다는 원칙을 지켜 `currentColor`로만 그리고, 44px에서도
 * 형태가 읽히도록 도형 수와 굵기를 제한한다.
 */

const MOTIF_COUNT = 12;

function seedFrom(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/**
 * 도형은 모두 회전에 따라 모양이 달라지도록 그린다. 동심원처럼 회전해도
 * 같아 보이는 형태를 쓰면 서로 다른 글이 같은 그림으로 보인다.
 */
function Motif({ index }: { index: number }) {
  switch (index) {
    case 0: // 모서리에서 퍼지는 호
      return (
        <>
          <path d="M10 54a20 20 0 0 1 20-20" />
          <path d="M10 54a32 32 0 0 1 32-32" />
          <path d="M10 54a44 44 0 0 1 44-44" />
        </>
      );
    case 1: // 대각선 줄무늬
      return (
        <>
          <path d="M10 34 34 10" />
          <path d="M10 46 46 10" />
          <path d="M10 58 58 10" />
          <path d="M22 58 58 22" />
        </>
      );
    case 2: // 반원과 밑줄
      return (
        <>
          <path d="M12 42a20 20 0 0 1 40 0" fill="currentColor" stroke="none" />
          <path d="M10 52h44" />
        </>
      );
    case 3: // 네 칸 중 하나를 채운 격자
      return (
        <>
          <rect x="11" y="11" width="19" height="19" fill="currentColor" stroke="none" />
          <rect x="34" y="11" width="19" height="19" />
          <rect x="11" y="34" width="19" height="19" />
          <rect x="34" y="34" width="19" height="19" />
        </>
      );
    case 4: // 삼각형과 수평선
      return (
        <>
          <path d="M32 12 54 44H10z" />
          <path d="M10 54h44" />
        </>
      );
    case 5: // 한쪽이 트인 겹고리
      return (
        <>
          <path d="M32 20A12 12 0 1 1 20 32" />
          <path d="M32 11A21 21 0 1 1 11 32" />
          <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none" />
        </>
      );
    case 6: // 높이가 다른 막대
      return (
        <>
          <path d="M15 54V38" />
          <path d="M26 54V26" />
          <path d="M38 54V32" />
          <path d="M49 54V14" />
        </>
      );
    case 7: // 어긋난 겹사각형
      return (
        <>
          <rect x="10" y="10" width="30" height="30" />
          <rect x="24" y="24" width="30" height="30" />
        </>
      );
    case 8: // 사분원
      return <path d="M10 10h22a22 22 0 0 1-22 22z" fill="currentColor" stroke="none" />;
    case 9: // 겹화살표
      return (
        <>
          <path d="M18 16 32 32 18 48" />
          <path d="M34 16 48 32 34 48" />
        </>
      );
    case 10: // 굵기가 다른 십자
      return (
        <>
          <path d="M32 10V54" />
          <path d="M12 32h40" strokeWidth="9" />
        </>
      );
    default: // 점 격자
      return (
        <>
          <circle cx="16" cy="16" r="7" fill="currentColor" stroke="none" />
          <circle cx="32" cy="16" r="3" fill="currentColor" stroke="none" />
          <circle cx="48" cy="16" r="3" fill="currentColor" stroke="none" />
          <circle cx="16" cy="32" r="3" fill="currentColor" stroke="none" />
          <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" />
          <circle cx="48" cy="32" r="3" fill="currentColor" stroke="none" />
          <circle cx="16" cy="48" r="3" fill="currentColor" stroke="none" />
          <circle cx="32" cy="48" r="3" fill="currentColor" stroke="none" />
          <circle cx="48" cy="48" r="3" fill="currentColor" stroke="none" />
        </>
      );
  }
}

export function ThumbnailMark({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const hash = seedFrom(seed);
  const motif = hash % MOTIF_COUNT;
  // 같은 도형이라도 90도 단위로 돌려 변형을 넓힌다.
  const quarterTurns = (hash >>> 5) % 4;

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <g transform={`rotate(${quarterTurns * 90} 32 32)`}>
        <Motif index={motif} />
      </g>
    </svg>
  );
}
