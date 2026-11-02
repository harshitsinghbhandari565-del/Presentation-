# Accessibility guidelines for animated, immersive surfaces

Written against AC's existing setup: `@axe-core/playwright 4.14.0` + `@playwright/test 1.64.1` in CI
[VERIFIED-FILE c9d0d599], a skip link and `MotionConfig reducedMotion="user"` already in `layout.tsx`
[VERIFIED-FILE], and AC's own reduced-motion token policy in the sibling branch (`--motion-*` durations remapped,
motion never removed) [VERIFIED-FILE 019fbda9 `src/tokens/motion.css`].

**Framing:** every rule below is written so it can become an assertion. Anything AK could not verify in this
sandbox is labelled — the *code shapes* came from the lab (20/20 headless passes including a forced reduced-motion
pass); the *AT behaviour* did not, because no screen reader or browser exists here **[UNVERIFIED]**.

## 1. Motion policy — three states, one of them always readable

| state | trigger | what happens | must never happen |
|---|---|---|---|
| full | default | reveals, parallax, ambient layer, tilt, pinned chapter | blocking LCP; >1 long task per scroll tick |
| reduce | `prefers-reduced-motion: reduce` **or** `?motion=reduce` **or** app setting | content appears in final state; state changes still animate at ≤150 ms opacity; ambient layer renders **one static frame**; pill/indicator jumps | content hidden waiting for a reveal that never runs; animation permanently disabled on the *next* load because a flag was persisted wrong |
| fallback | no WebGL / low power / `?fallback=1` | CSS gradient or CSS-3D stand-in; identical DOM, identical text | a blank canvas, a spinner, or lost information |

The lab encodes the contract AC can copy: `prefs.reduced` = attribute → URL param → media query, in that order, and
every experiment's reduced pass is executed by `node test.mjs`.

