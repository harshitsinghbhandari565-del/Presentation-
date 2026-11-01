# Visual Direction

**AK · 2026-11-01 · Domain J.** Facts about the existing system are `[VERIFIED-FILE]` (paths given). Everything else is `[AK-RECOMMENDATION]` for the Product Owner to accept, edit or reject. This is a *direction*, not a redesign of the product's information architecture.

---

## 1. The idea in one sentence

**A reading room with a projector.** The product is where a student finds one document and opens it — so the visual language should feel like *good light on good paper*: calm, typographic, high-contrast where it matters, dark by default, and animated only where motion carries meaning.

## 2. What already exists (keep it)

| Asset | Current state | Verdict |
|---|---|---|
| Palette tokens | `--color-midnight #050505`, `--color-ink #0a0a0a`, `--color-surface #121212`, `--color-elevated #18181b`, `--color-border-subtle/-medium rgba(255,255,255,.06/.08)`, `--color-text-primary #f8fafc`, `--color-text-secondary #94a3b8`, `--color-text-muted #64748b`, accents `indigo #6366f1` / `emerald #34d399` | ✅ the dark base is already coherent — **extend it, don't repaint it** |
| Type | `--font-sans: "Geist"` + `--font-editorial: "Newsreader"` (+ italic), loaded via `next/font/google`; components use `font-[family-name:var(--font-editorial)]` | ✅ a real editorial/UI pairing = the "reading room" voice. ⚠️ token collision, audit §5.5 |
| Radii | `--radius-sm 0.5rem` → `--radius-2xl 1.5rem` | ✅ use 3 of the 5 only (§4) |
| Surfaces | `.glass-card` (`blur(20px) saturate(180%)`, 1 px `rgba(255,255,255,.06)`, inset top highlight, `transform 200ms`), `.glass-card-utility` (lighter, no lift), `.glass-card-featured` (160° indigo→violet gradient wash, `::before`/`::after` decoration) | ✅ three tiers already exist — the system should formalise them, not add a fourth |
| Ambient | 3 blurred mesh blobs, `float` 30 s/35 s/40 s | ⚠️ keep one instance, retune (§6) |
| Light mode | `html[data-theme="light"]` with **~15 `!important` overrides targeting arbitrary Tailwind hex classes** (`.bg-\[\#050505\]`, `.text-\[\#f8fafc\]` …) | ❌ **the single worst structural liability** — replace with tokens (R2) |
| Projector mode | `html.projector-mode { font-size: 18px }` + stronger card borders | ✅ **unique and on-brand — promote it to a first-class theme** (§7) |
| A11y | `:focus-visible` outline, `[tabindex]`, skip-link, reduced-motion global kill | ✅ protect; add per-component polish |
| Motion | framer-motion only; one `duration: 0.4` in `page.tsx` | ⚠️ no motion language yet → this doc supplies it |

## 3. Mood and references (what "premium" means here)

- **Primary references (behaviour, not looks):** Smithsonian's si.edu design system `[VERIFIED-FETCH]` for **systematic calm**; Codrops "Joffrey Spitzer portfolio: minimalist + GSAP with subtle reveals" `[VERIFIED-LISTING]` for **restraint**; Awwwards Developer-Award work (Vectr, Noho by Eugene Morev) `[VERIFIED-LISTING]` for **precision of timing**.
- **Texture words for AC:** *matte, inked, backlit, quiet, deliberate, editorial.*
- **Anti-references (explicitly rejected):** neon-gradient SaaS hero, aurora mesh + glass everywhere, generic AI-purple, dark-mode-with-one-accent-only, and the `arihanthcodes/spectrum-ui`/Aceternity component look (see `github-repositories/frontend-components.md` §1). Premium must come from **type, space, states and timing** — those are the things a Product Owner can't get from a template.

## 4. Colour system (proposed, additive)

Keep dark as the authored default. Introduce semantic names so `!important`s disappear (R2):

| Token role | Dark | Light | Notes |
|---|---|---|---|
| `--bg` | `#050505` (existing midnight) | `#f7f7f8` | one page background, never two |
| `--surface` | `#0f0f11` | `#ffffff` | cards sit here; use existing `--color-surface` where it fits |
| `--surface-raised` | `#18181b` | `#fbfbfc` | hover/popover |
| `--text` | `#f8fafc` | `#111317` | ≥ 15:1 on `--bg` |
| `--text-secondary` | `#94a3b8` | `#475569` | ≥ 7:1 |
| `--text-muted` | `#64748b` | `#5b6472` | **≥ 4.5:1 — do not darken further**; today `#64748b` on `#050505` is ≈ 6:1 ✅ |
| `--line` / `--line-strong` | `rgba(255,255,255,.07/.12)` | `#e6e8ec` | borders only; no dividers thicker than 1 px |
| `--accent` (brand) | indigo `#6366f1` → prefer `#7c86ff` for AA on dark | `#4f46e5` | interactive + focus ring |
| `--positive` | emerald `#34d399` | `#047857` | success/pinned |
| `--warn` | amber `#f59e0b` | `#b45309` | "no preview / external link only" |
| **per-record `accent`** | data field exists (`p.accent`) | | keep as **tint only** (icon, hairline, chip text), never a full-card gradient; contrast-checked pair per subject |

