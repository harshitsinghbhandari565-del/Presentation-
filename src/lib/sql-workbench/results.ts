import type { QueryResult } from "./engine";

/** Sort a copy of the retained rows; never imply that the full query is sorted. */
export function sortedResult(result: QueryResult, column: number | null, direction: "asc" | "desc"): QueryResult {
  if (column === null || column < 0 || column >= result.columns.length) return result;
  const rows = result.rows.map((row, index) => ({ row, index }));
  rows.sort((a, b) => {
    const left = a.row[column], right = b.row[column];
    let order: number;
    if (left === null && right === null) order = 0;
    else if (left === null) order = -1;
    else if (right === null) order = 1;
    else if (typeof left === "number" && typeof right === "number") order = left - right;
    else order = String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
    return order === 0 ? a.index - b.index : direction === "asc" ? order : -order;
  });
  return { ...result, rows: rows.map(item => item.row) };
}
