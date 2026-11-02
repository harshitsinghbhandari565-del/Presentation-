import type { Platform } from "@/types/document";

/** Validate destinations only; this function never fetches or changes permissions. */
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 4096 || value.trim() !== value || /[\u0000-\u0020\u007f]/.test(value)) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (!["https:", "http:"].includes(url.protocol)) return null;
    if (url.username || url.password || !host.includes(".")) return null;
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return null;
    // Public sharing links should use a domain name, not an IP/literal/internal host.
    if (/^[\d.]+$/.test(host) || host.includes(":") || host.startsWith("[")) return null;
    return value;
  } catch { return null; }
}

export function detectPlatform(value: string): Platform {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (host === "drive.google.com") return "Google Drive";
    if (host === "docs.google.com") {
      if (url.pathname.startsWith("/presentation/")) return "Google Slides";
      if (url.pathname.startsWith("/spreadsheets/")) return "Google Sheets";
      if (url.pathname.startsWith("/document/")) return "Google Docs";
    }
    if (host === "dropbox.com" || host.endsWith(".dropbox.com")) return "Dropbox";
  } catch { /* Invalid input is handled by safeExternalUrl. */ }
  return "Other";
}

export function displayHost(value: string): string {
  try { return new URL(value).hostname.replace(/^www\./, ""); }
  catch { return "External source"; }
}

export function slugify(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}