**Reveal components must default to visible.** Pattern (from `cssReveal()` in the lab):

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    [data-reveal]:not([data-revealed]) { animation: reveal linear both; animation-timeline: view(); animation-range: entry 5% cover 26%; }
  }
}
```
If either query fails, nothing is hidden. A `.reveal { opacity:0 }` rule that depends on JS to remove is an a11y bug,
not a style choice — with JS off or an interrupted hydration, the page is invisible.

## 2. Canvas, WebGL and 3D

1. The canvas is `aria-hidden="true"`, never focusable, and carries no text content. All copy lives in DOM above/beside it (EX05's structure).
2. A 3D scene that conveys meaning needs a **non-visual equivalent**: a list of the same items (our doc stack → the actual result list underneath).
3. Interactive 3D (drag to rotate) must have a keyboard alternative (`←/→` step, or a real `<button>` per item) and a visible focus path; if we cannot express it in keyboard terms, the scene is decorative only.
4. Text rendered *in* WebGL (troika/SDF/three text) is invisible to AT and cannot be zoomed by user stylesheets → **do not render document titles or metadata as 3D text.** Headings that must be found by a screen reader are HTML, positioned over the canvas.
5. Context creation failure must not remove content (lab: capability check before `await import`).

## 3. Contrast & legibility on effects

| surface | rule |
|---|---|
| body text over an ambient/shader layer | text sits on a panel with `background: color-mix(in oklab, var(--surface) 82%, transparent)` (EX05) — never raw over a moving gradient |
| contrast floor | 4.5:1 body, 3:1 for ≥ 24 px/18.7 px bold, 3:1 for borders that convey state — check **both** themes and the *animated* frames, since a moving background changes effective contrast |
| spotlight/glare | `mix-blend-mode: screen` at ≤ 0.75 alpha on a *card*, never behind text |
| `backdrop-filter` | allowed on toolbars/panels; test that removing blur (some browsers/OS settings) still leaves an opaque-enough surface |
| colour-only signals | facet counts, "new", selected states need a second channel (icon/weight/position) |
| projector mode (AC has it) | re-test all of the above at 6 m viewing distance: larger type, harder borders, motion off [VERIFIED-FILE: `presentation-hub-theme-projector`] |

## 4. Keyboard contracts (from the lab's implementations)

| component | keys | focus rules |
|---|---|---|
| subject/course nav (EX08) | `Tab` enters, `←/→ ↑/↓ Home End` move, `Enter/Space` select | roving tabindex: exactly one `tabindex="0"`; `aria-selected` mirrors it; focus ring on the *item*, not the container |
| doc card (EX07) | `Tab`, `Enter` opens | card is not a duplicate link target: AC already does `tabIndex={-1} aria-hidden` on the cover link [VERIFIED-FILE `DocumentCard.tsx`] — keep that; if the whole card becomes activatable, it must be a single `<a>` with `:focus-visible` ring, not a `div role="button"` |
| filter sheet (EX10) | `Esc` closes; `Tab` cycles inside; focus returns to the trigger | `aria-modal="true"`, `role="dialog"`, `aria-expanded` on trigger, body scroll lock released on close; **do not** trap focus in a non-modal popover |
| preview lightbox | `Esc`, `←/→`, `+/-` or pinch | `img` alt from doc title + page number; announce "page 3 of 24" via a live region |
| skip link | present in AC layout | must land on the results heading, not `main` of a page where filters steal focus first |
| pinned chapter (Tier 2) | `Tab` must not be trapped by a pin; `End`/`PageDown` still move the document | a pin that swallows keyboard scroll is the #1 complaint about ScrollTrigger sites → `matchMedia` off for `reduce` **and** for `(max-width: 900px)` (EX04 does both) |

## 5. Screen-reader & semantic rules

- **Result counts**: AC returns exact counts from `get_catalog_facets()` [VERIFIED-FILE] — put them in `aria-live="polite"` on the results heading region so "128 resources" is announced after a filter change, debounced (~300 ms) so typing doesn't spam.
- **Facet filter group**: `<fieldset>`/`<legend>` or `role="group" aria-labelledby`; options are checkboxes with real inputs, not styled divs (EX10 uses `aria-pressed` buttons — acceptable, but native inputs are safer for the mobile sheet).
- **Sort control**: `aria-label="Sort results by"` + `aria-live` on the applied value.
- **Applied-filter summary**: a visible list with per-chip remove buttons labelled `Remove filter: Psychology` — and the same text available to AT (not `aria-hidden` icons only).
- **Empty state**: `role="status"` paragraph with the query echoed + one actionable suggestion (broaden/clear) — AC's local verification already covered empty states; keep the copy in the accessible name.
- **External link safety**: AC's `displayHost(originalUrl)` pattern [VERIFIED-FILE] + suffix text ` (opens in a new tab)` in the accessible name; `rel="noopener noreferrer"`; never announce a navigation that a popup blocker will kill.
- **View Transitions**: `::view-transition{pointer-events:none}` (in EX09's CSS) so the snapshot layer doesn't eat clicks; focus must be re-queried **after** `finished` — during a VT the DOM is snapshotted and `document.activeElement` can be stale.
- **Skeletons**: `aria-hidden="true"` + a single `role="status"` "Loading resources"; skeletons must not be read as content.
- **Motion toggle is a preference, not a joke**: label it "Reduce motion", persist under the same key AC already uses for theme (`presentation-hub-theme`), and honour `?motion=reduce` for testing.

## 6. Targets, spacing, zoom

| rule | value | source |
|---|---|---|
| touch target | ≥ 44 × 44 px (EX10: 44–48 px) | WCAG 2.2 2.5.8 (24 px min) — we exceed it |
| gap between targets | ≥ 8 px | 2.5.8 |
| text zoom | layouts survive 200 % zoom; no `overflow:hidden` on the animated hero | review item |
| reflow | no horizontal scroll at 320 px | EX10 screen is 390 px min-width-safe by design |
| hover-only | every hover reveal (spotlight, glare, quick-open) also has a focus/active equivalent; nothing appears *only* on hover | `hover:hover and pointer:fine` guard in EX07 |
| timing | no interaction requires a timed response; sheet/carousel have no timer | 2.2.1 |

## 7. Test plan AC can run (each line = one Playwright test)

```ts
// 1. axe on the three routes, both themes, both motion modes
for (const theme of ["dark","light"]) for (const motion of ["","?motion=reduce"]) {
  test(`axe ${theme}${motion}`, async ({ page }) => {
    await page.addInitScript(t => localStorage.setItem("presentation-hub-theme", t), theme);
    await page.goto("/library" + motion);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}
// 2. reduced motion actually changes behaviour, and content still exists
test("reduce: no hidden content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  const anim = await page.evaluate(() => getComputedStyle(document.querySelector("[data-reveal]")!).opacity);
  expect(Number(anim)).toBe(1);           // reveal must not leave opacity 0
});
// 3. no frames while the ambient layer is offscreen (also a perf test)
// 4. keyboard-only traversal reaches every action on card, sheet, nav (tabCount assertion)
// 5. sheet: focus return + Escape + aria-expanded transitions
// 6. 320px reflow + 200% zoom screenshots for PO sign-off
// 7. "opens in a new tab" present in accessible name of every external link
await expect(page.getByRole("link", { name: /opens in a new tab$/ })).toHaveCount(n);
```

Plus two manual items no automation replaces: one NVDA/Firefox and one VoiceOver/Safari pass on the landing story
section and the filter sheet (**AC or a volunteer, not AK — no AT exists in this sandbox [UNVERIFIED]**).

## 8. Known accessibility risks in AC's *current* code (reported, not fixed)

| finding | evidence | why it matters | proposed fix (AC's call) |
|---|---|---|---|
| `html { scroll-behavior: smooth; scroll-padding-top: 105px }` | [VERIFIED-FILE c9d0d599 `globals.css`] | conflicts with any added smooth-scroll lib; also makes `Skip link` jumps animate (some users report nausea) | drop it if Lenis lands; keep otherwise |
| self-referential Tailwind token `--font-editorial: var(--font-editorial), Georgia, serif` | [VERIFIED-FILE same file] | same-element circular var reference → resolved by source order, fragile | rename the `@theme` key |
| serif loaded as **italic-only** (`newsreader-latin-wght-italic.woff2`, `style:"italic"`) | [VERIFIED-FILE] | upright serif text renders faux-italic or falls back; also points into `node_modules` (fragile) | ship roman + italic files, or use `@fontsource-variable`'s default file |
| `.ov-button { transition: all }` | [VERIFIED-FILE 019fbda9 `primitive/button/button.css`] | `all` animates layout props (border-width/size) → jank + unexpected motion | enumerate properties |
| mobile nav breakpoint 761 px vs Tailwind's 768 px | [VERIFIED-FILE 019fbda9] | 7 px band with neither nav working | single token for both |

These are AC's files; AK has not edited them and will not (branch rules). AO decides whether they enter the next PR.
