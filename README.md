# Caleb Standfield - Portfolio

Personal developer portfolio for Caleb Standfield. This repository is the git
root; the actual app lives in the [`portfolio/`](./portfolio) subdirectory.

## Repository layout

```
caleb-standfield-portfolio/   <- git root (this folder)
├── LICENSE
├── README.md                 <- you are here
└── portfolio/                <- the Vite app (all app code lives here)
    ├── index.html            <- entry HTML
    ├── src/
    │   ├── main.tsx          <- app entry, mounts <App /> into #root
    │   ├── App.tsx           <- root component
    │   ├── index.css         <- Tailwind + theme tokens
    │   ├── components/ui/     <- shadcn components
    │   └── lib/utils.ts       <- cn() helper
    ├── public/               <- static assets (images, resume PDF)
    ├── vite.config.ts
    └── package.json
```

Because the app is nested one level down, **all `npm` commands must be run from
inside `portfolio/`**, not from the repository root.

## Tech stack

- [React 19](https://react.dev)
- [Vite 7](https://vite.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com)
- [Phosphor Icons](https://phosphoricons.com)
- [Motion](https://motion.dev)

## Getting started

```bash
cd portfolio
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it.

Other scripts (also run from `portfolio/`):

```bash
npm run build     # typecheck + production build (output to dist/)
npm run preview   # serve the production build
npm run lint      # eslint
```

To add a shadcn component:

```bash
npx shadcn@latest add button
```

## Deployment

The site is deployed on [Vercel](https://vercel.com), which tracks the `main`
branch, so every push to `main` triggers a production deploy. Because the app is
nested, Vercel's **Root Directory** is set to `portfolio/` and the framework
preset is Vite (build output is `dist/`).

> Only push to `main` when the site is ready to go live.

## Current status

The portfolio is mid-redesign. The live page is intentionally stripped down to
just the top bar (name plus GitHub/LinkedIn links) over a blank black canvas.
Projects, resume, and about/contact sections, along with their images in
`portfolio/public/`, are being reintroduced as the new design comes together.
