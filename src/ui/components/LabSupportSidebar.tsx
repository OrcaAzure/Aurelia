import { useState } from 'react'
import { isTechniqueDeckId, type GameCard } from '@/cards/types'
import { isResidueCard } from '@/engine/deckUtils'
import type { RackPotionEntry } from '@/ui/components/LabSupportTray'
import { Card } from '@/ui/components/Card'
import { RackDraggablePotion } from '@/ui/components/RackDraggablePotion'

interface LabSupportSidebarProps {
  entries: { deckId: string; instanceId: string; card: GameCard }[]
  rackPotions: RackPotionEntry[]
  resolveCard: (id: string) => GameCard | undefined
  onPlacePotionOnDesk: (instanceId: string, point: { x: number; y: number }) => void
  onUseTechnique: (instanceId: string) => void
  onDiscard: (instanceId: string) => void
}

function SidebarCardSlot({
  card,
  onUse,
  onDiscard,
  useLabel,
  useClass,
}: {
  card: GameCard
  onUse?: () => void
  onDiscard?: () => void
  useLabel: string
  useClass: string
}) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="w-[7.25rem] shrink-0">
        <Card
          card={card}
          rack
          motionless
          flippable
          flipped={flipped}
          onFlipChange={setFlipped}
          showFlipControl
        />
      </div>
      {onDiscard ? (
        <button
          type="button"
          onClick={onDiscard}
          className="w-[7.25rem] rounded-md border border-red-900/45 bg-red-950/35 px-2 py-1.5 text-[9px] uppercase tracking-widest text-red-300/85 hover:bg-red-950/55"
        >
          Discard
        </button>
      ) : (
        <button
          type="button"
          onClick={onUse}
          className={`w-[7.25rem] rounded-md border px-2 py-1.5 text-[9px] uppercase tracking-widest transition hover:brightness-110 ${useClass}`}
        >
          {useLabel}
        </button>
      )}
    </div>
  )
}

export function LabSupportSidebar({
  entries,
  rackPotions,
  resolveCard,
  onPlacePotionOnDesk,
  onUseTechnique,
  onDiscard,
}: LabSupportSidebarProps) {
  const techniques = entries.filter(({ deckId }) => isTechniqueDeckId(deckId))
  const residue = entries.filter(({ deckId }) => isResidueCard(deckId))
  const hasContent = rackPotions.length + techniques.length + residue.length > 0

  return (
    <aside
      data-lab-rack
      className="flex w-[8.75rem] shrink-0 flex-col overflow-hidden border-l border-amber/15 bg-[linear-gradient(180deg,rgba(22,16,12,0.98),rgba(14,10,8,1))]"
    >
      <div className="shrink-0 border-b border-amber/10 px-3 py-3">
        <p className="font-display text-[9px] uppercase tracking-[0.32em] text-amber/55">
          Rack
        </p>
        <p className="mt-0.5 text-[9px] leading-relaxed text-parchment/38">
          Drag potions to the desk
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-2.5 py-3">
        {!hasContent && (
          <p className="px-1 text-center text-[10px] leading-relaxed text-parchment/35">
            Brew to fill your rack.
          </p>
        )}

        {rackPotions.length > 0 && (
          <section>
            <p className="mb-2 px-0.5 text-[8px] uppercase tracking-widest text-vial/65">
              Potions
            </p>
            <div className="flex flex-col items-center gap-3">
              {rackPotions.map(({ instanceId, deckId }) => {
                const card = resolveCard(deckId)
                if (!card) return null
                return (
                  <div key={instanceId} className="w-[7.25rem] shrink-0">
                    <RackDraggablePotion
                      instanceId={instanceId}
                      card={card}
                      onPlaceOnDesk={onPlacePotionOnDesk}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {techniques.length > 0 && (
          <section>
            <p className="mb-2 px-0.5 text-[8px] uppercase tracking-widest text-amber/55">
              Techniques
            </p>
            <div className="flex flex-col items-center gap-3">
              {techniques.map(({ instanceId, card }) => (
                <SidebarCardSlot
                  key={instanceId}
                  card={card}
                  useLabel="Use"
                  useClass="border-amber/40 bg-amber/10 text-amber-light"
                  onUse={() => onUseTechnique(instanceId)}
                />
              ))}
            </div>
          </section>
        )}

        {residue.length > 0 && (
          <section>
            <p className="mb-2 px-0.5 text-[8px] uppercase tracking-widest text-red-400/55">
              Residue
            </p>
            <div className="flex flex-col items-center gap-3">
              {residue.map(({ instanceId, card }) => (
                <SidebarCardSlot
                  key={instanceId}
                  card={card}
                  useLabel="Discard"
                  useClass=""
                  onDiscard={() => onDiscard(instanceId)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}
