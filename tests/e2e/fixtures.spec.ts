import { test, expect } from "@playwright/test";

test("development-only fixtures render empty, one and multi states without exposing drafts", async ({ page }) => {
  test.skip(process.env.REVIEW_FIXTURE_E2E !== "1", "Run separately against a development server with REVIEW_FIXTURE_E2E=1");
  await page.goto("/library?fixture=1");
  await expect(page.locator(".review-banner")).toContainText("Synthetic records");
  await expect(page.locator('.results-toolbar [role="status"]')).toContainText("15 resources");
  await expect(page.locator(".resource-card")).toHaveCount(12);
  const longCard = page.locator(".resource-card").filter({ hasText: "deliberately long synthetic title" });
  await expect(longCard.locator("h3")).toContainText("across narrow and wide review layouts");
  expect(await longCard.locator(".paper-title").evaluate(element => getComputedStyle(element).webkitLineClamp)).toBe("3");
  await expect(page.getByRole("link", { name: "Next" })).toHaveAttribute("href", /fixture=1/);
  await expect(page.locator(".resource-card").filter({ hasText: "Fixture draft not public" })).toHaveCount(0);
  await page.getByLabel("Document type").selectOption("Worksheet");
  await expect(page).toHaveURL(/fixture=1/);
  await expect(page.locator('.results-toolbar [role="status"]')).toContainText("3 resources");
  await page.goto("/library?fixture=one");
  await expect(page.locator(".resource-card")).toHaveCount(1);
  await page.goto("/library?fixture=empty");
  await expect(page.locator(".resource-card")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No resources on this shelf. Yet." })).toBeVisible();
  await page.goto("/library?fixture=1&q=nonexistent");
  await expect(page.locator(".resource-card")).toHaveCount(0);
  await page.getByRole("link", { name: "Clear search & filters" }).click();
  await expect(page).toHaveURL(/fixture=1/);
  await expect(page.locator(".resource-card")).toHaveCount(12);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `fixture grid at ${width}px`).toBe(true);
  }
});
