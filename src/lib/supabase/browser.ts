"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";
import { getAuthCookieOptions } from "./cookies";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  client ??= createBrowserClient(config.url, config.key, {
    cookieOptions: getAuthCookieOptions(),
  });
  return client;
}