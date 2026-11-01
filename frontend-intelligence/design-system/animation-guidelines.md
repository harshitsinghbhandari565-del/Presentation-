# Animation Guidelines

**AK · 2026-11-01 · Domain J.** The design-system half of the motion language; the engineering *how* lives in `research/motion-design.md`, `research/gsap-and-scrolltrigger.md` and `technical-guides/implementation-recipes.md`.

---

## 1. Motion tokens (add to `@theme` so Tailwind can emit them)

```css
@theme {
  /* durations */
  --animate-in: 120ms;      /* press, hover, focus, chip select */
  --animate-fast: 200ms;    /* palette in/out, dropdown, tooltip, theme light spread */
  --animate-base: 300ms;    /* card hover lift, filter relayout, modal sheet */
  --animate-slow: 450ms;    /* VT route morph, section enter */
  --animate-story: 800ms;   /* one-off narrative beats (pinned scrub is exempt — scrub ≠ duration) */
  /* easings — name them so every file says the same thing */
  --ease-out-soft:  cubic-bezier(0.22, 1, 0.36, 1);      /* default enter */
  --ease-in-soft:   cubic-bezier(0.4, 0, 1, 1);           /* default exit (shorter) */
  --ease-inout:     cubic-bezier(0.65, 0, 0.35, 1);       /* scene/curtain */
  --ease-spring:    linear(0, 0.009, 0.035 8%, 0.141, 0.28 28%, 0.726 48%, 0.96, 1); /* settle */
  /* distances — the amplitude budget */
  --move-xs: 4px;  --move-sm: 8px;  --move-md: 14px;  --move-lg: 24px;
}
```

Exit is always **faster** than enter (200 in / 150 out). Nothing exceeds 800 ms except a scrub-driven scene, which is *user-paced*, not timed.

## 2. Per-component rules (the table AC actually implements from)

| Component | Trigger | Property | Duration / ease | Amplitude | Forbidden |
|---|---|---|---|---|---|
| `.glass-card` hover | `pointerenter` | `transform`, `box-shadow` (already 200 ms `ease` `[VERIFIED-FILE globals.css]`) | 200 / `--ease-out-soft` | 2–4 px lift | `background`/`filter` tweens, scale > 1.02 |
| Featured card | mount | `opacity`, `--spot-angle` (`@property`) | 600 / `--ease-out-soft` | one rotation | a second idle animation at the same time |
| `DocCard` → detail | click | native View Transition group | 420 / `--ease-out-soft` | geometric | morphing the iframe (R3) |
| Grid filter relayout | state change | Flip `x,y,scale,opacity` (R4) | 340 / `--ease-out-soft` | 0.94 scale | stagger, `width/height` tweens |
| Section reveal | `view()` range | `opacity`, `translateY` | 450 / `--ease-out-soft` | `--move-sm` | animating > 6 items per viewport with JS |
| Hero reveal curtain | mount once | `clip-path`, `y`, `blur` | ≤ 900 total / `--ease-inout` | — | blocking input, replaying on back-nav |
| Hero eyebrow decode | mount once | per-char swap | ≤ 1.2 s | — | more than one decode per page |
| Command palette | ⌘K | `opacity`, `scale` | 180 / `--ease-out-soft` | 0.98 → 1 | scroll animation of results while typing |
| Theme toggle | click | existing spring (stiffness 120 / damping 20 `[VERIFIED-FILE]`) + optional VT clip | 500–700 | — | two simultaneous page-wide fades |
| Mobile filter sheet | tap | `translateY` (transform only) | 300 in / 240 out | 100% | `bottom`/`height` animation |
| Ambient blobs | infinite | `translate` | 30–40 s linear-ish (already `[VERIFIED-FILE]`) | small | parallax response, `will-change` left on |
| Stat numbers | in-view once | `textContent` count-up (rAF) | 900 / ease-out | — | re-counting on every filter change |
| Copy-link feedback | click | icon swap + `scale` | 160 | 1.06 | toasts that push layout (CLS) |

## 3. Easing etiquette

`--ease-out-soft` by default; **springs only where the object feels physical** (theme lamp, magnetic pull, drag); `--ease-inout` only for full-screen/scene transitions; never `ease-in` on an enter (it reads as laggy), never `linear` except on the ambient loop. GSAP strings (`power2.out`, `power3.inOut`) map to these: `power2.out ≈ --ease-out-soft`, `power3.inOut ≈ --ease-inout` — pick **one vocabulary per file** and note the mapping in the PR, don't mix naming inside a timeline.

## 4. Amplitude and density budget (per viewport, at any scroll position)

