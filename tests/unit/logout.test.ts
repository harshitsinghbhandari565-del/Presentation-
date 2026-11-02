import assert from "node:assert/strict";
import test from "node:test";
import { revokeSession } from "../../src/lib/admin/logout";

test("confirmed provider revocation is the only successful logout result", async () => {
  let calls = 0;
  assert.equal(await revokeSession({ auth: { signOut: async () => { calls++; return { error: null }; } } }), true);
  assert.equal(calls, 1);
});

test("provider-reported logout errors are not treated as successful sign-out", async () => {
  assert.equal(await revokeSession({ auth: { signOut: async () => ({ error: new Error("Synthetic network failure") }) } }), false);
});

test("thrown provider/logout storage failures are not treated as successful sign-out", async () => {
  assert.equal(await revokeSession({ auth: { signOut: async () => { throw new Error("Synthetic failure"); } } }), false);
});

test("missing server configuration cannot claim a successful logout", async () => {
  assert.equal(await revokeSession(null), false);
});