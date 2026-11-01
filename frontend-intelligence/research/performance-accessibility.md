# Performance & Accessibility Engineering

**AK · 2026-11-01 · Domain H.** Thresholds verified against published Core Web Vitals guidance (multiple 2026 sources agree `[REPORTED S6]`); platform capabilities against MDN/Next.js docs `[VERIFIED-DOC]`.

## 1. Budgets (the numbers AC must hit)

Google's published thresholds, unchanged in 2026, measured at the **75th percentile of field data**:

| Metric | Good | Needs improvement | Poor | Our target (lab, mobile, CPU-throttled 4×) |
|---|---|---|---|---|
| **LCP** | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s | **≤ 1.8 s** (marketing-landing guidance `[REPORTED S6]`) |
| **INP** | ≤ 200 ms | 200–500 ms | > 500 ms | **≤ 120 ms** p75 (animation-heavy UI needs headroom) |
| **CLS** | ≤ 0.1 | 0.1–0.25 | > 0.25 | **≤ 0.02** (a text-first page can be near zero) |
| TTFB (supporting) | ≤ 600 ms | — | — | ≤ 400 ms (static/ISR routes ≪ this) |

Project-specific budgets `[AK-RECOMMENDATION]`:

| Budget | Limit | Enforcement |
|---|---|---|
| First-load JS, `/` | **≤ 170 KB gz** (current app is far below; adding three.js blows it) | `next build` output + `@next/bundle-analyzer` |
| Any single visual effect | ≤ 4 MB/s main-thread work, **no long task > 50 ms** | DevTools Performance trace |
| Fonts | 2 families, ≤ 3 files, `display: swap`, self-hosted | already via `next/font` `[VERIFIED-FILE]` |
| Layout shift on filter change | **0** | skeletons hold size; `line-clamp` on titles; explicit aspect-ratio on the preview band |
| Ambient animation idle cost | ~0 CPU when not interacting (`frameloop="demand"`, `animation-play-state: paused` off-screen) | trace while scrolling then idle |

## 2. The five things that will actually hurt this app

1. **`page.tsx` is a client component importing the dataset `[VERIFIED-FILE]`.** Every effect added there ships in the first-load chunk and re-renders on each keystroke in the search box. Fix: server-component the data, isolate the query state in a client leaf, and derive results in a `useDeferredValue`. *This is the top INP risk in the entire project.*
2. **`.glass-card` `backdrop-filter` scaled to a large grid `[VERIFIED-FILE]`.** Cap blurred layers (≤4 visible), and give list/grid items a solid surface with a 1px border instead.
3. **Reveal animations that hide the LCP element.** Never `opacity: 0` the hero title; animate `y`/`clip-path` only, or start visible.
4. **Web fonts + oversized display type.** `next/font` already self-hosts and preloads Geist/Newsreader `[VERIFIED-FILE]`; add `size-adjust` on the fallback to kill the swap shift, and keep Newsreader italic as the only extra style.
5. **Scroll libraries fighting each other** (`html{scroll-behavior:smooth}` + Lenis + ScrollTrigger pin-spacers) — pick one scroll owner. See `scroll-animations.md`.

## 3. Loading & code-splitting strategy (Next 16 App Router)

| Technique | Use here | Note |
|---|---|---|
| Server Components by default | ✅ | Move data reads out of `page.tsx`; header/toggles stay `"use client"` |
| `next/dynamic(..., { ssr: false })` | ✅ **mandatory** for any R3F canvas or GSAP-heavy scene | Keep `three` out of the initial chunk |
| Route-level split | ✅ | `/presentation/[id]` must not carry the landing scene |
| `next/image` + AVIF/WebP | ✅ for any generated textures/thumbnails | **`next.config.ts` has no image config `[VERIFIED-FILE]`** — external Google/Dropbox hosts need `remotePatterns` before `next/image` can be used; otherwise use our SVG texture |
| `priority` + `fetchpriority="high"` on the hero visual | ✅ | `[REPORTED S6]`: preload the LCP image, never lazy-load above the fold |
| `content-visibility: auto` + `contain-intrinsic-size` | ✅ on below-fold sections & long card lists | biggest free win for a catalogue page |
| `loading="lazy"` iframes | ✅ | Slides/Dropbox embeds are third-party — put a poster + click-to-load in front |
| `preload` for the one animation asset | ⚠️ only if >1 scene uses it | |
| `next/script` `afterInteractive` for analytics | n/a today | if the Product Owner adds analytics: it is the classic INP killer `[REPORTED S6]` |
| Partial prerendering / Cache Components | 💡 evaluate | Next 16 supports `'use cache'`; a hub with a JSON/db read is a candidate for static + revalidation, which is the cheapest LCP win available |

