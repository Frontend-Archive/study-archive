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
  await page.locator('a[href="/members/kwon-sihyeon"]').click();
  await expect(page.getByRole("heading", { name: /권시현/ })).toBeVisible();
});
