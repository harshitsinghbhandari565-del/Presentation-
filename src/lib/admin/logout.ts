export interface SessionRevocationClient {
  auth: {
    // The provider defaults to global scope, revoking the account's sessions.
    signOut: () => Promise<{ error: unknown }>;
  };
}

/** True only when the provider confirms revocation; never log token errors. */
export async function revokeSession(client: SessionRevocationClient | null): Promise<boolean> {
  if (!client) return false;
  try {
    const { error } = await client.auth.signOut();
    return !error;
  } catch {
    return false;
  }
}