## 4. GPU & frame discipline

- Animate `transform`, `opacity`, `filter`, `clip-path` only; `will-change` on the specific animating element, removed after (permanent `will-change` on many nodes costs memory and can *reduce* fps).
- `contain: layout paint style` on cards; `contain-intrinsic-size` with `content-visibility`.
- Batch reads/writes in any scroll handler (avoid layout thrashing `[REPORTED S6]`).
- Prefer **compositor-driven** motion: CSS scroll-driven animations run off the main thread, so they stay smooth while JS is busy — the single strongest argument for using them over JS reveals `[REPORTED S8]`.
- Long tasks: break with `scheduler.yield()` / chunked updates when filtering large arrays `[REPORTED S6]`.
- 120 Hz devices: Motion/GSAP run per-frame; clamp durations rather than chasing refresh rate; for R3F, `frameloop="demand"` + `invalidate()` is the mobile-battery win `[REPORTED S5]`.
- Power: WebGL scenes throttle thermally after ~2 min on mid phones — hence idle=0 and a quality ladder (particle count, DPR, effects-off at `deviceMemory <= 4`).

## 5. Reduced motion — the correct implementation (most teams get this wrong)

CSS handles declarative motion. **JS does not stop itself.** The project already has a solid CSS block (kills blob float, card transitions, `animate-ping`, and clamps all durations `[VERIFIED-FILE]`). Add:

```tsx
export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches); on();
    mq.addEventListener("change", on); return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}
```
Contract when `reduce === true`: **no Lenis** (instant native scroll), **no scrubbed timelines** (`gsap.set` to end state, no pin), **no infinite ambient loops**, **no pointer parallax / magnetic travel / tilt**, **no custom cursor**, **no marquee**, **no view-transition animation** (keep route changes instant, not cross-faded), and **instant content reveal** (content simply visible — never `opacity:0` with no animation path). Motion's own `MotionConfig reducedMotion="user"` covers declarative components — use it as the backstop `[VERIFIED-DOC]`.

Also respect `prefers-reduced-transparency` (→ replace glass with solid surfaces) and `prefers-contrast` (→ drop glows, raise border alpha) — both are one-line `@media` rules and are exactly the sort of detail a reviewer/award judge checks. `[AK-RECOMMENDATION]`

## 6. Keyboard & focus requirements (audited state + deltas)

Present and good `[VERIFIED-FILE]`: skip link, `:focus-visible` ring via box-shadow, landmarks (`banner/main/contentinfo/navigation`), ⌘K with arrows/Enter/Esc, projector-mode 48 px targets, `suppressHydrationWarning` with a pre-paint theme script.

Deltas AC must make when adding motion/3D:
1. **Any newly interactive element** (3D "card", custom slider, tilt surface) needs a DOM-equivalent focusable control. Canvas content is not keyboard-reachable — expose a parallel `<ul>` of links (visually hidden if needed) with `aria-hidden` on the canvas.
2. `:focus-visible` must survive the new layers: our ring is `box-shadow` — it will be **clipped** by `overflow:hidden` wrappers and **invisible** on light `#f8fafc` if only indigo at 50% alpha. Define a two-tone ring: `outline: 2px solid Canvas; box-shadow: 0 0 0 4px var(--focus)`; test both themes.
3. Palette: `role="dialog"` + `aria-modal="true"`, focus trap, return focus to trigger, `Esc` anywhere, list `role="listbox"`/options `role="option"`, `aria-activedescendant`.
4. Result count → `aria-live="polite"` region (e.g. "12 documents"); do **not** announce per keystroke without debounce.
5. Toggling theme/projector → announce via live region (`aria-live="polite"` "Dark theme") — silent state changes read as breakage.
6. `inert` + `aria-hidden` on background content while an overlay is open (better than manual tab-trapping alone).
7. Focus must never be lost by a re-layout animation — run `Flip` on the visible grid while focus stays put (do not re-key DOM nodes during the tween).
8. Skip link must not be covered by a new fixed layer (`z-index: 100` today `[VERIFIED-FILE]` — raise above any new effect layer).

