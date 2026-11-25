# Personal Portfolio

An interactive 3D engineering campus built with React, Vite and Three.js. The main experience presents five engineering facilities, professional links and services; the classic portfolio is a separate accessible alternative.

## Prerequisites

- Node.js 22.12+ (or a newer supported LTS release)

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>.
The city is the home page (`/`); the classic portfolio is at `/classic/`.
The legacy `/preview-campus.html` path still opens the same campus experience.
All three HTML entry points are included in the production build.

## Common commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `src/` and `vite.config.ts` |

## Project structure

```
src/
  App.tsx              Section order for the page
  index.css            Design tokens (Tailwind @theme) + custom utilities
  components/
    layout/            Navbar, Footer, shared section containers
    sections/          One component per page section (Hero, About, Contact, ...)
    three/             Three.js / threejs-react scenes
  data/
    sections.ts        Section ids + labels (single source of truth for the nav)
    contact.ts         Contact links and location
  preview/             Standalone scenes used while iterating on 3D work
public/
  favicon.svg          Browser tab icon
```

Two conventions are worth knowing before adding a section:

- **Section ids live in `src/data/sections.ts`.** `SECTIONS` and `SECTION_LABELS`
  drive the navbar, so a new section needs an entry there or it will not be
  reachable from the nav. The nav links to `#<id>`, which means the section
  component must render an element with `id="<id>"`.
- **Contact details live in `src/data/contact.ts`.** The contact section renders
  from that file, so links and labels are edited in one place.

## Notes

- The 3D scenes are the heaviest part of the dependency tree (`three`,
  `threejs-react`, `bloom`, `postprocessing`). Anything that imports them ends up
  in the main bundle, so keep new scenes out of components the page loads on
  first paint unless they are actually rendered.
- `index.html` and `preview-campus.html` share the city entry component.
  `preview-inkling.html` remains a development-only scratch preview.
- Public GitHub and LinkedIn links are centralized in `src/data/contact.ts`.
  Email is intentionally omitted until the owner approves a public address.


## Browser smoke tests

After installing dependencies, run:

```bash
npm run lint
npm run build
npx playwright install chromium
npx playwright test
```

These checks cover production navigation, mobile menu behavior and the accessible
campus directory with 3D disabled. They do not certify the WebGL scene's visuals,
performance, keyboard camera movement or full cross-browser compatibility.

## Classic portfolio visual layer

Each classic section has its own decorative geometry. WebGL is mounted only while its background is visible, with a capped pixel ratio and a static decorative fallback for reduced motion or rendering failure. The campus remains the home route; its normal 3D and motion switches are intentionally removed, while the loading escape and non-WebGL project directory remain available. Architecture descriptions are always readable and layer selection supports keyboard and touch.

The Playwright suite checks navigation, reduced-motion fallback, architecture interaction and responsive widths. Visual fidelity and real-GPU performance still need browser verification with motion enabled.

## Classic immersive presentation

Home retains its original neural-network hero. The other six Classic sections use the same reusable full-slide scene and information interface: the models sit behind the editorial text, numbered hotspots and a keyboard/touch-accessible point list select the information, and horizontal drag snaps to the nearest point. Dragging does not take over vertical touch scrolling. Reduced motion and failed WebGL retain the SVG scene and all selectors; no additional packages are needed. Architecture has nine accessible layers and project/contact links remain functional. The existing campus routes and mobile list are unchanged.

Visual acceptance must include normal-motion desktop and mobile testing, checking geometry scale, readability, drag direction, marker alignment, smooth snapping, fallback and GPU load. The automated reduced-motion tests exercise layout, point selection, wrapping and drag-to-select without requiring a GPU.
