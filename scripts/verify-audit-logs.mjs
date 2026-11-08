#!/usr/bin/env node
/**
 * C5: Audit-log deduplication verifier.
 *
 * AK review §6.4 found two audit logs (`milestone1-audit-offline.json.log` and
 * `milestone1-audit-registry.json.log`) that are byte-identical (same SHA-256,
 * 380 B). They must be counted as ONE observation, not two.
 *
 * This script scans a directory for audit log files, computes SHA-256 for each,
 * groups byte-identical files, and reports the deduplicated observation count.
 * It exits 0 when the count reflects unique observations (not raw file count).
 *
 * Usage:
 *   node scripts/verify-audit-logs.mjs [dir] [pattern]
 * Defaults: dir=".", pattern="*.log"
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

async function main() {
  const dir = process.argv[2] ?? ".";
  const pattern = process.argv[3] ?? "*.log";

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    console.error(`ERROR: cannot read directory "${dir}"`);
    process.exit(2);
  }

  // Filter by pattern (simple glob: * matches anything)
  const logFiles = entries
    .filter((e) => e.isFile() && patternMatch(e.name, pattern))
    .map((e) => e.name);

  if (logFiles.length === 0) {
    console.log(`No audit log files found in "${dir}" matching "${pattern}".`);
    console.log("Observation count: 0");
    process.exit(0);
  }

  // Compute SHA-256 for each file
  const hashes = new Map(); // hash -> [filenames]
  for (const name of logFiles) {
    const fullPath = path.join(dir, name);
    const content = await readFile(fullPath);
    const hash = createHash("sha256").update(content).digest("hex");
    if (!hashes.has(hash)) hashes.set(hash, []);
    hashes.get(hash).push(name);
  }

  // Report
  const totalFiles = logFiles.length;
  const uniqueHashes = hashes.size;
  const duplicateGroups = [...hashes.values()].filter((files) => files.length > 1);

  console.log(`Audit log directory: "${dir}"`);
  console.log(`Pattern: "${pattern}"`);
  console.log(`Total files: ${totalFiles}`);
  console.log(`Unique hashes: ${uniqueHashes}`);
  console.log(`Duplicate groups: ${duplicateGroups.length}`);

  if (duplicateGroups.length > 0) {
    console.log("\nByte-identical groups (counted as one observation each):");
    for (const files of duplicateGroups) {
      console.log(`  ${files.join(" == ")}  → 1 observation`);
    }
  }

  console.log(`\nObservation count (deduplicated): ${uniqueHashes}`);

  // Exit 0 — the script ran correctly. The observation count is the
  // deduplicated count, not the raw file count.
  process.exit(0);
}

function patternMatch(name, pattern) {
  const regex = new RegExp(
    "^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$",
  );
  return regex.test(name);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
