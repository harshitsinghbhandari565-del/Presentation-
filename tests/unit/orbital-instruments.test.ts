import { test } from "node:test";
import assert from "node:assert/strict";
import { createOrbitalInstrument } from "../../src/components/landing/orbital-instruments";

test("orbital decoration uses disposable segmented instrument lines in both themes", () => {
  for (const light of [false, true]) {
    const instrument = createOrbitalInstrument(light);
    assert.equal(instrument.group.children.length, 2);
    assert.equal(instrument.group.position.z, -1.2);
    assert.ok(instrument.outer.geometry.getAttribute("position").count > 100);
    assert.equal(instrument.outer.isLineSegments, true);
    assert.equal(instrument.inner.isLineSegments, true);
    let disposed = 0;
    instrument.outer.geometry.addEventListener("dispose", () => disposed++);
    instrument.inner.geometry.addEventListener("dispose", () => disposed++);
    instrument.dispose();
    assert.equal(disposed, 2);
  }
});