- ≤ **1** choreographed sequence (hero, pinned scene, or card→detail — never more than one at a time).
- ≤ **3** simultaneously moving layers in a scroll-linked scene (Codrops lesson: 3 layers max `[REPORTED tympanus]`).
- ≤ **8** reveals in flight; after that, stagger collapses to 0 and items appear.
- Nothing moves more than `--move-md` (14 px) except curtains and sheets.
- Idle animation: at most **one** (currently: the blobs `[VERIFIED-FILE]`). Adding a second must remove the first.
- No motion in the document-preview area (embeds are third-party — `research/document-discovery-ui.md` §5).

## 5. Reduced motion = a designed state, not a disabled state

| Layer | reduce behaviour |
|---|---|
| Global CSS kill (already: `animation: none !important; transition-duration: 0.01ms !important` `[VERIFIED-FILE globals.css]`) | keep — it is the safety net |
| `@theme`/`@supports` scroll-driven reveals | `animation: none`, **opacity 1, translate 0** (must not stay hidden) |
| GSAP (ScrollTrigger) | `gsap.matchMedia()` guard → `gsap.set(final state)`; never leave a `from` at opacity 0 |
| Motion | `<MotionConfig reducedMotion="user">` (built-in, prefer over manual checks `[VERIFIED-DOC]`) |
| R3F/WebGL | unmount the canvas → static poster (an animated 3D scene cannot be "slowed") |
| Lenis | off — inertia *is* the sensation that makes people ill `[VERIFIED-DOC lenis README]` |
| Theme toggle | keep the state change, skip the spring |
| Count-ups | render the final number immediately |

**Test matrix:** `no-preference` / `reduce` × dark / light / projector × desktop / mobile. If a section loses information (not just motion) in `reduce`, it is a bug — the repo's `:is(a,button,input)` exception for transforms `[VERIFIED-FILE]` shows the authors already thought about this; keep that spirit.

## 6. Performance contract (each rule maps to a Core Web Vitals metric)

1. Animate **only** `transform`, `opacity`, `filter`, registered custom properties (`@property`) — no `top/left/width/height/margin` (layout → CLS/INP).
2. Scroll-linked work on the compositor where possible: CSS scroll-driven first, JS scrub only for pinning `[VERIFIED-DOC MDN]`.
3. `will-change` added **before** and **removed after** (a persistent `will-change: transform` on 60 cards costs more than the animation).
4. `content-visibility: auto` + `contain-intrinsic-size` on off-screen sections (big First-Paint win; safe for print? verify in projector mode).
5. One `requestAnimationFrame` per page — either GSAP's ticker or Lenis's `autoRaf`, never both (R5).
6. Batch DOM measurement: `Flip.getState` once per grid; `getBoundingClientRect` cached on enter, not in `pointermove`.
7. WebGL: `frameloop="demand"`, DPR cap, ≤ 1 draw call per effect, pause off-screen (`IntersectionObserver`), and a static fallback that is *better* than the animation.
8. Bundle: 3D layer ≤ 150 KB JS, canvas layer ≤ 50 KB, total JS target < 300 KB gz after R1 (see `recommended-stack.md` §4 for the numbers and how to measure them).
9. Images/embeds: `aspect-ratio` on every media box, `loading="lazy"` + `decoding="async"` for below-fold, never `fetchpriority` on more than one element (LCP).
10. Fonts: fix the `--font-editorial` collision (audit §5.5) or every heading animation is measured on a shifting baseline.

## 7. Anti-patterns (rejected on purpose)

Scroll-jacking / wheel hijack; pinned sections longer than ~2.5× viewport; site-wide cursor replacement; text that decodes/fades *in* on hover; staggered list entrances on search results; parallax on more than one layer; marquee of partner logos; gradient-animated `background-position` on large areas (paint-bound); `transition: all` (the existing `transition: transform 200ms, box-shadow 200ms` is the pattern to keep `[VERIFIED-FILE]`); animating layout of the embed; animating anything inside a third-party iframe; motion that hides content when JS fails (R8).

## 8. Acceptance checklist per animated section (AC's own gate)

`[ ]` enters once, exits gracefully · `[ ]` ≤ 1 choreographed sequence per viewport · `[ ]` transform/opacity only · `[ ]` `reduce` = final state visible · `[ ]` works with CSS scroll-driven unsupported (`@supports` fallback) · `[ ]` no `ScrollTrigger` left after unmount (`gsap.context`/`useGSAP` cleanup `[VERIFIED-DOC]`) · `[ ]` Lighthouse mobile perf ≥ 85 with the section enabled · `[ ]` INP measured while animating (not at rest) · `[ ]` light + projector verified · `[ ]` keyboard path unchanged · `[ ]` no layout shift at the animation's end (measure, don't eyeball).
