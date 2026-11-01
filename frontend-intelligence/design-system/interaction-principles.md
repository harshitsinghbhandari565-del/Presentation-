# Interaction Principles

**AK · 2026-11-01 · Domain J.** The behavioural contract for every interactive surface in the hub. Mechanism details are in `website-inspiration/interaction-breakdowns.md`; domain research in `research/document-discovery-ui.md`.

---

## 1. Seven principles

1. **Answer the click in ≤ 100 ms, visibly.** A tap either (a) changes state, (b) navigates, or (c) shows feedback — never nothing. Because our LCP/INP budgets are the real ceiling (`compatibility-matrix.md` §5), *no interactive element may depend on a JS animation to look responsive*: press states are CSS `:active` (existing pattern `[VERIFIED-FILE globals.css]`), not rAF.
2. **Motion is feedback, not decoration.** Every animation must be classifiable as *orientation* (where am I now: reveal, progress hairline), *continuity* (this thing became that thing: VT morph, Flip relayout), or *confirmation* (it worked: copy-link check, theme lamp). Decoration without a class is cut.
3. **The document is the destination; never animate the destination.** Our previews are third-party embeds (Google Slides / Dropbox `[VERIFIED-FILE]`) — transforms on that container read as breakage. All choreography lives on *our* chrome (rules, frames, cards), which also honours the embed's own full-screen behaviour (`research/document-discovery-ui.md` §5).
4. **One primary action per view.** Landing = *Browse/Find*; card = *Open*; detail = *Open in Slides*; backup links are secondary; copy-link is tertiary. The hierarchy is expressed in size, not colour alone.
5. **Every state is designed, not tolerated.** loading · empty · no-results · error · offline · not-found · "link is external" · "no preview available" — eight states, each with copy and a way forward (see §4).
6. **Never trap the user, never trap the scroll.** Modal = focus trap + `Esc` + return focus; but page scroll must always be escapable: `data-lenis-prevent` on internal scrollers `[VERIFIED-DOC lenis README]`, no infinite scroll (documented a11y harm + load-more converts better for search `[REPORTED S13]`), no wheel hijack.
7. **Affordance before surprise.** A clickable card gets hover + focus + cursor + (mobile) press; a non-clickable card never animates as if it were. Icons that look like buttons are buttons.

## 2. State matrix AC must satisfy per component

| Component | Rest | Hover (fine) | Focus-visible | Active/pressed | Loading | Empty | Error |
|---|---|---|---|---|---|---|---|
| `DocCard` | `--surface`, 1 px `--line` | −2 px lift, `--line-strong`, spotlight ring | 2 px `--accent` outline offset 2 | 0.99 scale | skeleton with real aspect ratio | n/a | stale-link badge |
| Primary CTA | `--accent` bg | 1.02 scale + glow | ring | 0.98 | spinner replaces label, width preserved | n/a | shake-free: inline error text |
| Filter chip | `--line` border | `--surface-raised` | ring | selected = `--accent` tint + check | disabled during relayout | n/a | — |
| Search input | `--line` bg | — | `--accent` border + 1 s caret | — | 120 ms debounce, no spinner for local | "no matches for *q*" + clear | "search unavailable" |
| Palette (⌘K) | closed | — | `aria-activedescendant` moves | — | 6 skeleton rows | "type to search…" | "no documents" |
| Embed frame | `--surface` + 1 px | — | focusable, `Esc` exits | — | poster + "Loading Slides…" | "Preview unavailable" + Open/Backup | "blocked by embedder" |
| Theme toggle | icon | ring | ring | 0.9 + spring | n/a | n/a | — |
| Projector | off | — | ring | on: state persists in `localStorage` (pattern exists `[VERIFIED-FILE]`) | — | — | — |

Global rules behind the matrix: focus ring always ≥ 3:1 against both `--bg` and `--surface` (the existing `:focus-visible` block is the base `[VERIFIED-FILE]`); never remove `:focus-visible`; no `outline: none` anywhere; `aria-live="polite"` on the result count; `aria-busy` on skeletons; `title`/`aria-label` on icon-only buttons (the existing `ThemeToggle` already labels itself `[VERIFIED-FILE]`).

## 3. Timing feel (what "premium" reads as, in ms)

| Interaction | Feel | Value |
|---|---|---|
| Press feedback | immediate | ≤ 100 ms, CSS |
| Hover response | instant but soft | 200–250 ms enter / 150 ms out |
| Overlay open | fast, no fanfare | 180 ms |
| Card → detail | smooth morph, not slow | 420 ms |
| Filter relayout | quick, no stagger | 340 ms |
| Section enter | calm | 450 ms |
| Scroll scrub | 1:1 with input, never "catch up" | `scrub: 0.6–1` `[VERIFIED-DOC]` |
| Ambient | near-imperceptible | 30–40 s (existing `[VERIFIED-FILE]`) |

## 4. Copy for the eight states (use these, they were written for this product)

| State | Copy | Action |
|---|---|---|
| Empty (no docs yet) | "No presentations here yet." | *Ask your faculty to share one* + `Browse all` |
| No search results | "Nothing matches “*query*” in *Subject*." | `Clear filters` · `Search all subjects` (never a dead end `[REPORTED S12]`) |
| Loading | — (skeleton only; ≤ 6 rows) | `aria-busy` |
| Link is external | "Opens Google Slides in a new tab" | visible 🔗-free text label, `rel="noopener noreferrer"` (existing `[VERIFIED-FILE]`) |
| Embed blocked | "This preview can't be shown here." | `Open presentation` + `Copy backup link` |
| Offline | "You're offline — links still work once you're back." | cached view only |
| 404 | existing `not-found.tsx` editorial page `[VERIFIED-FILE]` | keep, add `Browse` |
| Copied | "Link copied" (icon swap, 1.4 s) | never a blocking toast |

## 5. Cross-cutting behaviour rules

- **Keyboard:** ⌘K/`Ctrl+K` + `/` to focus search (guard: never when an input is focused); ↑↓ + Enter in results; `Esc` closes topmost layer only; focus returns to the trigger; skip-link already present `[VERIFIED-FILE globals.css]` — the animated header must not cover it.
- **URL is state:** subject/course/semester/type/`?q=` are query params so a filtered view is shareable (the product's whole point); a document detail URL must render *without* the SPA (no client-only data → R1).
- **Persistence:** theme, projector, last-used filters, recents in `localStorage` under a `hub.` prefix (the repo already persists theme + projector `[VERIFIED-FILE]`) — never persist per-document read state until accounts exist.
- **External-link hygiene:** `target="_blank"` + `rel="noopener noreferrer"` + a stated destination in the label; no fake "loading" spinners for links we don't control; Dropbox/Slides embeds lazy-loaded only when the frame is near the viewport (IntersectionObserver).
- **Motion must never gate a task:** the three critical jobs — find, open, share — work identically with all animation disabled.
- **Accessibility floor:** `prefers-reduced-motion` (global kill exists), `prefers-contrast: more` (drop blur, raise borders — cheap and appreciated in bright lecture halls), `forced-colors: active` (keep `system-colors`-safe borders), text ≥ AA in all three themes.
- **Delight budget:** exactly one surprising moment per session (theme morph, hero reveal, or a projector-mode transition). More than one and the hub stops feeling like a tool.
