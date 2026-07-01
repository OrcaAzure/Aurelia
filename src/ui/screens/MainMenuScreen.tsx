import { useState } from 'react'
import { motion } from 'framer-motion'
import { audioService } from '@/audio'
import { getDailyChallengeForDate, ORDER_TEMPLATE_MAP } from '@/data'
import { GAME_CONFIG } from '@/config'
import { splitDeckCounts } from '@/engine/deckUtils'
import {
  getPlayerRank,
  useGameStore,
} from '@/stores/gameStore'
import { TutorialModal, shouldShowTutorial } from '@/ui/components/TutorialModal'

export function MainMenuScreen() {
  const [tutorialOpen, setTutorialOpen] = useState(shouldShowTutorial)
  const setPhase = useGameStore((state) => state.setPhase)
  const startLaboratory = useGameStore((state) => state.startLaboratory)
  const openJournal = useGameStore((state) => state.openJournal)
  const completeTutorial = useGameStore((state) => state.completeTutorial)
  const claimOrderReward = useGameStore((state) => state.claimOrderReward)
  const save = useGameStore((state) => state.save)

  const rank = getPlayerRank(save)
  const challenge = getDailyChallengeForDate(new Date())
  const challengeDone = save.dailyChallengeCompleted
  const deckCounts = splitDeckCounts(save.playerDeck)

  const handleCloseTutorial = () => {
    completeTutorial()
    setTutorialOpen(false)
  }

  const navigate = (action: () => void) => {
    audioService.resume()
    audioService.play('click')
    action()
  }

  return (
    <>
      <TutorialModal open={tutorialOpen} onClose={handleCloseTutorial} />

      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl"
        >
          <p className="mb-3 font-display text-sm uppercase tracking-[0.4em] text-amber-light">
            Alchemy Deckbuilder
          </p>
          <h1 className="font-display text-6xl font-semibold tracking-wide text-parchment">
            Aurelia
          </h1>
          <p className="mt-4 text-lg text-parchment/65">
            Welcome, {save.playerName}
          </p>
          <p className="mt-1 text-sm text-amber/70">
            {rank} · {save.experience} XP · {save.gold} gold · {save.reagents} reagents
          </p>

          {save.discoveredRecipeIds.length > 0 && (
            <p className="mt-3 text-sm text-moss">
              {save.discoveredRecipeIds.length} recipe
              {save.discoveredRecipeIds.length === 1 ? '' : 's'} discovered
            </p>
          )}

          <div className="mt-6 rounded-xl border border-vial/25 bg-vial/5 px-5 py-3 text-left">
            <p className="font-display text-xs uppercase tracking-widest text-vial">
              Daily Challenge {challengeDone ? '✓' : ''}
            </p>
            <p className="mt-1 text-sm text-parchment/75">{challenge.title}</p>
            <p className="text-xs text-parchment/50">{challenge.description}</p>
          </div>

          <div className="mt-4 rounded-xl border border-amber/25 bg-amber/5 px-5 py-3 text-left">
            <p className="font-display text-xs uppercase tracking-widest text-amber-light">
              Alchemist&apos;s Orders
            </p>
            <ul className="mt-2 space-y-2">
              {save.activeOrders.map((order) => {
                const template = ORDER_TEMPLATE_MAP.get(order.templateId)
                if (!template) return null
                return (
                  <li key={order.templateId} className="text-xs text-parchment/70">
                    <span className="text-parchment/90">{template.title}</span>
                    {' — '}
                    {order.claimed
                      ? 'Claimed'
                      : order.completed
                        ? (
                            <button
                              type="button"
                              onClick={() => navigate(() => claimOrderReward(order.templateId))}
                              className="text-moss underline"
                            >
                              Claim {template.rewardGold}g
                            </button>
                          )
                        : `${order.progress}/${template.target}`}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <motion.button
              type="button"
              onClick={() => navigate(() => { startLaboratory() })}
              className="rounded-xl border-2 border-amber bg-amber/15 px-6 py-4 font-display text-xs uppercase tracking-[0.2em] text-amber-light sm:col-span-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter Laboratory
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate(() => setPhase('exploration'))}
              className="rounded-xl border border-moss/40 px-6 py-3 font-display text-xs uppercase tracking-widest text-moss"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore ({save.explorationRunsRemaining}/{GAME_CONFIG.explorationRunsPerDay})
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate(() => setPhase('deckbuilding'))}
              className="rounded-xl border border-parchment-dark/40 px-6 py-3 font-display text-xs uppercase tracking-widest text-parchment/70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Deck ({deckCounts.ingredients}/{GAME_CONFIG.maxIngredientDeckSize} ing ·{' '}
              {deckCounts.support}/{GAME_CONFIG.maxSupportDeckSize} support)
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate(() => setPhase('preparation'))}
              className="rounded-xl border border-moss/30 px-6 py-3 font-display text-xs uppercase tracking-widest text-moss/80"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Prepare
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate(() => setPhase('shop'))}
              className="rounded-xl border border-amber/30 px-6 py-3 font-display text-xs uppercase tracking-widest text-amber/80"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Shop
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate(() => openJournal('menu'))}
              className="rounded-xl border border-parchment-dark/40 px-6 py-3 font-display text-xs uppercase tracking-widest text-parchment/70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Journal
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setTutorialOpen(true)}
              className="rounded-xl border border-vial/40 px-6 py-3 font-display text-xs uppercase tracking-widest text-vial sm:col-span-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              How to Play
            </motion.button>
          </div>
        </motion.div>
      </main>
    </>
  )
}
