import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("header names, visible keyboard focus and search dialog work on workbench routes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/sql-workbench", "/sql-workbench/library"]) {
    await page.goto(path);
    const brand = page.getByRole("banner").getByRole("link", { name: "Harshit Presentation Hub home" });
    const search = page.getByRole("button", { name: "Search ⌘ K resources (Command or Control K)" });
    await expect(brand).toBeVisible();
    await expect(search).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(brand).toBeFocused();
    expect(await brand.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe("none");
    await search.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Search resources" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(search).toBeFocused();
    if (path === "/sql-workbench") await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible();
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
  }
});

test("mobile search and navigation have names and work with a keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sql-workbench");
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("button", { name: "Search ⌘ K resources (Command or Control K)" })).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
});
