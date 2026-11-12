"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql, SQLite } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { format } from "sql-formatter";
import { sortedResult } from "@/lib/sql-workbench/results";
import { Database, Play, RotateCcw, Download, Square, ChevronDown, TerminalSquare, ShieldCheck, FileCode2 } from "lucide-react";
import { samples } from "@/lib/sql-workbench/samples";
import { csvForResult, mayChangeOrDeleteExistingData, type Execution, type SchemaObject } from "@/lib/sql-workbench/engine";

const DRAFT_KEY = "presentation-hub-sqlite-draft-v1";
const WORKSPACE_KEY = "presentation-hub-sql-workspace-v2";
type Tab = { id: string; name: string; sql: string };
type Workspace = { tabs: Tab[]; active: string; history: string[] };
const defaultWorkspace: Workspace = { tabs: [{ id: "1", name: "query-1.sql", sql: samples[0].starter }], active: "1", history: [] };
function readWorkspace(): Workspace {
  try {
    const raw = sessionStorage.getItem(WORKSPACE_KEY);
    if (raw && raw.length < 7_500_000) {
      const value: unknown = JSON.parse(raw);
      if (value && typeof value === "object" && "tabs" in value && "active" in value && "history" in value) {
        const w = value as Workspace;
        if (Array.isArray(w.tabs) && w.tabs.length > 0 && w.tabs.length <= 10 && w.tabs.every(t => typeof t.id === "string" && typeof t.name === "string" && typeof t.sql === "string" && t.sql.length <= 100_000) && typeof w.active === "string" && w.tabs.some(t => t.id === w.active) && Array.isArray(w.history) && w.history.length <= 20 && w.history.every(h => typeof h === "string" && h.length <= 100_000)) return w;
      }
    }
    const legacy = sessionStorage.getItem(DRAFT_KEY);
    if (legacy !== null && legacy.length <= 100_000) return { ...defaultWorkspace, tabs: [{ ...defaultWorkspace.tabs[0], sql: legacy }] };
  } catch { /* Storage is optional. */ }
  return { ...defaultWorkspace, tabs: defaultWorkspace.tabs.map(tab => ({ ...tab })), history: [] };
}
const TIMEOUT_MS = 10_000;
const accessibleSqlHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: "#d6a4f3 !important" },
  { tag: [tags.name, tags.variableName, tags.propertyName], color: "#f4a2aa !important" },
  { tag: tags.string, color: "#b9df9e !important" },
  { tag: tags.number, color: "#f5c184 !important" },
  { tag: tags.comment, color: "#b5c0ce !important", fontStyle: "italic" },
]));
type WorkerReply = { id: number; ok: boolean; type?: "load" | "run" | "import" | "export"; bytes?: ArrayBuffer; execution?: Execution; schema?: SchemaObject[] | null; error?: string };

