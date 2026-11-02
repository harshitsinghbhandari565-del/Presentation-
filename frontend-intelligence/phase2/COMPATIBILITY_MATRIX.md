# Compatibility matrix — against AC's real code, not a hypothetical one

Baseline read from `origin/arena/c9d0d599-presentation` on 2026-11-02 (`package.json`, `layout.tsx`,
`globals.css`, `api/search/route.ts`, `lib/catalog.ts`, `supabase/migrations/202611010001_catalog.sql`,
`playwright.config.ts`, `.github/workflows/ci.yml`, `DECISIONS.md`) and from the sibling design-system branch
`origin/arena/019fbda9-presentation` — all [VERIFIED-FILE] via `git show`, never checked out.

| | next 16.4.3 | react 19.2.6 | tailwind 4.1.17 | framer-motion ^12.43.0 | RSC + `revalidate=60` | Supabase (`@supabase/ssr` 0.12.7, RLS) | Drizzle 0.45.2 | Playwright 1.64 + axe 4.14 |
|---|---|---|---|---|---|---|---|---|
| CSS `@keyframes`/`@property` | ✅ | ✅ | ⚠️ register props in `@theme`/`:root`, not in JS | ✅ | ✅ | ✅ | ✅ | ✅ needs a real browser to assert visuals |
| CSS scroll-driven (`view()`) | ✅ | ✅ | ✅ (`@utility`) | ✅ no conflict | ✅ zero JS | ✅ | ✅ | ⚠️ Chromium-first: keep the `@supports` guard or tests fail on WebKit |
| `@property`-driven card | ✅ | ✅ | ⚠️ avoid `transition: all` (019fbda9 pattern to fix) | ✅ | ✅ | ✅ | ✅ | ✅ |
| native View Transitions | ✅ | ⚠️ **npm helpers need React ≥19.3** — AC pins 19.2.6 → use the DOM API directly | ✅ `::view-transition-*` in `globals.css` | ⚠️ don't animate the same element with both FM and a VT snapshot | ⚠️ VT works on client navigation; `revalidate=60` HTML swap on full load gets no transition (expected) | ✅ | ✅ | ⚠️ `startViewTransition` unsupported in Firefox until recently → guard `typeof document.startViewTransition === "function"` |
| framer-motion `/mini` + `LazyMotion` | ✅ | ✅ | ✅ | ✅ same package, different entry (measured −15.2 KB gz) | ✅ `m.*` components are client-only, keep them in client files | ✅ | ✅ | ✅ |
| Lenis 1.3.27 | ✅ | ✅ | ✅ | ✅ bridge documented | ⚠️ must not be in the root layout — one Lenis per page, else anchor/`scroll-behavior` fights | ✅ | ✅ | ⚠️ `page.mouse.wheel` behaves differently under Lenis; tests should call `lenis.scrollTo` or scroll the element |
| GSAP 3.15 + ScrollTrigger | ✅ | ✅ | ✅ | ⚠️ two scroll authorities: pick one per section | ✅ (ScrollTrigger is client-only; pin needs DOM that exists at hydration → `dynamic({ssr:false})`) | ✅ | ✅ | ⚠️ pinned sections change scroll height → Playwright `scrollIntoViewIfNeeded` + refresh `ScrollTrigger.refresh()` after route change |
| three 0.187 (raw) | ✅ | ✅ | ✅ | ✅ | ⚠️ canvas must not render on the server: dynamic import + client boundary | ✅ | ✅ | ✅ but no WebGL in CI containers → assert the fallback path, as the lab harness does |
| `@react-three/fiber` 9 + drei | ✅ (v9 targets React 19) | ⚠️ major-coupled: React upgrade = R3F upgrade, in the same PR | ✅ (avoid FM+R3F animating the same transform) | ⚠️ do not mix `useFrame` and FM `animate` on one object | ⚠️ `<Canvas>` forces a client boundary; keep the *content* outside it so RSC still streams text | ✅ | ✅ | ⚠️ axe can't see inside canvas — a11y lives in the DOM twin |
| `@rive-app/react-canvas` | ⚠️ needs a client component + WASM fetch config in `next.config` (asset handling) | ✅ | ✅ | ✅ | ⚠️ WASM must not block hydration of the hero | ✅ | ✅ | ⚠️ `page.waitForFunction` on the rive instance before asserting |
| `lottie-web` | ⚠️ last publish/push 2025-09-01 [VERIFIED-API] | ✅ | ✅ | ✅ | ⚠️ 60 KB renderer for decoration | ✅ | ✅ | ✅ |
| TanStack/virtual 8 | ✅ | ✅ | ✅ | ✅ | ⚠️ measurement needs real layout → no RSC benefit | ✅ | ✅ | ✅ |
| `fuse.js` (compat-mode search) | ✅ (client) | ✅ | ✅ | ✅ | ✅ client-only; **must not replace** the server `to_tsvector` path | ✅ | ✅ | ✅ |

