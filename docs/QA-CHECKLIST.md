# Aurelia — QA Checklist

Use this before a playtest release or after large changes. Run `npm run qa` first (build + lint).

## Build & deploy

- [ ] `npm run qa` passes (no TypeScript or ESLint errors)
- [ ] `npm run preview` — smoke test production build locally
- [ ] Vercel deploy succeeds (Node 22.x)
- [ ] Live URL loads main menu (not old Hello World skeleton)

## First-time user

- [ ] Main menu tutorial appears (or skip works)
- [ ] Enter Laboratory → lab spotlight tutorial appears
- [ ] Lab tutorial **?** button reopens guide
- [ ] Settings → Replay tutorials works
- [ ] Settings → Reset progress (double confirm) returns to fresh save

## Main menu

- [ ] All navigation buttons work (Lab, Explore, Deck, Prepare, Shop, Journal, How to Play)
- [ ] Daily challenge and orders display
- [ ] Player name, gold, XP, reagents shown correctly

## Laboratory — drawing & desk

- [ ] 5 cards on desk at lab start
- [ ] Draw adds cards when deck/discard has cards
- [ ] Draw disabled when desk full (9 ingredients)
- [ ] Ingredient availability tracker updates (held / in deck)
- [ ] Cards draggable on canvas; positions persist after journal round-trip

## Laboratory — brewing

- [ ] Stack two ingredients → fusion animation → brew
- [ ] Known recipe (Herb + Water) succeeds
- [ ] Unknown pair fails safely; ingredients return
- [ ] Reagent deducted on success
- [ ] Craft adds potion to rack/deck
- [ ] Bottle grants gold + reagent
- [ ] Cannot fuse again while pending craft/bottle
- [ ] Transmutation adds new material to collection

## Laboratory — rack & support

- [ ] Potions draggable from rack to desk
- [ ] Techniques: Distill, Filter, Heat, Stir work as described
- [ ] Techniques blocked during active fusion/brew
- [ ] Residue discard works
- [ ] Potion **Use** on desk/rack applies effect

## Catalyst brews

- [ ] Potion + two ingredients stack triggers catalyst recipe (when valid)
- [ ] Catalyst consumed on success

## Deckbuilder

- [ ] Add/remove cards within limits (20 ing / 10 support)
- [ ] Max 3 copies per card enforced
- [ ] Empty deck shows message in lab

## Exploration

- [ ] 3 runs per day; decrements on complete
- [ ] Ingredient rewards add to collection
- [ ] Encounter events (scroll/curse/bountiful) if triggered

## Shop & preparation

- [ ] Purchase deducts gold; adds ingredient
- [ ] Preparation upgrades ingredient for gold

## Journal

- [ ] Discovered recipes listed
- [ ] Return navigates back to correct screen
- [ ] Hints / undiscovered section reasonable

## UI / polish

- [ ] Ferrofluid background on non-lab screens
- [ ] Card element animations visible (fire on Ember, etc.)
- [ ] No infinite loop / freeze entering laboratory
- [ ] Mobile viewport: usable (touch drag may vary)

## Regression hotspots

- [ ] Fusion: both cards disappear without survivor bug
- [ ] Stir swaps correct ingredient art (instance IDs)
- [ ] Journal from lab preserves desk state
- [ ] Failed brew preserves pending craft if any (should be blocked instead)

## Performance

- [ ] Lab with 9 cards + rack remains responsive
- [ ] No memory leak after 10+ lab enter/exit cycles
- [ ] Chunks: `react-vendor`, `motion`, `ogl` split in build output

---

**Sign-off:** _______________ **Date:** _______________ **Build:** _______________
