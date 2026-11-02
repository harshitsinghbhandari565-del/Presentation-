# Visual design patterns — editorial, premium, and implementable in AC's tokens

Purpose: turn the 154 rows of `WEBSITE_ATLAS.md` into **decisions AC can encode as tokens**, not a mood board.
Where a value already exists in AC's branches, it is quoted from their files and *kept* — the visual system is not
up for re-invention, only for completion.

## 0. What AC already has (starting point, [VERIFIED-FILE])

| token family | `019fbda9` (Vault branch) | `c9d0d599` (product branch) |
|---|---|---|
| motion durations | `--motion-micro: 150ms` … `--motion-exit: 200ms` | none in `@theme` (framer-motion values inline: `duration: 0.5`) |
| easing | `--ease-default: cubic-bezier(0.16, 1, 0.3, 1)` | `ease: [0.22, 1, 0.36, 1]` in `Reveal.tsx` |
| reduce policy | all `--motion-*` **remapped to 150 ms** (motion continues, quietly) | `MotionConfig reducedMotion="user"` + `useReducedMotion()` in components |
| type | Inter + Space Grotesk + JetBrains Mono | Geist + Newsreader (italic-only file — bug, see a11y §8) |
| surfaces | per-component `.ov-*` CSS, `--z-index` scale | tailwind-4 `@theme` + `[data-theme="light"]` overrides |
| movement | `--move-*` (translate distances) | none |

**Recommendation to AO:** the *union* is the system — Vault's token discipline (`--motion-*`, `--ease-*`, `--move-*`, z-index scale) with the product branch's framer-motion wiring, and **one** easing curve chosen by PO (they are within 0.06 of each other; picking either is fine, using both is not).

## 1. Typography — the actual premium signal

Measured against nothing: type is the cheapest 90 % of "expensive-feeling" in this pack (EX01/EX10 ship the look with **0 KB** of libraries; `Enigma`, `Endcap`, `Hozon`, `Casa Momo` are type-only sites [VERIFIED-LISTING]).

```css
/* proposed additions to AC's @theme — names follow their existing convention */
--font-editorial: "Newsreader Variable", Georgia, serif;   /* display + lead paragraphs */
--font-ui: "Inter Variable", system-ui, sans-serif;        /* UI, labels, buttons */
--font-mono: "JetBrains Mono Variable", ui-monospace;      /* IDs, page counts, dates, byte sizes */
--text-hero: clamp(2.6rem, 6.4vw, 5.4rem);   /* line-height .98, letter-spacing -.02em */
--text-lead: clamp(1.15rem, 1.6vw, 1.45rem); /* measure 58–68ch */
--text-body: 1rem; --text-meta: .8125rem;    /* metadata rows in --font-mono at .75rem */
--tracking-label: .12em;                      /* uppercase subject/course labels */
```

Rules that come straight out of the editorial references:
1. **Serif for voice, sans for machinery.** Titles and lead paragraphs serif; every control, label and value sans or mono. That split is what makes a page read "designed" rather than "themed".
2. **One italic accent, not a style.** AC's `c9d0d599` uses Newsreader italic as an accent — keep it as a *single* device (eyebrow/quote), and fix the italic-only file first.
3. **Scale jump must be big.** Hero ≥ 2.6× body at desktop. Templates feel cheap at 1.4×.
4. **Mono only for machine values** (pages, sizes, dates, slug). Never for prose — `githubnext/monaspace` and `subframe7536/maple-font` (both OFL-1.1) are the reference releases for why a coding face can also carry ligatures; we use plain tabular mono to stay safe.
5. **Measure:** 62–68 characters for lead text; card titles clamp to 2 lines with `text-wrap: balance`.
6. **`font-variation-settings` as a motion channel:** weight/opsz interpolation on scroll or hover is a *type* animation, cheaper and more tasteful than translating text (EX01 uses it; Peaches [VERIFIED-LISTING] is the extreme).
7. Never put editorial text in WebGL/canvas (a11y §2.4).

## 2. Grid & composition

