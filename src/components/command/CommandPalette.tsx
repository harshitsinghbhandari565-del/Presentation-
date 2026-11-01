"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, FileText, Star, ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
interface Result { slug: string; title: string; subject: string; topic: string; isFeatured: boolean; }
export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) { const previous = document.activeElement as HTMLElement | null; dialog.showModal(); inputRef.current?.focus(); return () => { dialog.close(); previous?.focus(); }; }
    dialog.close();
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data = await response.json();
        setResults(data.documents); setSelected(0);
      } catch (err) { if (!(err instanceof Error && err.name === "AbortError")) setError("Search is temporarily unavailable. Try again in a moment."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 160);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, isOpen]);
  useEffect(() => { listRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" }); }, [selected]);
  const navigate = useCallback((slug: string) => { setQuery(""); onClose(); router.push(`/resources/${slug}`); }, [onClose, router]);
  return <dialog ref={dialogRef} className="command-dialog" aria-labelledby="command-title" onCancel={event => { event.preventDefault(); setQuery(""); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { setQuery(""); onClose(); } }}>
    <div className="command-content">
      <h2 id="command-title" className="sr-only">Search the resource library</h2>
      <div className="command-input-row"><Search size={21} aria-hidden="true" /><input ref={inputRef} value={query} placeholder="What would you like to learn?" autoComplete="off" spellCheck={false} role="combobox" aria-label="Search resources" aria-expanded={isOpen} aria-controls="command-results" aria-autocomplete="list" aria-activedescendant={results[selected] ? `command-option-${selected}` : undefined}
        onChange={event => { setQuery(event.target.value); setSelected(0); }}
        onKeyDown={event => {
          if (event.key === "ArrowDown") { event.preventDefault(); setSelected(index => Math.min(index + 1, results.length - 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setSelected(index => Math.max(0, index - 1)); }
          if (event.key === "Enter" && results[selected]) { event.preventDefault(); navigate(results[selected].slug); }
        }} /><button className="key-button" onClick={() => { setQuery(""); onClose(); }} aria-label="Close search">esc</button></div>
      <div className="command-section-label">{query ? "Search results" : "Featured resources"}{loading && <LoaderCircle size={13} className="spin" aria-label="Loading results" />}</div>
      <div ref={listRef} id="command-results" className="command-results" role="listbox" aria-label="Resources" aria-busy={loading}>
        {error ? <p className="command-empty" role="alert">{error}</p> : !loading && results.length === 0 ? <p className="command-empty">No resources found. Try a subject, title or keyword.</p> : results.map((result, index) => <button key={result.slug} id={`command-option-${index}`} data-index={index} role="option" aria-selected={selected === index} tabIndex={-1} className={`command-result ${selected === index ? "selected" : ""}`} onMouseEnter={() => setSelected(index)} onClick={() => navigate(result.slug)}><span className="command-result-icon">{result.isFeatured ? <Star size={18} /> : <FileText size={18} />}</span><span><strong>{result.title}</strong><small>{result.subject} <span aria-hidden="true">·</span> {result.topic}</small></span><ArrowRight size={17} aria-hidden="true" /></button>)}
      </div>
      <div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span><span>Knowledge, a little closer.</span></div>
    </div>
  </dialog>;
}
