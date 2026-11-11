import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

test("Cosmic Cliffs photo is local, decorative, credited, and available with reduced motion", () => {
  const background = readFileSync("src/components/layout/AmbientBackground.tsx", "utf8");
  const css = readFileSync("src/app/globals.css", "utf8");
  const footer = readFileSync("src/components/layout/SiteFooter.tsx", "utf8");
  assert.match(background, /className="ambient-cosmic-photo" aria-hidden="true"/);
  assert.match(css, /url\(['"]\/images\/carina-cosmic-cliffs\.webp['"]\)/);
  assert.ok(statSync("public/images/carina-cosmic-cliffs.webp").size > 0);
  assert.match(footer, /NASA, ESA, CSA and STScI/);
  assert.match(footer, /creativecommons\.org\/licenses\/by-sa\/3\.0\/igo/);
  const motionSection = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.doesNotMatch(motionSection, /\.ambient-cosmic-photo\s*\{\s*display:\s*none/);
});
