import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { safeExternalUrl } from "@/lib/urls";
export default function ExternalLink({ href, children, className = "button button-primary", label }: { href: string | null; children: ReactNode; className?: string; label?: string }) {
  const safe = safeExternalUrl(href);
  if (!safe) return <span className="unavailable-link" role="note">This source link is unavailable.</span>;
  return <a href={safe} target="_blank" rel="noopener noreferrer" className={className} aria-label={label}>{children}<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>;
}
