export interface SupabasePublicConfig {
  url: string;
  key: string;
}

/** Validate public inputs without logging keys or provider error payloads. */
export function validateSupabaseConfig(
  url: string | undefined,
  key: string | undefined,
): SupabasePublicConfig | null {
  if (!url || !key || key.length < 20) return null;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    ) return null;

    // Supabase's publishable keys are safe for browser use. Secret keys are
    // rejected by this allowlist, including through NEXT_PUBLIC_* variables.
    if (/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(key)) {
      return { url: parsed.origin, key };
    }

    // Retain compatibility with legacy anon JWTs. This is a role/format guard,
    // not signature verification; Supabase verifies the token on the server.
    const segments = key.split(".");
    if (segments.length === 3 && segments.every(segment => /^[A-Za-z0-9_-]+$/.test(segment))) {
      const payload: unknown = JSON.parse(
        atob(segments[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (
        payload !== null &&
        typeof payload === "object" &&
        "role" in payload &&
        payload.role === "anon"
      ) return { url: parsed.origin, key };
    }
    return null;
  } catch {
    return null;
  }
}

export function getSupabaseConfig(): SupabasePublicConfig | null {
  // Keep literal NEXT_PUBLIC_* references so Next can inline them for browsers.
  return validateSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export const isSupabaseConfigured = () => getSupabaseConfig() !== null;
