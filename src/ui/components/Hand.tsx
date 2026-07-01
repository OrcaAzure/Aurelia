import type { GameCard } from '@/cards/types'
import { isIngredientDeckId, isPotionDeckId, isTechniqueDeckId } from '@/cards/types'
import { isResidueCard } from '@/engine/deckUtils'
import { DraggableCard } from '@/ui/components/DraggableCard'
import { Card } from '@/ui/components/Card'
import { shouldPlaceOnCanvas } from '@/lib/dragDrop'

interface HandProps {
  cards: GameCard[]
  cardIds: string[]
  selectedCardId: string | null
  onSelectCard: (cardId: string) => void
  onDeskDrop: (cardId: string, point: { x: number; y: number }) => void
  onUsePotion: (cardId: string) => void
  onUseTechnique: (cardId: string) => void
  onDiscard: (cardId: string) => void
}

export function Hand({
  cards,
  cardIds,
  selectedCardId,
  onSelectCard,
  onDeskDrop,
  onUsePotion,
  onUseTechnique,
  onDiscard,
}: HandProps) {
  return (
    <section className="w-full">
      <h2 className="mb-1 text-center font-display text-sm uppercase tracking-[0.3em] text-amber/80">
        Your Hand
      </h2>
      <p className="mb-4 text-center text-xs text-parchment/45">
        Drag cards anywhere on screen · Mess them up · Stack two to fuse
      </p>
      <div className="flex min-h-[220px] flex-wrap items-end justify-center gap-4 overflow-visible rounded-2xl border border-amber/15 bg-[linear-gradient(180deg,rgba(30,22,16,0.9),rgba(20,15,10,0.95))] px-6 py-6 shadow-[inset_0_4px_24px_rgba(0,0,0,0.4)]">
        {cards.length === 0 ? (
          <p className="text-sm text-parchment/40">Your hand is empty.</p>
        ) : (
          cards.map((card, index) => {
            const deckId = cardIds[index]
            if (isIngredientDeckId(deckId) && !isResidueCard(deckId)) {
              return (
                <DraggableCard
                  key={deckId}
                  deckId={deckId}
                  card={card}
                  selected={selectedCardId === deckId}
                  onSelect={() => onSelectCard(deckId)}
                  onDrop={(cardId, point) => {
                    if (shouldPlaceOnCanvas(point)) {
                      onDeskDrop(cardId, point)
                    }
                  }}
                />
              )
            }

            if (isResidueCard(deckId)) {
              return (
                <div key={deckId} className="flex flex-col items-center gap-2">
                  <Card card={card} selected={selectedCardId === deckId} />
                  <button
                    type="button"
                    onClick={() => onDiscard(deckId)}
                    className="rounded-full border border-red-900/50 bg-red-950/30 px-4 py-1 text-[10px] uppercase tracking-widest text-red-300/80"
                  >
                    Discard
                  </button>
                </div>
              )
            }

            const isPotion = isPotionDeckId(deckId)
            const isTechnique = isTechniqueDeckId(deckId)

            return (
              <div key={deckId} className="flex flex-col items-center gap-2">
                <Card card={card} compact flippable />
                <button
                  type="button"
                  onClick={() => {
                    if (isPotion) onUsePotion(deckId)
                    if (isTechnique) onUseTechnique(deckId)
                  }}
                  className={`rounded-full border px-4 py-1 text-[10px] uppercase tracking-widest ${
                    isTechnique
                      ? 'border-amber/40 bg-amber/10 text-amber-light'
                      : 'border-vial/40 bg-vial/10 text-vial'
                  }`}
                >
                  Use
                </button>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
