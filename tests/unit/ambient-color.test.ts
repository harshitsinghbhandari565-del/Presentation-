import test from "node:test";
import assert from "node:assert/strict";
import { parseCssColor } from "../../src/components/layout/ambient-shader";
import { buildShelfItems } from "../../src/components/landing/shelf-scene";
import { isMotionPaused, setMotionPaused, toggleMotionPaused } from "../../src/components/layout/motion-state";

const fallback = [0.1, 0.2, 0.3] as const;

test("shader palette parses the actual theme hex tokens and RGB notation", () => {
  assert.deepEqual(parseCssColor("#a5aaff", fallback), [165 / 255, 170 / 255, 1]);
  assert.deepEqual(parseCssColor("#fff", fallback), [1, 1, 1]);
  assert.deepEqual(parseCssColor("rgb(255, 128, 0)", fallback), [1, 128 / 255, 0]);
  assert.deepEqual(parseCssColor("rgb(100% 0% 50% / .5)", fallback), [1, 0, 0.5]);
});

test("missing or malformed colours use a safe cached fallback", () => {
  for (const value of ["", "var(--missing)", "#12xz00", "rgb(300,0,0)", "rgb(NaN,0,0)", "rgb(1garbage,0,0)", "#12345"]) {
    assert.deepEqual(parseCssColor(value, fallback), fallback, value);
  }
});

test("shelf builder preserves genuine live counts and fills upcoming studio folios", () => {
  const items = buildShelfItems([{ name: "English", count: 1 }]);
  assert.equal(items.length, 5);
  assert.deepEqual(items[0], { name: "English", count: 1, live: true });
  assert.ok(items.slice(1).every(item => item.live === false && item.count === 0));
});

test("motion pause state safely defaults to unpaused without DOM storage", () => {
  assert.equal(isMotionPaused(), false);
  setMotionPaused(true);
  assert.equal(typeof toggleMotionPaused(), "boolean");
});
