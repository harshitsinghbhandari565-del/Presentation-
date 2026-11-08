import { test } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../..");
const configPath = path.resolve(projectRoot, "drizzle.config.ts");

const VALID_URL = "postgresql://testuser:testpassword@127.0.0.1:5432/testdb";

function tryLoad(
  overrides: Record<string, string | undefined> = {},
): { ok: boolean; message: string } {
  // Start from the parent env but strip PG* vars so they don't cause false
  // rejections in tests that don't care about them.
  const env: NodeJS.ProcessEnv = { NODE_ENV: process.env.NODE_ENV ?? "test" };
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && !/^pg/i.test(k)) env[k] = v;
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) env[k] = v;
    else delete env[k];
  }
  const script = `import(${JSON.stringify(configPath)}).then(() => {}).catch((e) => { console.error(String(e && e.message || e)); process.exit(1); })`;
  const result = spawnSync(process.execPath, ["--import", "tsx", "--eval", script], {
    env,
    cwd: projectRoot,
    encoding: "utf8",
  });
  return {
    ok: result.status === 0,
    message: (result.stderr ?? "").trim(),
  };
}

test("loads with a valid loopback URL", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: VALID_URL });
  assert.equal(r.ok, true, r.message);
});

test("requires DRIZZLE_DATABASE_URL", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: undefined });
  assert.equal(r.ok, false);
  assert.match(r.message, /DRIZZLE_DATABASE_URL is required/);
});

test("rejects empty DRIZZLE_DATABASE_URL", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "" });
  assert.equal(r.ok, false);
  assert.match(r.message, /DRIZZLE_DATABASE_URL is required/);
});

test("ignores DATABASE_URL (only DRIZZLE_DATABASE_URL works)", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: undefined, DATABASE_URL: VALID_URL });
  assert.equal(r.ok, false);
  assert.match(r.message, /DRIZZLE_DATABASE_URL is required/);
});

test("rejects PGPASSWORD", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: VALID_URL, PGPASSWORD: "secret" });
  assert.equal(r.ok, false);
  assert.match(r.message, /PG\* environment variable/);
});

test("rejects PGHOST", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: VALID_URL, PGHOST: "127.0.0.1" });
  assert.equal(r.ok, false);
  assert.match(r.message, /PG\* environment variable/);
});

test("rejects lowercase pgpassword (case-insensitive)", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: VALID_URL, pgpassword: "secret" });
  assert.equal(r.ok, false);
  assert.match(r.message, /PG\* environment variable/);
});

test("rejects PgData (case-insensitive PG prefix)", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: VALID_URL, PgData: "/tmp" });
  assert.equal(r.ok, false);
  assert.match(r.message, /PG\* environment variable/);
});

test("rejects non-loopback host evil.example", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@evil.example:5432/d" });
  assert.equal(r.ok, false);
});

test("rejects 0.0.0.0 host", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@0.0.0.0:5432/d" });
  assert.equal(r.ok, false);
});

test("rejects 127.0.0.2 host (not in allowlist)", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@127.0.0.2:5432/d" });
  assert.equal(r.ok, false);
});

test("accepts localhost host (mapped to 127.0.0.1)", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@localhost:5432/d" });
  assert.equal(r.ok, true, r.message);
});

test("accepts [::1] host (mapped to ::1)", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@[::1]:5432/d" });
  assert.equal(r.ok, true, r.message);
});

test("accepts postgres:// protocol", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgres://u:p@127.0.0.1:5432/d" });
  assert.equal(r.ok, true, r.message);
});

test("rejects port 0", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@127.0.0.1:0/d" });
  assert.equal(r.ok, false);
});

test("rejects port 65536", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@127.0.0.1:65536/d" });
  assert.equal(r.ok, false);
});

test("rejects two path segments", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@127.0.0.1:5432/d/extra" });
  assert.equal(r.ok, false);
});

test("rejects query string", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@127.0.0.1:5432/d?sslmode=require" });
  assert.equal(r.ok, false);
});

test("rejects fragment", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@127.0.0.1:5432/d#frag" });
  assert.equal(r.ok, false);
});

test("rejects empty user", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://:p@127.0.0.1:5432/d" });
  assert.equal(r.ok, false);
});

test("rejects empty password", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:@127.0.0.1:5432/d" });
  assert.equal(r.ok, false);
});

test("accepts percent-encoded user and password (decoded once)", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u%40x:p%40s@127.0.0.1:5432/d" });
  assert.equal(r.ok, true, r.message);
});

test("rejects lowercase percent-encoding %ff", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p%ff@127.0.0.1:5432/d" });
  assert.equal(r.ok, false);
});

test("rejects control char percent-encoding %0A", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p%0A@127.0.0.1:5432/d" });
  assert.equal(r.ok, false);
});

test("rejects decomposed NFC percent-encoding", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p%65%CC%81@127.0.0.1:5432/d" });
  assert.equal(r.ok, false);
});

test("rejects path traversal in database name (M-3 closure)", () => {
  const r = tryLoad({ DRIZZLE_DATABASE_URL: "postgresql://u:p@127.0.0.1:5432/d%2F..%2F..%2Fetc" });
  assert.equal(r.ok, false);
});
