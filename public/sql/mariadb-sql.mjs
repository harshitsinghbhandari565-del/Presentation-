// Defensive single-statement guard, not a security boundary or SQL parser.
// MariaDB's embedded single-query API may otherwise ignore trailing statements.
export function ensureOneStatement(sql) {
  let quote = '', line = false, block = false, ended = false, significant = false;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i], next = sql[i + 1];
    if (line) { if (c === '\n' || c === '\r') line = false; continue; }
    if (block) { if (c === '*' && next === '/') { block = false; i++; } continue; }
    if (quote) {
      if (c === '\\') throw new Error('Backslashes inside quoted text are not supported in this experimental mode.');
      if (c === quote) { if (next === quote) i++; else quote = ''; }
      continue;
    }
    if (c === '#' || (c === '-' && next === '-' && (i + 2 === sql.length || /\s/.test(sql[i + 2])))) { line = true; if (c === '-') i++; continue; }
    if (c === '/' && next === '*') { if (sql[i + 2] === '!' || ((sql[i + 2] === 'M' || sql[i + 2] === 'm') && sql[i + 3] === '!')) throw new Error('Executable comments are not supported in this experimental mode.'); block = true; i++; continue; }
    if (/\s/.test(c)) continue;
    if (ended) throw new Error('Run one statement at a time. Select a single statement or remove the others.');
    if (c === ';') { if (!significant) throw new Error('Enter a SQL statement to run.'); ended = true; continue; }
    if (c === "'" || c === '"' || c === '`') quote = c;
    significant = true;
  }
  if (!significant) throw new Error('Enter a SQL statement to run.');
  if (quote || block) throw new Error('Unterminated quoted text or comment.');
}
