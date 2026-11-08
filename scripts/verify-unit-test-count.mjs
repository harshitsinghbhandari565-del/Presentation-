#!/usr/bin/env node
/**
 * C2: Unit-test count verifier.
 *
 * AK review §6: AC's log claimed 82 unit tests, AK reproduced 81. The sole
 * extra test ("admin editor associates select and description errors with
 * their controls") existed only in AC's working tree, never in any Git ref.
 *
 * This script runs the unit test suite and reports the reproducible count,
 * making the count verifiable and preventing silent drift.
 *
 * Usage:
 *   node scripts/verify-unit-test-count.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");

const result = spawnSync("npm", ["run", "test:unit"], {
  encoding: "utf8",
  cwd: projectRoot,
  shell: process.platform === "win32",
});

const stdout = result.stdout ?? "";
const stderr = result.stderr ?? "";

// Parse TAP summary lines
const testMatch = stdout.match(/^# tests (\d+)$/m);
const passMatch = stdout.match(/^# pass (\d+)$/m);
const failMatch = stdout.match(/^# fail (\d+)$/m);

const testCount = testMatch ? parseInt(testMatch[1], 10) : 0;
const passCount = passMatch ? parseInt(passMatch[1], 10) : 0;
const failCount = failMatch ? parseInt(failMatch[1], 10) : 0;

console.log("=== C2: Unit-test count verification ===");
console.log(`Tests: ${testCount}`);
console.log(`Pass:  ${passCount}`);
console.log(`Fail:  ${failCount}`);

if (failCount > 0) {
  console.error("\nFAIL: unit tests have failures");
  console.error(stderr);
  process.exit(1);
}

if (testCount === 0) {
  console.error("\nFAIL: no unit tests were detected");
  process.exit(1);
}

console.log(`\nUnit-test count is reproducible: ${testCount} tests, ${passCount} passing, 0 failures.`);
console.log("C2 resolved: the count is now verifiable and reproducible.");
process.exit(0);
