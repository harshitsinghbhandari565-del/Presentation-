import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const mathPapersLive = process.env.TEST_MATH_PAPERS === "1";

test("landing communicates purpose and reports an empty catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Less searching.More learning.");
  await expect(page.getByRole("link", { name: "Explore the library", exact: true })).toBeVisible();
  if (mathPapersLive) {
    await expect(page.getByRole("link", { name: /Download .* as PDF/ }).first()).toBeVisible();
  } else {
    await expect(page.locator(".hero-stats")).toContainText("00");
    await expect(page.locator(".resource-card")).toHaveCount(0);
    await expect(page.getByText("A fresh chapter is coming.")).toBeVisible();
  }
  await expect(page.locator("body")).not.toContainText("MCQs Practice");
});
test("library and subjects show genuine empty states", async ({ page }) => {
  await page.goto("/library");
  if (mathPapersLive) {
    await expect(page.getByRole("link", { name: /Download .* as PDF/ }).first()).toBeVisible();
    await page.goto("/subjects");
    await expect(page.getByRole("heading", { name: "Mathematics" })).toBeVisible();
  } else {
    await expect(page.locator(".resource-card")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "No resources on this shelf. Yet." })).toBeVisible();
    await page.goto("/subjects");
    await expect(page.locator(".subject-card")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "A new shelf, ready to grow." })).toBeVisible();
  }
});
test("deleted resource and its legacy URL return 404", async ({ page }) => {
  for (const route of ["/resources/english-lost-spring-mcqs", "/presentation/english-lost-spring-mcqs"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This page isn’t on the shelf." })).toBeVisible();
  }
});
test("command search has no deleted resource", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search ⌘ K resources (Command or Control K)" }).click();
  const input = page.getByRole("combobox", { name: "Search resources" });
  await input.fill("mcqs");
  await expect(page.getByRole("option")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
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
    for (const route of ["/", "/library", "/subjects", "/subjects"]) {
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
    for (const route of ["/", "/library", "/subjects"]) {
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
  await expect(page.locator(".ambient-viewport-field")).toBeHidden();
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

test("math papers offer direct PDF attachments", async ({ page, request }) => {
  test.skip(!mathPapersLive, "Requires the published math-paper catalog");
  await page.goto("/resources/maths-paper-01");
  await expect(page.getByRole("link", { name: /Download .* as PDF/ }).first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText("github.com");
  const response = await request.get("/api/download/maths-paper-01");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("application/pdf");
  expect(response.headers()["content-disposition"]).toContain('attachment; filename="Paper_01.pdf"');
  expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
});
