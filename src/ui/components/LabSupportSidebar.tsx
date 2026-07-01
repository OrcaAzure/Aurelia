import { useState } from 'react'
import { isTechniqueDeckId, type GameCard } from '@/cards/types'
import { isResidueCard } from '@/engine/deckUtils'
import { Card } from '@/ui/components/Card'

interface LabSupportSidebarProps {
  entries: { id: string; card: GameCard }[]
  onUseTechnique: (id: string) => void
  onDiscard: (id: string) => void
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
  onUseTechnique,
  onDiscard,
}: LabSupportSidebarProps) {
  const techniques = entries.filter(({ id }) => isTechniqueDeckId(id))
  const residue = entries.filter(({ id }) => isResidueCard(id))
  const hasContent = techniques.length + residue.length > 0

  return (
    <aside className="flex w-[8.75rem] shrink-0 flex-col overflow-hidden border-l border-amber/15 bg-[linear-gradient(180deg,rgba(22,16,12,0.98),rgba(14,10,8,1))]">
      <div className="shrink-0 border-b border-amber/10 px-3 py-3">
        <p className="font-display text-[9px] uppercase tracking-[0.32em] text-amber/55">
          Rack
        </p>
        <p className="mt-0.5 text-[9px] leading-relaxed text-parchment/38">
          Techniques & residue
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-2.5 py-3">
        {!hasContent && (
          <p className="px-1 text-center text-[10px] leading-relaxed text-parchment/35">
            Brew to fill your rack. Potions scatter on the desk.
          </p>
        )}

        {techniques.length > 0 && (
          <section>
            <p className="mb-2 px-0.5 text-[8px] uppercase tracking-widest text-amber/55">
              Techniques
            </p>
            <div className="flex flex-col items-center gap-3">
              {techniques.map(({ id, card }) => (
                <SidebarCardSlot
                  key={id}
                  card={card}
                  useLabel="Use"
                  useClass="border-amber/40 bg-amber/10 text-amber-light"
                  onUse={() => onUseTechnique(id)}
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
              {residue.map(({ id, card }) => (
                <SidebarCardSlot
                  key={id}
                  card={card}
                  useLabel="Discard"
                  useClass=""
                  onDiscard={() => onDiscard(id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}
