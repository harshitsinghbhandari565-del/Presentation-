"use client";
import { useState } from "react";
import { Play, Maximize2, Minimize2, RotateCw, ArrowUpRight } from "lucide-react";
import { safeExternalUrl } from "@/lib/urls";

export default function DocumentPreview({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  const safeUrl = safeExternalUrl(url);
  if (!safeUrl?.startsWith("https://docs.google.com/")) return null;

  return (
    <section className={`optional-preview ${cinema ? "preview-cinema" : ""}`}>
      <div className="preview-heading">
        <div>
          <h2>Take a closer look</h2>
          <p>Load the owner’s Google embed. Public permission is still required.</p>
        </div>
        {!loaded ? (
          <button type="button" className="button button-secondary" onClick={() => setLoaded(true)}>
            <Play size={15} />
            Load preview
          </button>
        ) : (
          <div className="preview-toolbar">
            <button
              type="button"
              className="button button-secondary preview-tool-btn"
              aria-pressed={cinema}
              onClick={() => setCinema(v => !v)}
            >
              {cinema ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {cinema ? "Standard size" : "Theater size"}
            </button>
            <button
              type="button"
              className="button button-secondary preview-tool-btn"
              onClick={() => setFrameKey(k => k + 1)}
              aria-label="Reload preview frame"
            >
              <RotateCw size={14} />
              Reload
            </button>
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-secondary preview-tool-btn"
            >
              Full tab <ArrowUpRight size={14} />
            </a>
          </div>
        )}
      </div>
      {loaded && (
        <iframe
          key={frameKey}
          src={safeUrl}
          title={`External preview: ${title}`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
          className="document-iframe"
        />
      )}
      {loaded && (
        <p className="fine-print">
          If the preview says access is required, use Open Document. This site cannot change the owner’s permissions.
        </p>
      )}
    </section>
  );
}
