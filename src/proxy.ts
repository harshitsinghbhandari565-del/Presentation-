import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  if (!config || !request.nextUrl.pathname.startsWith("/admin")) return response;
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // Refreshes expired cookies; authorization is always rechecked server-side.
  await supabase.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = { matcher: ["/admin/:path*"] };
