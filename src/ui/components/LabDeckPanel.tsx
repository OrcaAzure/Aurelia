import type { IngredientAvailability } from '@/lib/labAvailability'

interface LabDeckPanelProps {
  deckCount: number
  discardCount: number
  canDraw: boolean
  deskFull: boolean
  availability: IngredientAvailability[]
  onDraw: () => void
}

export function LabDeckPanel({
  deckCount,
  discardCount,
  canDraw,
  deskFull,
  availability,
  onDraw,
}: LabDeckPanelProps) {
  const drawTitle = !canDraw
    ? 'Deck and discard are empty'
    : deskFull
      ? 'Desk full — brew ingredients first'
      : 'Draw a card'

  return (
    <aside
      data-lab-tutorial="deck"
      className="flex w-[8.25rem] shrink-0 flex-col items-center overflow-hidden border-r border-amber/15 bg-[linear-gradient(180deg,rgba(22,16,12,0.95),rgba(14,10,8,0.98))] py-4"
    >
      <p className="mb-4 font-display text-[9px] uppercase tracking-[0.35em] text-amber/50">
        Deck
      </p>

      <button
        type="button"
        onClick={onDraw}
        disabled={!canDraw || deskFull}
        className="group flex w-full flex-col items-center px-2 disabled:cursor-not-allowed disabled:opacity-40"
        title={drawTitle}
      >
        <div className="relative flex h-[5.25rem] w-[4rem] items-center justify-center rounded-lg border-2 border-amber/45 bg-[linear-gradient(160deg,#3d2b1f,#1a1410)] shadow-lg transition group-enabled:hover:border-amber-light">
          <span className="font-display text-3xl text-amber-light">{deckCount}</span>
          <div className="pointer-events-none absolute right-0 top-2 h-[4.75rem] w-[3.5rem] translate-x-1 rounded-md border border-amber/15 bg-[#2a1f16]/90" />
        </div>
        <span className="mt-2 text-center text-[10px] uppercase leading-relaxed tracking-widest text-parchment/55 group-enabled:group-hover:text-amber-light/80">
          {canDraw ? (deskFull ? 'Desk full' : 'Draw') : 'Empty'}
        </span>
      </button>

      <div className="mt-4 flex w-full min-h-0 flex-1 flex-col px-2">
        <p className="mb-2 text-center text-[8px] uppercase tracking-widest text-parchment/35">
          Available
        </p>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {availability.length === 0 ? (
            <p className="text-center text-[9px] leading-relaxed text-parchment/30">
              No ingredients tracked
            </p>
          ) : (
            availability.map((entry) => (
              <div
                key={entry.deckId}
                className="rounded-md border border-amber/10 bg-ink/40 px-2 py-1.5"
              >
                <p className="text-[9px] leading-relaxed text-parchment/55">
                  <span className="capitalize text-parchment/75">{entry.name}</span>
                  <span className="text-parchment/30"> – </span>
                  <span className="tabular-nums text-amber-light/90">{entry.held}</span>
                  <span className="text-parchment/30">/</span>
                  <span className="tabular-nums">{entry.inDeck}</span>
                  <span className="text-parchment/35"> available</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-3 flex w-full flex-col items-center px-2">
        <div className="flex h-[3.5rem] w-[3.75rem] items-center justify-center rounded-lg border-2 border-parchment-dark/20 bg-[linear-gradient(160deg,#2a2018,#121010)] opacity-90 shadow-inner">
          <span className="font-display text-xl text-parchment/45">{discardCount}</span>
        </div>
        <span className="mt-1.5 text-[9px] uppercase tracking-widest text-parchment/40">
          Discard
        </span>
      </div>
    </aside>
  )
}
