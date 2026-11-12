import test from "node:test";
import assert from "node:assert/strict";
import { sortedResult } from "../../src/lib/sql-workbench/results";

test("sorting preserves original result, handles numbers and nulls, and is stable", () => {
  const result = { columns: ["value"], rows: [[10], [2], [null], [2]], truncated: true };
  assert.deepEqual(sortedResult(result, 0, "asc").rows, [[null], [2], [2], [10]]);
  assert.deepEqual(sortedResult(result, 0, "desc").rows, [[10], [2], [2], [null]]);
  assert.deepEqual(result.rows, [[10], [2], [null], [2]]);
  assert.equal(sortedResult(result, 0, "asc").truncated, true);
});
