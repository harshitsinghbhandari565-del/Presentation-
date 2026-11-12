import { test, expect, type Page } from "@playwright/test";

async function replaceSql(page: Page, value: string) {
  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(value);
}

test("real browser sandbox runs, mutates, resets and saves only its draft", async ({ page, context }) => {
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table")).toContainText("Zoya");
  await expect(page.locator(".sql-results-table tbody tr")).toHaveCount(3);
  await replaceSql(page, "INSERT INTO students VALUES (5, 'Test Student', 91); SELECT name FROM students WHERE id = 5;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table")).toContainText("Test Student");
  const other = await context.newPage();
  await other.goto("/sql-workbench");
  await expect(other.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await replaceSql(other, "SELECT name FROM students WHERE id = 5;");
  await other.getByRole("button", { name: /Run SQL/ }).click();
  await expect(other.locator(".sql-result-summary")).toContainText("0 displayed rows");
  await other.close();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Reset database" }).click();
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await replaceSql(page, "SELECT name FROM students WHERE id = 5;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-result-summary")).toContainText("0 displayed rows");
  await page.reload();
  await expect(page.locator(".cm-content")).toContainText("SELECT name FROM students WHERE id = 5;");
});

test("sample selection, SQL errors, CSV and mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await page.getByLabel("Sample database").selectOption("library");
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Load sample" }).click();
  await page.getByText("DATABASE OBJECTS").click();
  await expect(page.locator(".sql-schema-list")).toContainText("loans");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table")).toContainText("Meera");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "CSV" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("results.csv");
  await replaceSql(page, "SELECT * FROM no_such_table;");
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(page.locator(".sql-error")).toContainText("no such table");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("destructive SQL requires confirmation and can be cancelled", async ({ page }) => {
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await replaceSql(page, "DELETE FROM students;");
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await replaceSql(page, "SELECT COUNT(*) AS total FROM students;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table tbody")).toContainText("4");
});

test("stop terminates a long-running worker and reset restores the sandbox", async ({ page }) => {
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await replaceSql(page, "WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n) SELECT SUM(x) FROM n;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(page.locator(".sql-error")).toContainText("in-memory database was discarded");
  await expect(page.getByRole("button", { name: /Run SQL/ })).toBeDisabled();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Reset database" }).click();
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("button", { name: /Run SQL/ })).toBeEnabled();
});

test("long-running SQL times out without sending SQL to a server", async ({ page }) => {
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  const sqlRequests: string[] = [];
  page.on("request", request => { if (request.method() !== "GET") sqlRequests.push(request.url()); });
  await replaceSql(page, "WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n) SELECT SUM(x) FROM n;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-error")).toContainText("exceeded 10 seconds", { timeout: 25000 });
  expect(sqlRequests).toEqual([]);
});
