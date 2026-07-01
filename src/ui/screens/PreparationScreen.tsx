import { motion } from 'framer-motion'
import { GAME_CONFIG } from '@/config'
import { INGREDIENT_MAP, PREPARATIONS } from '@/data'
import { resolveCard, useGameStore } from '@/stores/gameStore'
import { Card } from '@/ui/components/Card'

export function PreparationScreen() {
  const save = useGameStore((state) => state.save)
  const setPhase = useGameStore((state) => state.setPhase)
  const prepareIngredient = useGameStore((state) => state.prepareIngredient)

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.35em] text-amber/60">
            Workshop
          </p>
          <h1 className="font-display text-3xl text-parchment">Prepare Ingredients</h1>
          <p className="mt-2 text-sm text-parchment/60">
            Transform materials before adding them to your deck. Cost: {GAME_CONFIG.preparationGoldCost}g each.
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

      <div className="grid gap-6">
        {PREPARATIONS.map((prep, index) => {
          const input = INGREDIENT_MAP.get(prep.inputId)
          const output = INGREDIENT_MAP.get(prep.outputId)
          const inputCard = resolveCard(prep.inputId)
          const outputCard = resolveCard(prep.outputId)
          const hasInput = save.ownedIngredientIds.includes(prep.inputId)
          const alreadyPrepared = save.ownedIngredientIds.includes(prep.outputId)
          const canAfford = save.gold >= prep.goldCost

          return (
            <motion.div
              key={prep.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-parchment-dark/25 bg-ink/40 p-6"
            >
              <h2 className="font-display text-lg text-parchment">{prep.name}</h2>
              <p className="mt-1 text-sm text-parchment/60">{prep.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                {inputCard && <Card card={inputCard} compact />}
                <span className="text-2xl text-amber/60">→</span>
                {outputCard && <Card card={outputCard} compact />}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-parchment/50">
                  Requires {input?.name ?? 'ingredient'} · {prep.goldCost} gold
                </p>
                <button
                  type="button"
                  disabled={!hasInput || alreadyPrepared || !canAfford}
                  onClick={() => prepareIngredient(prep.id)}
                  className="rounded border border-moss/40 px-4 py-2 text-xs uppercase tracking-widest text-moss disabled:opacity-40"
                >
                  {alreadyPrepared ? 'Prepared' : 'Prepare'}
                </button>
              </div>
              {!hasInput && (
                <p className="mt-2 text-xs text-parchment/40">
                  Find {input?.name ?? 'this ingredient'} through exploration first.
                </p>
              )}
              {alreadyPrepared && output && (
                <p className="mt-2 text-xs text-moss">
                  {output.name} is in your collection. Add it from the Deckbuilder.
                </p>
              )}
            </motion.div>
          )
        })}
      </div>
    </main>
  )
}
