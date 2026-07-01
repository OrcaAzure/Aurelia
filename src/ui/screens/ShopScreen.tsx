import { motion } from 'framer-motion'
import { audioService } from '@/audio'
import { SHOP_ITEMS } from '@/data'
import { INGREDIENT_MAP } from '@/data'
import { useGameStore } from '@/stores/gameStore'

export function ShopScreen() {
  const save = useGameStore((state) => state.save)
  const setPhase = useGameStore((state) => state.setPhase)
  const buyShopItem = useGameStore((state) => state.buyShopItem)

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.35em] text-amber/60">
            Merchant Stall
          </p>
          <h1 className="font-display text-3xl text-parchment">Shop</h1>
          <p className="mt-2 text-sm text-amber/70">{save.gold} gold available</p>
        </div>
        <button
          type="button"
          onClick={() => setPhase('menu')}
          className="rounded-lg border border-amber/30 px-5 py-2 text-xs uppercase tracking-widest text-amber-light"
        >
          Back
        </button>
      </header>

      <ul className="space-y-4">
        {SHOP_ITEMS.map((item, index) => {
          const isReagent = item.ingredientId === 'reagent-pack'
          const ingredient = isReagent
            ? null
            : INGREDIENT_MAP.get(item.ingredientId)
          const owned = !isReagent && save.ownedIngredientIds.includes(item.ingredientId)
          const canAfford = save.gold >= item.price

          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between rounded-xl border border-amber/20 bg-parchment/5 p-5"
            >
              <div>
                <h2 className="font-display text-lg text-amber-light">
                  {isReagent ? 'Reagent Pack (×3)' : ingredient?.name}
                </h2>
                <p className="mt-1 text-sm text-parchment/60">
                  {isReagent
                    ? 'Restores 3 brewing reagents.'
                    : owned
                      ? 'Adds a copy to your deck.'
                      : 'Unlocks this ingredient for your collection.'}
                </p>
              </div>
              <button
                type="button"
                disabled={!canAfford}
                onClick={() => {
                  audioService.play('click')
                  buyShopItem(item.id, item.ingredientId, item.price)
                }}
                className="rounded-lg border border-amber bg-amber/15 px-5 py-2 font-display text-xs uppercase tracking-widest text-amber-light disabled:opacity-40"
              >
                {item.price}g
              </button>
            </motion.li>
          )
        })}
      </ul>
    </main>
  )
}
