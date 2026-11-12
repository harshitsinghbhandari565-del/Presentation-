"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql, SQLite } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { Database, Play, RotateCcw, Download, Square, ChevronDown, TerminalSquare, ShieldCheck, FileCode2 } from "lucide-react";
import { samples } from "@/lib/sql-workbench/samples";
import { csvForResult, mayChangeOrDeleteExistingData, type Execution, type SchemaObject } from "@/lib/sql-workbench/engine";

const DRAFT_KEY = "presentation-hub-sqlite-draft-v1";
const TIMEOUT_MS = 10_000;
const PAGE_SIZE = 50;
const accessibleSqlHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: "#d6a4f3 !important" },
  { tag: [tags.name, tags.variableName, tags.propertyName], color: "#f4a2aa !important" },
  { tag: tags.string, color: "#b9df9e !important" },
  { tag: tags.number, color: "#f5c184 !important" },
  { tag: tags.comment, color: "#b5c0ce !important", fontStyle: "italic" },
]));
type WorkerReply = { id: number; ok: boolean; type?: "load" | "run"; execution?: Execution; schema?: SchemaObject[] | null; error?: string };

function download(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Workbench() {
  const [sampleId, setSampleId] = useState(samples[0].id);
  const [loadedId, setLoadedId] = useState(samples[0].id);
  const [query, setQuery] = useState(samples[0].starter);
  const [schema, setSchema] = useState<SchemaObject[]>([]);
  const [execution, setExecution] = useState<Execution | null>(null);
  const [busy, setBusy] = useState(true);
  const [sandboxReady, setSandboxReady] = useState(false);
  const [status, setStatus] = useState("Starting your private SQLite sandbox…");
  const [error, setError] = useState("");
  const [resultIndex, setResultIndex] = useState(0);
  const [page, setPage] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const editorRef = useRef<EditorView | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);
  const requestRef = useRef<{ id: number; sampleId?: string } | null>(null);

  const stopWorker = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null; workerRef.current?.terminate(); workerRef.current = null; requestRef.current = null;
  }, []);

  const startWorker = useCallback((id: string, reason?: string) => {
    stopWorker();
    let worker: Worker;
    try { worker = new Worker(new URL("../../lib/sql-workbench/sqlite.worker.ts", import.meta.url)); }
    catch { setBusy(false); setSandboxReady(false); setError("This browser could not start the sandbox. Try a modern browser and reset the database."); setStatus("Sandbox unavailable"); return; }
    workerRef.current = worker;
    const requestId = ++idRef.current;
    requestRef.current = { id: requestId, sampleId: id };
    setBusy(true); setSandboxReady(false); setError("");
    setStatus(reason ?? "Starting your private SQLite sandbox…");
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      const message = event.data;
      if (workerRef.current !== worker || requestRef.current?.id !== message.id) return;
      const request = requestRef.current;
      requestRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null; setBusy(false);
      if (!message.ok) {
        if (message.schema) setSchema(message.schema);
        setError(message.error ?? "SQLite could not complete the request.");
        setStatus("Stopped with an error. Earlier statements in this run may have completed.");
      } else if (message.type === "load") {
        if (request.sampleId) setLoadedId(request.sampleId);
        setSandboxReady(true); setSchema(message.schema ?? []); setExecution(null); setResultIndex(0); setPage(0);
        setStatus("SQLite sandbox ready · Runs only in this browser");
      } else if (message.execution) {
        setExecution(message.execution); setSchema(message.execution.schema); setResultIndex(0); setPage(0);
        setStatus(`Completed ${message.execution.statements} statement${message.execution.statements === 1 ? "" : "s"} in ${message.execution.durationMs} ms · ${message.execution.changes} row change operation${message.execution.changes === 1 ? "" : "s"} (including rolled-back changes)`);
      }
    };
    worker.onerror = () => {
      if (workerRef.current !== worker) return;
      stopWorker(); setBusy(false); setSandboxReady(false); setError("SQLite could not start. Check your connection and try Reset database."); setStatus("Sandbox unavailable");
    };
    timerRef.current = setTimeout(() => {
      if (workerRef.current !== worker) return;
      stopWorker(); setBusy(false); setSandboxReady(false); setError("The sandbox timed out. Its in-memory data was discarded. Reset the database to continue."); setSchema([]); setExecution(null); setStatus("Sandbox stopped · Reset required");
    }, TIMEOUT_MS);
    worker.postMessage({ id: requestId, type: "load", sampleId: id });
  }, [stopWorker]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { const draft = sessionStorage.getItem(DRAFT_KEY); if (draft !== null && draft.length <= 100_000) setQuery(draft); } catch { /* Private mode may block storage. */ }
      startWorker(samples[0].id);
    }, 0);
    return () => { window.clearTimeout(timer); stopWorker(); };
  }, [startWorker, stopWorker]);

  const updateQuery = useCallback((value: string) => {
    setQuery(value);
    try { sessionStorage.setItem(DRAFT_KEY, value); } catch { /* Editing still works if local storage is unavailable. */ }
  }, []);

  const run = useCallback(() => {
    const worker = workerRef.current;
    if (!worker || requestRef.current) return;
    const selection = editorRef.current?.state.selection.main;
    const text = selection && !selection.empty ? editorRef.current!.state.sliceDoc(selection.from, selection.to) : query;
    if (!text.trim()) { setError("Enter or select SQL to run."); return; }
    if (mayChangeOrDeleteExistingData(text) && !window.confirm("This SQL may modify or delete existing sandbox data. Run it?")) return;
    const id = ++idRef.current; requestRef.current = { id };
    setBusy(true); setError(""); setExecution(null); setStatus("Running SQL in your browser…");
    timerRef.current = setTimeout(() => {
      if (workerRef.current !== worker || requestRef.current?.id !== id) return;
      stopWorker(); setBusy(false); setSandboxReady(false); setExecution(null); setSchema([]);
      setError("Query exceeded 10 seconds. The sandbox was stopped and its in-memory changes were discarded. Reset the database to continue."); setStatus("Sandbox stopped · Reset required");
    }, TIMEOUT_MS);
    worker.postMessage({ id, type: "run", sql: text });
  }, [query, stopWorker]);

  const reset = useCallback((id: string, useStarter: boolean) => {
    if (!window.confirm("Load this sample? The current in-memory database and its changes will be lost.")) return;
    if (useStarter) updateQuery(samples.find(sample => sample.id === id)!.starter);
    startWorker(id, "Loading the sample database…");
  }, [startWorker, updateQuery]);
  const stop = useCallback(() => {
    stopWorker(); setBusy(false); setSandboxReady(false); setExecution(null); setSchema([]);
    setError("Execution stopped. The in-memory database was discarded. Reset the database to continue."); setStatus("Sandbox stopped · Reset required");
  }, [stopWorker]);

  const schemaCompletion = useMemo(() => Object.fromEntries(schema.map(item => [item.name, item.columns.map(column => column.name)])), [schema]);
  const extensions = useMemo(() => [sql({ dialect: SQLite, schema: schemaCompletion }), accessibleSqlHighlight, EditorView.contentAttributes.of({ "aria-label": "SQL editor" })], [schemaCompletion]);
  const result = execution?.results[resultIndex];
  const pageCount = result ? Math.max(1, Math.ceil(result.rows.length / PAGE_SIZE)) : 1;

  return <div className="sql-workbench">
    <div className="sql-workbench-top"><div><div className="eyebrow"><TerminalSquare size={14} /> THE LEARNING LAB</div><h1>SQL <em>Workbench.</em></h1><p>Write real SQL. Explore the results. Learn by doing.</p></div><div className="sql-local-badge"><ShieldCheck size={16} /> Private browser sandbox</div></div>
    <div className="sql-notice"><strong>SQLite is ready.</strong> PostgreSQL, MySQL, shared libraries and AI are planned—not yet available. Your database is temporary and resets when you refresh or leave this page.</div>
    <div className="sql-layout">
      <aside className="sql-sidebar" aria-label="Database explorer">
        <div className="sql-panel-heading"><span><Database size={16} /> EXPLORER</span><small>SQLite</small></div>
        <div className="sql-side-body"><label htmlFor="sql-sample">Sample database</label><select id="sql-sample" value={sampleId} onChange={event => setSampleId(event.target.value)}>{samples.map(sample => <option key={sample.id} value={sample.id}>{sample.name}</option>)}</select><p>{samples.find(sample => sample.id === sampleId)?.description} · Fictional data</p>
          <button className="sql-load-button" onClick={() => reset(sampleId, true)} disabled={busy}>Load sample <ChevronDown size={14} /></button>
          <details className="sql-schema-disclosure"><summary className="sql-schema-heading">DATABASE OBJECTS <span>{schema.length} <ChevronDown size={13} /></span></summary>
          <div className="sql-schema-list">{schema.length ? schema.map(item => <details key={`${item.type}-${item.name}`} open><summary><span className="sql-table-icon">▦</span> {item.name}<small>{item.type}</small></summary><ul>{item.columns.map(column => <li key={column.name}><span>{column.primaryKey ? "◇" : "·"} {column.name}</span><small>{column.type || "ANY"}</small></li>)}</ul></details>) : <p>No tables to display.</p>}</div></details>
        </div>
        <div className="sql-side-note"><ShieldCheck size={15} /><span>Sandbox data never reaches the website database.</span></div>
      </aside>
      <section className="sql-main" aria-label="SQL editor and results">
        <div className="sql-editor-bar"><div className="sql-tab"><FileCode2 size={15} /> query.sql <span>●</span></div><span className="sql-dialect">SQLITE <span>●</span></span></div>
        <div className="sql-editor-wrap" onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); run(); } }}><CodeMirror value={query} height="290px" theme="dark" extensions={extensions} onChange={updateQuery} onCreateEditor={view => { editorRef.current = view; }} basicSetup={{ foldGutter: true, lineNumbers: true, highlightActiveLine: true }} aria-label="SQL editor" /></div>
        <div className="sql-toolbar"><div className="sql-toolbar-actions"><button className="button button-primary" onClick={run} disabled={busy || !sandboxReady}><Play size={15} fill="currentColor" /> Run SQL <kbd>Ctrl ↵</kbd></button>{busy && <button className="button button-secondary" onClick={stop}><Square size={13} /> Stop</button>}<button className="button button-secondary" onClick={() => reset(loadedId, false)} disabled={busy}><RotateCcw size={14} /> Reset database</button><button className="sql-icon-action" onClick={() => download("query.sql", query, "application/sql;charset=utf-8")}><Download size={15} /> SQL</button></div><span>Runs selected text, or the whole editor</span></div>
        <div className="sql-results-head"><div><span className="sql-active-tab">RESULTS</span><span>OUTPUT</span></div><span className="sql-status-dot">● <span>{busy ? "WORKING" : "SQLITE"}</span></span></div>
        <div className="sql-output" aria-live="polite"><div className="sql-status">{status}</div>{error && <div className="sql-error" role="alert"><strong>SQLite message</strong><p>{error}</p></div>}
          {execution && <><div className="sql-result-summary"><span>{execution.results.length ? `${result?.rows.length ?? 0} displayed rows${result?.truncated ? ` (first 500 only)` : ""}` : "No rows returned"}</span><div>{execution.results.length > 1 && <label>Result <select aria-label="Result set" value={resultIndex} onChange={event => { setResultIndex(Number(event.target.value)); setPage(0); }}>{execution.results.map((_, index) => <option key={index} value={index}>Result {index + 1}</option>)}</select></label>}{result && <button className="sql-icon-action" onClick={() => download("results.csv", csvForResult(result), "text/csv;charset=utf-8")}><Download size={14} /> CSV</button>}</div></div>
            {result && <><div className="sql-table-scroll"><table className="sql-results-table"><thead><tr><th scope="col">#</th>{result.columns.map((column, i) => <th scope="col" key={i}>{column}</th>)}</tr></thead><tbody>{result.rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((row, index) => <tr key={index}><td>{page * PAGE_SIZE + index + 1}</td>{row.map((value, i) => <td key={i}>{value === null ? <i>NULL</i> : String(value)}</td>)}</tr>)}</tbody></table></div>{pageCount > 1 && <div className="sql-pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1} of {pageCount}</span><button disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)}>Next</button></div>}</>}
          </>}
          {!execution && !error && !busy && <div className="sql-empty-output"><TerminalSquare size={25} /><strong>Ready when you are.</strong><span>Run a query to see its results here.</span></div>}
        </div>
      </section>
    </div>
    <div className="sql-footnote"><span>01 / LOCAL-FIRST</span><p>Your SQL draft is saved in this tab for the current browser session when storage is available. Sample databases are temporary—export your SQL before leaving. Never enter sensitive data on a shared device.</p></div>
  </div>;
}
