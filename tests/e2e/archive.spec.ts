import { expect, test } from "@playwright/test";
test("검색과 초기화가 URL과 결과를 갱신한다", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Frontend Archive", exact: true }),
  ).toBeVisible();
  await page.locator('[data-hydrated="true"]').waitFor();
  const input = page.getByPlaceholder("어떤 배움을 찾고 있나요?");
  await input.fill("React Compiler");
  await expect(page).toHaveURL(/q=React\+Compiler/);
  await expect(page.getByText(/1개의 기록/)).toBeVisible();
  await page.getByRole("button", { name: "초기화" }).click();
  await expect(page).not.toHaveURL(/q=/);
});
test("회차와 멤버 상세로 이동할 수 있다", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /회차 전체 보기/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "스터디 6회차" }),
  ).toBeVisible();
  await page.goto("/#members");
  await page
    .getByRole("link", { name: /권시현.*개의 기록/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "권시현의 기록", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("멤버 활동 요약")).toContainText("게시 기록");
  await expect(
    page.getByRole("heading", { name: "관심사가 남긴 흔적" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "다음 멤버 민준경" }),
  ).toHaveAttribute("href", "/members/min-jungyeong");
});

test("멤버의 주제 흔적에서 작성자와 주제가 결합된 기록으로 이동한다", async ({
  page,
}) => {
  await page.goto("/members/kwon-sihyeon");
  const topicLink = page.getByRole("link", {
    name: "아키텍처·패턴 관련 기록 보기",
  });
  await expect(topicLink).toBeVisible();
  await topicLink.click();
  await page.locator('[data-hydrated="true"]').waitFor();

  await expect(page).toHaveURL(/author=%EA%B6%8C%EC%8B%9C%ED%98%84/);
  await expect(page).toHaveURL(/topic=architecture-patterns/);
  await expect(page.getByLabel("WRITER")).toHaveValue("권시현");
  await expect(page.getByLabel("TOPIC")).toHaveValue("architecture-patterns");
});

test("멤버 학습 로그에서 회차와 원문으로 이동할 수 있다", async ({ page }) => {
  await page.goto("/members/kwon-sihyeon");
  const firstRecord = page.getByTestId("member-record").first();

  await expect(
    firstRecord.getByRole("link", { name: "ROUND 01" }),
  ).toHaveAttribute("href", "/sessions/1");
  await expect(
    firstRecord.getByRole("link", { name: /새 탭에서 원문 열기/ }),
  ).toHaveAttribute("target", "_blank");
});

test("공유된 필터 URL을 복원하고 조건을 개별 제거한다", async ({ page }) => {
  await page.goto(
    `/?author=${encodeURIComponent("염승준")}&topic=react-framework#archive`,
  );
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(page.getByLabel("WRITER")).toHaveValue("염승준");
  await expect(page.getByLabel("TOPIC")).toHaveValue("react-framework");
  await page
    .getByRole("button", { name: "주제 React·프레임워크 조건 제거" })
    .click();
  await expect(page).not.toHaveURL(/topic=/);
  await expect(page.getByLabel("WRITER")).toHaveValue("염승준");
  await page.goBack();
  await expect(page.getByLabel("TOPIC")).toHaveValue("react-framework");
  await page.goForward();
  await expect(page.getByLabel("TOPIC")).toHaveValue("");
});

test("결과가 없을 때 조건을 보여주고 다시 제거할 수 있다", async ({ page }) => {
  await page.goto("/?q=존재하지않는검색어#archive");
  await page.locator('[data-hydrated="true"]').waitFor();
  await expect(
    page.getByRole("heading", { name: "아직 만나는 기록이 없어요." }),
  ).toBeVisible();
  const chip = page.getByRole("button", {
    name: "검색 “존재하지않는검색어” 조건 제거",
  });
  await expect(chip).toBeVisible();
  await chip.click();
  await expect(page.getByTestId("article-row").first()).toBeVisible();
});

