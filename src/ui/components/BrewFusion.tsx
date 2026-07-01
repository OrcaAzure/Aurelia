import { AnimatePresence, motion } from 'framer-motion'
import type { GameCard } from '@/cards/types'
import { POTION_MAP } from '@/data'
import { Card } from '@/ui/components/Card'
import {
  DraggableCardBody,
  DraggableCardContainer,
} from '@/ui/components/DraggableCardBody'

interface BrewFusionProps {
  slots: [string | null, string | null]
  resultPotionId: string | null
  brewMessage: string | null
  brewOutcome: 'idle' | 'success' | 'fail'
  pendingBrew: { recipeId: string; potionId: string } | null
  selectedCardId: string | null
  isBrewing: boolean
  isMerging: boolean
  resolveCard: (id: string) => GameCard | undefined
  onRemoveFromSlot: (slotIndex: 0 | 1) => void
  onPlaceSelected: () => void
  onCraft: () => void
  onBottle: () => void
  onDismissMessage: () => void
}

export function BrewFusion({
  slots,
  resultPotionId,
  brewMessage,
  brewOutcome,
  pendingBrew,
  selectedCardId,
  isBrewing,
  isMerging,
  resolveCard,
  onRemoveFromSlot,
  onPlaceSelected,
  onCraft,
  onBottle,
  onDismissMessage,
}: BrewFusionProps) {
  const cardA = slots[0] ? resolveCard(slots[0]) ?? null : null
  const cardB = slots[1] ? resolveCard(slots[1]) ?? null : null
  const resultPotion = resultPotionId ? POTION_MAP.get(resultPotionId) : null
  const canPlace = selectedCardId !== null && !isBrewing && !isMerging
  const stackCount = (cardA ? 1 : 0) + (cardB ? 1 : 0)
  const fusing = isMerging || isBrewing

  return (
    <section className="relative flex flex-col items-center">
      <DraggableCardContainer className="relative mb-8">
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber/25"
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={
            brewOutcome === 'success'
              ? { scale: [1, 1.2, 1], opacity: [0.15, 0.45, 0.15] }
              : brewOutcome === 'fail'
                ? { scale: [1, 0.94, 1], opacity: [0.1, 0.35, 0.1] }
                : fusing
                  ? { scale: [1, 1.08, 1], opacity: [0.2, 0.5, 0.2] }
                  : { opacity: 0.14 }
          }
          transition={{ duration: fusing ? 0.6 : 0.8, repeat: fusing ? Infinity : 0 }}
          style={{
            background:
              brewOutcome === 'success'
                ? 'radial-gradient(circle, rgba(61,90,62,0.5) 0%, transparent 70%)'
                : brewOutcome === 'fail'
                  ? 'radial-gradient(circle, rgba(180,60,40,0.4) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(196,122,44,0.22) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 rounded-3xl border border-amber/25 bg-[linear-gradient(180deg,rgba(42,32,24,0.95),rgba(26,20,16,0.98))] px-12 py-10 shadow-[0_0_60px_rgba(196,122,44,0.15)]">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-amber/60">
            Fusion Circle
          </p>

          <button
            type="button"
            data-fusion-zone
            onClick={() => {
              if (canPlace && stackCount < 2) onPlaceSelected()
            }}
            className={[
              'group relative flex h-60 w-44 items-center justify-center rounded-2xl border-2 border-dashed transition',
              canPlace && stackCount < 2
                ? 'border-amber/50 bg-amber/5 hover:border-amber-light hover:bg-amber/10'
                : 'border-amber/30 bg-ink/30',
            ].join(' ')}
          >
            <AnimatePresence mode="popLayout">
              {!cardA && !cardB && (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 text-center text-xs leading-relaxed text-parchment/40"
                >
                  Drag an ingredient here
                  <span className="mt-2 block text-[10px] text-amber/45">
                    Stack a second on top to fuse
                  </span>
                </motion.p>
              )}

              {cardA && (
                <motion.div
                  key={`base-${slots[0]}`}
                  className="absolute z-10"
                  initial={{ scale: 0.7, opacity: 0, rotate: -14 }}
                  animate={{
                    scale: fusing ? 0.9 : 1,
                    opacity: fusing && isBrewing ? 0.35 : 1,
                    rotate: fusing ? 0 : -8,
                    y: fusing ? 6 : 10,
                    x: fusing ? 0 : -4,
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!fusing) onRemoveFromSlot(0)
                    }}
                    title="Return to hand"
                  >
                    <DraggableCardBody>
                      <Card card={cardA} compact motionless />
                    </DraggableCardBody>
                  </button>
                </motion.div>
              )}

              {cardB && (
                <motion.div
                  key={`top-${slots[1]}`}
                  className="absolute z-20"
                  initial={{ scale: 1.15, opacity: 0, y: -48, rotate: 16 }}
                  animate={{
                    scale: fusing ? 0.85 : 1,
                    opacity: fusing ? 0 : 1,
                    y: fusing ? 4 : -32,
                    rotate: fusing ? 0 : 10,
                    x: fusing ? 0 : 6,
                  }}
                  exit={{ scale: 0.5, opacity: 0, y: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!fusing) onRemoveFromSlot(1)
                    }}
                    title="Return to hand"
                  >
                    <DraggableCardBody>
                      <Card card={cardB} compact motionless />
                    </DraggableCardBody>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isMerging && (
                <motion.div
                  key="merge-burst"
                  className="pointer-events-none absolute inset-0 z-30 rounded-2xl"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{
                    opacity: [0, 0.85, 0],
                    scale: [0.6, 1.15, 1.4],
                  }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  style={{
                    background:
                      'radial-gradient(circle, rgba(232,168,74,0.55) 0%, transparent 70%)',
                  }}
                />
              )}
            </AnimatePresence>

            {cardA && !cardB && !fusing && (
              <motion.p
                className="pointer-events-none absolute -bottom-8 left-1/2 w-48 -translate-x-1/2 text-center text-[10px] uppercase tracking-widest text-amber/55"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Drop another on top
              </motion.p>
            )}

            {fusing && (
              <motion.p
                className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 font-display text-xs uppercase tracking-[0.3em] text-amber-light"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {isMerging ? 'Fusing…' : 'Brewing…'}
              </motion.p>
            )}
          </button>

          <div className="flex h-28 w-36 flex-col items-center justify-center rounded-xl border border-dashed border-vial/40 bg-ink/40 px-2 text-center">
            <span className="mb-1 font-display text-[10px] uppercase tracking-widest text-vial/70">
              Result
            </span>
            <AnimatePresence mode="wait">
              {resultPotion ? (
                <motion.p
                  key={resultPotion.id}
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-display text-sm text-parchment"
                >
                  {resultPotion.name}
                </motion.p>
              ) : (
                <motion.span
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-parchment/40"
                >
                  —
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DraggableCardContainer>

      <AnimatePresence>
        {pendingBrew && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex flex-wrap items-center justify-center gap-3"
          >
            <p className="text-sm text-parchment/80">
              {POTION_MAP.get(pendingBrew.potionId)?.name} is ready —
            </p>
            <button
              type="button"
              onClick={onCraft}
              className="rounded-lg border border-moss bg-moss/15 px-5 py-2 text-xs uppercase tracking-widest text-moss"
            >
              Craft Card
            </button>
            <button
              type="button"
              onClick={onBottle}
              className="rounded-lg border border-amber/40 px-5 py-2 text-xs uppercase tracking-widest text-amber-light"
            >
              Bottle ({POTION_MAP.get(pendingBrew.potionId)?.bottleValue ?? 0}g + 1 reagent)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {brewMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={[
              'flex items-center gap-4 rounded-lg border px-6 py-3',
              brewOutcome === 'success'
                ? 'border-moss/40 bg-moss/10'
                : brewOutcome === 'fail'
                  ? 'border-red-900/40 bg-red-950/30'
                  : 'border-amber/30 bg-ink/80',
            ].join(' ')}
          >
            <p className="text-sm text-parchment/90">{brewMessage}</p>
            <button
              type="button"
              onClick={onDismissMessage}
              className="text-xs uppercase tracking-widest text-amber-light hover:text-amber"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