| pattern | value | where it comes from |
|---|---|---|
| landing grid | 12-col, `max-width: 1320px`, `gap: clamp(16px,2vw,32px)`; content column 7 / rail column 5 | `Chris Williams Art Gallery`, `Eduardo Alba` (whitespace-as-layout [VERIFIED-LISTING]) |
| discovery grid | `repeat(auto-fill, minmax(300px,1fr))` — no breakpoint math | EX07; survives 200 % zoom |
| editorial asymmetry | hero copy starts at column 2, not 1; one intentional 1-col "breather" per 3 sections | `Möbius`, `Webdrift` |
| baseline rhythm | 4 px base, type sizes on a 1.25 modular step from 16 px | `skeletonlabs/skeleton`'s typography system [VERIFIED-FILE] |
| rule lines | 1 px `--border` lines used as *structure*, not decoration (max 2 per viewport) | `LAYERS OF TIME` [VERIFIED-LISTING] |
| sticky rail | the chapter index / facet rail is sticky, the content is not | EX04 |

## 3. Depth: five layers, not five shadows

The lab's card (EX07) is the distillation of `DavidHDev/react-bits`, `magicui` and the award sites — and it is pure CSS:

| layer | what it is | how it changes on interaction |
|---|---|---|
| 1 `surface` | `linear-gradient(165deg, raised, base)` + `inset 0 1px 0 rgba(255,255,255,.05)` + `0 1px 2px rgba(0,0,0,.4)` | unchanged |
| 2 `hairline` | 1 px border, `color-mix(accent 55%, border)` on hover/focus | colour only |
| 3 `ambient` | low-alpha accent radial at the top-left | opacity .75 → 1 |
| 4 `spotlight` | pointer-positioned radial, `mix-blend-mode: screen`, driven by `--mx/--my/--glare` | follows the cursor, `@property`-interpolated |
| 5 content | text, metadata, one CTA | translateZ via `--rx/--ry` tilt |

