import { test, expect, type Page } from "@playwright/test";

async function replaceSql(page: Page, value: string) {
  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(value);
}

// Test data is explicitly created by the visitor; it is not preloaded by the app.
async function createStudents(page: Page) {
  await replaceSql(page, "CREATE TABLE students(id INTEGER PRIMARY KEY, name TEXT NOT NULL, marks INTEGER NOT NULL); INSERT INTO students VALUES (1,'Aarav',92),(2,'Mira',85),(3,'Kabir',74),(4,'Zoya',96);");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-status")).toContainText("Completed");
}

test("empty browser sandbox runs custom SQL, isolates visitors, resets and preserves drafts", async ({ page, context }) => {
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await page.getByText("DATABASE OBJECTS").click();
  await expect(page.locator(".sql-schema-list")).toContainText("No tables yet");
  await expect(page.getByLabel("Sample database")).toHaveCount(0);
  await createStudents(page);
  await expect(page.locator(".sql-schema-list")).toContainText("students");
  await replaceSql(page, "INSERT INTO students VALUES (5, 'Test Student', 91); SELECT name FROM students WHERE id = 5;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table")).toContainText("Test Student");
  const other = await context.newPage();
  await other.goto("/sql-workbench");
  await expect(other.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await replaceSql(other, "SELECT name FROM students WHERE id = 5;");
  await other.getByRole("button", { name: /Run SQL/ }).click();
  await expect(other.locator(".sql-error")).toContainText("no such table");
  await other.close();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Reset database" }).click();
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".sql-schema-list")).toContainText("No tables yet");
  await replaceSql(page, "SELECT name FROM students WHERE id = 5;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-error")).toContainText("no such table");
  await page.reload();
  await expect(page.locator(".cm-content")).toContainText("SELECT name FROM students WHERE id = 5;");
});

test("refresh starts an empty database while retaining the SQL draft", async ({ page }) => {
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await createStudents(page);
  await replaceSql(page, "SELECT * FROM students;");
  await page.reload();
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".cm-content")).toContainText("SELECT * FROM students;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-error")).toContainText("no such table");
});

test("custom table, SQL errors, CSV and mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await replaceSql(page, "CREATE TABLE books(title TEXT); INSERT INTO books VALUES('My book'); SELECT * FROM books;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await page.getByText("DATABASE OBJECTS").click();
  await expect(page.locator(".sql-schema-list")).toContainText("books");
  await expect(page.locator(".sql-results-table")).toContainText("My book");
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
  await createStudents(page);
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

test("multiple tabs, formatting, history and session refresh", async ({ page }) => {
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await createStudents(page);
  await replaceSql(page, "select name, marks from students where marks>90;");
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await expect(page.locator(".cm-content")).toContainText("SELECT");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table")).toContainText("Zoya");
  await page.getByRole("button", { name: "Add SQL tab" }).click();
  await replaceSql(page, "SELECT 42 AS answer;");
  await page.reload();
  await expect(page.locator(".cm-content")).toContainText("SELECT 42 AS answer;");
  await page.getByRole("button", { name: "query-1.sql", exact: true }).click();
  await expect(page.locator(".cm-content")).toContainText("students");
  await page.getByText(/Query history/).click();
  await expect(page.locator(".sql-history")).toContainText("students");
  await page.getByRole("button", { name: "query-2.sql", exact: true }).click();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Close query-2.sql" }).click();
  await expect(page.getByRole("button", { name: "query-2.sql", exact: true })).toHaveCount(0);
});

test("sorting, page size and CSV export retain correct data", async ({ page }) => {
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await replaceSql(page, "WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x < 60) SELECT x FROM n;");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table tbody tr")).toHaveCount(50);
  await page.getByLabel("Rows per page").selectOption("25");
  await expect(page.locator(".sql-results-table tbody tr")).toHaveCount(25);
  await page.getByRole("button", { name: /x ↕/ }).click();
  await page.getByRole("button", { name: /x ↑/ }).click();
  await expect(page.locator(".sql-results-table tbody tr").first()).toContainText("60");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".sql-results-table tbody tr").first()).toContainText("35");
  const downloadPromise = page.waitForEvent("download"); await page.getByRole("button", { name: "CSV", exact: true }).click();
  const download = await downloadPromise; const stream = await download.createReadStream();
  let csv = ""; for await (const chunk of stream) csv += chunk.toString();
  expect(csv.split("\r\n")).toHaveLength(61); expect(csv).toMatch(/^"x"\r\n"60"/);
});

