# Aurelia

An original alchemy-themed deckbuilding card game built with React, TypeScript, and Vite.

## Development

```bash
npm install
npm run dev
```

Requires **Node.js 20.19+** (Vite 7).

## Deploy (Vercel)

1. Push this repo to GitHub (`OrcaAzure/Aurelia`).
2. In [Vercel](https://vercel.com), import the repo (or open the existing project).
3. Confirm **Framework Preset**: Vite, **Build Command**: `npm run build`, **Output Directory**: `dist`.
4. Set **Node.js Version** to **22.x** (Project Settings → General → Node.js Version), or rely on `engines` in `package.json`.
5. Redeploy (Deployments → … → Redeploy).

If the live site still shows an old “Hello World” page, the latest deploy likely **failed** — open the failed deployment log and check for Node/Vite errors.

## Architecture

```
src/
  engine/       Game session and phase management
  cards/        Card types and data
  recipes/      Recipe discovery interfaces
  inventory/    Resource and card collection interfaces
  journal/      Alchemy journal interfaces
  animation/    Framer Motion presets
  audio/        Audio service interfaces
  networking/   Future multiplayer interfaces
  stores/       Zustand state
  ui/           React components and screens
```
