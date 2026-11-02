"use client";
import { Check, Copy, CircleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { safeExternalUrl } from "@/lib/urls";
export default function CopyLink({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  if (!safeExternalUrl(url)) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setState("copied"); }
    catch { setState("error"); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 3000);
  };
  return <div className="copy-action"><button className="button button-secondary" onClick={copy}>{state === "copied" ? <Check size={16} /> : state === "error" ? <CircleAlert size={16} /> : <Copy size={16} />}{state === "copied" ? "Copied" : state === "error" ? "Try again" : "Copy link"}</button><span className="sr-only" role="status">{state === "copied" ? "Original link copied to clipboard" : state === "error" ? "Could not copy. Please copy the source address manually." : ""}</span>{state === "error" && <small className="field-error">Clipboard access was blocked. Open the source and copy its address.</small>}</div>;
}
