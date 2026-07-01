import { motion } from 'framer-motion'
import { audioService } from '@/audio'
import { GAME_CONFIG } from '@/config'
import { EXPLORATION_LOCATIONS, INGREDIENT_MAP, RECIPE_MAP } from '@/data'
import { resolveCard, useGameStore } from '@/stores/gameStore'
import { Card } from '@/ui/components/Card'

export function ExplorationScreen() {
  const save = useGameStore((state) => state.save)
  const exploration = useGameStore((state) => state.exploration)
  const setPhase = useGameStore((state) => state.setPhase)
  const startExploration = useGameStore((state) => state.startExploration)
  const completeExploration = useGameStore((state) => state.completeExploration)
  const cancelExplorationEncounter = useGameStore(
    (state) => state.cancelExplorationEncounter,
  )

  if (exploration) {
    const location = EXPLORATION_LOCATIONS.find((l) => l.id === exploration.locationId)
    const event = exploration.event

    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
        <header className="mb-8">
          <button
            type="button"
            onClick={() => cancelExplorationEncounter()}
            className="text-xs uppercase tracking-widest text-parchment/50"
          >
            ← Choose another location
          </button>
          <h1 className="mt-4 font-display text-3xl text-parchment">
            {location?.name}
          </h1>
          <p className="mt-2 text-parchment/60">Choose one ingredient to take back.</p>

          {event?.type === 'bountiful' && (
            <p className="mt-3 rounded-lg border border-moss/30 bg-moss/10 px-4 py-2 text-sm text-moss">
              Bountiful harvest! Four ingredients to choose from.
            </p>
          )}
          {event?.type === 'scroll' && event.hintRecipeId && (
            <p className="mt-3 rounded-lg border border-vial/30 bg-vial/10 px-4 py-2 text-sm text-vial">
              You found a recipe scroll! Hint: &ldquo;{RECIPE_MAP.get(event.hintRecipeId)?.hint}&rdquo;
            </p>
          )}
          {event?.type === 'curse' && (
            <p className="mt-3 rounded-lg border border-red-900/40 bg-red-900/10 px-4 py-2 text-sm text-red-300/80">
              An ominous presence lingers… you may lose a little gold.
            </p>
          )}
        </header>

        <div className="flex flex-wrap justify-center gap-6">
          {exploration.choices.map((id, index) => {
            const card = resolveCard(id)
            if (!card) return null
            const isNew = !save.ownedIngredientIds.includes(id)
            return (
              <motion.button
                key={id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => {
                  audioService.play('explore')
                  completeExploration(id)
                }}
                className="text-left"
              >
                <Card card={card} flippable />
                {isNew && (
                  <span className="mt-2 block text-center text-xs uppercase tracking-widest text-moss">
                    New!
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.35em] text-moss/80">
            Exploration
          </p>
          <h1 className="font-display text-3xl text-parchment">Find Ingredients</h1>
          <p className="mt-2 text-sm text-parchment/60">
            Runs remaining: {save.explorationRunsRemaining} / {GAME_CONFIG.explorationRunsPerDay}
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

      {save.explorationRunsRemaining === 0 ? (
        <p className="rounded-xl border border-dashed border-parchment-dark/30 p-8 text-center text-parchment/50">
          No exploration runs left today. Return tomorrow.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {EXPLORATION_LOCATIONS.map((location, index) => (
            <motion.button
              key={location.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              onClick={() => {
                audioService.play('click')
                startExploration(location.id)
              }}
              className="rounded-xl border border-moss/25 bg-moss/5 p-6 text-left hover:border-moss/50"
            >
              <h2 className="font-display text-xl text-moss">{location.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-parchment/65">
                {location.description}
              </p>
              <p className="mt-3 text-xs text-vial/80">{location.traitLabel}</p>
              <p className="mt-1 text-xs text-parchment/40">
                {location.ingredientPool.length} possible finds · events possible
              </p>
            </motion.button>
          ))}
        </div>
      )}

      <section className="mt-12">
        <h2 className="mb-4 font-display text-lg text-parchment/80">Your Collection</h2>
        <div className="flex flex-wrap gap-2">
          {save.ownedIngredientIds.map((id) => {
            const ing = INGREDIENT_MAP.get(id)
            return (
              <span
                key={id}
                className="rounded-full border border-parchment-dark/30 px-3 py-1 text-xs text-parchment/70"
              >
                {ing?.name ?? id}
              </span>
            )
          })}
        </div>
      </section>
    </main>
  )
}
