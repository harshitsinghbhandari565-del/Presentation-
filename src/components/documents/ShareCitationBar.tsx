"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Quote, Share2, Check } from "lucide-react";

const noopSubscribe = () => () => {};
const getShareSnapshot = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

interface ShareCitationBarProps {
  title: string;
  subject: string;
  course?: string | null;
  documentType: string;
  platform: string;
  originalUrl: string;
}

export default function ShareCitationBar({
  title,
  subject,
  course,
  documentType,
  platform,
  originalUrl,
}: ShareCitationBarProps) {
  const [cited, setCited] = useState(false);
  const canNativeShare = useSyncExternalStore(noopSubscribe, getShareSnapshot, () => false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const copyCitation = async () => {
    const context = [subject, course].filter(Boolean).join(", ");
    const text = `${title} (${context}) — ${documentType} via ${platform}. ${originalUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCited(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCited(false), 2600);
    } catch {}
  };

  const triggerShare = async () => {
    try {
      await navigator.share({
        title: `${title} — ${subject}`,
        text: `Check out "${title}" (${subject}) on Harshit Presentation Hub:`,
        url: window.location.href,
      });
    } catch {}
  };

  return (
    <>
      <button
        type="button"
        className="button button-secondary"
        onClick={copyCitation}
        aria-label={`Copy study citation for ${title}`}
      >
        {cited ? <Check size={15} /> : <Quote size={15} />}
        {cited ? "Citation copied" : "Cite"}
      </button>
      {canNativeShare && (
        <button
          type="button"
          className="button button-secondary"
          onClick={triggerShare}
          aria-label={`Share ${title}`}
        >
          <Share2 size={15} />
          Share
        </button>
      )}
    </>
  );
}
