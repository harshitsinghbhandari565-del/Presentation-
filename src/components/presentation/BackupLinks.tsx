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
    <div className="flex flex-wrap gap-2.5" role="group" aria-label="Presentation actions">
      {/* Primary action */}
      <a
        href={presentation.presentUrl || presentation.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Start presentation: ${presentation.title}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm transition-colors shadow-sm shadow-indigo-500/20"
      >
        <ExternalLink size={15} aria-hidden="true" />
        Start Presentation
      </a>

      {/* Backup links */}
      {presentation.backupLinks?.map((backup) => (
        <a
          key={backup.url}
          href={backup.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open backup: ${backup.label}`}
          title={backup.description || `Open ${backup.label}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#f8fafc] font-medium text-sm transition-colors"
        >
          <ExternalLink size={15} aria-hidden="true" />
          Open Backup
        </a>
      ))}

      {/* Copy primary */}
      <button
        onClick={() => copy(presentation.presentUrl || presentation.url, "primary")}
        aria-label={copied === "primary" ? "Link copied" : "Copy presentation link"}
        className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm transition-all ${
          copied === "primary"
            ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
            : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc]"
        }`}
      >
        {copied === "primary" ? (
          <>
            <Check size={15} aria-hidden="true" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy size={15} aria-hidden="true" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Copy backup links */}
      {presentation.backupLinks?.map((backup) => (
        <button
          key={backup.url}
          onClick={() => copy(backup.url, backup.label)}
          aria-label={copied === backup.label ? `${backup.label} copied` : `Copy ${backup.label} link`}
          className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm transition-all ${
            copied === backup.label
              ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
              : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc]"
          }`}
        >
          {copied === backup.label ? (
            <>
              <Check size={15} aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={15} aria-hidden="true" />
              <span>Copy Backup</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
