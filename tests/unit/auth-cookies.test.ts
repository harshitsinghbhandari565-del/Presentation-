import assert from "node:assert/strict";
import test from "node:test";
import { getAuthCookieOptions } from "../../src/lib/supabase/cookies";

test("production auth cookies are secure, same-site and host-only", () => {
  const options = getAuthCookieOptions(true);
  assert.deepEqual(options, { path: "/", sameSite: "lax", secure: true, httpOnly: false });
  assert.equal("domain" in options, false);
});

test("development keeps local HTTP login usable without weakening production", () => {
  assert.equal(getAuthCookieOptions(false).secure, false);
  assert.equal(getAuthCookieOptions(true).secure, true);
  assert.equal(getAuthCookieOptions(false).sameSite, "lax");
});

test("cookie policy preserves provider expiry and the browser-managed SSR design", () => {
  const options = getAuthCookieOptions(true);
  // Browser-created login cookies cannot be HttpOnly. Do not claim otherwise.
  assert.equal(options.httpOnly, false);
  // Do not override the provider's refresh/session expiry with a fixed maxAge.
  assert.equal("maxAge" in options, false);
  assert.equal("expires" in options, false);
});