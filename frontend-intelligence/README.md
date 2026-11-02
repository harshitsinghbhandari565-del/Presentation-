# Frontend Intelligence & Research Engineering Division

**Agent:** AK (Agent Knowledge) · **Reported to:** AO (Chief Orchestrator) · **Consumer:** AC (Agent C, coding)
**Mission:** Build an evidence-backed frontend knowledge base so AC can implement an exceptional frontend without repeating research.
**Research date (all documents unless noted):** 2026-11-01 · **Product:** Harshit Presentation Hub

---

## 1. What this repository of knowledge is

This is a **research-only** deliverable. No application code was modified. Everything lives under `frontend-intelligence/`.

Two documents are load-bearing:

| Document | Read if you are |
|---|---|
| [`AC_IMPLEMENTATION_PLAYBOOK.md`](./AC_IMPLEMENTATION_PLAYBOOK.md) | **AC.** The only file you strictly need. Stack, section architecture, animation plan, recipes, sequence, budgets. |
| [`AO_HANDOVER.md`](./AO_HANDOVER.md) | **AO.** Status, findings, decisions needing approval, risks. |

Everything else is supporting evidence and deeper reference.

## 2. Directory map

```
frontend-intelligence/
├── README.md                     ← you are here
├── RESEARCH_INDEX.md             ← every source, what was verified, how, and when
├── AO_HANDOVER.md                ← report to the orchestrator
├── AK_HANDOVER.md                ← my own continuation context
├── AC_IMPLEMENTATION_PLAYBOOK.md ← PRIMARY DELIVERABLE for AC
│
├── audit/
│   └── stack-audit.md            ← what the codebase ACTUALLY is (read first)
│
├── research/                     ← domain research A–H from the mission brief
│   ├── 3d-websites.md
│   ├── threejs.md
│   ├── react-three-fiber.md
│   ├── scroll-animations.md
│   ├── gsap-and-scrolltrigger.md
│   ├── motion-design.md
│   ├── premium-ui-ux.md
│   ├── visual-effects.md
│   ├── document-discovery-ui.md
│   └── performance-accessibility.md
│
├── github-repositories/
│   ├── repository-catalog.md     ← master verified table (start here)
│   ├── 3d-projects.md
│   ├── animation-projects.md
│   ├── scrolling-experiences.md
│   └── frontend-components.md
│
├── website-inspiration/
│   ├── website-gallery.md
│   └── interaction-breakdowns.md
│
├── technical-guides/
│   ├── recommended-stack.md      ← the minimal coherent set, install list, drops
│   ├── technology-comparison.md  ← head-to-head tables
│   ├── compatibility-matrix.md   ← peer-dep matrix vs. THIS project
│   └── implementation-recipes.md ← copy-paste, Next-16-specific code
│
└── design-system/
    ├── visual-direction.md
    ├── animation-guidelines.md
    ├── responsive-guidelines.md
    └── interaction-principles.md
```

## 3. Evidence policy used throughout (important)

Claims are tagged so AC and AO can weigh them:

- **`[VERIFIED-API]`** — repository metadata (stars, license, last push, homepage) pulled live from the GitHub REST API on 2026-11-01. Not from memory.
- **`[VERIFIED-REGISTRY]`** — version, date, license, peer-dependency ranges pulled live from `registry.npmjs.org` on 2026-11-01.
- **`[VERIFIED-DOC]`** — read from the official page on 2026-11-01 (Next.js, MDN) or official repo README.
- **`[REPORTED]`** — secondary sources (blogs, award roundups) agree, but I did not reach a primary source. Useful for direction, not for a dependency decision.
- **`[AK-RECOMMENDATION]`** — my judgment. Not a fact. Never presented as verified.
- **`[UNVERIFIED]`** — flagged, do not rely on.

**Every version number in this knowledge base was resolved against the live registry, because this ecosystem moves faster than any training corpus.** Several widely-repeated "facts" found in articles contradicted the registry and were discarded — see `RESEARCH_INDEX.md` § Contradictions resolved.

## 4. The single most important finding

**The mission brief and the committed code describe different products.**

The brief describes a multi-dimensional document discovery platform (subject × course × semester × topic × document type, Supabase-backed, admin functionality). The committed code at `4307a68` is a **single-presentation classroom hub**: one JSON file with **one** record, a Google Slides link, Dropbox backups, a local-Postgres Drizzle stub, no Supabase SDK, no admin, and a **client-side** home page.

Recommendations in this knowledge base are therefore split into:

1. **Do now, fits the committed product** (the majority of the playbook).
2. **Contingent on AO confirming the richer data model** (facet-aware discovery architecture, marked as such).

Full detail: [`audit/stack-audit.md`](./audit/stack-audit.md).

## 5. Reading order for AC

1. `audit/stack-audit.md` — 5 minutes, prevents building for a product that does not exist yet.
2. `AC_IMPLEMENTATION_PLAYBOOK.md` — the plan.
3. `technical-guides/compatibility-matrix.md` — what may be installed without breaking the app.
4. `technical-guides/implementation-recipes.md` — code.
5. Everything else on demand.

## 6. Legal / usage discipline

Inspiration ≠ permission. Most cloned or demo repositories found during research carry **no license file** (`NONE`/`NOASSERTION` in GitHub metadata) and are therefore **reference-only — read, do not copy**. Each catalog row states its license verbatim from the API. GSAP is free-but-not-open-source (`Standard "No Charge"`); this is fine for our use but must be recorded. Details in `github-repositories/repository-catalog.md` § License discipline.


---

## Phase 2 added on top of this pack (2026-11-02)

Phase 1 (the 31 files listed above) stays exactly as it was: it is the stack audit, and its conclusions about the
*main* branch are still true of *main*. Phase 2 — deep repository discovery, 150 website references, nine technology
comparisons, and **ten built prototypes with measured bundle sizes** — lives in
**[`phase2/`](./phase2/README.md)**, starting with `phase2/AO_FINAL_FRONTEND_BLUEPRINT.md`.

Three corrections Phase 2 forces on Phase 1 (kept visible, not quietly edited):

| Phase 1 said | Phase 2 measured | effect |
|---|---|---|
| "three.js ≈ 168 KB, budget 3D ≤ 150 KB gz" | **187.5 KB gz** namespace / 130.4 KB gz named imports | the Phase-1 number mixed minified bytes with gzip; a 3D budget needs the named-import discipline |
| "Lenis ≈ 12 KB gz" | **5.3 KB gz** | Lenis is cheap in bytes and expensive in behaviour — the recommendation changed accordingly |
| "add GSAP if needed" | 44.4 KB gz **and `license: Standard 'no charge'`** in npm metadata [VERIFIED-LICENSE] | adds a legal review step before any AC PR |

Phase 2 also replaces the audit's *repository baseline*: the app today is AC's `arena/c9d0d599-presentation` branch
(Supabase + Drizzle catalog, `revalidate=60` RSC landing, Playwright + axe CI), not the 1-record JSON `main` this
pack originally described. `phase2/GITHUB_RESEARCH_GAPS.md` documents both the original findings and the corrections.
