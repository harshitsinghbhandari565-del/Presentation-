"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql, MySQL } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";
import { Database, Download, Play, RotateCcw, ShieldCheck, Square, TerminalSquare } from "lucide-react";
import { csvForResult, mayChangeOrDeleteExistingData, type QueryResult } from "@/lib/sql-workbench/engine";

const DRAFT_KEY = "presentation-hub-mariadb-draft-v1";
const extensions = [sql({ dialect: MySQL }), EditorView.contentAttributes.of({ "aria-label": "MariaDB SQL editor" })];
type Reply = { id: number; ok: boolean; type?: "load" | "run"; result?: QueryResult | null; error?: string; affected?: number; durationMs?: number };
function download(name: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MariaDbWorkbench() {
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(true);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Starting experimental MariaDB…");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);
  const editorRef = useRef<EditorView | null>(null);

  const terminate = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null; workerRef.current?.terminate(); workerRef.current = null; requestRef.current = null;
  }, []);

  const start = useCallback(() => {
    terminate(); setResult(null); setError(""); setReady(false); setBusy(true);
    if (!window.crossOriginIsolated || typeof SharedArrayBuffer === "undefined") {
      setBusy(false); setStatus("Sandbox unavailable");
      setError("MariaDB needs a secure, cross-origin-isolated browser page. Open this page directly in a modern browser; embedded previews may not support it."); return;
    }
    let worker: Worker;
    try { worker = new Worker("/sql/mariadb-worker.mjs", { type: "module" }); }
    catch { setBusy(false); setStatus("Sandbox unavailable"); setError("Could not start the MariaDB worker. Try a modern browser."); return; }
    workerRef.current = worker; const id = ++nextId.current; requestRef.current = id;
    setStatus("Loading experimental MariaDB (about 17 MB)…");
    worker.onmessage = (event: MessageEvent<Reply>) => {
      if (workerRef.current !== worker || requestRef.current !== event.data.id) return;
      const message = event.data; requestRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = null; setBusy(false);
      if (!message.ok) {
        if (message.type === "load") { terminate(); setReady(false); }
        setError(message.error || "MariaDB could not complete the request.");
        setStatus("Statement failed. Earlier changes or an open transaction may remain.");
      } else if (message.type === "load") {
        setReady(true); setStatus("MariaDB sandbox ready · Current database: scratch");
      } else {
        setResult(message.result ?? null);
        setStatus(`Completed in ${message.durationMs} ms · ${message.affected ?? 0} affected rows (as reported by MariaDB)`);
      }
    };
    worker.onerror = () => {
      if (workerRef.current !== worker) return;
      terminate(); setBusy(false); setReady(false); setResult(null);
      setError("MariaDB could not start or the worker stopped. Your temporary database was discarded."); setStatus("Sandbox unavailable");
    };
    timerRef.current = setTimeout(() => {
      if (workerRef.current !== worker) return;
      terminate(); setBusy(false); setReady(false); setResult(null);
      setError("MariaDB startup timed out. The temporary database was discarded; try Reset database."); setStatus("Sandbox stopped · Reset required");
    }, 45_000);
    worker.postMessage({ id, type: "load" });
  }, [terminate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try { const draft = sessionStorage.getItem(DRAFT_KEY); if (draft !== null && draft.length <= 100_000) setQuery(draft); } catch { /* optional storage */ }
      setHydrated(true); start();
    }, 0);
    return () => { clearTimeout(timer); terminate(); };
  }, [start, terminate]);
  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(DRAFT_KEY, query); } catch { window.setTimeout(() => setNotice("Browser storage is unavailable or full. Download your SQL to keep the draft."), 0); }
  }, [hydrated, query]);

  const run = useCallback(() => {
    const worker = workerRef.current; if (!worker || !ready || requestRef.current !== null) return;
    const selection = editorRef.current?.state.selection.main;
    const text = selection && !selection.empty ? editorRef.current!.state.sliceDoc(selection.from, selection.to) : query;
    if (!text.trim()) { setError("Enter or select one SQL statement."); return; }
    if (mayChangeOrDeleteExistingData(text) && !window.confirm("This SQL may modify or delete temporary sandbox data. Run it?")) return;
    const id = ++nextId.current; requestRef.current = id; setBusy(true); setError(""); setResult(null); setStatus("Running SQL in your browser…");
    timerRef.current = setTimeout(() => {
      if (workerRef.current !== worker || requestRef.current !== id) return;
      terminate(); setBusy(false); setReady(false); setResult(null);
      setError("Query exceeded 10 seconds. The temporary MariaDB database was discarded; reset to continue."); setStatus("Sandbox stopped · Reset required");
    }, 10_000);
    worker.postMessage({ id, type: "run", sql: text });
  }, [query, ready, terminate]);
  const reset = () => { if (window.confirm("Reset MariaDB? All temporary databases and data will be lost. Your SQL draft will remain.")) start(); };
  const stop = () => { terminate(); setBusy(false); setReady(false); setResult(null); setError("Execution stopped. The temporary MariaDB database was discarded; reset to continue."); setStatus("Sandbox stopped · Reset required"); };

  return <div className="sql-workbench">
    <div className="sql-workbench-top"><div><div className="eyebrow"><TerminalSquare size={14} /> THE LEARNING LAB</div><h1>SQL <em>Workbench.</em></h1><p>Experimental MariaDB practice in your browser.</p></div><div className="sql-top-actions"><a className="button button-secondary" href="/sql-workbench" onClick={event => { if (!window.confirm("Leave MariaDB? All temporary database data will be lost. Your MariaDB SQL draft will remain.")) event.preventDefault(); }}>Switch to SQLite</a><div className="sql-local-badge"><ShieldCheck size={16} /> Private browser sandbox</div></div></div>
    <div className="sql-notice"><strong>Experimental MariaDB 13.1 preview — not MySQL.</strong> Many MySQL commands work, but behavior can differ. This is a preview engine, not for production or sensitive data. The database is temporary and is lost on refresh, leaving, reset, stop or timeout. Database import/export is not available in this mode; download your SQL separately.</div>
    <div className="sql-layout">
      <aside className="sql-sidebar" aria-label="MariaDB information"><div className="sql-panel-heading"><span><Database size={16} /> DATABASE</span><small>MariaDB</small></div><div className="sql-side-body"><p>Starts with an empty <strong>scratch</strong> database. The required information_schema is also listed by SHOW DATABASES.</p><p>Run one statement at a time. Try <code>SHOW DATABASES;</code> or <code>SHOW TABLES;</code>. Backslashes in quoted strings and executable comments are not supported.</p><button className="sql-load-button" onClick={reset} disabled={busy}>New empty database</button><p>Large results can consume substantial device memory before the display limit is applied.</p><p><a href="/sql/mariadb/COPYING.txt">Engine licence (GPL-2.0)</a> · <a href="https://github.com/shyim/lite4mariadb/tree/24be9371a2f6c71250a2356631ad6feab2280b02" target="_blank" rel="noopener noreferrer">Engine source</a></p></div><div className="sql-side-note"><ShieldCheck size={15} /><span>Separate from the website database and SQLite.</span></div></aside>
      <section className="sql-main" aria-label="MariaDB SQL editor and results">
        <div className="sql-editor-bar"><div className="sql-tabs"><span className="sql-tab sql-tab-active">mariadb-query.sql</span></div><span className="sql-dialect">MARIADB · EXPERIMENTAL <span>●</span></span></div>
        <div className="sql-editor-wrap" onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); run(); } }}><CodeMirror editable={hydrated} value={query} height="290px" theme="dark" extensions={extensions} onChange={value => { if (value.length <= 100_000) setQuery(value); else setNotice("SQL is limited to 100,000 characters."); }} onCreateEditor={view => { editorRef.current = view; }} /></div>
        <div className="sql-toolbar"><div className="sql-toolbar-actions"><button className="button button-primary" onClick={run} disabled={busy || !ready}><Play size={15} fill="currentColor" /> Run SQL <kbd>Ctrl ↵</kbd></button>{busy && <button className="button button-secondary" onClick={stop}><Square size={13} /> Stop</button>}<button className="button button-secondary" onClick={reset} disabled={busy}><RotateCcw size={14} /> Reset database</button><button className="sql-icon-action" onClick={() => download("mariadb-query.sql", query, "application/sql;charset=utf-8")}><Download size={15} /> SQL</button></div><span>Runs one selected statement, or the editor</span></div>
        <div className="sql-history"><span role="status">{notice}</span></div>
        <div className="sql-results-head"><div><span className="sql-active-tab">RESULTS</span></div><span className="sql-status-dot">● <span>{busy ? "WORKING" : "MARIADB"}</span></span></div>
        <div className="sql-output" aria-live="polite"><div className="sql-status">{status}</div>{error && <div className="sql-error" role="alert"><strong>MariaDB message</strong><p>{error}</p></div>}
          {result && <><div className="sql-result-summary"><span>{result.rows.length} displayed rows{result.truncated ? " (display limited)" : ""}</span><button className="sql-icon-action" onClick={() => download("results.csv", csvForResult(result), "text/csv;charset=utf-8")}><Download size={14} /> CSV</button></div><div className="sql-table-scroll"><table className="sql-results-table"><thead><tr><th scope="col">#</th>{result.columns.map((name, i) => <th scope="col" key={i}>{name}</th>)}</tr></thead><tbody>{result.rows.map((row, i) => <tr key={i}><td>{i + 1}</td>{row.map((v, j) => <td key={j}>{v === null ? <i>NULL</i> : String(v)}</td>)}</tr>)}</tbody></table></div><p className="sql-sort-note">CSV includes retained rows only. Result limits do not prevent high engine memory use.</p></>}
          {!result && !error && !busy && <div className="sql-empty-output"><TerminalSquare size={25} /><strong>Ready when you are.</strong><span>Run a statement to see its results here.</span></div>}
        </div>
      </section>
    </div>
    <div className="sql-footnote"><span>01 / EXPERIMENTAL</span><p>Your MariaDB SQL draft is saved only in this browser tab when session storage is available. Database data is not persisted or exported. Avoid sensitive data on shared devices.</p></div>
  </div>;
}
