# Development Progress

> **Last updated:** 2026-11-25 · branch `feat/chatgpt-campus` · HEAD `eff47d8`

## Current Snapshot

### Test results (run today, at HEAD `eff47d8`)
- ✅ **Build** — `npm run build` succeeds: `✓ built in 834ms`
  - `dist/index.html` 0.59 kB (gzip 0.37 kB)
  - `dist/assets/index-*.css` 39.04 kB (gzip 6.52 kB)
  - `dist/assets/index-*.js` **1,350.37 kB** (gzip 379.43 kB) — still one oversized chunk, unchanged from the Stage 1 baseline
- ❌ **Lint** — `npm run lint` exits 1 with **7 errors, 0 warnings**:
  - `src/components/three/CampusVisuals.tsx:40:5` — 1 error
  - `src/components/three/EngineeringCampus.tsx:721, 725, 756, 761, 885` — 6 errors
  - All 7 are `Cannot modify local variables after render completes` / `This value cannot be modified` (React 19 compiler rules) in files that are **untracked work in progress**.
  - Every file touched by this task (`Navbar.tsx`, `Contact.tsx`, `sections.ts`, `contact.ts`) lints clean.
- ✅ **Manual checks pending** — no browser verification has been done yet; nav anchors and the contact CTA need a visual pass at desktop and mobile widths.

### Blockers
1. **Lint gate is red for reasons outside this task.** The 7 errors live in `CampusVisuals.tsx` / `EngineeringCampus.tsx`, which are untracked and being actively edited. They are deliberately untouched, so `npm run lint` will keep failing until that work lands. Stage commits are made with explicit paths so this WIP is never staged.
2. **Contact links are placeholders.** `src/data/contact.ts` ships `TODO` values on purpose — real URLs are needed before deploy.
3. **`opencode.json` is deleted** in the working tree with an untracked `opencode.json.bak` alongside. Left alone; flagging it so it is not mistaken for task fallout.

### Exact next step
**Stage 3 — Accessibility** (not started). Concretely:
1. Add a `@media (prefers-reduced-motion: reduce)` block to `src/index.css` that neutralises `animate-fade-up`, `animate-fade-in`, `animate-marquee` and transform transitions.
2. Add `focus-visible:` variants beside the existing `hover:` / `group-hover:` classes in `Hero.tsx`, `About.tsx`, `Expertise.tsx`, `Architecture.tsx`, `Projects.tsx`, `TechStack.tsx`, `Contact.tsx`.
3. In `Hero.tsx`, skip mounting `NeuralNetwork3D` when `matchMedia('(prefers-reduced-motion: reduce)').matches`.

> Stage numbering below is the original plan. The agreed execution order for this task is **1 bugs → 3 accessibility → 2 navigation → 4 bundle/3D performance → 5 SEO/social**, one commit per stage.

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
