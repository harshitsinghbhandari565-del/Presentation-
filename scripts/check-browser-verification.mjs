#!/usr/bin/env node
/**
 * C6: Browser verification availability checker.
 *
 * AK review §6.5: browser verification remains BLOCKED and UNVERIFIED —
 * recorded as such, never as passed. This sandbox has no Playwright browser
 * binaries (the browser CDN is not in the network allowlist), so no browser
 * can be installed here.
 *
 * This script checks whether Playwright browser binaries are available and
 * writes a status file. It NEVER reports browser verification as "passed".
 * The status is either "AVAILABLE" (browser present, verification can run)
 * or "BLOCKED" (no browser, verification cannot run).
 *
 * Usage:
 *   node scripts/check-browser-verification.mjs [statusFile]
 * Defaults: statusFile="browser-verification-status.json"
 */
import { existsSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import os from "node:os";

function main() {
  const statusFile = process.argv[2] ?? "browser-verification-status.json";
  const playwrightCache = path.join(os.homedir(), ".cache", "ms-playwright");

  let browserDirs = [];
  if (existsSync(playwrightCache)) {
    try {
      browserDirs = readdirSync(playwrightCache).filter((d) =>
        existsSync(path.join(playwrightCache, d)),
      );
    } catch {
      browserDirs = [];
    }
  }

  // Check for actual browser executables (not just empty directories)
  const hasBrowserExecutable = browserDirs.some((dir) => {
    const browserPath = path.join(playwrightCache, dir);
    try {
      const entries = readdirSync(browserPath);
      // Look for executable files (chrome, headless_shell, etc.)
      return entries.some((entry) => {
        const full = path.join(browserPath, entry);
        try {
          const s = statSync(full);
          return s.isFile();
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  });

  let status;
  let reason;
  if (hasBrowserExecutable) {
    status = "AVAILABLE";
    reason = `Playwright browser executables found in ${browserDirs.join(", ")}`;
  } else {
    status = "BLOCKED";
    reason =
      "No Playwright browser binaries in ~/.cache/ms-playwright. Browser CDN is not in network allowlist. Verification cannot run.";
  }

  const result = {
    status,
    reason,
    playwrightCache: playwrightCache,
    browserDirs,
    timestamp: new Date().toISOString(),
    // C6: never report as passed
    passed: false,
  };

  const outPath = path.resolve(statusFile);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");

  console.log(`Browser verification status: ${status}`);
  console.log(`Reason: ${reason}`);
  console.log(`Status file: ${outPath}`);
  console.log(`Passed: ${result.passed} (C6: never reported as passed when blocked)`);

  process.exit(0);
}

main();