test("database file and SQL exports round-trip, malformed files rejected", async ({ page }) => {
  await page.goto("/sql-workbench"); await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await createStudents(page);
  await replaceSql(page, "INSERT INTO students VALUES (9, 'Exported', 89);");
  await page.getByRole("button", { name: /Run SQL/ }).click(); await expect(page.locator(".sql-status")).toContainText("Completed");
  const sqlDownload = page.waitForEvent("download"); await page.getByRole("button", { name: "SQL", exact: true }).click();
  const sqlStream = await (await sqlDownload).createReadStream(); let sql = ""; for await (const c of sqlStream) sql += c.toString(); expect(sql).toContain("Exported");
  const dbDownload = page.waitForEvent("download"); await page.getByRole("button", { name: "Export database" }).click();
  const file = await dbDownload; expect(file.suggestedFilename()).toBe("sandbox.sqlite");
  const stream = await file.createReadStream(); const parts: Buffer[] = []; for await (const c of stream) parts.push(Buffer.from(c)); const data = Buffer.concat(parts);
  page.once("dialog", dialog => dialog.accept()); await page.getByRole("button", { name: "Reset database" }).click();
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  page.once("dialog", dialog => dialog.accept()); await page.locator('input[type="file"]').setInputFiles({name:"test.sqlite", mimeType:"application/vnd.sqlite3", buffer:data});
  await expect(page.getByText("Imported database in use", { exact: false })).toBeVisible();
  await replaceSql(page, "SELECT name FROM students WHERE id = 9;"); await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table")).toContainText("Exported");
  page.once("dialog", dialog => dialog.accept()); await page.locator('input[type="file"]').setInputFiles({name:"bad.sqlite", mimeType:"application/octet-stream", buffer:Buffer.alloc(100)});
  await expect(page.locator(".sql-error")).toContainText("valid SQLite");
  await page.getByRole("button", { name: /Run SQL/ }).click(); await expect(page.locator(".sql-results-table")).toContainText("Exported");
});

test("new empty database asks before replacing data and preserves SQL tabs", async ({ page }) => {
  await page.goto("/sql-workbench");
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await createStudents(page);
  await replaceSql(page, "SELECT name FROM students WHERE id = 1;");
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "New empty database" }).click();
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table")).toContainText("Aarav");
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "New empty database" }).click();
  await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".cm-content")).toContainText("SELECT name FROM students");
  await page.getByText("DATABASE OBJECTS").click();
  await expect(page.locator(".sql-schema-list")).toContainText("No tables yet");
  await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-error")).toContainText("no such table");
});

