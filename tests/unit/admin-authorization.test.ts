import assert from "node:assert/strict";
import test from "node:test";
import {
  administratorAccessRedirect,
  resolveAdministratorAccess,
  type AdministratorAuthorizationDependencies,
} from "../../src/lib/admin/authorization";

const adminId = "00000000-0000-4000-8000-000000000001";
const otherId = "00000000-0000-4000-8000-000000000002";
const failure = new Error("Synthetic provider failure");

function fixture(options: {
  user?: { id: string } | null;
  authError?: unknown;
  membership?: { user_id: string } | null;
  membershipError?: unknown;
  throwAt?: "auth" | "membership";
} = {}) {
  const calls: string[] = [];
  const client: AdministratorAuthorizationDependencies = {
    getVerifiedUser: async () => {
      calls.push("auth.getUser");
      if (options.throwAt === "auth") throw failure;
      return { data: { user: options.user ?? null }, error: options.authError ?? null };
    },
    getMembership: async userId => {
      calls.push(`membership:${userId}`);
      if (options.throwAt === "membership") throw failure;
      return { data: options.membership ?? null, error: options.membershipError ?? null };
    },
  };
  return { client, calls };
}

test("anonymous users never receive administrator access or trigger a membership lookup", async () => {
  const { client, calls } = fixture();
  const access = await resolveAdministratorAccess(client);
  assert.deepEqual(access, { user: null, isAdministrator: false });
  assert.deepEqual(calls, ["auth.getUser"]);
  assert.equal(administratorAccessRedirect(access), "/admin/login");
});

test("invalid Auth responses fail closed even if a membership-shaped object is supplied", async () => {
  const { client, calls } = fixture({ authError: failure, membership: { user_id: adminId } });
  assert.deepEqual(await resolveAdministratorAccess(client), { user: null, isAdministrator: false });
  assert.deepEqual(calls, ["auth.getUser"]);
});

test("a verified non-administrator is identified but denied access", async () => {
  const { client } = fixture({ user: { id: otherId } });
  const access = await resolveAdministratorAccess(client);
  assert.deepEqual(access, { user: { id: otherId }, isAdministrator: false });
  assert.equal(administratorAccessRedirect(access), "/admin/access-denied");
});

test("membership lookup errors fail closed for a verified user", async () => {
  const { client } = fixture({ user: { id: adminId }, membershipError: failure, membership: { user_id: adminId } });
  const access = await resolveAdministratorAccess(client);
  assert.equal(access.isAdministrator, false);
  assert.equal(administratorAccessRedirect(access), "/admin/access-denied");
});

test("a mismatched membership UUID cannot authorize the current user", async () => {
  const { client } = fixture({ user: { id: otherId }, membership: { user_id: adminId } });
  const access = await resolveAdministratorAccess(client);
  assert.equal(access.isAdministrator, false);
  assert.equal(administratorAccessRedirect(access), "/admin/access-denied");
});

test("only an exact membership match for the Auth-verified UUID grants access", async () => {
  const { client, calls } = fixture({ user: { id: adminId }, membership: { user_id: adminId } });
  const access = await resolveAdministratorAccess(client);
  assert.deepEqual(access, { user: { id: adminId }, isAdministrator: true });
  assert.equal(administratorAccessRedirect(access), null);
  assert.deepEqual(calls, ["auth.getUser", `membership:${adminId}`]);
});

test("thrown Auth or membership failures fail closed", async () => {
  for (const throwAt of ["auth", "membership"] as const) {
    const { client } = fixture({ user: { id: adminId }, membership: { user_id: adminId }, throwAt });
    assert.deepEqual(await resolveAdministratorAccess(client), { user: null, isAdministrator: false });
  }
});

test("unconfigured authorization redirects to setup/login, not a false success state", () => {
  assert.equal(administratorAccessRedirect(null), "/admin/login");
});