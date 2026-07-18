# Aurelia — Playtest / Trial Guide

Welcome to the Aurelia playtest. This build is a **browser-based alchemy deckbuilder** — experiment in the lab, build your deck, explore for ingredients, and fill your journal with discoveries.

## Quick start (2 minutes)

1. Run locally: `npm install && npm run dev` → open the URL shown (usually `http://localhost:5173`).
2. On first launch, read the **main menu tutorial** (or skip).
3. Click **Enter Laboratory** — the **lab guide** walks you through dragging, brewing, and the rack.
4. Try **Herb + Water** on the desk → Healing Infusion (classic first discovery).

Progress saves automatically in your browser (`localStorage`).

## Core loop

| Step | Where | What to do |
|------|--------|------------|
| 1 | Laboratory | Drag ingredients; stack two to brew |
| 2 | Laboratory | On success: **Craft** (card) or **Bottle** (gold + reagent) |
| 3 | Laboratory | **Draw** more cards from the left panel |
| 4 | Deckbuilder | Tune your 20 ingredient + 10 support deck |
| 5 | Exploration | Find new ingredients (3 runs/day) |
| 6 | Journal | Review discoveries and hints |
| 7 | Shop / Prepare | Buy materials, upgrade ingredients |

## Laboratory controls

- **Desk (center):** Free-drag ingredients. Drop one on another to fuse and brew.
- **Draw (left):** Pull from deck; discard reshuffles when empty.
- **Rack (right):** Potions (drag to desk), techniques (**Use**), residue (**Discard**).
- **Catalyst brew:** Fuse two ingredients, then stack a matching potion from the rack.
- **? button:** Reopen the lab tutorial anytime.

## Costs & rules

- Successful brews cost **1 reagent** (0 at mastery level 3 for that recipe).
- Failed brews return ingredients safely (volatile ingredients may rarely be consumed if enabled in config).
- You **cannot brew again** until you craft or bottle a pending potion result.
- Desk holds up to **9** ingredient cards at once.

## Playtest tools (Settings)

- **Replay tutorials** — resets menu + lab guide flags.
- **Reset all progress** — fresh save (keeps your player name). Click twice to confirm.

## Reporting bugs

When filing feedback, include:

1. **Steps** to reproduce  
2. **Expected** vs **actual** behavior  
3. **Screen** (menu, lab, deckbuilder, etc.)  
4. Browser (Chrome / Firefox / Safari / Edge)  
5. Whether you had a **pending craft/bottle** or were **mid-fusion**

Use the checklist in [QA-CHECKLIST.md](./QA-CHECKLIST.md) for systematic testing.

## Recipe reference

Full recipe list for QA: [QA-RECIPES.md](./QA-RECIPES.md)

## Known limitations (playtest)

- Single-player, local save only — no accounts or cloud sync yet.
- No automated test suite; rely on manual QA + `npm run qa`.
- Large bundle on first load (WebGL background + lab); subsequent visits use cached chunks.
- Laboratory uses a solid background (ferrofluid shows on menu/other screens).

## Scalability notes (for contributors)

- **Content:** Recipes, ingredients, potions live in `src/data/` — add entries there; engine matches by ID/properties.
- **State:** Zustand + immutable `gameActions` reducers; lab uses instance IDs for every card copy.
- **UI:** Screens in `src/ui/screens/`; shared card component in `src/ui/components/Card.tsx`.
- **Deploy:** Vercel + Node 22; see root `README.md`.

Happy brewing.
