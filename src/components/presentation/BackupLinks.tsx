"use client";
import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import type { Presentation } from "@/types/presentation";
import { VaultButton } from "../primitive/button/VaultButton";

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
        className="no-underline"
      >
        <VaultButton 
            variant="primary" 
            leftIcon={<ExternalLink size={16} />}
            className="shadow-lg shadow-orange-600/20"
        >
            Start Presentation
        </VaultButton>
      </a>

      {/* Copy primary */}
      <VaultButton
        variant="secondary"
        onClick={() => copy(presentation.presentUrl || presentation.url, "primary")}
        leftIcon={copied === "primary" ? <Check size={16} className="ov-text-success" /> : <Copy size={16} />}
        className={copied === "primary" ? "border-emerald-500/30" : ""}
      >
        {copied === "primary" ? "Link Copied" : "Copy Link"}
      </VaultButton>

      {/* Backup links */}
      {presentation.backupLinks?.map((backup) => (
        <a
          key={backup.url}
          href={backup.url}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <VaultButton 
            variant="secondary" 
            leftIcon={<ExternalLink size={16} />}
          >
            {backup.label}
          </VaultButton>
        </a>
      ))}
    </div>
  );
}
