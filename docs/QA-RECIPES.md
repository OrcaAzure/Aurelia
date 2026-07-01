# Aurelia — Recipe & Combo Reference (QA)

Reference for testing all laboratory brews, transmutations, catalyst combos, preparations, and support-card effects.

**Last updated:** matches current `src/data/recipes.ts` (44 brew recipes).

---

## How combos work

| Action | Input | Result |
|--------|--------|--------|
| **Standard brew** | Stack 2 ingredients on the lab desk | Potion card (craft/bottle) or transmutation |
| **Property brew** | 2 ingredients whose **properties** match (only if no exact-ID recipe exists) | See [Property-based brews](#3-property-based-brews) |
| **Catalyst brew** | 2 ingredients + matching **potion** stacked together | Enhanced potion; catalyst is consumed |
| **Preparation** | 1 ingredient + gold on Prep screen | Upgraded ingredient |
| **Use potion** | Tap **Use** on a potion (rack or desk) | Potion effect only — not a brew |
| **Technique** | Tap **Use** on a technique (rack) | Technique effect |

### Rules QA should verify

- **Order does not matter** for ingredient pairs (Herb + Water = Water + Herb).
- **Exact ingredient recipes are checked before property recipes.** If a specific pair exists, property matching is skipped.
- **Residue** cannot be brewed. Filter technique removes it from hand/discard.
- **Failed brews** return ingredients to the desk/hand. If a catalyst was attached, it is also returned.
- **Successful brews** cost 1 reagent (0 at mastery level 3 for that recipe).
- **Catalyst brew** only triggers when all three cards (2 ingredients + correct potion) overlap/stack; dropping a potion on a single ingredient does nothing.
- After a successful potion brew, player chooses **Craft** (card to rack/hand) or **Bottle** (gold).

---

## 1. Standard potion brews (ingredient + ingredient)

Stack either ingredient onto the other on the lab desk.

| # | Ingredient A | Ingredient B | Result potion |
|---|--------------|--------------|---------------|
| 1 | Herb | Water | Healing Infusion |
| 2 | Ember | Stone | Fire Core |
| 3 | Crystal Dust | Water | Mana Solution |
| 4 | Nightshade | Moonpetal | Shadow Tonic |
| 5 | Iron Shavings | Sulfur | Acid Wash |
| 6 | Sea Salt | Water | Brine Elixir |
| 7 | Wind Spore | Dewdrop | Clarity Draft |
| 8 | Charcoal | Ember | Forge Tonic |
| 9 | Glow Moss | Pearl Dust | Luminous Balm |
| 10 | Herb | Glow Moss | Vitality Brew |
| 11 | Bellflower | Water | Serenity Draught |
| 12 | Mycelium | Moonpetal | Dream Tonic |
| 13 | Obsidian Shard | Ember | Volcano Extract |
| 14 | Phoenix Ash | Pearl Dust | Sun Elixir |
| 15 | Wind Spore | Bellflower | Gale Essence |
| 16 | Concentrated Brine | Dewdrop | Deep Tide Phial |
| 17 | Living Crystal | Water | Astral Ink |
| 18 | Nightshade | Sulfur | Murk Distillate |
| 19 | Sunbloom | Dewdrop | Sun Dew Elixir |
| 20 | Frost Petal | Water | Frost Tonic |
| 21 | Fine Crystal Powder | Pearl Dust | Prism Draught |
| 22 | Spark Dust | Ember | Lightning Phial |
| 23 | Moon Silver | Crystal Dust | Lunar Serum |
| 24 | Witch Lichen | Charcoal | Smoke Veil |
| 25 | Dried Herb | Brined Salt | Savory Broth |
| 26 | Murk Residue | Nightshade | Void Tincture |
| 27 | Ether Mist | Moon Silver | Aether Breath |
| 28 | Ash Root | Water | Ash Tonic |

---

## 2. Transmutations (ingredient + ingredient → new ingredient)

Same stack interaction as potion brews. On success, a new ingredient is added to the collection/deck (no craft/bottle choice).

| # | Ingredient A | Ingredient B | Result material |
|---|--------------|--------------|-----------------|
| 1 | Herb | Dewdrop | Infused Herb |
| 2 | Charcoal | Stone | Forge Ash |
| 3 | Crystal Dust | Glow Moss | Living Crystal |
| 4 | Sea Salt | Dewdrop | Concentrated Brine |
| 5 | Nightshade | Charcoal | Murk Residue |
| 6 | Volcanic Glass | Sulfur | Magma Bond |
| 7 | Any **volatile** + any **crystalline** | (see §3) | Spark Dust |

---

## 3. Property-based brews

Used only when **no exact ingredient recipe** matches the pair.

### Vital Mist (potion)

| Rule | Details |
|------|---------|
| Match | One ingredient with property **living** + one with **stable** |
| Result | Vital Mist |

**Ingredients with `living`:** Herb, Wind Spore, Glow Moss, Bellflower, Mycelium, Infused Herb, Living Crystal, Sunbloom, Witch Lichen, Ash Root, Ether Mist

**Ingredients with `stable`:** Herb, Water, Stone, Moonpetal, Sea Salt, Dewdrop, Infused Herb, Forge Ash, Concentrated Brine, Dried Herb, Brined Salt, Frost Petal, Ash Root, Moon Silver, Magma Bond

**QA examples** (pairs with no exact recipe): Mycelium + Stone, Bellflower + Stone.

**QA conflict:** Herb + Glow Moss has an exact recipe → **Vitality Brew**, not Vital Mist.

### Spark Fusion (transmute)

| Rule | Details |
|------|---------|
| Match | One ingredient with **volatile** + one with **crystalline** |
| Result | Spark Dust |

**Ingredients with `volatile`:** Ember, Wind Spore, Mycelium, Sulfur, Obsidian Shard, Phoenix Ash, Forge Ash, Murk Residue, Spark Dust, Sunbloom, Volcanic Glass, Ether Mist, Magma Bond

**Ingredients with `crystalline`:** Crystal Dust, Moonpetal, Pearl Dust, Glow Moss, Living Crystal, Fine Crystal Powder, Spark Dust, Frost Petal, Witch Lichen, Moon Silver, Magma Bond

---

## 4. Catalyst brews (2 ingredients + potion)

Drag a potion from the rack onto the desk, place two ingredients near it, then either:

- Stack one ingredient onto the other while the potion overlaps the merge point, or
- Stack the potion onto the ingredient pair.

The catalyst potion is **consumed** on success (discarded). All three cards fuse and brew.

| # | Ingredient A | Ingredient B | Catalyst potion | Result potion |
|---|--------------|--------------|-----------------|---------------|
| 1 | Herb | Glow Moss | Healing Infusion | Vital Mist |
| 2 | Ember | Obsidian Shard | Fire Core | Volcano Extract |
| 3 | Living Crystal | Water | Mana Solution | Astral Ink |
| 4 | Nightshade | Moonpetal | Shadow Tonic | Void Tincture |
| 5 | Charcoal | Ember | Forge Tonic | Sun Elixir |
| 6 | Sea Salt | Water | Brine Elixir | Deep Tide Phial |
| 7 | Wind Spore | Bellflower | Clarity Draft | Aether Breath |
| 8 | Glow Moss | Pearl Dust | Luminous Balm | Prism Draught |

### Catalyst QA cases

| Case | Expected |
|------|----------|
| Herb + Glow Moss, no potion nearby | Vitality Brew |
| Herb + Glow Moss + Healing Infusion | Vital Mist (catalyst consumed) |
| Herb + Glow Moss + wrong potion nearby | Vitality Brew; potion stays on desk |
| Valid catalyst triple, not enough reagents | Fail; all 3 cards returned |
| Potion dropped on one ingredient only | No brew; cards stay separate |
| Tap **Use** on catalyst potion | Potion effect only; no brew |

---

## 5. Preparations (Prep screen)

Not lab brewing. Done from the preparation screen for gold.

| # | Input | Output | Gold cost |
|---|-------|--------|-----------|
| 1 | Herb | Dried Herb | 8 |
| 2 | Crystal Dust | Fine Crystal Powder | 8 |
| 3 | Sea Salt | Brined Salt | 8 |

---

## 6. Techniques (rack — tap Use)

| Technique | Effect |
|-----------|--------|
| **Distill** | Recover 1 random card from discard pile to hand |
| **Heat** | Next successful brew with a fire ingredient grants +5 gold |
| **Filter** | Remove all Residue from hand and discard pile |
| **Stir** | Swap the two ingredients in the alchemy circle (legacy slot UI; on rack in current lab) |

---

## 7. Potion Use effects (not brews)

Tap **Use** on a potion card. Does not require stacking with ingredients.

| Potion | Use effect |
|--------|------------|
| Healing Infusion | Restore 2 reagents |
| Fire Core | Gain 8 gold |
| Mana Solution | Draw 2 cards |
| Shadow Tonic | Reveal 1 recipe hint |
| Acid Wash | Gain 10 gold |
| Brine Elixir | Restore 1 reagent |
| Clarity Draft | Reveal 1 recipe hint |
| Forge Tonic | Draw 1 card |
| Luminous Balm | Restore 3 reagents |
| Vitality Brew | Draw 1 card |
| Serenity Draught | Restore 2 reagents |
| Dream Tonic | Reveal 1 recipe hint |
| Volcano Extract | Gain 15 gold |
| Sun Elixir | Draw 3 cards |
| Gale Essence | Draw 2 cards |
| Deep Tide Phial | Restore 2 reagents |
| Astral Ink | Reveal 2 hints |
| Murk Distillate | Gain 12 gold |
| Vital Mist | Restore 3 reagents |
| Sun Dew Elixir | Gain 6 gold |
| Frost Tonic | Draw 2 cards |
| Prism Draught | Reveal 2 hints |
| Lightning Phial | Gain 18 gold |
| Lunar Serum | Restore 4 reagents |
| Smoke Veil | Reveal 1 hint |
| Savory Broth | Restore 2 reagents |
| Void Tincture | Draw 4 cards |
| Aether Breath | Restore 5 reagents |
| Ash Tonic | Restore 1 reagent |

---

## 8. Suggested progression chains (smoke tests)

```
Herb + Water → Healing Infusion
  └─ catalyst: Herb + Glow Moss + Healing Infusion → Vital Mist

Sea Salt + Dewdrop → Concentrated Brine
  └─ Concentrated Brine + Dewdrop → Deep Tide Phial

Crystal Dust + Glow Moss → Living Crystal
  └─ Living Crystal + Water → Astral Ink
      └─ catalyst: Living Crystal + Water + Mana Solution → Astral Ink

Nightshade + Charcoal → Murk Residue
  └─ Murk Residue + Nightshade → Void Tincture
      └─ catalyst: Nightshade + Moonpetal + Shadow Tonic → Void Tincture
```

---

## 9. Counts summary

| Category | Count |
|----------|------:|
| Exact potion recipes | 28 |
| Transmutations | 7 |
| Property recipes | 2 |
| Catalyst recipes | 8 |
| Preparations | 3 |
| **Total brew recipes** | **44** |

---

## 10. Known non-recipe interactions

| Interaction | Expected behavior |
|-------------|-------------------|
| Unknown ingredient pair | Brew fails; ingredients returned (volatile may be consumed) |
| Residue in a pair | Brew fails with message to use Filter |
| Desk full (9 ingredients) | Cannot draw until space is made |
| Potions on rack | Drag to desk to place; drag back to rack to return |
| Successful brew | Craft → potion card; Bottle → gold + inventory stack |
