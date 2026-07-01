import { AnimatePresence, motion } from 'framer-motion'
import type { RefObject } from 'react'
import type { GameCard } from '@/cards/types'
import { POTION_MAP } from '@/data'
import {
  DESK_CARD_HEIGHT,
  DESK_CARD_WIDTH,
  type CardTransform,
} from '@/lib/dragDrop'
import { DeskCard } from '@/ui/components/DeskCard'
import { Card } from '@/ui/components/Card'
import { DraggableCardContainer } from '@/ui/components/DraggableCardBody'

interface LabDeskProps {
  canvasRef: RefObject<HTMLDivElement | null>
  tableCardIds: string[]
  cardTransforms: Record<string, CardTransform>
  zOrder: Record<string, number>
  mergingPair: [string, string] | null
  mergeTransforms: Record<string, CardTransform>
  isBrewing: boolean
  isMerging: boolean
  resultPotionId: string | null
  brewMessage: string | null
  brewOutcome: 'idle' | 'success' | 'fail'
  pendingBrew: { recipeId: string; potionId: string } | null
  resolveCard: (id: string) => GameCard | undefined
  resolveCanvasDeckId: (instanceId: string) => string | undefined
  onFocusCard: (cardId: string) => void
  onMoveCard: (cardId: string, transform: CardTransform) => void
  onFuse: (cardId: string, targetId: string) => void
  onCheckOverlap: (center: { x: number; y: number }, excludeId: string) => string | null
  onUsePotion: (canvasId: string) => void
  onReturnPotionToRack: (canvasId: string) => void
  onCraft: () => void
  onBottle: () => void
  onDismissMessage: () => void
}

