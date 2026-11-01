# Stack Audit — What the Project Actually Is

**Audited:** 2026-11-01 · **Commit:** `4307a6884527e22af27541cd76722867e5e6bb14` ("Initial upload of Harshit Presentation Hub") · **Branch audited:** `main` (default branch per `origin/HEAD`) — read-only inspection
**Method:** direct file reads of the checkout. No assumptions from the mission brief.

> **Read me first, AC.** Do not install anything until this file is read. The single biggest risk to this frontend project is building for the product described in the brief rather than the product that exists.

---

## 1. Ground truth: the real frontend stack

| Layer | Reality | Source |
|---|---|---|
| Framework | **Next.js 16.2.6** (App Router) | `package.json` `[VERIFIED-FILE]` |
| Runtime | **React 19.2.6 / react-dom 19.2.6** | `package.json` |
| Language | TypeScript 5.9.3, `strict: true`, `target: ES2017`, `moduleResolution: bundler`, `@/* → ./src/*` | `tsconfig.json` |
| Styling | **Tailwind CSS 4.1.17** via `@tailwindcss/postcss` — CSS-first, **no `tailwind.config.*` file exists** | `postcss.config.mjs`, `globals.css` |
| Animation | **`framer-motion` ^12.43.0** — the only animation library present | `package.json` |
| Icons | `lucide-react` ^1.28.0 | `package.json` |
| Data layer | Drizzle ORM 0.45.2 + `pg` 8.20.0 (`node-postgres` Pool), `dotenv` | `src/db/index.ts` |
| Fonts | `next/font/google`: **Geist** (UI) + **Newsreader italic** (editorial) | `src/app/layout.tsx` |
| ESLint | `eslint-config-next/core-web-vitals`, flat config | `eslint.config.mjs` |
| Config | `next.config.ts` is **empty** (no `experimental`, no image config, no headers) | `next.config.ts` |
| CI / tests / e2e | **None.** No `.github/`, no Playwright/Jest/Vitest, no `pnpm audit` | `ls`, `package.json` scripts |
| Node | Repo README says "Node.js 18+". Sandbox runs **v22.22.3**. Next 16 does not support 18 — see §7 | `[VERIFIED-FILE]` |
| Deploy | "Vercel-ready" claim in README; **no `vercel.json`, no lockfile committed** | `[VERIFIED-FILE]` |

**Not present, despite the mission brief:** `@supabase/supabase-js`, any auth, any admin route, any 3D library, any smooth-scroll library, any Lottie/Rive runtime, `next-themes`, shadcn/ui.

```bash
# verified 2026-11-01
$ grep -rIl -iE "supabase|admin|auth" src/   →  NONE in src
$ ls .github                                 →  no .github dir
```

### Also notable: there is no lockfile

`git ls-files` shows no `package-lock.json`/`pnpm-lock.yaml`. Every dependency is a **caret range** (`^12.43.0`, `^1.28.0`), so a fresh install resolves to *newer than this audit* on CI. `[AK-RECOMMENDATION]` AO should ask AC to commit a lockfile before visual work begins, or every performance measurement in the playbook becomes non-reproducible.

## 2. Real structure (26 source files, ~1,861 LOC)

```
src/app/layout.tsx              Root layout: header, theme+projector inline script, AmbientBackground, footer
src/app/page.tsx          ★     "use client" — the entire landing/dashboard, filter state, JSON imported directly
src/app/loading.tsx             Route loading UI
src/app/not-found.tsx           404
src/app/globals.css             438 lines: @theme tokens + light-mode overrides + glass system + keyframes + a11y
src/app/presentation/[id]/page.tsx  Server component; finds one record; focus view
src/app/api/health/route.ts     Health endpoint
src/components/dashboard/       FeaturedPresentation, SearchBar, SubjectChips, StatsBar
src/components/command/         CommandPalette (⌘K), CommandTrigger
src/components/layout/          AmbientBackground (3 CSS radial-gradient blobs + noise)
src/components/presentation/    BackupLinks (copy-to-clipboard + external links)
src/components/projector/       ProjectorModeToggle
src/components/theme/           ThemeToggle (hand-rolled useSyncExternalStore)
src/components/ui/              GlassCard, StatusOrb
src/data/presentations.json   ★  1 record
src/db/{index,schema}.ts        Pool from DATABASE_URL; schema is an EMPTY STUB
src/lib/{presentations,search,utils}.ts
src/types/presentation.ts
```

