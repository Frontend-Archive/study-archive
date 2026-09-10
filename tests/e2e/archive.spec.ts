import { expect, test } from "@playwright/test";
test("검색과 초기화가 URL과 결과를 갱신한다", async ({ page }) => {
  await page.goto("/");
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
  await page.locator('a.member-card[href="/members/kwon-sihyeon"]').click();
  await expect(page.getByRole("heading", { name: /권시현/ })).toBeVisible();
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
  await expect(page.getByText("최근 기록부터 천천히 거슬러 올라가 보세요.")).toBeVisible();
});

test("글에서 원문, 작성자, 태그와 주제로 이동할 수 있다", async ({ page }) => {
  await page.goto("/?q=React+Compiler#archive");
  await page.locator('[data-hydrated="true"]').waitFor();
  const row = page.locator(".article-row", { hasText: "React Compiler" });
  const source = row.getByRole("link", { name: /새 탭에서 원문 열기/ });
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(row.getByRole("link", { name: "염승준" })).toHaveAttribute(
    "href",
    "/members/yeom-seungjun",
  );
  await expect(
    row.getByRole("link", { name: "React 태그로 기록 보기" }),
  ).toHaveAttribute("href", "/?tag=React#archive");
  await row.getByRole("link", { name: "React·프레임워크" }).click();
  await expect(page).toHaveURL(/\/topics\/react-framework/);
  await expect(
    page.getByRole("heading", { name: /React·\s*프레임워크/ }),
  ).toBeVisible();
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
  const topicWidths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(topicWidths.content).toBeLessThanOrEqual(topicWidths.viewport);
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
