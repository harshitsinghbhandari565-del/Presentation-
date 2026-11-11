import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
  // Turbopack uses hashed chunk names: inspect the built client chunks rather
  // than hoping a network URL contains the source name "three".
  const chunks = join(process.cwd(), ".next/static/chunks");
  const threeChunks = readdirSync(chunks).filter(name => name.endsWith(".js") && readFileSync(join(chunks, name), "utf8").includes("WebGLRenderer"));
  expect(threeChunks.length).toBeGreaterThan(0);
  await page.waitForTimeout(600);
  expect(requests.some(url => threeChunks.some(name => new URL(url).pathname.endsWith(`/${name}`)))).toBe(false);
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
});

// Browser-only escape hatch: the application must request the major-caveat
// protection, but this headless sandbox has only software WebGL. Keep recording
// the requested attributes while allowing the test browser to create a context.
async function allowHeadlessSoftwareWebGL(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    const calls: { type: string; options: Record<string, unknown> }[] = [];
    (window as unknown as { glRequests: typeof calls }).glRequests = calls;
    const colors: number[][] = [];
    (window as unknown as { glColors: typeof colors }).glColors = colors;
    const uniform = WebGLRenderingContext.prototype.uniform3f;
    WebGLRenderingContext.prototype.uniform3f = function (location, x, y, z) {
      colors.push([x, y, z]);
      return uniform.call(this, location, x, y, z);
    };
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") {
        const options = { ...((args[0] ?? {}) as Record<string, unknown>) };
        calls.push({ type, options });
        args[0] = { ...options, failIfMajorPerformanceCaveat: false };
      }
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
}

test("successful shelf context loss restores poster, retry control, and polite status", async ({ page }) => {
  await allowHeadlessSoftwareWebGL(page);
  await page.goto("/");
  await page.getByRole("button", { name: "View optional 3D shelf" }).click();
  const stage = page.locator("#optional-shelf-stage");
  await expect(stage).toHaveAttribute("data-state", "ready");
  await expect(stage.locator("canvas")).toHaveCount(1);
  const requests = await page.evaluate(() => (window as unknown as { glRequests: { type: string; options: Record<string, unknown> }[] }).glRequests);
  expect(requests.some(call => call.type === "webgl2" && call.options.failIfMajorPerformanceCaveat === true && call.options.powerPreference === "low-power")).toBe(true);
  const loss = await stage.locator("canvas").evaluate(canvas => {
    const element = canvas as HTMLCanvasElement;
    const gl = element.getContext("webgl2");
    const ext = gl?.getExtension("WEBGL_lose_context");
    if (ext) { ext.loseContext(); return "extension"; }
    element.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    return "synthetic-event";
  });
  expect(["extension", "synthetic-event"]).toContain(loss);
  await expect(stage).toHaveAttribute("data-state", "fallback");
  await expect(stage.locator("canvas")).toHaveCount(0);
  await expect(stage.locator(".static-shelf")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try optional 3D shelf again" })).toBeEnabled();
  await expect(page.locator('.optional-shelf [role="status"]')).toContainText("interrupted");
});

test("projector mode blocks and tears down the optional scene without blocking scrolling", async ({ page }) => {
  await allowHeadlessSoftwareWebGL(page);
  await page.goto("/");
  await page.getByRole("button", { name: "View optional 3D shelf" }).click();
  await expect(page.locator("#optional-shelf-stage")).toHaveAttribute("data-state", "ready");
  await page.getByRole("button", { name: "Enable projector mode" }).click();
  await expect(page.locator("#optional-shelf-stage")).toHaveAttribute("data-state", "fallback");
  await expect(page.locator("#optional-shelf-stage canvas")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Try optional 3D shelf again" })).toBeDisabled();
  await expect(page.locator('.optional-shelf [role="status"]')).toContainText("Projector mode");
  await page.evaluate(() => window.scrollTo(0, 1000));
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Disable projector mode" }).click();
  await expect(page.getByRole("button", { name: "Try optional 3D shelf again" })).toBeEnabled();
  await expect(page.locator("#optional-shelf-stage canvas")).toHaveCount(0);
});

test("forced colours suppress decoration and pending results retain full text contrast", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/library");
  await expect(page.locator('.library-results-content[aria-busy="false"]')).toBeVisible();
  await page.evaluate(() => { const element = document.createElement("div"); element.className = "skeleton"; element.id = "forced-colors-test-skeleton"; document.body.appendChild(element); });
  for (const selector of [".ambient-canvas", ".ambient-grid"]) expect(await page.locator(selector).evaluate(element => getComputedStyle(element).display)).toBe("none");
  expect(await page.locator("#forced-colors-test-skeleton").evaluate(element => getComputedStyle(element, "::after").display)).toBe("none");
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "no-preference" });
  let release: () => void = () => {};
  let intercepted = 0;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/library?*", async route => {
    if (route.request().url().includes("q=nonexistent")) { intercepted += 1; await gate; }
    await route.continue();
  });
  try {
    await page.getByRole("searchbox", { name: "Search the resource library" }).fill("nonexistent");
    await expect(page.locator(".library-results-content")).toHaveAttribute("aria-busy", "true");
    await expect.poll(() => intercepted).toBeGreaterThan(0);
    expect(await page.locator(".library-results").evaluate(element => getComputedStyle(element).opacity)).toBe("1");
    await expect(page.locator('.results-toolbar [role="status"]')).toContainText("Updating results");
    expect(await page.locator('.results-toolbar [role="status"]').evaluate(element => element.closest('[aria-busy="true"]'))).toBeNull();
    const accessibility = await new AxeBuilder({ page }).include(".library-results").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
  } finally { release(); }
  await expect(page.locator(".library-results-content")).toHaveAttribute("aria-busy", "false", { timeout: 15000 });
});

