import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameCard } from '@/cards/types'
import { POTION_MAP } from '@/data'
import { Card } from '@/ui/components/Card'

interface AlchemyCircleProps {
  slots: [string | null, string | null]
  resultPotionId: string | null
  brewMessage: string | null
  brewOutcome: 'idle' | 'success' | 'fail'
  pendingBrew: { recipeId: string; potionId: string } | null
  selectedCardId: string | null
  isBrewing: boolean
  resolveCard: (id: string) => GameCard | undefined
  onRemoveFromSlot: (slotIndex: 0 | 1) => void
  onPlaceInSlot: (slotIndex: 0 | 1) => void
  onBrew: () => void
  onCraft: () => void
  onBottle: () => void
  onDismissMessage: () => void
}

function SlotDropZone({
  slotIndex,
  card,
  highlighted,
  onRemove,
  onPlace,
  registerRef,
}: {
  slotIndex: 0 | 1
  card: GameCard | null
  highlighted: boolean
  onRemove: () => void
  onPlace: () => void
  registerRef: (index: 0 | 1, node: HTMLDivElement | null) => void
}) {
  return (
    <div
      ref={(node) => registerRef(slotIndex, node)}
      data-slot-index={slotIndex}
      className={[
        'relative flex h-52 w-36 items-center justify-center transition',
        highlighted ? 'scale-105' : '',
      ].join(' ')}
    >
      <div
        className={[
          'absolute inset-0 rounded-full border-2 border-dashed bg-ink/30 shadow-[inset_0_0_24px_rgba(196,122,44,0.12)] transition',
          highlighted
            ? 'border-amber-light bg-amber/10'
            : 'border-amber/40',
        ].join(' ')}
      />
      {card ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10"
        >
          <button type="button" onClick={onRemove} className="block" title="Return to hand">
            <Card card={card} compact />
          </button>
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={onPlace}
          className="relative z-10 rounded-full px-4 py-2 font-display text-xs uppercase tracking-widest text-amber/50 hover:text-amber-light"
        >
          Ingredient {slotIndex + 1}
        </button>
      )}
    </div>
  )
}

export function AlchemyCircle({
  slots,
  resultPotionId,
  brewMessage,
  brewOutcome,
  pendingBrew,
  selectedCardId,
  isBrewing,
  resolveCard,
  onRemoveFromSlot,
  onPlaceInSlot,
  onBrew,
  onCraft,
  onBottle,
  onDismissMessage,
}: AlchemyCircleProps) {
  const slotRefs = useRef<(HTMLDivElement | null)[]>([null, null])

  const registerRef = (index: 0 | 1, node: HTMLDivElement | null) => {
    slotRefs.current[index] = node
  }

  const resultPotion = resultPotionId ? POTION_MAP.get(resultPotionId) : null
  const canBrew = slots[0] !== null && slots[1] !== null && !isBrewing

  return (
    <section className="relative flex flex-col items-center">
      <div className="relative mb-8 flex items-center justify-center">
        <motion.div
          className="pointer-events-none absolute h-80 w-80 rounded-full border border-amber/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="pointer-events-none absolute h-72 w-72 rounded-full border border-amber-light/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="pointer-events-none absolute h-64 w-64 rounded-full"
          animate={
            brewOutcome === 'success'
              ? { scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }
              : brewOutcome === 'fail'
                ? { scale: [1, 0.95, 1], opacity: [0.1, 0.3, 0.1] }
                : { opacity: 0.18 }
          }
          transition={{ duration: brewOutcome === 'idle' ? 0 : 0.8 }}
          style={{
            background:
              brewOutcome === 'success'
                ? 'radial-gradient(circle, rgba(61,90,62,0.5) 0%, transparent 70%)'
                : brewOutcome === 'fail'
                  ? 'radial-gradient(circle, rgba(180,60,40,0.4) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(196,122,44,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex items-center gap-8 rounded-3xl border border-amber/25 bg-[linear-gradient(180deg,rgba(42,32,24,0.95),rgba(26,20,16,0.98))] px-10 py-8 shadow-[0_0_60px_rgba(196,122,44,0.15)]">
          <SlotDropZone
            slotIndex={0}
            card={slots[0] ? resolveCard(slots[0]) ?? null : null}
            highlighted={selectedCardId !== null && slots[0] === null}
            onRemove={() => onRemoveFromSlot(0)}
            onPlace={() => onPlaceInSlot(0)}
            registerRef={registerRef}
          />

          <div className="flex flex-col items-center gap-3">
            <motion.button
              type="button"
              onClick={onBrew}
              disabled={!canBrew}
              className="rounded-full border-2 border-amber bg-amber/20 px-8 py-3 font-display text-sm uppercase tracking-[0.25em] text-amber-light shadow-[0_0_20px_rgba(196,122,44,0.3)] transition enabled:hover:bg-amber/35 disabled:cursor-not-allowed disabled:opacity-40"
              whileTap={canBrew ? { scale: 0.96 } : undefined}
              animate={
                isBrewing
                  ? { scale: [1, 1.06, 1], boxShadow: ['0 0 20px rgba(196,122,44,0.3)', '0 0 40px rgba(196,122,44,0.6)', '0 0 20px rgba(196,122,44,0.3)'] }
                  : {}
              }
              transition={{ duration: 0.5, repeat: isBrewing ? Infinity : 0 }}
            >
              {isBrewing ? 'Brewing…' : 'Brew'}
            </motion.button>

            <div
              data-slot-index="result"
              className="flex h-28 w-32 flex-col items-center justify-center rounded-xl border border-dashed border-vial/40 bg-ink/40 px-2 text-center"
            >
              <span className="mb-1 font-display text-[10px] uppercase tracking-widest text-vial/70">
                Result
              </span>
              <AnimatePresence mode="wait">
                {resultPotion ? (
                  <motion.p
                    key={resultPotion.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
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

          <SlotDropZone
            slotIndex={1}
            card={slots[1] ? resolveCard(slots[1]) ?? null : null}
            highlighted={selectedCardId !== null && slots[1] === null}
            onRemove={() => onRemoveFromSlot(1)}
            onPlace={() => onPlaceInSlot(1)}
            registerRef={registerRef}
          />
        </div>
      </div>

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