function download(name: string, contents: string | ArrayBuffer, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Workbench() {
  const [sampleId, setSampleId] = useState(samples[0].id);
  const [loadedId, setLoadedId] = useState(samples[0].id);
  const [workspace, setWorkspace] = useState<Workspace>(defaultWorkspace);
  const [hydrated, setHydrated] = useState(false);
  const query = workspace.tabs.find(tab => tab.id === workspace.active)?.sql ?? "";
  const [notice, setNotice] = useState("");
  const [imported, setImported] = useState(false);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(50);
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
      } else if (message.type === "load" || message.type === "import") {
        if (request.sampleId) setLoadedId(request.sampleId);
        setImported(message.type === "import");
        setSandboxReady(true); setSchema(message.schema ?? []); setExecution(null); setResultIndex(0); setPage(0);
        setStatus("SQLite sandbox ready · Runs only in this browser");
      } else if (message.type === "export" && message.bytes) {
        download("sandbox.sqlite", message.bytes, "application/vnd.sqlite3"); setStatus("Database exported. The current sandbox remains open.");
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
      const loaded = readWorkspace();
      try {
        const pending = sessionStorage.getItem("presentation-hub-sql-pending-query");
        if (pending !== null && pending.length <= 100_000 && loaded.tabs.length < 10) {
          const id = crypto.randomUUID(); let number = 1;
          while (loaded.tabs.some(tab => tab.name === `query-${number}.sql`)) number++;
          loaded.tabs = [...loaded.tabs, { id, name: `query-${number}.sql`, sql: pending }]; loaded.active = id;
          sessionStorage.removeItem("presentation-hub-sql-pending-query");
        }
      } catch { /* Session storage may be unavailable. */ }
      setWorkspace(loaded); setHydrated(true);
      startWorker(samples[0].id);
    }, 0);
    return () => { window.clearTimeout(timer); stopWorker(); };
  }, [startWorker, stopWorker]);

  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace)); } catch { window.setTimeout(() => setNotice("Browser storage is unavailable or full. Export your SQL to avoid losing drafts."), 0); }
  }, [workspace, hydrated]);

  const updateQuery = useCallback((value: string) => {
    if (value.length > 100_000) { setNotice("Each SQL tab is limited to 100,000 characters; the edit was not saved."); return; }
    setWorkspace(current => ({ ...current, tabs: current.tabs.map(tab => tab.id === current.active ? { ...tab, sql: value } : tab) }));
  }, []);
  const addTab = useCallback(() => {
    const id = crypto.randomUUID();
    setWorkspace(current => {
      if (current.tabs.length >= 10) return current;
      let number = 1; while (current.tabs.some(tab => tab.name === `query-${number}.sql`)) number++;
      return { ...current, tabs: [...current.tabs, { id, name: `query-${number}.sql`, sql: "" }], active: id };
    });
  }, []);
  const closeTab = useCallback((id: string) => {
    const tab = workspace.tabs.find(item => item.id === id);
    if (!tab || workspace.tabs.length === 1 || (tab.sql.trim() && !window.confirm(`Close ${tab.name}? Its draft will be removed.`))) return;
    setWorkspace(current => { const tabs = current.tabs.filter(item => item.id !== id); return { ...current, tabs, active: current.active === id ? tabs[0].id : current.active }; });
  }, [workspace]);
  const copyText = useCallback(async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); setNotice(`${label} copied.`); }
    catch { setNotice("Copy failed. Check browser clipboard permissions."); }
  }, []);
  const formatQuery = useCallback(() => {
    try { updateQuery(format(query, { language: "sqlite", keywordCase: "upper" })); setNotice("SQL formatted."); }
    catch { setNotice("Could not format this SQL. Check its syntax; your query was not changed."); }
  }, [query, updateQuery]);

  const run = useCallback((command?: string) => {
    const worker = workerRef.current;
    if (!worker || requestRef.current) return;
    const selection = editorRef.current?.state.selection.main;
    const text = command ?? (selection && !selection.empty ? editorRef.current!.state.sliceDoc(selection.from, selection.to) : query);
    if (!text.trim()) { setError("Enter or select SQL to run."); return; }
    if (mayChangeOrDeleteExistingData(text) && !window.confirm("This SQL may modify or delete existing sandbox data. Run it?")) return;
    if (text.length <= 100_000) setWorkspace(current => ({ ...current, history: [text, ...current.history.filter(item => item !== text)].slice(0, 20).reduce<string[]>((items, item) => items.reduce((sum, previous) => sum + previous.length, 0) + item.length <= 200_000 ? [...items, item] : items, []) }));
    setSortColumn(null); setPage(0);
    const id = ++idRef.current; requestRef.current = { id };
    setBusy(true); setError(""); setExecution(null); setStatus("Running SQL in your browser…");
    timerRef.current = setTimeout(() => {
      if (workerRef.current !== worker || requestRef.current?.id !== id) return;
      stopWorker(); setBusy(false); setSandboxReady(false); setExecution(null); setSchema([]);
      setError("Query exceeded 10 seconds. The sandbox was stopped and its in-memory changes were discarded. Reset the database to continue."); setStatus("Sandbox stopped · Reset required");
    }, TIMEOUT_MS);
    worker.postMessage({ id, type: "run", sql: text });
  }, [query, stopWorker]);

  const databaseTransfer = useCallback((type: "import" | "export", bytes?: ArrayBuffer) => {
    const worker = workerRef.current;
    if (!worker || requestRef.current) return;
    const id = ++idRef.current; requestRef.current = { id };
    setBusy(true); setError(""); setStatus(type === "import" ? "Checking the SQLite file…" : "Exporting the database…");
    timerRef.current = setTimeout(() => {
      if (workerRef.current !== worker || requestRef.current?.id !== id) return;
      stopWorker(); setBusy(false); setSandboxReady(false); setExecution(null); setSchema([]);
      setError("Database operation timed out. The sandbox was discarded; reset it to continue."); setStatus("Sandbox stopped · Reset required");
    }, TIMEOUT_MS);
    worker.postMessage({ id, type, bytes }, bytes ? [bytes] : []);
  }, [stopWorker]);
  const importFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (file.size < 100 || file.size > 5 * 1024 * 1024) { setError("Choose a SQLite database file between 100 bytes and 5 MiB."); return; }
    if (!window.confirm("Import this SQLite file? The current temporary database will be replaced if the file passes validation.")) return;
    const originalWorker = workerRef.current, initialId = idRef.current;
    try {
      const bytes = await file.arrayBuffer();
      if (workerRef.current !== originalWorker || requestRef.current || initialId !== idRef.current) { setError("The sandbox changed while reading the file. Please try the import again."); return; }
      databaseTransfer("import", bytes);
    } catch { setError("Could not read this file."); }
  }, [databaseTransfer]);

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
  const rawResult = execution?.results[resultIndex];
  const result = useMemo(() => rawResult ? sortedResult(rawResult, sortColumn, sortDirection) : undefined, [rawResult, sortColumn, sortDirection]);
  const pageCount = result ? Math.max(1, Math.ceil(result.rows.length / pageSize)) : 1;

  return <div className="sql-workbench">
    <div className="sql-workbench-top"><div><div className="eyebrow"><TerminalSquare size={14} /> THE LEARNING LAB</div><h1>SQL <em>Workbench.</em></h1><p>Write real SQL. Explore the results. Learn by doing.</p></div><div className="sql-top-actions"><Link className="button button-secondary" href="/sql-workbench/library">Shared queries</Link><div className="sql-local-badge"><ShieldCheck size={16} /> Private browser sandbox</div></div></div>
    <div className="sql-notice"><strong>SQLite is ready.</strong> PostgreSQL, MySQL and AI are planned—not yet available. Shared queries require administrator setup. Your database is temporary and resets when you refresh or leave this page.</div>
    <div className="sql-layout">
      <aside className="sql-sidebar" aria-label="Database explorer">
        <div className="sql-panel-heading"><span><Database size={16} /> EXPLORER</span><small>SQLite</small></div>
        <div className="sql-side-body"><label htmlFor="sql-sample">Sample database</label><select id="sql-sample" value={sampleId} onChange={event => setSampleId(event.target.value)}>{samples.map(sample => <option key={sample.id} value={sample.id}>{sample.name}</option>)}</select><p>{samples.find(sample => sample.id === sampleId)?.description} · Fictional data</p>
          <button className="sql-load-button" onClick={() => reset(sampleId, true)} disabled={busy}>Load sample <ChevronDown size={14} /></button><label className="sql-file-label">Import SQLite file (max 5 MiB)<input type="file" accept=".sqlite,.sqlite3,.db,application/vnd.sqlite3" disabled={busy || !sandboxReady} onChange={event => { void importFile(event.target.files?.[0]); event.target.value = ""; }} /></label><button className="sql-load-button" disabled={busy || !sandboxReady} onClick={() => databaseTransfer("export")}>Export database</button>{imported && <p>Imported database in use. Reset loads the last sample.</p>}
          <details className="sql-schema-disclosure"><summary className="sql-schema-heading">DATABASE OBJECTS <span>{schema.length} <ChevronDown size={13} /></span></summary>
          <div className="sql-schema-list">{schema.length ? schema.map(item => <details key={`${item.type}-${item.name}`} open><summary><span className="sql-table-icon">▦</span> {item.name}<small>{item.type}</small></summary><ul>{item.columns.map(column => <li key={column.name}><span>{column.primaryKey ? "◇" : "·"} {column.name}</span><small>{column.type || "ANY"}</small></li>)}</ul></details>) : <p>No tables to display.</p>}</div></details>
        </div>
        <div className="sql-side-note"><ShieldCheck size={15} /><span>Sandbox data never reaches the website database.</span></div>
      </aside>
      <section className="sql-main" aria-label="SQL editor and results">
        <div className="sql-editor-bar"><div className="sql-tabs" aria-label="SQL editor tabs">{workspace.tabs.map(tab => <div className={`sql-tab ${workspace.active === tab.id ? "sql-tab-active" : ""}`} key={tab.id}><button type="button" aria-pressed={workspace.active === tab.id} onClick={() => setWorkspace(current => ({ ...current, active: tab.id }))}><FileCode2 size={15} /> {tab.name}</button>{workspace.tabs.length > 1 && <button type="button" aria-label={`Close ${tab.name}`} onClick={() => closeTab(tab.id)}>×</button>}</div>)}<button className="sql-add-tab" onClick={addTab} disabled={!hydrated || workspace.tabs.length >= 10} aria-label="Add SQL tab">+</button></div><span className="sql-dialect">SQLITE <span>●</span></span></div>
        <div className="sql-editor-wrap" onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); run(); } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "f") { event.preventDefault(); formatQuery(); } }}><CodeMirror key={workspace.active} editable={hydrated} value={query} height="290px" theme="dark" extensions={extensions} onChange={updateQuery} onCreateEditor={view => { editorRef.current = view; }} basicSetup={{ foldGutter: true, lineNumbers: true, highlightActiveLine: true }} aria-label="SQL editor" /></div>
        <div className="sql-toolbar"><div className="sql-toolbar-actions"><button className="button button-primary" onClick={() => run()} disabled={busy || !sandboxReady}><Play size={15} fill="currentColor" /> Run SQL <kbd>Ctrl ↵</kbd></button>{busy && <button className="button button-secondary" onClick={stop}><Square size={13} /> Stop</button>}<button className="button button-secondary" onClick={() => reset(loadedId, false)} disabled={busy}><RotateCcw size={14} /> Reset database</button><button className="sql-icon-action" onClick={formatQuery} title="Ctrl or Command Shift F">Format</button><button className="sql-icon-action" onClick={() => copyText(query, "Query")}>Copy query</button><button className="sql-icon-action" onClick={() => download("query.sql", query, "application/sql;charset=utf-8")}><Download size={15} /> SQL</button><button className="sql-icon-action" disabled={busy || !sandboxReady} onClick={() => run("ROLLBACK;")} title="Roll back an open transaction">Rollback</button></div><span>Runs selected text, or the whole editor</span></div>
        <div className="sql-history"><details><summary>Query history ({workspace.history.length})</summary><p>Private to this tab’s browser session. Selecting an entry replaces the current editor text.</p>{workspace.history.length > 0 && <><button className="sql-icon-action" onClick={() => setWorkspace(current => ({ ...current, history: [] }))}>Clear history</button><ul>{workspace.history.map((item, index) => <li key={index}><button onClick={() => { if (!query.trim() || window.confirm("Replace the current editor text with this history entry?")) updateQuery(item); }}>{item.slice(0, 120)}{item.length > 120 ? "…" : ""}</button></li>)}</ul></>}</details><span role="status">{notice}</span></div>
        <div className="sql-results-head"><div><span className="sql-active-tab">RESULTS</span></div><span className="sql-status-dot">● <span>{busy ? "WORKING" : "SQLITE"}</span></span></div>
        <div className="sql-output" aria-live="polite"><div className="sql-status">{status}</div>{error && <div className="sql-error" role="alert"><strong>SQLite message</strong><p>{error}</p></div>}
          {execution && <><div className="sql-result-summary"><span>{execution.results.length ? `${result?.rows.length ?? 0} displayed rows${result?.truncated ? ` (limited by row or size cap)` : ""}` : "No rows returned"}</span><div>{execution.results.length > 1 && <label>Result <select aria-label="Result set" value={resultIndex} onChange={event => { setResultIndex(Number(event.target.value)); setPage(0); setSortColumn(null); }}>{execution.results.map((_, index) => <option key={index} value={index}>Result {index + 1}</option>)}</select></label>}{result && <><button className="sql-icon-action" onClick={() => copyText(csvForResult(result), "Results (CSV)")}>Copy results</button><button className="sql-icon-action" onClick={() => download("results.csv", csvForResult(result), "text/csv;charset=utf-8")}><Download size={14} /> CSV</button></>}</div></div>
            {result && <><div className="sql-table-scroll"><table className="sql-results-table"><thead><tr><th scope="col">#</th>{result.columns.map((column, i) => <th scope="col" key={i} aria-sort={sortColumn === i ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}><button onClick={() => { setSortDirection(sortColumn === i && sortDirection === "asc" ? "desc" : "asc"); setSortColumn(i); setPage(0); }} title="Sort retained rows">{column}{sortColumn === i ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕"}</button></th>)}</tr></thead><tbody>{result.rows.slice(page * pageSize, (page + 1) * pageSize).map((row, index) => <tr key={index}><td>{page * pageSize + index + 1}</td>{row.map((value, i) => <td key={i}>{value === null ? <i>NULL</i> : String(value)}</td>)}</tr>)}</tbody></table></div><div className="sql-pagination"><label>Rows per page <select aria-label="Rows per page" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(0); }}><option>25</option><option>50</option><option>100</option></select></label><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1} of {pageCount}</span><button disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)}>Next</button></div><p className="sql-sort-note">Sorting and CSV apply to retained rows only, not rows beyond the limit.</p></>}
          </>}
          {!execution && !error && !busy && <div className="sql-empty-output"><TerminalSquare size={25} /><strong>Ready when you are.</strong><span>Run a query to see its results here.</span></div>}
        </div>
      </section>
    </div>
    <div className="sql-footnote"><span>01 / LOCAL-FIRST</span><p>Your tabs and history are saved only in this tab for the current browser session when storage is available. Sandbox databases are temporary—export your database or SQL before leaving. Never enter sensitive data on a shared device.</p></div>
  </div>;
}
