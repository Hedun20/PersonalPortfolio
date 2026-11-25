# PersonalPortfolio — 3D Engineering Portfolio

## Objective
Transform the PersonalPortfolio project into an immersive 3D engineering portfolio for **Tymur Abbasov** (Senior Full-Stack / AI & LLM Systems Engineer), preserving existing working components while fixing bugs and adding 3D zones, modes, and responsive design.

## Design Identity
- **Palette**: Dark graphite/obsidian (`#05070B`) with electric blue/cyan accents (`#38BDF8`)
- **Typography**: Inter (body) + Space Grotesk (headings)
- **Vibe**: Professional, technical, futuristic but grounded

## Energy network visual direction
- Original low-profile hemispherical fusion core surrounded by animated cyan/violet energy channels, facility feeds and elevated conduits.
- No civilian NPCs, vehicles, cafes or road markings in the active exterior. Preserve the five existing interactive facilities, interiors and accessibility fallback.
- The fusion/quantum styling is a fictional visual metaphor for connected software systems, not a claim about physical technology.

## 3D Zones
1. **AI Core** — LLM systems, prompt engineering, AI agent architecture
2. **Software Engineering Lab** — Full-stack development, system design
3. **Data Center** — Data pipelines, analytics, ML infrastructure
4. **Command Center** — DevOps, CI/CD, cloud infrastructure
5. **Research Lab** — Publications, experiments, technical writing

## Entry points and professional profile
- `/`: interactive campus as the primary experience (Explore by default; Cinematic on request).
- `/classic/`: traditional portfolio for quick review or as an alternative to WebGL.
- Compact public GitHub and LinkedIn links, plus a services section below the campus. Do not invent credentials, outcomes or private contact details.

## Modes
1. **Cinematic** — Full-screen 3D walkthrough with scroll-driven transitions
2. **Explore** — Interactive 3D scene with clickable zone nodes
3. **Classic** — Traditional scrollable portfolio layout (fallback)

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 |
| 3D | Three.js via @react-three/fiber, drei, postprocessing |
| Animation | Framer Motion 14, GSAP, Lenis |
| Icons | Lucide React |
| Fonts | Inter + Space Grotesk (variable) |

## Build & Lint
```bash
npm run build   # tsc -b && vite build
npm run lint    # eslint .
npm run dev     # vite
```

## Constraints
- Do **not** fabricate professional experience, metrics, or clients
- Do **not** deploy, push, or publish
- Maintain this plan and DEVELOPMENT_PROGRESS.md
