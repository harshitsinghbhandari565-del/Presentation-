import initSqlJs, { type Database } from "sql.js";
import { executeSql, schemaOf } from "./engine";
import { samples } from "./samples";

let db: Database | null = null;
const ready = initSqlJs({ locateFile: () => "/sql/sql-wasm.wasm" });
self.onmessage = async (event: MessageEvent<{ id: number; type: "load" | "run"; sql?: string; sampleId?: string }>) => {
  const message = event.data;
  try {
    const SQL = await ready;
    if (message.type === "load") {
      const sample = samples.find(item => item.id === message.sampleId);
      if (!sample) throw new Error("Unknown sample database.");
      const next = new SQL.Database();
      try { next.run("PRAGMA foreign_keys = ON;"); next.run(sample.sql); }
      catch (error) { next.close(); throw error; }
      db?.close(); db = next;
      self.postMessage({ id: message.id, ok: true, type: "load", schema: schemaOf(db) });
    } else {
      if (!db) throw new Error("Load a sample database first.");
      self.postMessage({ id: message.id, ok: true, type: "run", execution: executeSql(db, message.sql ?? "") });
    }
  } catch (error) {
    // Report current schema because earlier statements may have succeeded.
    let schema = null;
    try { if (db) schema = schemaOf(db); } catch { /* Ignore schema failure. */ }
    self.postMessage({ id: message.id, ok: false, error: error instanceof Error ? error.message : "SQLite error", schema });
  }
};
