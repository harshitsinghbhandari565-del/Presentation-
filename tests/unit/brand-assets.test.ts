import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Brand from "../../src/components/layout/Brand";

test("header brand uses the selected icon and remains an accessible home link", () => {
  const html = renderToStaticMarkup(createElement(Brand));
  assert.match(html, /aria-label="Harshit Presentation Hub home"/);
  assert.match(html, /orbital-mark\.webp/);
  assert.match(html, /alt=""/);
  assert.match(html, /Presentation Hub/);
});

test("selected logo assets and appropriately sized PNG icons are local", () => {
  for (const file of ["orbital-mark.webp", "full-logo.webp"]) {
    const bytes = readFileSync(`public/images/brand/${file}`);
    assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
  }
  for (const [file, size] of [["favicon-32.png", 32], ["favicon-192.png", 192], ["apple-touch-icon.png", 180]] as const) {
    const bytes = readFileSync(`public/images/brand/${file}`);
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.equal(bytes.readUInt32BE(16), size);
    assert.equal(bytes.readUInt32BE(20), size);
  }
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.match(layout, /favicon-32\.png/);
  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(readFileSync("src/components/layout/SiteFooter.tsx", "utf8"), /full-logo\.webp/);
});
