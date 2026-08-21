# AGENTS.md

Guidance for Codex when working in this repository.

## Project

Personal developer portfolio. The git root is this folder; the Vite app lives
in [`portfolio/`](./portfolio). Run all `npm` commands from inside `portfolio/`.

## Tech stack

- **React 19 + Vite 7 + TypeScript** (SPA, no SSR).
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin. Theme tokens live in
  `src/index.css`; there is no `tailwind.config` file (v4 is CSS-first).
- **shadcn/ui** on the **Base UI** primitive base (`@base-ui/react`). shadcn
  defaults to Base UI as of July 2026. Config is `components.json`
  (`style: base-nova`, `iconLibrary: phosphor`). Add components with
  `npx shadcn@latest add <name>`. The `shadcn` package is a runtime dep because
  `src/index.css` imports `shadcn/tailwind.css`.
- **Phosphor Icons** (`@phosphor-icons/react`) for iconography. This is also the
  configured `iconLibrary`, so `shadcn add` pulls Phosphor icons, not Lucide.
- **Motion** (`motion`, imported from `motion/react`) for animation. This is the
  successor package to framer-motion.
- Path alias `@/*` maps to `src/*` (set in `vite.config.ts` and the tsconfigs).

Do not bring in new dependencies without explicit permission.

### Layout

- `index.html` is the entry; `src/main.tsx` mounts `src/App.tsx` into `#root`.
- `src/components/portfolio/` holds the homepage sections, typed content
  configuration, active-section tracking, expandable code-node behavior, and
  the measured connector overlays.
- `src/components/hero/` now contains only shared syntax-highlighting and
  connector-geometry utilities used by the portfolio presentation.
- `src/components/ui/` holds shadcn components. `src/lib/utils.ts` has `cn()`.
- Static assets (resume PDF, images) live in `public/` and are served from `/`.

The homepage uses a single-column content flow below 1024px. At 1024px and
wider, the content occupies the left side and one document-level reference
architecture runs down the right side. Three measured scene clusters align to
the hero, projects, and resume sections, while standalone bridge nodes continue
the story through contact. Each cluster uses a six-column placement grid for
varied horizontal, centered, and full-width node arrangements. Obstacle-aware
orthogonal connectors use short local routes plus two shared long corridors for
origin delivery and recovery. Topology-backed traffic scenarios drive SVG
pulses in both directions along shared paths. The delivery and operations scene
is deliberately limited to seven core nodes so its release and reliability
story stays readable. Project and graph content are configured in
`src/components/portfolio/portfolio.config.ts`.

A second document-level SVG overlay connects the profile card to every rendered
project card at all viewport widths. Source and target wrappers provide stable
measurements outside Motion transforms. The routes use separate left-gutter
lanes that compress with the available space, solid arrowheads, and one random
traffic pulse every four seconds. The overlay is decorative and never affects
content layout.

### Scripts (run from `portfolio/`)

- `npm run dev` - Vite dev server.
- `npm run build` - `tsc -b` typecheck then `vite build` (output to `dist/`).
- `npm run preview` - serve the production build.
- `npm run lint` - ESLint (flat config in `eslint.config.js`).

## Deployment

Vercel tracks the `main` branch and deploys on every push. **Only push to `main`
when the site is ready to go live.** Do redesign/feature work on branches.

The app is a Vite SPA now (framework changed from Next.js). Build output is
`dist/`. In the Vercel project settings the Root Directory is `portfolio/`; make
sure the Framework Preset is **Vite** (not Next.js) so the build command and
output directory resolve correctly.

## Working rules

- **Any architectural change requires updating both `AGENTS.md` and `README.md`.**
  Keep them in sync with reality.
- **Never cross-contaminate the two files.** `AGENTS.md` is internal guidance for
  Codex; `README.md` is public-facing documentation.
- **No AI references in `README.md`** — keep all mention of Codex, AI, or agent
  tooling out of the README. It belongs only here.
