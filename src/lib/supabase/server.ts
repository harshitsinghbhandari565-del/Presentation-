import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";
import { getAuthCookieOptions } from "./cookies";

export async function getServerClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  // A fresh client per request prevents session/cookie state crossing requests.
  return createServerClient(config.url, config.key, {
    cookieOptions: getAuthCookieOptions(),
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          for (const { name, value, options } of values) cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot write cookies. The proxy refreshes them
          // before rendering; pages/actions still validate the user server-side.
        }
      },
    },
  });
}