import { motion } from 'framer-motion'

interface LaboratoryTopBarProps {
  playerName: string
  rank: string
  gold: number
  reagents: number
  brewCost: number
  onOpenJournal: () => void
  onOpenSettings: () => void
  onOpenGuide?: () => void
  onBack: () => void
}

export function LaboratoryTopBar({
  playerName,
  rank,
  gold,
  reagents,
  brewCost,
  onOpenJournal,
  onOpenSettings,
  onOpenGuide,
  onBack,
}: LaboratoryTopBarProps) {
  return (
    <header
      data-lab-tutorial="topbar"
      className="relative z-50 flex flex-wrap items-center justify-between gap-4 border-b border-amber/15 bg-ink/50 px-6 py-3 backdrop-blur-md"
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="font-display text-xs uppercase tracking-widest text-parchment/50 hover:text-parchment"
        >
          ← Menu
        </button>
        <div>
          <p className="font-display text-xs uppercase tracking-[0.35em] text-amber/60">
            {rank}
          </p>
          <h1 className="font-display text-xl text-parchment">{playerName}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-parchment/60">
        <span>{gold} gold</span>
        <span className={reagents < brewCost ? 'text-red-400' : 'text-moss'}>
          {reagents} reagents
        </span>
      </div>

      <nav className="flex gap-3">
        {onOpenGuide && (
          <motion.button
            type="button"
            onClick={onOpenGuide}
            className="rounded-lg border border-vial/35 bg-vial/10 px-4 py-2 font-display text-xs uppercase tracking-widest text-vial"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            title="Laboratory guide"
          >
            ?
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={onOpenJournal}
          data-lab-tutorial="journal"
          className="rounded-lg border border-amber/30 bg-amber/10 px-5 py-2 font-display text-xs uppercase tracking-widest text-amber-light"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Journal
        </motion.button>
        <motion.button
          type="button"
          onClick={onOpenSettings}
          className="rounded-lg border border-parchment-dark/40 px-5 py-2 font-display text-xs uppercase tracking-widest text-parchment/70"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Settings
        </motion.button>
      </nav>
    </header>
  )
}
