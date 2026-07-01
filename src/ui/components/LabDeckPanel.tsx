interface LabDeckPanelProps {
  deckCount: number
  discardCount: number
  onDraw: () => void
}

export function LabDeckPanel({ deckCount, discardCount, onDraw }: LabDeckPanelProps) {
  return (
    <aside className="flex w-[7.5rem] shrink-0 flex-col items-center overflow-hidden border-r border-amber/15 bg-[linear-gradient(180deg,rgba(22,16,12,0.95),rgba(14,10,8,0.98))] py-5">
      <p className="mb-5 font-display text-[9px] uppercase tracking-[0.35em] text-amber/50">
        Deck
      </p>

      <button
        type="button"
        onClick={onDraw}
        disabled={deckCount === 0}
        className="group flex w-full flex-col items-center px-3 disabled:cursor-not-allowed disabled:opacity-40"
        title={deckCount > 0 ? 'Draw a card' : 'Deck empty'}
      >
        <div className="relative flex h-[5.25rem] w-[4rem] items-center justify-center rounded-lg border-2 border-amber/45 bg-[linear-gradient(160deg,#3d2b1f,#1a1410)] shadow-lg transition group-enabled:hover:border-amber-light">
          <span className="font-display text-3xl text-amber-light">{deckCount}</span>
          <div className="pointer-events-none absolute right-0 top-2 h-[4.75rem] w-[3.5rem] translate-x-1 rounded-md border border-amber/15 bg-[#2a1f16]/90" />
        </div>
        <span className="mt-3 text-center text-[10px] uppercase leading-relaxed tracking-widest text-parchment/55 group-enabled:group-hover:text-amber-light/80">
          {deckCount > 0 ? 'Draw' : 'Empty'}
        </span>
      </button>

      <div className="mt-8 flex w-full flex-col items-center px-3">
        <div className="flex h-[4.5rem] w-[4.25rem] items-center justify-center rounded-lg border-2 border-parchment-dark/20 bg-[linear-gradient(160deg,#2a2018,#121010)] opacity-90 shadow-inner">
          <span className="font-display text-2xl text-parchment/45">{discardCount}</span>
        </div>
        <span className="mt-2 text-[10px] uppercase tracking-widest text-parchment/40">
          Discard
        </span>
      </div>
    </aside>
  )
}
