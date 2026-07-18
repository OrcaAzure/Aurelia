# Aurelia

An original alchemy-themed deckbuilding card game built with React, TypeScript, and Vite.

**Playtest docs:** [Trial guide](docs/TRIAL-GUIDE.md) · [QA checklist](docs/QA-CHECKLIST.md) · [Recipe reference](docs/QA-RECIPES.md)

## Development

```bash
npm install
npm run dev
```

Requires **Node.js 20.19+** (Vite 7).

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint |
| `npm run qa` | Build + lint (pre-release) |

## Playtest / trial

1. Share the deployed URL or run locally.
2. Testers: start with [docs/TRIAL-GUIDE.md](docs/TRIAL-GUIDE.md).
3. Before release: complete [docs/QA-CHECKLIST.md](docs/QA-CHECKLIST.md).
4. **Settings** in-game: replay tutorials or reset progress for a clean run.

Save data is stored in browser `localStorage` (`aurelia-v1-save`).

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
  engine/       Game rules, lab session, reducers (gameActions)
  cards/        Card types
  data/         Ingredients, recipes, potions, locations, orders
  lib/          Recipe engine, persistence, drag/drop, lab helpers
  stores/       Zustand game store
  ui/           Screens, components, Ferrofluid background
docs/           Trial guide, QA checklist, recipe QA reference
```

### Scalability

- **Content-driven:** Add recipes/ingredients in `src/data/` without engine changes for standard brews.
- **Instance-based lab:** Each card copy has a unique instance ID — supports duplicates, fusion, and layout persistence.
- **Reducer pattern:** All game mutations go through `gameActions` → easy to test and extend.
- **Code splitting:** Vite manual chunks for React, Framer Motion, and OGL (ferrofluid).

## Features (current build)

- Free-placement laboratory desk with drag-to-fuse brewing
- Catalyst potion + ingredient combos
- Deckbuilder, exploration, shop, preparation
- Journal, daily challenges, alchemist orders, recipe mastery
- In-lab spotlight tutorial + card element animations
- Ferrofluid WebGL menu background

## License

Private / playtest — see repository owner.
