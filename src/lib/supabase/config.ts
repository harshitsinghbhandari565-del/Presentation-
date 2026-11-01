export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || key.length < 20) return null;
    // A service-role or secret key must never be used in a browser-capable client.
    if (key.startsWith("sb_secret_")) return null;
    if (key.startsWith("eyJ")) {
      const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.role && payload.role !== "anon") return null;
    }
    return { url: parsed.origin, key };
  } catch { return null; }
}
export const isSupabaseConfigured = () => getSupabaseConfig() !== null;
