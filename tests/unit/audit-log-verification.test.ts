import { test } from "node:test";
import assert from "node:assert";
import { writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../..");
const scriptPath = path.resolve(projectRoot, "scripts/verify-audit-logs.mjs");

function runVerify(dir: string): { ok: boolean; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [scriptPath, dir, "*.log"], {
    encoding: "utf8",
    cwd: projectRoot,
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

test("C5: two byte-identical audit logs are counted as one observation", async () => {
  const tmpDir = path.join(projectRoot, "tmp-c5-test");
  rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });

  // Write two byte-identical audit logs (the AK review §6.4 case)
  const identicalContent = JSON.stringify({
    name: "npm audit",
    audit: { vulnerabilities: 0 },
    timestamp: "2026-11-04T00:00:00Z",
  });
  writeFileSync(path.join(tmpDir, "milestone1-audit-offline.json.log"), identicalContent);
  writeFileSync(path.join(tmpDir, "milestone1-audit-registry.json.log"), identicalContent);

  // Write a third, different audit log
  writeFileSync(
    path.join(tmpDir, "milestone1-audit-production.json.log"),
    JSON.stringify({ name: "npm audit", audit: { vulnerabilities: 0 }, timestamp: "2026-11-05T00:00:00Z" }),
  );

  const r = runVerify(tmpDir);
  assert.equal(r.ok, true, r.stderr);

  // Total files = 3, but unique observations = 2 (two identical + one different)
  assert.match(r.stdout, /Total files: 3/);
  assert.match(r.stdout, /Unique hashes: 2/);
  assert.match(r.stdout, /Duplicate groups: 1/);
  assert.match(r.stdout, /Observation count \(deduplicated\): 2/);
  assert.match(r.stdout, /milestone1-audit-offline\.json\.log == milestone1-audit-registry\.json\.log/);

  rmSync(tmpDir, { recursive: true, force: true });
});

test("C5: all-unique audit logs are counted individually", async () => {
  const tmpDir = path.join(projectRoot, "tmp-c5-test-unique");
  rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });

  writeFileSync(path.join(tmpDir, "a.log"), "content-a");
  writeFileSync(path.join(tmpDir, "b.log"), "content-b");
  writeFileSync(path.join(tmpDir, "c.log"), "content-c");

  const r = runVerify(tmpDir);
  assert.equal(r.ok, true, r.stderr);
  assert.match(r.stdout, /Total files: 3/);
  assert.match(r.stdout, /Unique hashes: 3/);
  assert.match(r.stdout, /Observation count \(deduplicated\): 3/);

  rmSync(tmpDir, { recursive: true, force: true });
});

test("C5: empty directory reports zero observations", async () => {
  const tmpDir = path.join(projectRoot, "tmp-c5-test-empty");
  rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });

  const r = runVerify(tmpDir);
  assert.equal(r.ok, true, r.stderr);
  assert.match(r.stdout, /No audit log files found/);
  assert.match(r.stdout, /Observation count: 0/);

  rmSync(tmpDir, { recursive: true, force: true });
});

test("C6: browser verification status file records BLOCKED when no browser", async () => {
  const scriptPath = path.resolve(projectRoot, "scripts/check-browser-verification.mjs");
  const tmpStatus = path.join(projectRoot, "tmp-c6-status.json");

  const result = spawnSync(process.execPath, [scriptPath, tmpStatus], {
    encoding: "utf8",
    cwd: projectRoot,
  });

  assert.equal(result.status, 0, result.stderr);

  const status = JSON.parse(readFileSync(tmpStatus, "utf8"));
  assert.equal(status.status, "BLOCKED");
  assert.equal(status.passed, false, "C6: browser verification must never be reported as passed");
  assert.match(status.reason, /No Playwright browser binaries/);

  rmSync(tmpStatus, { force: true });
});
