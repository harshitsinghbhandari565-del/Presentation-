"use client";
import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import type { Presentation } from "@/types/presentation";

export default function BackupLinks({
  presentation,
}: {
  presentation: Presentation;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // ignore
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Presentation actions">
      {/* Primary action */}
      <a
        href={presentation.presentUrl || presentation.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Start presentation: ${presentation.title}`}
        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
      >
        <ExternalLink size={16} aria-hidden="true" />
        Start Presentation
      </a>

      {/* Copy primary */}
      <button
        onClick={() => copy(presentation.presentUrl || presentation.url, "primary")}
        aria-label={copied === "primary" ? "Link copied" : "Copy presentation link"}
        className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
          copied === "primary"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1] text-[#94a3b8] hover:text-[#f8fafc]"
        }`}
      >
        {copied === "primary" ? (
          <>
            <Check size={14} aria-hidden="true" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy size={14} aria-hidden="true" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* Backup links */}
      {presentation.backupLinks?.map((backup) => (
        <a
          key={backup.url}
          href={backup.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open backup: ${backup.label}`}
          title={backup.description || `Open ${backup.label}`}
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-[#f8fafc] font-black text-[10px] uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-sm active:translate-y-0"
        >
          <ExternalLink size={14} aria-hidden="true" />
          {backup.label}
        </a>
      ))}
    </div>
  );
}
