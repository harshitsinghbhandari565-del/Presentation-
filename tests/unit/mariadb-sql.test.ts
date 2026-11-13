import { test } from "node:test";
import assert from "node:assert/strict";
// Runtime module is served directly to the browser worker.
// @ts-expect-error This plain JS module is intentionally used unbundled.
import { ensureOneStatement } from "../../public/sql/mariadb-sql.mjs";

test("MariaDB single statement guard permits quoted delimiters and comments", () => {
  for (const sql of ["SHOW DATABASES;", "SELECT ';' AS value; -- hi", "SELECT 'it''s;ok'", "SELECT `semi;colon` FROM t; # comment", "/* head */ SELECT 1; /* tail */"]) assert.doesNotThrow(() => ensureOneStatement(sql));
});
test("MariaDB single statement guard rejects multiple or ambiguous statements", () => {
  for (const sql of ["SELECT 1; SELECT 2", "SELECT 1;;", "SELECT 'x\\'y'", "/*!50000 SELECT 1 */", "/*M!100000 SELECT 1 */", "SELECT 'unterminated", "/* comment */"]) assert.throws(() => ensureOneStatement(sql));
});