★ = the two facts that most constrain frontend design.

## 3. The data model — smaller than the brief implies

```ts
// src/types/presentation.ts, verbatim
interface BackupLink { label: string; platform: string; url: string; description?: string }
interface Presentation {
  id: string; title: string; subject: string; topic: string; description: string;
  platform: string; url: string; presentUrl?: string; embedUrl?: string;
  backupLinks?: BackupLink[]; tags: string[]; pinned?: boolean; accent?: string;
}
```

| Dimension in the brief | Field exists? | Notes |
|---|---|---|
| Subject | ✅ `subject` | single value: `"English"` |
| Topic | ✅ `topic` | free text |
| Document type | ⚠️ partially | `platform` (`"Google Slides"`), not a `type` taxonomy |
| Course | ❌ | no field, no facet, no UI |
| Semester | ❌ | no field, no facet, no UI |
| Search & filters | ✅ basic | `includes()` substring on title/topic/subject/tags + one `subject` chip row |
| "Stores metadata + external links, not files" | ✅ exactly | url/presentUrl/backupLinks only |
| Supabase backend | ❌ | raw `pg` against `DATABASE_URL`; `drizzle.config.json` points at `postgresql://postgres:postgres@127.0.0.1:5432/app_db` |
| Administrator functionality | ❌ | nothing |
| Dark/light/system themes | ✅ | hand-rolled, `data-theme` attribute + `.dark` class |
| Responsive layouts | ✅ | 12-col grid, mobile-first |
| Google Slides + Dropbox links | ✅ | hardcoded Dropbox URL also exists in `page.tsx` markup |

**Dataset size (measured):** `presentations: 1`, `subjects: ["English"]`, `platforms: ["Google Slides"]`, keys present: `accent, backupLinks, description, embedUrl, id, pinned, platform, presentUrl, subject, tags, title, topic, url`.

### Why this decides the whole design conversation

A heavy scroll-storytelling/3D landing page exists to *orient a user inside a large catalogue*. With **one** record and one subject:

- A "browse all subjects" animated section would render **one chip**. A 3D subject-constellation would show **one star**. Faceted search over 1 item is theatre.
- The hero, featured card, projector mode and ⌘K palette are the product's actual value today. **Polish these.**
- Anything requiring catalogue volume must be built **data-driven with a graceful "not enough data yet" state**, so it looks intentional at n=1 and impressive at n=200. Every playbook concept is specified this way.

`[AK-RECOMMENDATION]` The single highest-leverage pre-frontend task is **seeding the dataset and adding `course`/`semester`/`type` to the model.** Ask AO to confirm before AC invests in discovery UX. See `AO_HANDOVER.md` Decision D1.

## 4. Current visual system (what already exists — reuse, don't fight)

**Design tokens** — `globals.css` `@theme` `[VERIFIED-FILE]`:

```
--color-midnight #050505 · --color-ink #0a0a0a · --color-surface #121212 · --color-elevated #18181b
--color-border-subtle rgba(255,255,255,.06) · --color-border-medium rgba(255,255,255,.08)
--color-text-primary #f8fafc · --color-text-secondary #94a3b8 · --color-text-muted #64748b
--color-accent-indigo #6366f1 · --color-accent-emerald #34d399
--font-sans Geist · --font-editorial Newsreader
--radius-sm .5rem → --radius-2xl 1.5rem
```

README's token table drifts from CSS: it lists `--color-text-muted #475569`, but `@theme` says `#64748b`, and `#475569` is applied via **raw arbitrary Tailwind values** (`text-[#475569]`) in 6 components. So the token layer and the markup layer disagree. `[AK-RECOMMENDATION]` Fix in Phase 0 (see playbook): replace literal `text-[#475569]` with `text-(--color-text-muted)`; it is also what makes light mode need `!important`.

**Surfaces:** `.glass-card` (blur 20px saturate 180%, inset top highlight, 200ms transform/shadow hover), `.glass-card-utility`, `.glass-card-featured` (160deg indigo→violet gradient, 60px accent glow, 2px border on projector).

