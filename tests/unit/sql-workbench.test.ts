import test from "node:test";
import assert from "node:assert/strict";
import initSqlJs from "sql.js";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { executeSql, csvForResult, schemaOf, mayChangeOrDeleteExistingData } from "../../src/lib/sql-workbench/engine";
import { samples } from "../../src/lib/sql-workbench/samples";

const sqlReady = initSqlJs();

test("all seven fictional samples build and their starter SQL returns real rows", async () => {
  const SQL = await sqlReady;
  assert.equal(samples.length, 7);
  for (const sample of samples) {
    const db = new SQL.Database();
    try {
      db.run("PRAGMA foreign_keys = ON"); db.run(sample.sql);
      const result = executeSql(db, sample.starter);
      assert.ok(result.results[0].rows.length > 0, sample.name);
      assert.ok(result.schema.length >= 2, sample.name);
    } finally { db.close(); }
  }
});

test("SQLite execution supports DDL, mutations, transactions, joins and errors", async () => {
  const SQL = await sqlReady;
  const db = new SQL.Database();
  try {
    db.run("PRAGMA foreign_keys=ON"); db.run(samples[0].sql);
    const result = executeSql(db, `CREATE TABLE t(id INTEGER PRIMARY KEY, name TEXT); INSERT INTO t VALUES (1,'Ada'); UPDATE t SET name='Grace' WHERE id=1; SELECT name FROM t;`);
    assert.equal(result.statements, 4);
    assert.equal(result.changes, 2);
    assert.deepEqual(result.results[0].rows, [["Grace"]]);
    assert.ok(schemaOf(db).some(table => table.name === "t" && table.columns.some(column => column.primaryKey)));
    executeSql(db, "BEGIN; DELETE FROM t; ROLLBACK;");
    assert.deepEqual(executeSql(db, "SELECT count(*) FROM t").results[0].rows, [[1]]);
    assert.throws(() => executeSql(db, "SELECT * FROM missing_table"), /no such table/);
    assert.throws(() => executeSql(db, "INSERT INTO enrolments VALUES (999,1)"), /FOREIGN KEY/);
  } finally { db.close(); }
});

test("multi-statement results are capped and SQL size limits are enforced", async () => {
  const SQL = await sqlReady;
  const db = new SQL.Database();
  try {
    const result = executeSql(db, "SELECT 1 AS a; SELECT 2 AS b;");
    assert.equal(result.results.length, 2);
    const many = executeSql(db, "WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<800) SELECT x FROM n;");
    assert.equal(many.results[0].rows.length, 500);
    assert.equal(many.results[0].truncated, true);
    assert.throws(() => executeSql(db, " "), /Enter a SQL/);
    assert.throws(() => executeSql(db, "x".repeat(100_001)), /too long/);
  } finally { db.close(); }
});

test("CSV escapes quotes and neutralizes spreadsheet formulas", () => {
  const csv = csvForResult({ columns: ["name", "=header"], rows: [["Alice, B", '=HYPERLINK("x")'], [null, -2]], truncated: false });
  assert.equal(csv, `"name","'=header"\r\n"Alice, B","'=HYPERLINK(""x"")"\r\n"","'-2"`);
});


test("potentially destructive SQL triggers a usability warning, not a security policy", () => {
  assert.equal(mayChangeOrDeleteExistingData("UPDATE students SET marks=0"), true);
  assert.equal(mayChangeOrDeleteExistingData("SELECT 1; DROP TABLE students"), true);
  assert.equal(mayChangeOrDeleteExistingData("-- DELETE everything\nSELECT 'drop table', \"update\""), false);
});

test("deployed SQLite WebAssembly matches the installed engine", () => {
  const hash = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
  assert.equal(hash("public/sql/sql-wasm.wasm"), hash("node_modules/sql.js/dist/sql-wasm.wasm"));
});

test("RETURNING completes mutations even when output is truncated", async () => {
  const SQL = await sqlReady; const db = new SQL.Database();
  try {
    db.run("CREATE TABLE t(x)");
    const result = executeSql(db, "WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x < 1000) INSERT INTO t SELECT x FROM n RETURNING x");
    assert.equal(result.results[0].rows.length, 500); assert.equal(result.results[0].truncated, true);
    assert.equal(result.changes, 1000);
    assert.deepEqual(db.exec("SELECT count(*) FROM t")[0].values, [[1000]]);
  } finally { db.close(); }
});

test("errors identify the failing statement and retain explicit transaction state", async () => {
  const SQL = await sqlReady; const db = new SQL.Database();
  try {
    db.run("CREATE TABLE t(x UNIQUE)");
    assert.throws(() => executeSql(db, "BEGIN; INSERT INTO t VALUES(1); INSERT INTO t VALUES(1);"), /Statement 3.*UNIQUE/);
    assert.deepEqual(db.exec("SELECT count(*) FROM t")[0].values, [[1]]);
    executeSql(db, "ROLLBACK"); assert.deepEqual(db.exec("SELECT count(*) FROM t")[0].values, [[0]]);
    assert.throws(() => executeSql(db, "SELECT 1; SELECT * FROM missing"), /Statement 2/);
  } finally { db.close(); }
});

test("large result values and statement count are bounded", async () => {
  const SQL = await sqlReady; const db = new SQL.Database();
  try {
    const r = executeSql(db, "SELECT hex(zeroblob(600000)) AS value;");
    assert.equal(r.results[0].truncated, true); assert.equal(r.results[0].rows.length, 0);
    assert.throws(() => executeSql(db, Array(101).fill("SELECT 1;").join(" ")), /at most 100/);
  } finally { db.close(); }
});
