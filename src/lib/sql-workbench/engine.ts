import type { Database, SqlValue } from "sql.js";

export const MAX_ROWS = 500;
export const MAX_SQL_LENGTH = 100_000;
export type Cell = string | number | null;
export interface QueryResult { columns: string[]; rows: Cell[][]; truncated: boolean }
export interface SchemaObject { name: string; type: string; columns: { name: string; type: string; primaryKey: boolean; notNull: boolean }[] }
export interface Execution { results: QueryResult[]; changes: number; statements: number; durationMs: number; schema: SchemaObject[] }

export function schemaOf(db: Database): SchemaObject[] {
  const objects = db.exec("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY type, name");
  return (objects[0]?.values ?? []).map(row => {
    const name = String(row[0]);
    const escaped = name.replace(/"/g, '""');
    const columns = db.exec(`PRAGMA table_info("${escaped}")`)[0]?.values ?? [];
    return { name, type: String(row[1]), columns: columns.map(c => ({ name: String(c[1]), type: String(c[2] || ""), notNull: Boolean(c[3]), primaryKey: Boolean(c[5]) })) };
  });
}

function cell(value: SqlValue): Cell {
  return value instanceof Uint8Array ? `[BLOB: ${value.length} bytes]` : value;
}

/** Executes real SQLite statements in sequence; errors may leave prior statements applied. */
export function executeSql(db: Database, sql: string): Execution {
  if (!sql.trim()) throw new Error("Enter a SQL statement to run.");
  if (sql.length > MAX_SQL_LENGTH) throw new Error("SQL is too long (maximum 100,000 characters).");
  const start = performance.now();
  const before = Number(db.exec("SELECT total_changes()")[0].values[0][0]);
  const results: QueryResult[] = [];
  let statements = 0;
  for (const statement of db.iterateStatements(sql)) {
    statements++;
    if (statements > 100) { statement.free(); throw new Error("A run can contain at most 100 statements; earlier statements may have completed."); }
    try {
      const columns = statement.getColumnNames();
      const rows: Cell[][] = [];
      let truncated = false;
      while (statement.step()) {
        if (rows.length === MAX_ROWS) { truncated = true; break; }
        if (columns.length) rows.push(statement.get().map(cell));
      }
      if (columns.length) results.push({ columns, rows, truncated });
    } finally { statement.free(); }
  }
  const after = Number(db.exec("SELECT total_changes()")[0].values[0][0]);
  return { results, changes: after - before, statements, durationMs: Math.round((performance.now() - start) * 10) / 10, schema: schemaOf(db) };
}

/** Prefix formula-like spreadsheet fields to prevent formula execution on import. */
export function csvForResult(result: QueryResult): string {
  const encode = (v: Cell) => {
    let text = v === null ? "" : String(v);
    if (/^[\t\r\n ]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [result.columns.map(encode).join(","), ...result.rows.map(row => row.map(encode).join(","))].join("\r\n");
}

/** A usability warning, not an SQL security boundary or a complete SQL parser. */
export function mayChangeOrDeleteExistingData(sql: string): boolean {
  const withoutLiterals = sql.replace(/--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`|\[[^\]]*\]/g, " ");
  return /\b(?:DELETE|UPDATE|DROP|ALTER|REPLACE|VACUUM)\b/i.test(withoutLiterals);
}