test("schema completion refreshes for newly created tables and copy writes the selected content", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/sql-workbench"); await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await replaceSql(page, "CREATE TABLE stellar_objects (stellar_id INTEGER, orbit_name TEXT);");
  await page.getByRole("button", { name: /Run SQL/ }).click(); await expect(page.locator(".sql-status")).toContainText("Completed");
  await replaceSql(page, "SELECT * FROM stell"); await page.keyboard.press("Control+Space");
  await expect(page.locator(".cm-tooltip-autocomplete")).toContainText("stellar_objects");
  await page.keyboard.press("Escape"); await page.getByRole("button", { name: "Copy query" }).click();
  await expect(page.getByText("Query copied.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("SELECT * FROM stell");
  await replaceSql(page, "INSERT INTO stellar_objects VALUES (1, 'Orbit'); SELECT orbit_name AS name FROM stellar_objects;"); await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table")).toContainText("Orbit");
  await page.getByRole("button", { name: "Copy results" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('"name"\r\n"Orbit"');
});

test("failed transaction is recoverable via rollback and reset is unavailable during execution", async ({ page }) => {
  await page.goto("/sql-workbench"); await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await createStudents(page);
  await replaceSql(page, "BEGIN; INSERT INTO students VALUES(9, 'Rollback', 70); INSERT INTO students VALUES(9, 'Duplicate', 70);");
  await page.getByRole("button", { name: /Run SQL/ }).click(); await expect(page.locator(".sql-error")).toContainText("Statement 3");
  await page.getByRole("button", { name: "Rollback", exact: true }).click(); await expect(page.locator(".sql-status")).toContainText("Completed");
  await replaceSql(page, "SELECT COUNT(*) AS total FROM students WHERE id=9;"); await page.getByRole("button", { name: /Run SQL/ }).click();
  await expect(page.locator(".sql-results-table tbody")).toContainText("0");
  await replaceSql(page, "WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n) SELECT SUM(x) FROM n;");
  await page.getByRole("button", { name: /Run SQL/ }).click(); await expect(page.getByRole("button", { name: "Reset database" })).toBeDisabled();
  await page.getByRole("button", { name: "Stop" }).click(); await expect(page.locator(".sql-error")).toContainText("discarded");
});

test("shared query library fails closed without its approved migration", async ({ page }) => {
  await page.goto("/sql-workbench/library");
  await expect(page.getByText("Shared queries are not configured or are temporarily unavailable.", { exact: false })).toBeVisible();
  await page.goto("/admin/sql-queries");
  await expect(page).toHaveURL(/admin\/(login|access-denied)/);
});

test("concurrent visitors have separate databases and exports reject open write transactions", async ({ browser }) => {
  const a = await browser.newContext(), b = await browser.newContext();
  try {
    const pa = await a.newPage(), pb = await b.newPage();
    await Promise.all([pa.goto("/sql-workbench"), pb.goto("/sql-workbench")]);
    await Promise.all([expect(pa.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 }), expect(pb.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 })]);
    await createStudents(pa);
    await replaceSql(pa, "BEGIN; INSERT INTO students VALUES (77, 'Private', 77);"); await pa.getByRole("button", { name: /Run SQL/ }).click();
    await expect(pa.locator(".sql-status")).toContainText("Completed");
    await pa.getByRole("button", { name: "Export database" }).click(); await expect(pa.locator(".sql-error")).toContainText(/busy|locked/i, { timeout: 30000 });
    await replaceSql(pb, "SELECT COUNT(*) FROM students WHERE id=77;"); await pb.getByRole("button", { name: /Run SQL/ }).click();
    await expect(pb.locator(".sql-error")).toContainText("no such table");
    await pa.getByRole("button", { name: "Rollback", exact: true }).click(); await expect(pa.locator(".sql-status")).toContainText("Completed");
  } finally { await a.close(); await b.close(); }
});

test("opening a shared SQLite query preserves local drafts and never executes it automatically", async ({ page }) => {
  await page.goto("/sql-workbench"); await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await replaceSql(page, "SELECT 'my private draft';");
  await page.evaluate(() => sessionStorage.setItem("presentation-hub-sql-pending-query", "SELECT 'shared example';"));
  await page.reload(); await expect(page.getByText("SQLite sandbox ready", { exact: false })).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".cm-content")).toContainText("shared example");
  await expect(page.locator(".sql-results-table")).toHaveCount(0);
  await page.getByRole("button", { name: "query-1.sql", exact: true }).click();
  await expect(page.locator(".cm-content")).toContainText("my private draft");
});
