import { motion } from 'framer-motion'
import { INGREDIENT_MAP } from '@/data'
import { POTION_MAP, RECIPE_MAP } from '@/data'
import {
  getRevealedHints,
  getRecipeMasteryInfo,
  getUndiscoveredRecipeHints,
  resolvePotion,
  useGameStore,
} from '@/stores/gameStore'

export function JournalScreen() {
  const save = useGameStore((state) => state.save)
  const journalReturnPhase = useGameStore((state) => state.journalReturnPhase)
  const setPhase = useGameStore((state) => state.setPhase)

  const discoveredRecipes = save.discoveredRecipeIds
    .map((id) => RECIPE_MAP.get(id))
    .filter((recipe): recipe is NonNullable<typeof recipe> => recipe !== undefined)

  const hints = getUndiscoveredRecipeHints(save)
  const revealed = getRevealedHints(save)

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.35em] text-amber/60">
            Alchemy Journal
          </p>
          <h1 className="font-display text-3xl text-parchment">Discoveries</h1>
        </div>
        <motion.button
          type="button"
          onClick={() => setPhase(journalReturnPhase)}
          className="rounded-lg border border-amber/30 px-5 py-2 font-display text-xs uppercase tracking-widest text-amber-light"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Back
        </motion.button>
      </header>

      {(hints.length > 0 || revealed.length > 0) && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-lg text-vial">Recipe Hints</h2>
          <ul className="space-y-2">
            {revealed.map((hint) => (
              <li
                key={`revealed-${hint.id}`}
                className="rounded-lg border border-amber/25 bg-amber/5 px-4 py-3 text-sm italic text-parchment/70"
              >
                <span className="text-[10px] uppercase tracking-widest text-amber/80">Scroll · </span>
                &ldquo;{hint.hint}&rdquo;
              </li>
            ))}
            {hints.map((hint) => (
              <li
                key={hint.id}
                className="rounded-lg border border-vial/20 bg-vial/5 px-4 py-3 text-sm italic text-parchment/60"
              >
                &ldquo;{hint.hint}&rdquo;
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg text-amber-light">
          Discovered Recipes ({discoveredRecipes.length})
        </h2>
        {discoveredRecipes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-parchment-dark/30 p-8 text-center text-parchment/50">
            No recipes discovered yet. Experiment in the laboratory.
          </p>
        ) : (
          <ul className="space-y-4">
            {discoveredRecipes.map((recipe, index) => {
              const potion = recipe.resultPotionId
                ? POTION_MAP.get(recipe.resultPotionId)
                : undefined
              const transmuted = recipe.transmuteResultId
                ? INGREDIENT_MAP.get(recipe.transmuteResultId)
                : undefined
              const title =
                potion?.name ?? transmuted?.name ?? recipe.name
              const mastery = getRecipeMasteryInfo(save, recipe.id)
              return (
                <motion.li
                  key={recipe.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-amber/20 bg-parchment/5 p-5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl text-amber-light">
                      {title}
                    </h3>
                    {mastery.level > 0 && (
                      <span className="text-[10px] uppercase tracking-widest text-moss">
                        Mastery {mastery.level} · {mastery.count} brews
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-parchment/70">
                    {recipe.description}
                  </p>
                </motion.li>
              )
            })}
          </ul>
        )}
      </section>

      {save.potions.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-lg text-parchment/80">Potion Collection</h2>
          <ul className="space-y-2">
            {save.potions.map((stack) => {
              const potion = resolvePotion(stack.potionId)
              return (
                <li
                  key={stack.potionId}
                  className="flex justify-between rounded-lg border border-parchment-dark/20 px-4 py-2 text-sm"
                >
                  <span>{potion?.name}</span>
                  <span className="text-parchment/50">×{stack.quantity}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg text-parchment/80">Experiment Log</h2>
        {save.journalEntries.length === 0 ? (
          <p className="text-sm text-parchment/40">No experiments recorded.</p>
        ) : (
          <ul className="space-y-3">
            {save.journalEntries.slice(0, 15).map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-parchment-dark/20 bg-ink/50 px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-sm font-semibold text-parchment">{entry.title}</h3>
                  <time className="text-[10px] uppercase tracking-wide text-parchment/40">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </time>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-parchment/60">{entry.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