Rules: **one accent per screen region**; accents never carry information alone (pair with icon + label `[VERIFIED-FILE]` — the data model already stores colour *and* subject text); semantic tokens over raw hex (kills audit §5.2); WCAG AA minimum, AAA for body text on `--bg`.

## 5. Typography (the actual premium lever)

| Role | Face | Size (mobile → desktop) | Weight / tracking |
|---|---|---|---|
| Hero display | Newsreader 500–600 | 40 → 72 px | `letter-spacing: -0.02em`, `line-height: 1.05` |
| Section title | Newsreader 500 | 24 → 32 px | `-0.01em` |
| Card title | Geist 600 | 16 → 18 px | `-0.01em`, max 2 lines |
| Body/description | Geist 400 | 14 → 15 px | `1.55` |
| Meta / labels | Geist 500 | 12 → 13 px | `+0.06em`, `text-transform: uppercase` for eyebrows only |
| Numerals (stats) | Geist tabular (`font-variant-numeric: tabular-nums`) | 28 → 40 px | 600 |

Editorial serif for *voice*, sans for *work*: titles Newsreader, all UI Geist (matches today's split `[VERIFIED-FILE]`). Cap the hero at **2 lines**; clamp everything (`text-[clamp(2.5rem,6vw,4.5rem)]` style tokens) so motion never needs `vw` hacks. Two families maximum, three weights each maximum (font bytes are a verified cost: `next/font` self-hosts Geist + Newsreader italic `[VERIFIED-FILE]`).

## 6. Space, depth, glass

- **Spacing scale** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128. Section rhythm: `96px` desktop / `64px` mobile. Bento gutters `16px` (existing) — never below 12 on touch.
- **Elevation = 3 signals, not shadows alone:** 1 px border (`.07`), inset top highlight (already in `.glass-card`), outer shadow. Add a 4th only for the featured card's gradient wash.
- **Glass discipline:** `backdrop-filter` on ≤ 2 nested levels per viewport; never on the document-preview container (it composites the iframe area); a solid non-glass variant ships with the token set so low-end devices can drop blur wholesale.
- **Ambient layer:** 3 mesh blobs at 30/35/40 s `float` `[VERIFIED-FILE]` → keep **2**, opacity ≤ 0.35 dark / ≤ 0.18 light (light mode already halves them to 0.4 ✅), `will-change: none`, and add `inert`/`aria-hidden`. Motion rule: they are *never* parallaxed by scroll — the hero's scroll response belongs to one dedicated layer (see `AC_IMPLEMENTATION_PLAYBOOK.md` §6).

## 7. Projector mode is the brand

`html.projector-mode { font-size: 18px }` `[VERIFIED-FILE]` is a genuinely differentiating feature for a classroom presentation hub. Direction: treat it as a **third theme** (dark / light / projector) with its own tokens — larger base size (18 → 20 px), `--text` at pure `#fff`-ish, borders stronger (already), shadows flattened (already), ambient blobs **off**, all idle animation paused, `focus` rings thicker. If AC implements one "premium" thing that no template has, this is it: it is premium *because it is useful*.

## 8. Iconography, imagery, document surfaces

- Icons: existing `lucide-react` (`@/components/*` import them `[VERIFIED-FILE]`) at 1.5 px stroke, 16/20/24 grid; one style, no mixing with emoji (the README's ✦/▦ usage stays in prose, not UI `[VERIFIED-FILE README]`).
- "Imagery" here = **document thumbnails**, and we don't own them: embed URLs point at Google Slides / Dropbox `[VERIFIED-FILE]`. Therefore the card's visual is a *generated* composition: subject tint + title in Newsreader + a hairline page-stack motif (pure CSS, 0 bytes) — **not** a broken external screenshot. This is the difference between a premium card and a template card, and it needs no design asset.
- Every external embed gets a **chrome** (1 px border + `--surface` frame + platform badge + "opens in a new tab" affordance) so a third-party viewer doesn't look like a bug in our layout.

## 9. Dark-first, light-never-broken (the acceptance test)

For **each** screen state — landing, filtered grid, empty, palette open, detail, projector — AC verifies side-by-side: no `!important` needed (R2 done), text ≥ AA, borders visible, blob opacity reduced, `theme-color` meta updated (currently hardcoded `#050505` `[VERIFIED-FILE layout.tsx]` → drive it from the theme), and no white flash on load (keep the inline theme script in `<head>` before paint `[VERIFIED-FILE layout.tsx]`).

## 10. What "premium" must NOT cost

No splash/intro animation beyond the §2 hero reveal; no cursor trail; no infinite marquee of logos; no glass on glass; no full-page parallax; no auto-playing sound; nothing that raises LCP above 2.5 s or INP above 200 ms `[VERIFIED-DOC web.dev]`. If a flourish can't survive `prefers-reduced-motion` as a *static* design, it is decoration, not design — cut it.
