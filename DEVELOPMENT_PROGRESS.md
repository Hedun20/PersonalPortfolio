# Development Progress

> **Last updated:** 2026-11-25 · street-life iteration based on `ef08e45` · candidate, not accepted.

## Current Snapshot

### Confirmed repository changes
- `eff47d8`: shared contact and navigation data, dead link fix, README.
- `6900550`: campus preview and five facilities, interior/workflow interactions, 3D controls.
- `dadb251`: targeted fixes for seven React Hooks immutability lint diagnostics in CampusVisuals and EngineeringCampus. Diff inspected. Local agent reported clean lint and successful build on its checkout; no independent browser verification.
- `336a574` / `f5b964f`: production campus entry, mobile navigation and reduced-motion improvements, browser smoke tests.
- `d1bdc39` / `ef08e45`: city-first home, classic route, service cards, hidden document scrollbar with scrolling retained.
- This candidate: original low-poly visor/coat NPCs (50 desktop / 20 narrow), four outer-road hovercars on existing lanes, additional batched streetlights and light pools, two small shops and a shallow plaza fountain. Optional project walkthrough explicitly uses scripted example data and no longer forces entry into the building. Added a walkthrough smoke test.

### Verification and blockers
- No lint/build/browser run on this candidate SHA yet. Run the README commands before acceptance. The available remote repository connection does not provide a local dependency installation or browser runtime.
- Prior build warning: oversized JavaScript chunk (~1.35 MB before this candidate). Measure new build before claiming any improvement.
- Actual WebGL rendering, animation, camera controls, interior navigation, shop placement, pedestrian/vehicle separation and responsive visual quality still require manual browser checks. Measure FPS on the same hardware before and after; no external assets or new shadow-casting lights were added.
- GitHub and previously supplied public LinkedIn are configured. Email is omitted until the owner approves a public address.
- `opencode.json.bak` is tracked. No obvious secret field was found in this review; keep it out of deployment and review local configuration separately.

### Exact next step
Run lint, build, and Playwright smoke tests against the candidate, then visually review the campus on desktop and mobile (including normal motion/WebGL). Resolve failures before merging. Continue the existing roadmap rather than create replacement scenes.

> The historical roadmap below remains in place. Implementation does not equal acceptance; unchecked stages must be verified before closure.

## Stage 1 — Audit & Baseline ✅
- [x] Read full project structure and all source files
- [x] Identify existing sections: Hero, About, Expertise, Architecture, Projects, TechStack, Contact
- [x] Identify existing 3D component: NeuralNetwork3D.tsx
- [x] Confirm tech stack in package.json
- [x] Confirm Vite config and TypeScript project references
- [x] Production build succeeds
- [x] Lint: 4 issues in NeuralNetwork3D.tsx (2 errors, 2 warnings)
- [x] Fix all 4 lint issues — zero errors, zero warnings
- [x] Create PROJECT_PLAN.md and DEVELOPMENT_PROGRESS.md

**Chunk size warning**: main JS bundle is 1,349 KB (379 KB gzipped) — code splitting recommended for later stage.

## Stage 2 — Bug Fixes (In Progress)
- [ ] Remove leftover Vite template styles from App.css — **not applicable**: `src/App.css` no longer exists in the repo; `src/index.css` carries the theme. Nothing to remove.
- [ ] Fix responsive layout issues (360px–1920px)
- [ ] Fix overlapping cards
- [ ] Fix animation conflicts
- [ ] Fix mobile navigation layout
- [x] Re-run lint and build checks — done today; results in **Current Snapshot** above.

### Completed under commit `eff47d8` (fix: repair dead links and make nav and contact data single-sourced)
- [x] Dead Location card link removed — `href="#"` jumped to the top of the page; the card is now a non-link `glass-card`, with the address text moved out of the anchor.
- [x] Contact CTA is now a real link: `mailto:` built from `contact.email` (was `href="#"`).
- [x] Nav is generated from `SECTIONS` instead of a hand-written array — this restored the missing `#techstack` anchor and makes a missing anchor structurally impossible.
- [x] Contact details centralised in new `src/data/contact.ts` (GitHub, LinkedIn, email, location); `Contact.tsx` reads it and maps icon keys to lucide components.
- [x] `src/data/sections.ts` rewritten as the single source of truth: `SECTIONS`, `SectionId`, `SECTION_LABELS`.
- [x] `README.md` rewritten from the stock Vite template: commands, structure, the two conventions (section ids must match `SECTIONS`; contact details live in `contact.ts`), and the 3D bundle warning.

## Stage 3 — Design System
- [ ] Finalize CSS variables and Tailwind theme
- [ ] Create reusable component primitives
- [ ] Establish spacing and typography scale

## Stage 4 — 3D Zones
- [ ] AI Core zone
- [ ] Software Engineering Lab zone
- [ ] Data Center zone
- [ ] Command Center zone
- [ ] Research Lab zone

## Stage 5 — Modes
- [ ] Cinematic mode
- [ ] Explore mode
- [ ] Classic mode
- [ ] Mode switcher UI

## Stage 6 — Responsive & Accessibility
- [ ] Mobile-first responsive breakpoints
- [ ] Touch interactions
- [ ] Keyboard navigation
- [ ] ARIA attributes
- [ ] Reduced-motion support

## Stage 7 — Performance
- [ ] Code splitting (dynamic imports)
- [ ] Lazy loading for 3D scenes
- [ ] WebGL fallback
- [ ] Bundle size optimization
- [ ] Image optimization

## Stage 8 — Polish & QA
- [ ] Cross-browser testing
- [ ] Final lint and build checks
- [ ] Visual polish and micro-interactions
- [ ] Documentation updates