test("Geist heading roles, grid stacking and both theme tokens stay in sync", async ({ page }) => {
  await allowHeadlessSoftwareWebGL(page);
  await page.goto("/");
  await expect(page.locator(".ambient-canvas")).toHaveAttribute("data-state", "ready");
  const layers = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return { bg: style.getPropertyValue("--bg").trim(), accent: style.getPropertyValue("--accent").trim(), grid: getComputedStyle(document.querySelector(".ambient-grid")!).zIndex, canvas: getComputedStyle(document.querySelector(".ambient-canvas")!).zIndex, h1: getComputedStyle(document.querySelector("h1")!).fontFamily, h3: getComputedStyle(document.querySelector(".optional-shelf h3")!).fontFamily, em: getComputedStyle(document.querySelector("h1 em")!).fontFamily };
  });
  expect(layers.bg).toBe("#090b10"); expect(layers.accent).toBe("#a5aaff");
  expect(Number(layers.grid)).toBeGreaterThan(Number(layers.canvas));
  expect(layers.h1).toBe(layers.h3); expect(layers.em).not.toBe(layers.h1);
  const hasColor = async (expected: number[]) => page.evaluate(value => (window as unknown as { glColors: number[][] }).glColors.some(color => color.every((channel, index) => Math.abs(channel - value[index]) < 0.0001)), expected);
  await expect.poll(() => hasColor([165 / 255, 170 / 255, 1])).toBe(true);
  await expect.poll(() => hasColor([9 / 255, 11 / 255, 16 / 255])).toBe(true);
  const requests = await page.evaluate(() => (window as unknown as { glRequests: { type: string; options: Record<string, unknown> }[] }).glRequests);
  expect(requests.some(call => call.type === "webgl" && call.options.failIfMajorPerformanceCaveat === true)).toBe(true);
  await page.getByRole("button", { name: /^Theme: dark/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".ambient-canvas")).toHaveAttribute("data-state", "ready");
  const light = await page.evaluate(() => ({ bg: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(), accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() }));
  expect(light).toEqual({ bg: "#f8f9fc", accent: "#5157c4" });
  await expect.poll(() => hasColor([81 / 255, 87 / 255, 196 / 255])).toBe(true);
  await expect.poll(() => hasColor([248 / 255, 249 / 255, 252 / 255])).toBe(true);
});

test("production ignores fixture flags and keeps the catalog empty", async ({ page }) => {
  await page.goto("/library?fixture=1");
  await expect(page.locator(".review-banner")).toHaveCount(0);
  await expect(page.locator(".resource-card")).toHaveCount(0);
  const response = await page.request.get("/fixtures/review-catalog.json");
  expect(response.status()).toBe(404);
});

test("projector mode at page load blocks any optional 3D download", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("presentation-hub-projector", "true"));
  const chunks = join(process.cwd(), ".next/static/chunks");
  const threeChunks = readdirSync(chunks).filter(name => name.endsWith(".js") && readFileSync(join(chunks, name), "utf8").includes("WebGLRenderer"));
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/projector-mode/);
  await expect(page.locator("#optional-shelf-stage")).toHaveAttribute("data-state", "fallback");
  await expect(page.getByRole("button", { name: "Try optional 3D shelf again" })).toBeDisabled();
  await expect(page.locator('.optional-shelf [role="status"]')).toContainText("Projector mode");
  expect(requests.some(url => threeChunks.some(name => new URL(url).pathname.endsWith(`/${name}`)))).toBe(false);
});