**Ambient background:** 3 fixed radial-gradient blobs (`float` 30s/35s/40s ease-in-out infinite) + vignette + inline-SVG `feTurbulence` noise at `opacity-[0.012]`. Server-rendered, no canvas — this is the existing "premium" signal and it is cheap. **Keep it.**

**Typography:** Geist for UI, Newsreader italic for display; hero `text-3xl→6xl`, `leading-[1.1]`, `tracking-tight`, `.title-glow` (two 40/80px indigo text-shadows). This pairing is genuinely good and is the design identity — do not replace it with a trendier face.

**Status language:** `StatusOrb` with `animate-ping` emerald dot, "Ready to Present". `accent` field per record supports per-subject color coding (unused beyond a stored string).

## 5. Engineering debt the frontend must not deepen

1. **`src/app/page.tsx` is `"use client"` and imports `presentations.json` directly.** The landing page — the page we want to make spectacular — is a client component shipping the whole dataset into the RSC boundary and filtering in the browser with `useMemo`. Any scroll/3D library added on top lands in the same bundle. **This is the #1 performance constraint on the whole mission.** Fix: make `page.tsx` a server component, pass data down, and isolate interactivity in leaf client components (`technical-guides/implementation-recipes.md` §R1).
2. **Light mode is a cascade of `!important` overrides** on Tailwind arbitrary-value selectors (`html[data-theme="light"] .bg-\[\#050505] { … !important }`, ~30 such rules). This is fragile, unwinnable at scale, and it will **silently break** any new component that uses a raw hex class. Fix: token-driven `color-scheme`-style theming with `@theme inline` + `dark:` variant (recipe §R2). Do not add new components in the current style.
3. **Theme state is hand-rolled** (`useSyncExternalStore` + `storage` event + `matchMedia`) with an inline blocking `<script>` for FOUC prevention. It works and avoids a dependency — keep the mechanism, but it must stay in `<head>`/pre-hydration or any new theme-transition work will flash.
4. **Two data sources.** `page.tsx` and `[id]/page.tsx` import the JSON directly; `lib/presentations.ts` and `lib/search.ts` wrap the same JSON; the DB path (`src/db`) is unused by any page. `lib/search.ts` duplicates the filter logic inline in `page.tsx`. Divergence risk for AC.
5. **A hardcoded Dropbox URL sits in `page.tsx` markup** (a specific `.pptx` file), duplicating data that also lives in the JSON. Any redesign must route that through the record.
6. **`embedUrl` exists in the type but is never used in any component** — a free opportunity for real slide previews (playbook §S6).
7. `src/db/schema.ts` is a **stub that exports nothing** (`export {}`) purely so `drizzle-kit push` does not crash. There is no table. Anything "Supabase-backed" is future state.
8. No error boundary beyond `not-found`/`loading`; no analytics; no `sitemap`; `metadata` is minimal (title/description only, no OG image) — relevant because a premium share experience for a document hub needs OG images (playbook §S10).

### 5.5 Font tokens collide with `next/font` (found while reading the CSS)

`layout.tsx` loads `Geist({variable:"--font-geist"})` and `Newsreader({variable:"--font-editorial"})` `[VERIFIED-FILE]`, but `globals.css` `@theme` **redefines `--font-editorial`** as the literal stack `"Newsreader", ui-serif, Georgia, serif` — i.e. the app's own token and next/font's generated variable share one name, and nothing ever references `--font-geist`; body text resolves through `--font-sans` to the literal family name instead of next/font's metric-adjusted fallback variable `[VERIFIED-FILE]`. Consequences: (a) whichever stylesheet wins the cascade decides the editorial face — fragile; (b) `adjustFontFallback`'s `size-adjust` benefit is bypassed, so Newsreader italic (loaded with `style:["italic"]`) can still shift headings on swap — a CLS risk on the hero and a pin-offset risk for ScrollTrigger. **Fix before motion work:** rename the Tailwind token (e.g. `--font-display`) and have `@theme` reference `var(--font-geist)` / `var(--font-editorial)` rather than literal family names.