Rules: **no layer may add layout height**; shadow is used to separate, never to decorate (max one ambient + one contact shadow); the card must survive all four layers being switched off (that's the low-power path, EX07 with `?fallback=1`).

## 4. Glass, blur and where "selective" means selective

| allowed | not allowed |
|---|---|
| sticky toolbar/header: `backdrop-filter: blur(12px)` on a ≤ 64 px band (EX10 header) | full-page glass sheets |
| one floating panel per screen (EX05's `.panel`) | blurred text containers (contrast risk, `text-shadow` temptations) |
| `saturate(160%)` with the blur — glass looks like glass only when the colour behind it is boosted | blur + shadow + border + gradient on one element |
| `@supports not (backdrop-filter: blur(1px))` → opaque `--surface` fallback | `background: rgba()` only, no fallback (fails in Firefox with reduced transparency) |
| — | `backdrop-filter` inside a `transform`-animated element (rasterises per frame; measured cost unavailable → treated as banned until AC traces it) |

## 5. Gradients, lighting & noise (the "futuristic" channel, done cheaply)

1. **Two-stop radial mesh, no library:** `radial-gradient(90% 70% at 50% 40%, accent 10%, transparent 70%)` over `--bg-soft` — this is EX03's stage background; 0 KB.
2. **Animated mesh = one GLSL pass** (EX05, 2.9 KB gz [MEASURED]) *if* PO wants movement; otherwise a 60 s `background-position` animation on a 2×-sized gradient.
3. **Palette discipline:** one accent hue + a green (success) + amber (attention) tint, all expressed as `color-mix(in oklab, …)` from AC's existing `--accent`; no rainbow gradients. Awwwards-minimal references earn their look from *restraint*, not from hue count [VERIFIED-LISTING].
4. **Lighting language in 3D:** `envmaps_hdr` + `tonemapping` (three.js examples [VERIFIED-API]) teach the cheaper trick — a single IBL-ish gradient + `ACESFilmic`-style tone curve reads "expensive"; three point lights with shadows read "video game".
5. **Grain/noise:** inline SVG `feTurbulence` as a data-URI on a fixed overlay at `opacity: .035`, `pointer-events:none`, `mix-blend-mode: overlay`, and **removed** in the low-power path (it forces an extra composited layer). Never a bitmap texture.
6. **Vignette:** `radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,.35))` — one line, does more depth than any blur.

## 6. Dark / light / projector parity

| surface | dark | light | projector |
|---|---|---|---|
| ambient radial | accent @ 10 % | accent @ 6 % | off |
| card surface | gradient raised→base | flat white + 1 px border | flat + 2 px border |
| spotlight/glare | `screen` blend, α .75 | `multiply` blend, α .18 (screen washes out on white) | off |
| blur | allowed | **avoid** (reads as dirty on light bg) | off |
| type | serif on dark = fine | serif on light needs +0.5 weight step | 1.5× size, no italic |
| motion | full | full | reduced (AC already has the projector flag [VERIFIED-FILE]) |

Method: every pattern in this file ships with both themes tested in the same PR — AC's `data-theme` + `[data-theme="light"]` mechanism already supports this [VERIFIED-FILE], and the lab's `lab.css` is built from their tokens so what AC sees in `dist/` is their palette, not AK's invention.

## 7. Creative navigation, and the limit of it

Observed on `Möbius`, `Spyker Cars`, `daren&curtis` [VERIFIED-LISTING]: nav as a *section index* (numbered, large, sticky-left) rather than a top bar. Our use: on the **landing** only — numbered chapters that double as a progress indicator (EX08's measured pill + EX04's index). On **discovery/detail, nav is boring on purpose**: search field, facet rail, results count, and a back affordance. Nothing in the reference set has a faceted-search nav we should copy, which is why the nav work there is Radix/Headless UI behaviour, not Awwwards styling (see `INTERACTION_BREAKDOWNS.md` §7).

## 8. The "premium card" spec, ready for AC (metadata hierarchy included)

```
┌ hairline (1px, accent-reactive)  · ambient (accent radial) · surface (gradient) ┐
│  TYPE LABEL            mono, 10px, tracking .14em, accent                      │
│  ┌ cover 16:9 — synthetic: type glyph + stack of 3 sheets + page count ┐        │
│  Title (serif, 19px/1.2, 2-line clamp, balance)                              │
│  Subject · Course            sans 11.5px, muted                               │
│  Semester ▸ Topic ▸ updated  mono 11px, tabular                               │
│  ───────────────────────────────────────────                                  │
│  host: docs.google.com   [Open document ↗]  (32px+ target)                    │
└ + spotlight layer (pointer) + 3px lift + tilt ≤ 7° ───────────────────────────┘
```
Hierarchy rules, all traceable to AC's data model (`lib/catalog.ts` fields, missing stays null [VERIFIED-FILE]):
type → title → ownership (subject/course) → time/size → host. **A null field is not rendered** (no "Unknown course");
`displayHost()` stays; the CTA keeps AC's wording "Open document" so the external hand-off is explicit.

## 9. Anti-patterns this research rejects (and how to spot them in the reference set)

| temptation | why it's out | tell |
|---|---|---|
| full-page glass + big blur | cost, contrast, "2020 template" | `backdrop-filter` on a container with text > 12 px |
| gradient text on the hero | unreadable in light theme, no `@supports` escape | `background-clip:text` + `color:transparent` |
| cursor-follow everything (custom cursor, magnetic buttons) | breaks touch, breaks focus, breaks a11y | `cursor:none` |
| scroll-jacking / fake scroll heights | violates "nothing obstructs finding resources" | a scroll listener calling `preventDefault` |
| infinite marquee logos | decorative motion with zero information | two duplicate tracks + `translateX` loop |
| text-split on every heading | janks on long pages, fights screen readers | word-level spans in `<p>` |
| Lottie/Rive for spinners and checkmarks | a runtime + payload for 3 CSS keyframes | `lottie.min.js` in a bundle that has no other animation |
| 3D logo hero | 190 KB gz [MEASURED] for a brand mark, no user value | `import { GLTFLoader }` on the landing route |

## 10. What PO must decide (one page, three choices)

1. **Type identity:** Geist+Newsreader (c9d0d599) **or** Inter+Space Grotesk (019fbda9). Everything else in §1 follows from this. AK's recommendation: `Inter` for UI + `Newsreader` upright (roman file added) for editorial, because the product's voice is documents, not dashboards.
2. **Motion ceiling:** Tier 0 (CSS + framer-motion, 0 KB) **or** Tier 2 (pinned chapter + 44.4 KB + licence review) **or** Tier 2+3D (+≥130 KB). The visual direction is nearly identical at all three levels — that is the finding AC should hear.
3. **Ambient background:** static CSS mesh (0 KB) or one GLSL pass (2.9 KB). Both are in the lab; both look premium; only one moves.
