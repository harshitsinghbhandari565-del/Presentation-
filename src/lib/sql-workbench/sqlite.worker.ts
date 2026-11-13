import initSqlJs, { type Database } from "sql.js";
import { executeSql, schemaOf } from "./engine";

let db: Database | null = null;
const ready = initSqlJs({ locateFile: () => "/sql/sql-wasm.wasm" });
self.onmessage = async (event: MessageEvent<{ id: number; type: "load" | "run" | "import" | "export"; sql?: string; bytes?: ArrayBuffer }>) => {
  const message = event.data;
  try {
    const SQL = await ready;
    if (message.type === "load") {
      const next = new SQL.Database();
      try { next.run("PRAGMA foreign_keys = ON;"); }
      catch (error) { next.close(); throw error; }
      db?.close(); db = next;
      self.postMessage({ id: message.id, ok: true, type: "load", schema: schemaOf(db) });
    } else if (message.type === "import") {
      const bytes = message.bytes && new Uint8Array(message.bytes);
      const signature = "SQLite format 3\0";
      if (!bytes || bytes.length < 100 || bytes.length > 5 * 1024 * 1024 || ![...signature].every((ch, i) => bytes[i] === ch.charCodeAt(0))) throw new Error("Choose a valid SQLite database file no larger than 5 MiB.");
      const next = new SQL.Database(bytes);
      try {
        next.run("PRAGMA foreign_keys = ON");
        const check = next.exec("PRAGMA quick_check(1)");
        if (check[0]?.values[0]?.[0] !== "ok") throw new Error("The SQLite file failed its integrity check.");
        const schema = schemaOf(next);
        db?.close(); db = next;
        self.postMessage({ id: message.id, ok: true, type: "import", schema });
      } catch (error) { next.close(); throw error; }
    } else {
      if (!db) throw new Error("Create a new database first.");
      if (message.type === "export") {
        const pages = Number(db.exec("PRAGMA main.page_count")[0]?.values[0]?.[0] ?? 0);
        const size = Number(db.exec("PRAGMA main.page_size")[0]?.values[0]?.[0] ?? 0);
        if (pages * size > 5 * 1024 * 1024) throw new Error("Database is too large to export (maximum 5 MiB).");
        const data = db.export().slice();
        self.postMessage({ id: message.id, ok: true, type: "export", bytes: data.buffer }, { transfer: [data.buffer] });
      } else self.postMessage({ id: message.id, ok: true, type: "run", execution: executeSql(db, message.sql ?? "") });
    }
  } catch (error) {
    // Report current schema because earlier statements may have succeeded.
    let schema = null;
    try { if (db) schema = schemaOf(db); } catch { /* Ignore schema failure. */ }
    self.postMessage({ id: message.id, ok: false, error: error instanceof Error ? error.message : "SQLite error", schema });
  }
};
