import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("reduced motion keeps content visible and disables ambient/skeleton animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".how-step")).toHaveCount(3);
  expect(await page.locator(".ambient-canvas").evaluate(el => getComputedStyle(el).display)).toBe("none");
  await page.goto("/library");
  await expect(page.locator(".resource-card")).toHaveCount(1);
});
test("WebGL unavailable falls back without hiding content or breaking optional 3D", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".ambient-canvas")).toHaveAttribute("data-state", "fallback");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "View optional 3D shelf" }).click();
  await expect(page.getByRole("status")).toContainText("3D is unavailable here");
  await expect(page.locator(".static-shelf")).toBeVisible();
});
test("pinned story is keyboard navigable and content survives animation initialization failure", async ({ page }) => {
  await page.addInitScript(() => { delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver; });
  await page.goto("/");
  const steps = page.locator(".how-step");
  await expect(steps).toHaveCount(3);
  for (const id of ["story-step-1", "story-step-2", "story-step-3"]) await expect(page.locator(`#${id}`)).toBeVisible();
  await page.locator("#how-it-works").scrollIntoViewIfNeeded();
  await page.locator("#main-content").getByRole("link", { name: "How it works", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#how-it-works/);
  await page.locator('.story-index a[href="#story-step-1"]').focus();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe("#story-step-2");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe("#story-step-3");
  await page.keyboard.press("Tab");
  // The pinned chapter must not trap focus: users can tab beyond the index.
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest(".story-index")))).toBe(false);
});
test("search results announce updates atomically and empty state remains understandable", async ({ page }) => {
  await page.goto("/library");
  const status = page.locator('.results-toolbar p[role="status"]');
  await expect(status).toHaveAttribute("aria-atomic", "true");
  await expect(status).toContainText("1 resource");
  await page.getByRole("searchbox", { name: "Search the resource library" }).fill("nonexistent");
  await expect(status).toContainText("0 resources");
  await expect(page.getByRole("heading", { name: "No resources on this shelf. Yet." })).toBeVisible();
});
test("optional 3D is not requested on initial load and landing has no automated WCAG A/AA violations", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (request.resourceType() === "script") requests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "View optional 3D shelf" })).toBeVisible();
  expect(requests.some(url => /shelf-scene|three/.test(url))).toBe(false);
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
});