## 7. Semantic & content requirements

`<main id="main-content">`, `<header>`, `<footer>`, `<nav aria-label>` exist `[VERIFIED-FILE]`. Add: `<search role="search">` around the filter panel; `<ol>`/`<ul>` for result lists with `<li>` cards (a grid of `<div>`s loses count semantics); `aria-current="page"` where nav items are added; a real `<h1>` per page (the detail page's title is an `h1` `[VERIFIED-FILE]` — keep exactly one); labelled landmarks for the card grid ("Documents"). Contrast: verify `#94a3b8` on `#050505` (≈ 8:1 ✅) and `#64748b`/`#475569` on `#f1f5f9` light surfaces (**likely < 4.5:1** `[AK-RECOMMENDATION: fix — the muted token is the risk in light mode`]).

## 8. Progressive enhancement ladder (the required architecture)

| Level | Delivers | When |
|---|---|---|
| **L0 HTML** | Headline, featured doc, all links, search form as a real GET form | always |
| **L1 + CSS** | Glass system, ambient gradient, reveal via `@supports (animation-timeline: view())`, `text-wrap: balance`, focus rings | browsers without JS keep this |
| **L2 + React/Motion** | Springs, `AnimatePresence` on palette, `layoutId` pills, deferred filtering | default |
| **L3 + native VT** | Shared-element morph, directional route slides, Suspense reveals | React 19.3 + Next 16.4 + Chromium 125+/recent Safari/Firefox `[VERIFIED-DOC]` |
| **L4 + GSAP** | Pinned hero scene, `Flip` grid relayout, SplitText | gated on 1–3 shipping |
| **L5 + WebGL** | Ambient particle field | **only** after WebGL2 + memory + motion + theme checks pass |

Each level degrades silently. L0–L2 alone must already look premium — if it doesn't, the design is wrong, not the fallback.

## 9. Compatibility & testing matrix

Browsers to test (README's stated floor is Chrome/Edge/FF 90+, Safari 14+ `[VERIFIED-FILE]` — **that floor is now too low for what we're adding**: same-document VT needs Safari 18/Chrome 111+, `animation-timeline` needs Safari 26/FF 159 `[VERIFIED-DOC]`):

Chrome 125+, current Safari + iOS Safari 17/18/26, Firefox 133+, Samsung Internet, **Android WebView / Chrome-in-app browsers**, and — because this is a classroom tool — **projector output at 1920×1080 with `projector-mode` on**.

Devices: one real ≤$200 Android (4 GB RAM, `deviceMemory ≤ 4`) and one iPhone on iOS 17/18. Emulation is not sufficient for `backdrop-filter` + scroll libraries.

Test set for every visual PR `[AK-RECOMMENDATION]`:
1. Lighthouse (mobile, throttled) — LCP/CLS/INP + a **reduced-motion** repeat.
2. Performance trace while: typing in search (INP), scroll through a pinned scene (frame budget), filter apply (long tasks), theme toggle.
3. Keyboard-only full walkthrough incl. palette and detail page.
4. axe DevTools / `eslint-plugin-jsx-a11y` pass; contrast check both themes + projector.
5. `npm run typecheck && npm run lint && npm run build` — all three scripts already exist `[VERIFIED-FILE]`.
6. Screenshot matrix: {dark, light, system-mimic} × {mobile 390, tablet 768, desktop 1440, projector} for `/` and `/presentation/[id]`.
7. No-JS check (L0). Slow-3G check. Context-loss check (L5 only).

## 10. Things that will make AC's build slow, ranked

1. Client-side dataset + keystroke filtering in a `"use client"` root page.
2. `backdrop-filter` on many nodes.
3. A scroll library + a tween library + a route-transition library all driving the same frame.
4. WebGL in the main bundle (not dynamic) or in the shared layout.
5. Animating layout properties (`height`, `margin`, `width`) instead of transforms.
6. Unbounded `box-shadow`/blur on hover for 50 cards.
7. Third-party iframes on the critical path (Slides embeds without click-to-load).
8. Un-measured "temporary" debug: `stats-gl`/`<Stats>`/`markers: true` left in production.
