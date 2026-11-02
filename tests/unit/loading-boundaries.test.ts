import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RootLoading from "../../src/app/loading";
import AdminLoading from "../../src/app/admin/loading";
import LibraryLoading from "../../src/app/library/loading";

test("root and admin route boundaries have accurate transient status and hidden decorative skeletons", () => {
  for (const [component, text] of [[RootLoading, "Loading page content."], [AdminLoading, "Loading the administrator workspace."], [LibraryLoading, "Loading the resource library."]] as const) {
    const html = renderToStaticMarkup(createElement(component));
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /role="status"/);
    assert.ok(html.includes(text));
    assert.ok(html.indexOf('role="status"') < html.indexOf('aria-busy="true"'), "status must be outside the busy region");
    assert.match(html, /aria-hidden="true"/);
    assert.match(html, /skeleton/);
  }
});
