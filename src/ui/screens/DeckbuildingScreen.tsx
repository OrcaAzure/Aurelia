import { motion } from 'framer-motion'
import { potionDeckId, techniqueDeckId } from '@/cards/types'
import { GAME_CONFIG } from '@/config'
import { INGREDIENT_MAP, RECIPE_MAP, TECHNIQUE_MAP } from '@/data'
import { countInDeck, splitDeckCounts } from '@/engine/deckUtils'
import {
  getOwnedTechniques,
  resolveCard,
  useGameStore,
} from '@/stores/gameStore'
import { Card } from '@/ui/components/Card'

export function DeckbuildingScreen() {
  const save = useGameStore((state) => state.save)
  const setPhase = useGameStore((state) => state.setPhase)
  const addCardToDeck = useGameStore((state) => state.addCardToDeck)
  const removeCardFromDeck = useGameStore((state) => state.removeCardFromDeck)

  const counts = splitDeckCounts(save.playerDeck)

  const owned = save.ownedIngredientIds
    .map((id) => INGREDIENT_MAP.get(id))
    .filter((ing): ing is NonNullable<typeof ing> => ing !== undefined)

  const unlockedPotions = save.discoveredRecipeIds
    .map((id) => RECIPE_MAP.get(id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined && !!r.resultPotionId)
    .map((r) => potionDeckId(r.resultPotionId!))

  const ownedTechniques = getOwnedTechniques(save).map((id) => techniqueDeckId(id))

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.35em] text-amber/60">
            Deckbuilder
          </p>
          <h1 className="font-display text-3xl text-parchment">Your Deck</h1>
          <p className="mt-2 text-sm text-parchment/60">
            Ingredients {counts.ingredients}/{GAME_CONFIG.maxIngredientDeckSize} · Support{' '}
            {counts.support}/{GAME_CONFIG.maxSupportDeckSize} (potions {counts.potions},
            techniques {counts.techniques}) · max {GAME_CONFIG.maxCopiesPerCard} copies each
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPhase('menu')}
          className="rounded-lg border border-amber/30 px-5 py-2 text-xs uppercase tracking-widest text-amber-light"
        >
          Back
        </button>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg text-parchment/80">Current Deck</h2>
        {save.playerDeck.length === 0 ? (
          <p className="text-sm text-parchment/40">Deck is empty. Add cards below.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {save.playerDeck.map((id, index) => {
              const card = resolveCard(id)
              if (!card) return null
              return (
                <motion.button
                  key={`${id}-${index}`}
                  type="button"
                  onClick={() => removeCardFromDeck(id)}
                  className="group relative"
                  title="Click to remove"
                  whileHover={{ scale: 1.03 }}
                >
                  <Card card={card} compact />
                  <span className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-900/80 text-xs text-parchment group-hover:flex">
                    ×
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg text-vial">Potion Cards</h2>
        <p className="mb-4 text-sm text-parchment/50">
          Discovered recipes you can add as playable potion cards ({counts.potions}/
          {GAME_CONFIG.maxSupportDeckSize} support slots shared with techniques).
        </p>
        {unlockedPotions.length === 0 ? (
          <p className="text-sm text-parchment/40">Discover recipes in the laboratory first.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unlockedPotions.map((deckId) => {
              const card = resolveCard(deckId)
              if (!card) return null
              const inDeck = countInDeck(save.playerDeck, deckId)
              return (
                <div
                  key={deckId}
                  className="flex items-center gap-3 rounded-xl border border-vial/20 bg-vial/5 p-3"
                >
                  <Card card={card} compact />
                  <div>
                    <p className="text-xs text-parchment/50">In deck: {inDeck}</p>
                    <button
                      type="button"
                      disabled={
                        inDeck >= GAME_CONFIG.maxCopiesPerCard
                        || counts.support >= GAME_CONFIG.maxSupportDeckSize
                      }
                      onClick={() => addCardToDeck(deckId)}
                      className="mt-2 rounded border border-vial/40 px-3 py-1 text-xs uppercase tracking-widest text-vial disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg text-amber-light">Technique Cards</h2>
        <p className="mb-4 text-sm text-parchment/50">
          Laboratory tools played from your hand. Share support slots with potions.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ownedTechniques.map((deckId) => {
            const techniqueId = deckId.replace('tech-', '')
            const technique = TECHNIQUE_MAP.get(techniqueId)
            const card = resolveCard(deckId)
            if (!card || !technique) return null
            const inDeck = countInDeck(save.playerDeck, deckId)
            return (
              <div
                key={deckId}
                className="flex items-center gap-3 rounded-xl border border-amber/20 bg-amber/5 p-3"
              >
                <Card card={card} compact />
                <div>
                  <p className="text-xs text-parchment/50">In deck: {inDeck}</p>
                  <button
                    type="button"
                    disabled={
                      inDeck >= GAME_CONFIG.maxCopiesPerCard
                      || counts.support >= GAME_CONFIG.maxSupportDeckSize
                    }
                    onClick={() => addCardToDeck(deckId)}
                    className="mt-2 rounded border border-amber/40 px-3 py-1 text-xs uppercase tracking-widest text-amber-light disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg text-parchment/80">Ingredients</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owned.map((ingredient) => {
            const card = resolveCard(ingredient.id)
            if (!card) return null
            const inDeck = countInDeck(save.playerDeck, ingredient.id)
            return (
              <div
                key={ingredient.id}
                className="flex items-center gap-3 rounded-xl border border-parchment-dark/20 bg-ink/40 p-3"
              >
                <Card card={card} compact />
                <div className="flex-1">
                  <p className="text-xs text-parchment/50">In deck: {inDeck}</p>
                  <button
                    type="button"
                    disabled={
                      inDeck >= GAME_CONFIG.maxCopiesPerCard
                      || counts.ingredients >= GAME_CONFIG.maxIngredientDeckSize
                    }
                    onClick={() => addCardToDeck(ingredient.id)}
                    className="mt-2 rounded border border-amber/30 px-3 py-1 text-xs uppercase tracking-widest text-amber-light disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
