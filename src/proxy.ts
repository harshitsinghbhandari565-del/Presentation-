import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getAuthCookieOptions } from "@/lib/supabase/cookies";

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");

  const config = getSupabaseConfig();
  if (!config || !request.nextUrl.pathname.startsWith("/admin")) return response;
  const supabase = createServerClient(config.url, config.key, {
    cookieOptions: getAuthCookieOptions(),
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values, headers) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  try {
    // Refresh cookies only. Authorization is always rechecked by pages/actions.
    await supabase.auth.getUser();
  } catch {
    // Do not log provider errors/token payloads. Downstream authorization fails
    // closed if the user cannot be validated against Supabase.
  }
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
