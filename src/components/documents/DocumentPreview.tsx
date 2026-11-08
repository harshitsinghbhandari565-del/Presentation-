"use client";
import { useState } from "react";
import { Play, ShieldCheck } from "lucide-react";
import { safeExternalUrl } from "@/lib/urls";
export default function DocumentPreview({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  if (!safeExternalUrl(url)?.startsWith("https://docs.google.com/")) return null;
  return <section className="optional-preview"><div className="preview-heading"><div><h2>Take a closer look</h2><p>Load the owner’s Google embed. Public permission is still required.</p></div>{!loaded && <button className="button button-secondary" onClick={() => setLoaded(true)}><Play size={15} />Load preview</button>}</div>{loaded && <iframe src={url} title={`External preview: ${title}`} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation" className="document-iframe" />}{loaded && <p className="fine-print">If the preview says access is required, use Open Document. This site cannot change the owner’s permissions.</p>}</section>;
}
