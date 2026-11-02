export interface AuthenticatedUser {
  id: string;
}

/** Narrow dependencies keep authorization testable without a service role. */
export interface AdministratorAuthorizationDependencies {
  getVerifiedUser: () => PromiseLike<{ data: { user: AuthenticatedUser | null }; error: unknown }>;
  getMembership: (userId: string) => PromiseLike<{ data: { user_id: string } | null; error: unknown }>;
}

export interface AdministratorAccess {
  user: AuthenticatedUser | null;
  isAdministrator: boolean;
}

/** Validate the Auth user, then require an exact UUID membership match. */
export async function resolveAdministratorAccess(
  dependencies: AdministratorAuthorizationDependencies,
): Promise<AdministratorAccess> {
  try {
    // The adapter must use getUser, which validates the token with Auth.
    // Never trust a decoded cookie or a client-only getSession result.
    const { data: { user }, error } = await dependencies.getVerifiedUser();
    if (error || !user) return { user: null, isAdministrator: false };
    const { data, error: membershipError } = await dependencies.getMembership(user.id);
    return {
      user,
      isAdministrator: !membershipError && data?.user_id === user.id,
    };
  } catch {
    // Network/storage/provider failures must never elevate privileges.
    return { user: null, isAdministrator: false };
  }
}

export function administratorAccessRedirect(
  access: AdministratorAccess | null,
): "/admin/login" | "/admin/access-denied" | null {
  if (!access?.user) return "/admin/login";
  return access.isAdministrator ? null : "/admin/access-denied";
}