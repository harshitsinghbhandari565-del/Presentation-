# Frontend Component & UI-System Repositories

**Verified 2026-11-01 `[VERIFIED-API]`**

## 1. Libraries — evaluated for adoption in *this* app

| Repository | ★ | Last push | Lic | Adopt? | Reasoning |
|---|---|---|---|---|---|
| `shadcn-ui/ui` | 127,119 | 2026-10-31 | MIT | ⚠️ selectively, source-only | The accessibility defaults for dialog/popover/combobox are excellent, but pulling the kit means adopting its tokens and Tailwind assumptions. **Copy `cmdk`-based dialog plumbing, keep our glass surfaces** |
| `dip/cmdk` | 13,057 | 2025-10-29 | MIT | ✅ **recommended candidate** | Unstyled, a11y-complete command menu. Our `CommandPalette` is hand-rolled `[VERIFIED-FILE]`; `cmdk` would give us roving focus, `aria-activedescendant`, and scroll-into-view for free. **Do not** restyle to look "shadcn" |
| `lucide-icons/lucide` | 25,442 | 2026-11-01 | **NOASSERTION** (per API) | ✅ already installed | Note the API's license flag — Lucide is ISC-licensed for code, but the *icon artwork* is CC-BY 4.0 in parts; we only render shipped icons, so this is fine. Just don't scrape raw SVGs into the repo |
| `DavidHDev/react-bits` | 50,952 | 2026-10-31 | NOASSERTION | ❌ as a dependency · ✅ as a pattern library | Copy-paste React components (splash text, spotlight, tilt, magnetic). Its own license is mixed per-collection — **read, re-implement with our tokens; do not paste** |
| `21st-dev/magic-mcp` | 6,333 | 2026-09-09 | ISC | 💡 for AC's tooling | An MCP for 10k+ components. If AO wants AC to fetch design references at build time, this is that. Not a runtime dep |
| `pmndrs/uikit` / `@react-three/uikit` | 3,258 | 2026-10-27 | custom (`SEE LICENSE`) | ❌ | Yoga layout inside R3F — powerful, wrong license, and we don't need DOM-like layout in the scene |
| `arihantcodes/spectrum-ui` | 1,516 | 2026-09-21 | Apache-2.0 | ⚠️ reference | Aceternity/Magic-UI-style collection. Useful to see how "premium effect components" are packaged, but it *is* the generic look we must not converge on |
| `RamaHerbin/fancy-ui` | 24 | 2026-10-30 | MIT | ⚠️ | 140+ animated components, Tailwind v4 + React — recent and MIT, but small; browse for the card/marquee primitives |
| `pptt3300/ui-fx-kit` | 49 | 2026-03-23 | MIT | ✅ as a **vocabulary source** | 64 composable cursor/scroll/text/background effects, explicitly designed for agent use |
| `mohitkumawat310/react-pdf-flipbook-viewer` | 67 | 2025-11-15 | MIT | ❌ | We do not host files (audit §3); an embed/`presentUrl` is our preview path |
| `react-pdf-viewer/react-pdf-viewer` | 2,600 | 2024-08-19 | **Archived** | ❌ | Archived — proof that document-viewer OSS churns fast; keep previews external |
| `admille/vaul` | — | — | — | ❌ not found (404) `[VERIFIED-API]` | The mobile-drawer library everyone remembers under this name is unavailable at that path; use the CSS bottom-sheet pattern (`pure-web-bottom-sheet`) instead |

## 2. Reusable components AC should build (the small set that matters)

Given 26 source files today `[VERIFIED-FILE]`, AC should not create a component zoo. Six additions cover the whole redesign:

1. **`<Reveal>`** — CSS-scroll-driven wrapper with `@supports` fallback + Motion fallback; props: `delay`, `y`, `as`. Used 10–15×, so it must be *one* primitive, not per-section bespoke code.
2. **`<DocCard>`** — replaces the inline card markup; 5 layers (see `design-system/visual-direction.md`); owns hover/spotlight/tilt/generate-texture; is the `Flip` target.
3. **`<SpotlightRing>`** — pure-CSS conic/spotlight border, `pointermove` → `--mx/--my`, `@property`-registered angle; used by featured card + primary CTA.
4. **`<FacetSidebar>` + `<FacetSheet>`** — desktop sidebar / mobile bottom sheet sharing one reducer; the place where `course`/`semester`/`type` will land (blocked on audit §3).
5. **`<ViewTransitionPair name>`** — thin wrapper enforcing `share`+`default="none"` together (Next's documented footgun `[VERIFIED-DOC]`) so AC can't forget the pairing.
6. **`<MotionProvider>`** — `<MotionConfig reducedMotion="user" isValidProp={isPropValid}>` + `LazyMotion`/`domAnimation` if bundle pressure appears; single place where easing/timing tokens are injected.

Existing components to **keep and extend, not replace**: `GlassCard` (add the layer system), `StatusOrb` (become the section-label primitive), `ThemeToggle` (add VT circular-clip), `ProjectorModeToggle` (must remain first-class — it's the classroom feature), `BackupLinks` (its copy interaction is already good `[VERIFIED-FILE]`).

## 3. Two component decisions with real trade-offs

**a) Adopt `cmdk` or keep the custom palette?**
The current palette implements open/close, arrows, Enter, Esc, recents `[VERIFIED-FILE]`. Missing: `role="listbox"/"option"` semantics, `aria-activedescendant`, focus return, scroll-into-view, and body-scroll locking (which matters the moment Lenis exists). `cmdk` is MIT, 13k★, unstyled, ~5 KB, and its `Command.Input/List/Item/Group/Dialog` structure would give us all of it. **`[AK-RECOMMENDATION]` adopt `cmdk` in the same phase as Lenis/scroll work, not before** — a palette swap in a styling branch risks regressing the one feature students use daily.

**b) View Transitions vs Motion `layoutId` for card → detail.**
`layoutId` cannot cross pages (it is same-tree only), while native VT can morph across a route — the difference is visible in exactly the moment users decide whether a document is the right one. Use **native `<ViewTransition>`** for card→detail, and keep Motion `layout` for in-page reorder (chips, palette). React 19.3 + Next 16.4 makes this config-free `[VERIFIED-DOC]`; on the pinned React 19.2.6 the same code is still experimental, hence the Phase-0 upgrade.

## 4. Component-quality bar (what "premium" means in code)

Every new component ships with: dark/light/projector × reduced-motion on/off rendering correctly; keyboard-operable with a visible focus state; no raw hex (`bg-[#…]`) — tokens only (audit §5.2); explicit `aspect-ratio` on media so CLS stays ≤0.02; `aria-live` for state that changes silently; and **no client-only data fetching inside the component** (the `page.tsx` lesson from the audit).
