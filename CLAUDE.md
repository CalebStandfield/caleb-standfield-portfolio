# CLAUDE.md

Guidance for Claude Code when working in this repository.

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
- `src/components/ui/` holds shadcn components. `src/lib/utils.ts` has `cn()`.
- `src/content/profile.content.ts` is the single source for site meta, projects,
  resume, and contact links. It must stay import-free (no `@/` alias, no React)
  because `vite.config.ts` imports it under `tsconfig.node.json`. Same rule for
  `src/components/portfolio/portfolio.routes.ts`, which owns `PortfolioStage`.
- `plugins/agent-files/` is a Vite plugin that generates `llms.txt`,
  `robots.txt`, and `sitemap.xml` (dev middleware + emitted on build) and injects
  JSON-LD and an `llms.txt` link into `index.html`. Do not add static copies of
  these files to `public/`; they would shadow the generated ones.
- Static assets (resume PDF, images) live in `public/` and are served from `/`.
- Images: `scripts/optimize-images.mjs` (`npm run images`, needs `cwebp` +
  macOS `sips`) turns every png/jpg in `public/` (except `og.png`) into WebP
  variants in `public/img/` and writes `src/content/images.generated.ts`
  (dims + variants, keyed by the original public path). Render images with
  `ResponsiveImage` (`src/components/portfolio/ResponsiveImage.tsx`) using the
  original path; helpers are in `src/lib/images.ts`. Outputs are committed, the
  script never runs on Vercel. Rerun it after adding or changing an image.
- Projects: `src/components/portfolio/projects/`. `ProjectWheel` is a generic
  circular wheel (front card + peeking neighbors, spun by horizontal scroll,
  touch swipe, arrows, keys, neighbor click); input and position live in
  `useWheel`. Cards sit on a 3D circle: `STEP`, `RADIUS`, `SHADE` are at the
  top of `ProjectWheel.tsx`; card width per breakpoint is `--card-w` on the
  stage. All cards share one grid cell, so wheel height = tallest
  card and spinning never moves the page. Each project's `media` is a list of
  slides (`image`, `images` side by side, or `video` with optional `poster`).
  Add a video by dropping the mp4 in `public/<project>/` and adding a `video`
  slide; it plays only on the front card when on screen. Media frame height is
  the `--media-h` var on `ProjectCard`. The rail's `application` cluster
  `rowGap` and `object_store` offset in `portfolio.config.ts` are tuned to this
  section's height; retune if the card gets much taller or shorter.
- Theme: day/night via `<html data-theme="dark|light">`, night default.
  Palette values live in the `:root` / `:root[data-theme="light"]` blocks of
  `src/index.css` and are exposed as Tailwind colors (`ink`, `surface`,
  `panel`, `page`, `ink-text`, `muted-line`, `grain`, accents). Orange, red,
  and `on-orange` are fixed. Never hardcode hex in components; use a token, or
  `var(--color-x)` plus `withAlpha` (`src/lib/color.ts`) for inline styles and
  SVG (set SVG fill/stroke through `style`, not attributes). `src/lib/theme.ts`
  owns read/apply/persist and `useTheme`; `index.html` has a pre-paint script
  that reads the same `theme` localStorage key. The shadcn `.dark` class is not
  used.
- Render perf: fast-changing state stays in leaves. `PortfolioContent` in
  `App.tsx` is memo'd so stage changes skip the content column; rail pulses
  live in `RailPulses`; measure callbacks use `keepIfSame` (`sameLayout.ts`) so
  unchanged ResizeObserver readings do not re-render.

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

- **Any architectural change requires updating both `CLAUDE.md` and `README.md`.**
  Keep them in sync with reality.
- **Never cross-contaminate the two files.** `CLAUDE.md` is internal guidance for
  Claude; `README.md` is public-facing documentation.
- **No AI references in `README.md`** — keep all mention of Claude, AI, or agent
  tooling out of the README. It belongs only here.
- Stop killing the dev server if your change doesn't require a hard restart.

## Copy reviewers

`.claude/agents/review-*.md` are Sonnet reviewer personas (engineer, hiring
manager, recruiter, Japanese reader, founder) for wording on the site and
LinkedIn. All share `.claude/reviewers/RUBRIC.md` for input and output format.
Run them in parallel on a brief (surface, limits, goal, labeled candidates),
aggregate rankings, rewrite, repeat. Add a persona by dropping in another
`review-<name>.md` that points at the rubric.