test("글에서 원문, 작성자, 태그로 이동할 수 있다", async ({ page }) => {
  await page.goto("/?q=React+Compiler#archive");
  await page.locator('[data-hydrated="true"]').waitFor();
  const row = page
    .getByTestId("article-row")
    .filter({ hasText: "React Compiler" });
  const source = row.getByRole("link", { name: /새 탭에서 원문 열기/ });
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(row.getByRole("link", { name: "염승준" })).toHaveAttribute(
    "href",
    "/members/yeom-seungjun",
  );
  await expect(
    row.getByRole("link", { name: "React 태그로 기록 보기" }),
  ).toHaveAttribute("href", "/?tag=React#archive");
  // 주소만 확인하면 목록이 걸러지지 않는 회귀를 놓친다. Link 이동은
  // popstate를 발생시키지 않아, 주소는 바뀌는데 필터 상태는 이전 검색어에
  // 머물러 있던 적이 있다. 적용된 조건과 결과까지 확인한다.
  await row.getByRole("link", { name: "React 태그로 기록 보기" }).click();
  await expect(page).toHaveURL(/tag=React/);
  await expect(page.getByText("태그 #React")).toBeVisible();
  await expect(page.getByText('검색 “React Compiler”')).toBeHidden();
  const rows = await page.getByTestId("article-row").all();
  expect(rows.length).toBeGreaterThan(0);
  for (const item of rows) {
    await expect(item).toContainText(/#React/);
  }
});

test("모바일에서 모든 메뉴를 사용할 수 있고 가로로 넘치지 않는다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Archive", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Topics", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Members", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "About", exact: true }),
  ).toBeVisible();
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
  await page.goto("/topics/react-framework");
  await expect(
    page.getByRole("heading", {
      name: "React·프레임워크 기록",
      exact: true,
    }),
  ).toBeVisible();
  const topicWidths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(topicWidths.content).toBeLessThanOrEqual(topicWidths.viewport);
  await page.goto("/members/kwon-sihyeon");
  const memberWidths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(memberWidths.content).toBeLessThanOrEqual(memberWidths.viewport);
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { name: "아카이브 소개", exact: true }),
  ).toBeVisible();
  const aboutWidths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(aboutWidths.content).toBeLessThanOrEqual(aboutWidths.viewport);
  await page.goto("/sessions/6");
  const sessionWidths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sessionWidths.content).toBeLessThanOrEqual(sessionWidths.viewport);
});

test("태블릿에서 긴 상세 제목이 자연스럽게 배치된다", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/topics/architecture-patterns");
  await expect(
    page.getByRole("heading", {
      name: "아키텍처·패턴 기록",
      exact: true,
    }),
  ).toBeVisible();
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

test("포커스, 호버와 reduced motion 환경을 보존한다", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const archiveLink = page.getByRole("link", {
    name: "Archive",
    exact: true,
  });
  await archiveLink.focus();
  await expect(archiveLink).toHaveCSS("outline-style", "solid");
  await expect(archiveLink).toHaveCSS("outline-width", "2px");
  await expect(archiveLink).toHaveCSS("outline-color", "rgb(35, 71, 255)");

  const memberCard = page.getByRole("link", { name: /권시현.*개의 기록/ });
  await expect(memberCard).toHaveCSS("transition-property", "none");

  const supportsHover = await page.evaluate(() =>
    window.matchMedia("(hover: hover)").matches,
  );
  if (supportsHover) {
    await memberCard.hover();
    await expect(memberCard).toHaveCSS("background-color", "rgb(35, 71, 255)");
    await expect(memberCard).toHaveCSS("color", "rgb(255, 255, 255)");
  }
});

test("RSS는 게시된 글만 제공한다", async ({ request }) => {
  const response = await request.get("/feed.xml");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await response.text();
  expect(xml).toContain('<rss version="2.0"');
  expect(xml).toContain("<item>");
  expect(xml).toContain("<dc:creator>");
  expect(xml).not.toContain("PREPARING");
});

test("홈 주제 목록에서 주제 페이지로 이동한다", async ({ page }) => {
  await page.goto("/#topics");
  await page.getByRole("link", { name: /React·프레임워크/ }).click();
  await expect(page).toHaveURL(/\/topics\/react-framework/);
  await expect(
    page.getByRole("heading", { name: /React·\s*프레임워크/ }),
  ).toBeVisible();
});