export function LabDesk({
  canvasRef,
  tableCardIds,
  cardTransforms,
  zOrder,
  mergingPair,
  mergeTransforms,
  isBrewing,
  isMerging,
  resultPotionId,
  brewMessage,
  brewOutcome,
  pendingBrew,
  resolveCard,
  resolveCanvasDeckId,
  onFocusCard,
  onMoveCard,
  onFuse,
  onCheckOverlap,
  onUsePotion,
  onReturnPotionToRack,
  onCraft,
  onBottle,
  onDismissMessage,
}: LabDeskProps) {
  const resultPotion = resultPotionId ? POTION_MAP.get(resultPotionId) : null
  const fusing = isMerging || isBrewing

  return (
    <DraggableCardContainer className="relative h-full w-full">
      <div
        ref={canvasRef}
        data-lab-canvas
        className="absolute inset-0 touch-none overflow-visible"
      >
        {tableCardIds.map((instanceId, index) => {
          const deckId = resolveCanvasDeckId(instanceId)
          const card = deckId ? resolveCard(deckId) : undefined
          const transform = cardTransforms[instanceId]
          if (!card || !deckId || !transform) return null

          return (
            <DeskCard
              key={instanceId}
              cardId={instanceId}
              card={card}
              transform={transform}
              zIndex={zOrder[instanceId] ?? 10 + index}
              disabled={fusing}
              onFocus={() => onFocusCard(instanceId)}
              onMove={(next) => onMoveCard(instanceId, next)}
              onFuse={(targetId) => onFuse(instanceId, targetId)}
              onCheckOverlap={onCheckOverlap}
              onUse={card.category === 'potion' ? () => onUsePotion(instanceId) : undefined}
              canReturnToRack={card.category === 'potion'}
              onReturnToRack={
                card.category === 'potion'
                  ? () => onReturnPotionToRack(instanceId)
                  : undefined
              }
            />
          )
        })}

        <AnimatePresence>
          {isMerging && mergingPair && (
            <motion.div
              key="merge-overlay"
              className="pointer-events-none absolute inset-0 z-[150]"
            >
              {mergingPair.map((instanceId, i) => {
                const deckId = resolveCanvasDeckId(instanceId)
                const card = deckId ? resolveCard(deckId) : undefined
                const pos = mergeTransforms[instanceId]
                if (!card || !pos) return null
                const other = mergeTransforms[mergingPair[1 - i]]
                const target = other
                  ? { x: (pos.x + other.x) / 2, y: (pos.y + other.y) / 2 }
                  : pos

                return (
                  <motion.div
                    key={instanceId}
                    className="absolute"
                    style={{ width: DESK_CARD_WIDTH }}
                    initial={{
                      x: pos.x,
                      y: pos.y,
                      rotate: pos.rotate,
                      scale: 1,
                      opacity: 1,
                    }}
                    animate={{
                      x: target.x,
                      y: target.y,
                      rotate: 0,
                      scale: 0.75,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card card={card} motionless compact />
                  </motion.div>
                )
              })}
              <motion.div
                className="absolute rounded-full"
                style={{
                  left:
                    mergingPair[0] && mergeTransforms[mergingPair[0]]
                      ? (mergeTransforms[mergingPair[0]].x
                        + (mergeTransforms[mergingPair[1]]?.x
                          ?? mergeTransforms[mergingPair[0]].x))
                        / 2
                        + DESK_CARD_WIDTH / 2
                      : '50%',
                  top:
                    mergingPair[0] && mergeTransforms[mergingPair[0]]
                      ? (mergeTransforms[mergingPair[0]].y
                        + (mergeTransforms[mergingPair[1]]?.y
                          ?? mergeTransforms[mergingPair[0]].y))
                        / 2
                        + DESK_CARD_HEIGHT / 2
                      : '50%',
                  width: 120,
                  height: 120,
                  marginLeft: -60,
                  marginTop: -60,
                }}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 1.4, 2], opacity: [0, 0.9, 0] }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(232,168,74,0.65) 0%, transparent 70%)',
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute bottom-16 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="flex min-h-[3.5rem] min-w-[8rem] flex-col items-center justify-center rounded-lg border border-vial/20 bg-ink/55 px-4 py-2 text-center backdrop-blur-sm">
          <span className="mb-0.5 font-display text-[9px] uppercase tracking-widest text-vial/55">
            Result
          </span>
          <AnimatePresence mode="wait">
            {resultPotion ? (
              <motion.p
                key={resultPotion.id}
                initial={{ opacity: 0, y: 4 }}
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
                className="text-xs text-parchment/35"
              >
                —
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {fusing && (
          <motion.p
            className="font-display text-xs uppercase tracking-[0.3em] text-amber-light"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            {isMerging ? 'Fusing…' : 'Brewing…'}
          </motion.p>
        )}
      </div>

      <div className="pointer-events-auto absolute bottom-4 left-1/2 z-[80] flex w-[min(100%,32rem)] -translate-x-1/2 flex-col items-center gap-2 px-3">
        <AnimatePresence>
          {pendingBrew && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex max-w-full flex-col items-stretch gap-2 rounded-xl border border-amber/20 bg-ink/90 px-4 py-3 text-center shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:text-left"
            >
              <p className="text-sm text-parchment/80">
                {POTION_MAP.get(pendingBrew.potionId)?.name} is ready —
              </p>
              <button
                type="button"
                onClick={onCraft}
                className="rounded-lg border border-moss bg-moss/15 px-4 py-1.5 text-xs uppercase tracking-widest text-moss"
              >
                Craft Card
              </button>
              <button
                type="button"
                onClick={onBottle}
                className="rounded-lg border border-amber/40 px-4 py-1.5 text-xs uppercase tracking-widest text-amber-light"
              >
                Bottle ({POTION_MAP.get(pendingBrew.potionId)?.bottleValue ?? 0}g)
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
                'flex max-w-lg items-center gap-4 rounded-lg border px-5 py-2.5 backdrop-blur-md',
                brewOutcome === 'success'
                  ? 'border-moss/40 bg-moss/15'
                  : brewOutcome === 'fail'
                    ? 'border-red-900/40 bg-red-950/40'
                    : 'border-amber/30 bg-ink/85',
              ].join(' ')}
            >
            <p className="flex-1 text-left text-sm leading-relaxed text-parchment/90">{brewMessage}</p>
              <button
                type="button"
                onClick={onDismissMessage}
                className="shrink-0 text-xs uppercase tracking-widest text-amber-light hover:text-amber"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DraggableCardContainer>
  )
}
