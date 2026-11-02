import assert from "node:assert/strict";
import test from "node:test";
import { validateSupabaseConfig } from "../../src/lib/supabase/config";
import { getBrowserClient } from "../../src/lib/supabase/browser";

const url = "https://example.supabase.co";
const publishable = "sb_publishable_UNIT_TEST_ONLY_000000000000";
const jwt = (payload: object) => [
  Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url"),
  Buffer.from(JSON.stringify(payload)).toString("base64url"),
  "unit-test-not-a-real-token",
].join(".");

test("public Supabase configuration requires both values and a clean HTTPS origin", () => {
  for (const [candidateUrl, key] of [
    [undefined, publishable], [url, undefined], [url, ""], [url, "short"],
    ["http://example.supabase.co", publishable],
    ["https://user:password@example.supabase.co", publishable],
    ["https://example.supabase.co/path", publishable],
    ["https://example.supabase.co?query=1", publishable],
    ["https://example.supabase.co#fragment", publishable],
    ["not-a-url", publishable],
  ]) assert.equal(validateSupabaseConfig(candidateUrl, key), null);
  assert.deepEqual(validateSupabaseConfig(`${url}/`, publishable), { url, key: publishable });
});

test("public key allowlist rejects secret keys, including when supplied through public configuration", () => {
  for (const key of [
    "sb_secret_UNIT_TEST_ONLY_000000000000",
    jwt({ role: "service_role" }),
    jwt({ role: "authenticated" }),
    jwt({}),
    "not-a-public-supabase-key-with-sufficient-length",
  ]) assert.equal(validateSupabaseConfig(url, key), null);
});

test("publishable keys and legacy anon JWTs are accepted without accepting malformed JWT payloads", () => {
  const anon = jwt({ role: "anon" });
  assert.deepEqual(validateSupabaseConfig(url, anon), { url, key: anon });
  assert.deepEqual(validateSupabaseConfig(url, publishable), { url, key: publishable });
  for (const key of ["eyJ.invalid-json.signature", `${anon}.extra`, `${anon}!`, `${jwt({ role: null })}`]) {
    assert.equal(validateSupabaseConfig(url, key), null);
  }
});

test("browser client refuses an unsafe public key before constructing a Supabase client", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_secret_UNIT_TEST_ONLY_000000000000";
    assert.equal(getBrowserClient(), null);
  } finally {
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  }
});