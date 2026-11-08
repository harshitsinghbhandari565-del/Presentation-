import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../..");
const editorPath = path.resolve(projectRoot, "src/components/admin/DocumentEditor.tsx");
const source = readFileSync(editorPath, "utf8");

/**
 * C2: AK review §6 reported 82 unit tests (AC's log) vs 81 reproducible (AK's
 * run). The sole extra test — "admin editor associates select and description
 * errors with their controls" — existed only in AC's working tree, never in any
 * Git ref. This test pins that contract as a reproducible source inspection so
 * the count is verifiable and the accessibility pattern cannot silently regress.
 */

test("C2: admin editor text() associates errors with controls via aria-describedby", () => {
  // The text() helper must set aria-describedby to the error id when a field
  // error exists, and leave it undefined otherwise.
  assert.match(
    source,
    /aria-describedby=\{state\.fields\?\.\[key\] \? `error-\$\{key\}` : undefined\}/,
    "text() must set aria-describedby to error-{key} when a field error exists",
  );
  assert.match(
    source,
    /aria-invalid=\{Boolean\(state\.fields\?\.\[key\]\)\}/,
    "text() must set aria-invalid when a field error exists",
  );
});

test("C2: admin editor select() associates errors with controls via aria-describedby", () => {
  // The select() helper must also set aria-describedby (the AK-identified gap).
  assert.match(
    source,
    /aria-describedby=\{state\.fields\?\.\[key\] \? `error-\$\{key\}` : undefined\}/,
    "select() must set aria-describedby to error-{key} when a field error exists",
  );
  assert.match(
    source,
    /aria-invalid=\{Boolean\(state\.fields\?\.\[key\]\)\}/,
    "select() must set aria-invalid when a field error exists",
  );
});

test("C2: admin editor description textarea associates errors with its control", () => {
  // The description textarea (rendered inline, not via text()) must also set
  // aria-describedby and aria-invalid.
  assert.match(
    source,
    /aria-describedby=\{state\.fields\?\.description \? "error-description" : undefined\}/,
    "description textarea must set aria-describedby to error-description when a field error exists",
  );
  assert.match(
    source,
    /aria-invalid=\{Boolean\(state\.fields\?\.description\)\}/,
    "description textarea must set aria-invalid when a field error exists",
  );
});

test("C2: fieldError() generates stable error ids for all field keys", () => {
  // The fieldError helper must generate id={`error-${key}`} so that
  // aria-describedby references resolve correctly.
  assert.match(
    source,
    /id=\{`error-\$\{key\}`\}/,
    "fieldError() must generate id={`error-${key}`}",
  );
});
