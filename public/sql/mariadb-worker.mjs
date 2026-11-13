// Isolated worker; the unmodified upstream MariaDB runtime is loaded locally.
import { Lite4MariaDB } from './mariadb/index.mjs';
import { ensureOneStatement } from './mariadb-sql.mjs';
let db;
const MAX_ROWS = 500, MAX_CHARS = 1_000_000, MAX_CELLS = 100_000;
function toCell(value) {
  if (value == null) return null;
  if (value instanceof Uint8Array) return `[BLOB: ${value.length} bytes]`;
  return typeof value === 'number' ? value : String(value);
}
function resultOf(result) {
  if (!result.fields) return null;
  const columns = result.fields;
  // The upstream library returns rows as objects and loses duplicate aliases.
  if (new Set(columns).size !== columns.length) throw new Error('Duplicate result column names cannot be displayed reliably. Give each column a unique alias.');
  const rows = []; let chars = 0, cells = 0, truncated = false;
  for (const item of result.rows) {
    if (rows.length >= MAX_ROWS || cells + columns.length > MAX_CELLS) { truncated = true; break; }
    const row = columns.map(name => toCell(item[name]));
    const size = row.reduce((total, v) => total + (v === null ? 0 : String(v).length), 0);
    if (chars + size > MAX_CHARS) { truncated = true; break; }
    rows.push(row); chars += size; cells += row.length;
  }
  return { columns, rows, truncated };
}
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'load') {
      db = await Lite4MariaDB.create();
      // Remove the packaged empty test schema; information_schema is required.
      db.exec('DROP DATABASE IF EXISTS test');
      db.exec('CREATE DATABASE scratch');
      db.exec('USE scratch');
      self.postMessage({ id: data.id, ok: true, type: 'load' });
    } else if (data.type === 'run') {
      if (!db) throw new Error('Start the database first.');
      if (typeof data.sql !== 'string' || !data.sql.trim()) throw new Error('Enter a SQL statement to run.');
      if (data.sql.length > 100000) throw new Error('SQL is too long (maximum 100,000 characters).');
      ensureOneStatement(data.sql);
      const start = performance.now();
      const raw = db.exec(data.sql);
      const result = resultOf(raw);
      self.postMessage({ id: data.id, ok: true, type: 'run', result, affected: raw.affected ?? 0, durationMs: Math.round((performance.now()-start)*10)/10 });
    }
  } catch (e) {
    self.postMessage({ id: data.id, type: data.type, ok: false, error: e instanceof Error ? e.message : String(e) });
  }
};
