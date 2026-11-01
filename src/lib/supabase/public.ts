import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

export function getPublicClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
