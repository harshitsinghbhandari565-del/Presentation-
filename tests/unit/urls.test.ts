import test from "node:test";
import assert from "node:assert/strict";
import { safeExternalUrl, detectPlatform, slugify } from "../../src/lib/urls";

test("preserves original sharing URLs and query parameters exactly", () => {
  const url = "https://docs.google.com/presentation/d/real-id/edit?usp=drivesdk&ouid=123&rtpof=true&sd=true";
  assert.equal(safeExternalUrl(url), url);
  assert.equal(safeExternalUrl("https://www.dropbox.com/scl/fi/id/file.pptx?rlkey=key&dl=0"), "https://www.dropbox.com/scl/fi/id/file.pptx?rlkey=key&dl=0");
});
test("rejects dangerous schemes, credentials, internal hosts and malformed URLs", () => {
  for (const value of ["javascript:alert(1)", "data:text/html,test", "file:///etc/passwd", "ftp://example.com/file", "https://user:pass@example.com/file", "http://localhost/x", "http://127.0.0.1/x", "http://169.254.169.254/latest", "http://[::1]/", "https://internal.local/x", "//example.com/x", " https://example.com/x", "https://example.com/\nattack", null, undefined, 42]) assert.equal(safeExternalUrl(value), null, String(value));
});
test("approves ordinary public HTTP and HTTPS destinations", () => {
  assert.equal(safeExternalUrl("http://example.com/notes"), "http://example.com/notes");
  assert.equal(safeExternalUrl("https://drive.google.com/file/d/id/view"), "https://drive.google.com/file/d/id/view");
});
test("detects source platform from the actual URL", () => {
  assert.equal(detectPlatform("https://drive.google.com/file/d/id/view"), "Google Drive");
  assert.equal(detectPlatform("https://docs.google.com/document/d/id/edit"), "Google Docs");
  assert.equal(detectPlatform("https://docs.google.com/spreadsheets/d/id/edit"), "Google Sheets");
  assert.equal(detectPlatform("https://docs.google.com/presentation/d/id/edit"), "Google Slides");
  assert.equal(detectPlatform("https://www.dropbox.com/scl/fi/id/file.pdf"), "Dropbox");
  assert.equal(detectPlatform("https://example.com/file.pdf"), "Other");
});
test("generates stable, safe descriptive slugs", () => {
  assert.equal(slugify("  Héllo, World! Chapter 2 — Notes  "), "hello-world-chapter-2-notes");
});