Legend: ✅ compatible as-is · ⚠️ compatible with a named constraint · ❌ would break something. **No ❌ appears in this table** — the blockers are budget, licence and process, not incompatibility.

## Conflicts AC must resolve before (not after) adopting anything

1. **Two scroll authorities.** AC's `globals.css` sets `html{scroll-behavior:smooth}` [VERIFIED-FILE]; Lenis and `ScrollTrigger` both want to own scroll. If either lands, that declaration goes in the same PR.
2. **Two animation authorities.** `Reveal.tsx` uses framer-motion `whileInView` with `ease:[0.22,1,0.36,1]`, `duration:0.5` [VERIFIED-FILE]. AC's sibling branch uses `--motion-micro:150ms` / `--ease-default:cubic-bezier(0.16,1,0.3,1)` [VERIFIED-FILE 019fbda9]. **Pick one easing/duration set as the system**, or the product will feel like two products. AK's recommendation: keep the Vault token names (`--motion-*`, `--ease-*`) and put framer-motion's defaults *on top of* them via CSS vars — not the reverse.
3. **Two type identities.** `c9d0d599` → Geist + Newsreader italic-only editorial serif; `019fbda9` → Inter + Space Grotesk + JetBrains Mono [VERIFIED-FILE both]. This is a PO decision (see `AO_FINAL_FRONTEND_BLUEPRINT.md` §4) — an animated hero cannot rescue a page whose type system is undecided.
4. **React 19.2.6 vs the View-Transitions helpers.** Native `document.startViewTransition` is available today; the React wrapper packages are not (peer range). Do the native thing; add the package when React moves.
5. **GSAP licence is not MIT.** [VERIFIED-LICENSE] npm says `Standard 'no charge' license`. Commercial use is allowed by that licence, but it is a *custom* licence and our product is commercial — PO/legal reads it before AC installs it. AK is not able to interpret the legal text.
6. **`use client` + Supabase cookies.** `c9d0d599`'s landing is an async **server** component with `Promise.all([getCatalogHighlights(), getFacets()])` [VERIFIED-FILE]. Every Tier-1/2 animation addition must therefore live in a *child* client component; nothing goes into the root layout except a provider that already exists (`MotionConfig`).
7. **No new fetch, no proxy.** AC's D2 forbids uploading/copying/proxying user documents. Any "preview" pattern in a reference repo that downloads the file (common in portfolio galleries) is **not** portable here. The lab's 3D card stack deliberately renders *synthetic* cards, not document content, for exactly this reason.
8. **Supabase/Drizzle untouched.** Nothing in the recommended stack touches the schema, RLS, `get_catalog_facets()`, or `search_vector`. If a search-UX change is wanted (e.g. `setweight` ranking — currently absent [VERIFIED-FILE `lib/search.ts`]), that is a **separate** AC PR with AO approval; AK records it as a UX finding only.

## Version-pinning policy AK used (and recommends for AC)

- Numbers in these docs came from the **npm registry and api.github.com on 2026-11-01/02**, never from memory or blog posts — a Phase-1 lesson: articles still cite `framer-motion@12` while the `motion` package is at 14.9.0.
- Before install, AC re-runs: `npm view <pkg> version peerDependencies license`.
- Any library whose **repo** shows `license: None/NOASSERTION` (e.g. `greensock/GSAP`, `ariakit/ariakit`, `DavidHDev/react-bits`) gets its *package* licence checked separately — the two can disagree, and for GSAP they do.
- Anything that fails this is reading material, not a dependency.
