import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import legacy from "../../src/data/presentations.json";
const original = legacy.presentations[0];

test("landing communicates purpose and only shows genuine collection counts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Less searching.More learning.");
  await expect(page.getByRole("link", { name: "Explore the library", exact: true })).toBeVisible();
  await expect(page.locator(".hero-stats")).toContainText("01");
  await expect(page.locator(".resource-card")).toHaveCount(1);
  await expect(page.locator(".featured-editorial")).toContainText("Good resources deserve");
});
test("library searches real results, composes filters, and offers a working empty state", async ({ page }) => {
  await page.goto("/library");
  await expect(page.locator(".resource-card")).toHaveCount(1);
  await page.getByRole("searchbox", { name: "Search the resource library" }).fill("nonexistent");
  await expect(page).toHaveURL(/q=nonexistent/);
  await expect(page.locator(".resource-card")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No resources on this shelf. Yet." })).toBeVisible();
  await page.getByRole("link", { name: "Clear search & filters" }).click();
  await expect(page.locator(".resource-card")).toHaveCount(1);
  await page.getByLabel("Subject", { exact: true }).selectOption("english");
  await page.getByLabel("Course", { exact: true }).selectOption("class-12");
  await page.getByLabel("Source platform", { exact: true }).selectOption("Google Slides");
  await expect(page.locator(".resource-card")).toHaveCount(1);
  await page.goto("/library?platform=Dropbox");
  await expect(page.locator(".resource-card")).toHaveCount(0);
  await page.goto("/library?q=ENGLISH&sort=title");
  await expect(page.locator(".resource-card")).toHaveCount(1);
});
test("debounced library input keeps focus and mobile filters are a disclosure", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/library");
  const input = page.getByRole("searchbox", {name:"Search the resource library"});
  await input.pressSequentially("mcqs", {delay:80});
  await expect(page).toHaveURL(/q=mcqs/);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("mcqs");
  const disclosure = page.locator(".filter-sidebar details");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await disclosure.locator("summary").click();
  await expect(page.getByLabel("Subject", {exact:true})).toBeVisible();
  await page.getByLabel("Subject", {exact:true}).selectOption("english");
  await expect(page).toHaveURL(/subject=english/);
  await expect(disclosure).toHaveAttribute("open", "");
});

test("subject and document navigation preserve the original external URL", async ({ page }) => {
  await page.goto("/subjects");
  await page.locator(".subject-card").filter({ hasText: "English" }).click();
  await expect(page).toHaveURL("/subjects/english");
  await page.getByRole("link", { name: "MCQs Practice", exact: true }).click();
  await expect(page).toHaveURL("/resources/english-lost-spring-mcqs");
  const open = page.getByRole("link", { name: "Open document: MCQs Practice" });
  await expect(open).toHaveAttribute("href", original.url);
  await expect(open).toHaveAttribute("target", "_blank");
  await expect(open).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByRole("link", { name: "Start presentation: MCQs Practice" })).toHaveAttribute("href", original.presentUrl);
  await expect(page.locator(".resource-facts")).toContainText("Class 12");
  await expect(page.locator(".resource-facts")).toContainText("Not specified");
  const response = await page.goto("/presentation/english-lost-spring-mcqs");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL("/resources/english-lost-spring-mcqs");
});
test("unknown resources return a real 404 and optional preview is user initiated", async ({ page }) => {
  const response = await page.goto("/resources/not-a-real-resource");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This page isn’t on the shelf." })).toBeVisible();
  await page.goto("/resources/english-lost-spring-mcqs");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Load preview" }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", original.embedUrl);
});
test("command search has correct focus, keyboard selection and focus restoration", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search resources (Command or Control K)" });
  await trigger.click();
  const input = page.getByRole("combobox", { name: "Search resources" });
  await expect(input).toBeFocused();
  await input.fill("mcqs");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/resources/english-lost-spring-mcqs");
  await page.keyboard.press("Control+k");
  await expect(input).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest("dialog")))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))).toBe("Search resources (Command or Control K)");
});
test("theme persists and projector mode remains available", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Theme: dark/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Enable projector mode" }).click();
  await expect(page.locator("html")).toHaveClass(/projector-mode/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/projector-mode/);
  await page.getByRole("button", { name: "Disable projector mode" }).click();
  await page.getByRole("button", { name: /^Theme: light/ }).click();
  await expect(page.getByRole("button", { name: /^Theme: system/ })).toBeVisible();
});
test("mobile navigation works without horizontal overflow at 320, 390 and 768px", async ({ page }) => {
  for (const width of [320,390,768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["/", "/library", "/resources/english-lost-spring-mcqs", "/subjects"]) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  await page.getByRole("button", {name:"Open navigation"}).click();
  await page.getByRole("navigation", {name:"Mobile navigation"}).getByRole("link",{name:"Library",exact:true}).click();
  await expect(page).toHaveURL("/library");
  await expect(page.getByRole("navigation", {name:"Mobile navigation"})).toHaveCount(0);
});
test("public pages have no automated WCAG A/AA violations in either theme", async ({ page }) => {
  test.setTimeout(90000);
  for (const theme of ["dark", "light"]) {
    await page.emulateMedia({colorScheme:theme as "dark"|"light",reducedMotion:"reduce"});
    await page.addInitScript(value => localStorage.setItem("presentation-hub-theme",value),theme);
    for (const route of ["/", "/library", "/resources/english-lost-spring-mcqs"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1100);
      const result = await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
      if (result.violations.length) console.log(JSON.stringify(result.violations.map(v => ({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))));
      expect(result.violations, `${route} (${theme})`).toEqual([]);
    }
  }
});
test("reduced motion disables decorative floating animation", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");
  expect(await page.locator(".floating-chip").first().evaluate(element => getComputedStyle(element).animationName)).toBe("none");
});
test("unconfigured services fail honestly; admin does not offer fake persistence", async ({ request, page }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(503);
  expect(await health.json()).toEqual({ok:false,database:"not_configured"});
  await page.goto("/admin");
  await expect(page.getByRole("heading", {name:"A secure home for your collection."})).toBeVisible();
  await expect(page.getByRole("button", {name:"Save resource"})).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
  await page.goto("/admin/access-denied");
  await expect(page).toHaveURL(/\/admin\/login$/);
  for (const route of ["/admin/categories", "/admin/resources/new", "/admin/00000000-0000-0000-0000-000000000001/edit"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/admin\/login$/);
    expect(response?.headers()["cache-control"]).toContain("no-store");
    expect(response?.headers()["cdn-cache-control"]).toBe("no-store");
    await expect(page.getByRole("heading", { name: "Your learning collection." })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Save resource" })).toHaveCount(0);
  }
});

test("unconfirmed logout shows an honest recovery state without private data or public caching", async ({ page, request }) => {
  const response = await request.get("/admin/logout-error");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  await page.goto("/admin/logout-error");
  await expect(page.getByRole("heading", { name: "Sign-out was not confirmed." })).toBeVisible();
  await expect(page.locator('p[role="alert"]')).toContainText("Your session may still be active");
  await expect(page.getByRole("button", { name: "Retry sign out" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save resource" })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.setViewportSize({ width: 320, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
});