## 6. Accessibility baseline that already exists (protect it)

Verified present in `globals.css` / `layout.tsx` `[VERIFIED-FILE]`:

- skip-link (`href="#main-content"`, animates in on focus)
- `:focus-visible` box-shadow ring `0 0 0 2px rgba(99,102,241,.5)` on `button/a/input/[role=button]/[tabindex]`
- `@media (prefers-reduced-motion: reduce)` — kills blob float, card transforms, `animate-ping`, and clamps all durations to `0.01ms`
- landmarks `role="banner|main|contentinfo|navigation"`, `aria-label`s on nav/actions, `aria-hidden` on decorative dots
- projector mode raises touch targets to `min-height: 48px` and 18px root font

Gaps AC must close while adding motion: `aria-live` for result counts, `aria-modal`/focus-trap audit on the palette, visible-focus check for new interactive 3D/canvas surfaces, and a **Lenis/ScrollTrigger reduced-motion path** (motion libraries do not obey the CSS media query automatically — see `research/performance-accessibility.md` §A2).

## 7. Version drift — checked against the live registry, 2026-11-01

| Package | Installed (range) | Latest on registry | Gap |
|---|---|---|---|
| `next` | 16.2.6 | **16.4.3** | 2 minors — 16.4 is where React's stable `<ViewTransition>` is the shipped pairing `[VERIFIED-DOC]` |
| `react` | 19.2.6 | **19.3.1** (2026-10-14) | **19.3 is the release that made `<ViewTransition>` stable** `[VERIFIED-DOC]` |
| `tailwindcss` | 4.1.17 | **4.3.3** | minor |
| `framer-motion` | ^12.43.0 | **14.9.0** (2026-10-30) | **2 majors behind**; v13 dropped `@emotion/is-prop-valid` for `<MotionConfig isValidProp>`, v14.2 added hardware-accelerated independent transforms `[VERIFIED-REGISTRY + repo CHANGELOG]` |
| `@react-three/fiber` | not installed | 9.8.2 | peer **`react >=19 <19.4`** → excludes React 20 and pins the ceiling just above 19.3.1 `[VERIFIED-REGISTRY]` |
| `three` | not installed | 0.187.0 (2026-10-30) | exports `./webgpu`, `./tsl`, `./addons` `[VERIFIED-REGISTRY]` |
| `gsap` | not installed | 3.15.0 (2026-04-13) | license `Standard "no charge"` — free, not open source `[VERIFIED-REGISTRY]` |
| `lenis` | not installed | 1.3.27 (2026-10-15) | MIT, zero deps `[VERIFIED-REGISTRY]` |

**Consequence:** any tutorial, blog post, or model-memory citation that says "Framer Motion requires `next/dynamic` + no SSR", or "GSAP plugins need a Club license", or "`experimental.viewTransition` must be enabled" is **stale**. See `technical-guides/compatibility-matrix.md` § What changed.

## 8. What the environment does / does not allow

- Sandbox network is limited to `github.com`, `api.github.com`, `codeload.github.com`, `registry.npmjs.org`, `pypi.org`, `files.pythonhosted.org`. `[VERIFIED-ENV]` Repo metadata and npm metadata were fetched through it — that is how every version/license/star figure here was obtained. **This does not restrict the deployed app**, only AK's ability to crawl arbitrary sites (see RESEARCH_INDEX § Limitations).
- Connected apps available to the team: `supabase`, `vercel`.
- Branch rules for this assignment: `main` untouched; no merge; no CI/settings/secrets changes; research docs only.

## 9. One-paragraph summary for AO

This is a well-made, dark-first, single-purpose classroom presentation hub in Next 16 + React 19 + Tailwind v4 with **one** animation library (framer-motion, two majors stale), **one** dataset record, **no** Supabase/admin despite the brief, a **client-side landing page**, and a light theme implemented with `!important` overrides on arbitrary Tailwind classes. It is 1,861 LOC of mostly clean code with real accessibility forethought. The frontend opportunity is therefore not "add a 3D engine to a rich catalogue" — it is **"make an excellent, fast, accessible premium shell that scales from 1 to N documents, and fix the two structural issues (client-component data + theme overrides) while you are in there."**
