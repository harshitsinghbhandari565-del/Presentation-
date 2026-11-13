import { expect, test, type Page } from "@playwright/test";

async function replaceSql(page: Page, sql: string) {
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(sql);
}
async function run(page: Page, sql: string) {
  await replaceSql(page, sql);
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-status")).toContainText("Completed", { timeout: 30000 });
}

test("MariaDB starts isolated, runs real MariaDB SQL and resets without losing draft", async ({ browser }) => {
  const context = await browser.newContext(); const page = await context.newPage();
  const postRequests: string[] = [];
  page.on("request", req => { if (req.method() !== "GET") postRequests.push(req.url()); });
  await page.goto("/sql-workbench/mariadb");
  await expect(page.getByText("MariaDB sandbox ready", { exact: false })).toBeVisible({ timeout: 60000 });
  expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);
  await run(page, "SELECT VERSION() AS version;");
  await expect(page.locator(".sql-results-table")).toContainText("13.1.0-MariaDB");
  await run(page, "SHOW DATABASES;");
  await expect(page.locator(".sql-results-table")).toContainText("scratch");
  await expect(page.locator(".sql-results-table")).toContainText("information_schema");
  await expect(page.locator(".sql-results-table")).not.toContainText("test");
  await run(page, "CREATE DATABASE my_school;");
  await run(page, "USE my_school;");
  await run(page, "CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(80));");
  await run(page, "INSERT INTO students VALUES (1, 'Ada');");
  await run(page, "SELECT * FROM students;");
  await expect(page.locator(".sql-results-table")).toContainText("Ada");
  const second = await context.newPage(); await second.goto("/sql-workbench/mariadb");
  await expect(second.getByText("MariaDB sandbox ready", { exact: false })).toBeVisible({ timeout: 60000 });
  await run(second, "SHOW DATABASES;");
  await expect(second.locator(".sql-results-table")).not.toContainText("my_school");
  await second.close();
  page.once("dialog", d => d.dismiss()); await page.getByRole("button", {name:"Reset database"}).click();
  await page.getByRole("button", {name:/Run SQL/}).click(); await expect(page.locator(".sql-results-table")).toContainText("Ada");
  page.once("dialog", d => d.accept()); await page.getByRole("button", {name:"Reset database"}).click();
  await expect(page.getByText("MariaDB sandbox ready", { exact: false })).toBeVisible({ timeout: 60000 });
  await expect(page.locator(".cm-content")).toContainText("SELECT * FROM students");
  await page.getByRole("button", {name:/Run SQL/}).click();
  await expect(page.locator(".sql-error")).toBeVisible();
  await run(page, "SHOW DATABASES;");
  await expect(page.locator(".sql-results-table")).not.toContainText("my_school");
  expect(postRequests).toEqual([]);
  await context.close();
});

test("single-statement failure remains usable, drafts survive refresh, and SQLite remains separate", async ({page}) => {
  await page.goto("/sql-workbench/mariadb"); await expect(page.getByText("MariaDB sandbox ready", {exact:false})).toBeVisible({timeout:60000});
  await replaceSql(page, "SELECT 1; SELECT 2;"); await page.getByRole("button", {name:/Run SQL/}).click();
  await expect(page.locator(".sql-error")).toBeVisible();
  await run(page, "SELECT 42 AS answer;"); await expect(page.locator(".sql-results-table")).toContainText("42");
  await page.reload(); await expect(page.getByText("MariaDB sandbox ready", {exact:false})).toBeVisible({timeout:60000});
  await expect(page.locator(".cm-content")).toContainText("SELECT 42 AS answer;");
  page.once("dialog", d => d.accept()); await page.getByRole("link", {name:"Switch to SQLite"}).click();
  await expect(page.getByText("SQLite sandbox ready", {exact:false})).toBeVisible({timeout:30000});
  await expect(page.getByText("Experimental MariaDB is available", {exact:false})).toBeVisible();
  await replaceSql(page, "SHOW DATABASES;"); await page.getByRole("button", {name:/Run SQL/}).click();
  await expect(page.locator(".sql-error")).toContainText("syntax error");
});

test("MariaDB stop terminates the sandbox and reset creates a fresh one", async ({page}) => {
  await page.goto("/sql-workbench/mariadb"); await expect(page.getByText("MariaDB sandbox ready", {exact:false})).toBeVisible({timeout:60000});
  await replaceSql(page, "SELECT SLEEP(30);"); await page.getByRole("button", {name:/Run SQL/}).click();
  await page.getByRole("button", {name:"Stop"}).click();
  await expect(page.locator(".sql-error")).toContainText("discarded");
  await expect(page.getByRole("button", {name:/Run SQL/})).toBeDisabled();
  page.once("dialog", d => d.accept()); await page.getByRole("button", {name:"Reset database"}).click();
  await expect(page.getByText("MariaDB sandbox ready", {exact:false})).toBeVisible({timeout:60000});
  await run(page, "SHOW DATABASES;"); await expect(page.locator(".sql-results-table")).toContainText("scratch");
});

test("MariaDB mobile layout retains controls", async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.goto("/sql-workbench/mariadb");
  await expect(page.getByText("MariaDB sandbox ready", {exact:false})).toBeVisible({timeout:60000});
  await run(page, "SHOW DATABASES;"); await expect(page.locator(".sql-results-table")).toContainText("scratch");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("MariaDB workbench accessibility smoke test", async ({browser}) => {
  const {default: AxeBuilder} = await import("@axe-core/playwright");
  const context = await browser.newContext(); const page = await context.newPage();
  try {
    await page.emulateMedia({reducedMotion:"reduce"}); await page.goto("/sql-workbench/mariadb");
    await expect(page.getByText("MariaDB sandbox ready", {exact:false})).toBeVisible({timeout:60000});
    const results = await new AxeBuilder({page}).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  } finally { await context.close(); }
});
