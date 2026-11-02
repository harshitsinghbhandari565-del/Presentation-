/**
 * Shared Supabase SSR cookie policy for browser, server and proxy clients.
 * Production builds require HTTPS. Development may use local HTTP.
 * No domain is set: cookies stay host-only. Provider expiry/refresh semantics
 * are preserved rather than imposing a shorter, incompatible maxAge.
 *
 * HttpOnly is intentionally false while the existing browser client writes
 * login cookies. Making them HttpOnly requires a server-owned login/refresh
 * flow; setting the flag here alone would break session persistence.
 */
export function getAuthCookieOptions(production = process.env.NODE_ENV === "production") {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: production,
    httpOnly: false,
  };
}