interface DeckStatsProps {
  deckCount: number
  discardCount: number
  onDraw: () => void
}

export function DeckStats({ deckCount, discardCount, onDraw }: DeckStatsProps) {
  return (
    <div className="flex items-center justify-center gap-8">
      <button
        type="button"
        onClick={onDraw}
        disabled={deckCount === 0}
        className="group flex flex-col items-center disabled:cursor-not-allowed disabled:opacity-40"
      >
        <div className="flex h-20 w-14 items-center justify-center rounded-lg border-2 border-amber/40 bg-[linear-gradient(145deg,#3d2b1f,#1a1410)] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition group-enabled:hover:border-amber-light">
          <span className="font-display text-2xl text-amber-light">{deckCount}</span>
        </div>
        <span className="mt-2 text-[10px] uppercase tracking-widest text-parchment/50">
          Deck {deckCount > 0 ? '· Click to Draw' : ''}
        </span>
      </button>

      <div className="flex flex-col items-center">
        <div className="flex h-20 w-14 items-center justify-center rounded-lg border-2 border-parchment-dark/30 bg-[linear-gradient(145deg,#2a2018,#141010)] opacity-80 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="font-display text-2xl text-parchment/60">{discardCount}</span>
        </div>
        <span className="mt-2 text-[10px] uppercase tracking-widest text-parchment/50">
          Discard
        </span>
      </div>
    </div>
  )
}
