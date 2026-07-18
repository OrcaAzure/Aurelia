import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'

export function SettingsScreen() {
  const setPhase = useGameStore((state) => state.setPhase)
  const save = useGameStore((state) => state.save)
  const setPlayerName = useGameStore((state) => state.setPlayerName)
  const resetTutorials = useGameStore((state) => state.resetTutorials)
  const resetGameProgress = useGameStore((state) => state.resetGameProgress)
  const [nameInput, setNameInput] = useState(save.playerName)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleSave = () => {
    setPlayerName(nameInput.trim() || 'Alchemist')
    setPhase('menu')
  }

  const handleResetProgress = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    resetGameProgress()
    setConfirmReset(false)
    setPhase('menu')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber/20 bg-ink/80 p-8 backdrop-blur-sm"
      >
        <h1 className="mb-2 font-display text-2xl text-parchment">Settings</h1>
        <p className="mb-6 text-xs text-parchment/45">Aurelia playtest build</p>

        <label className="mb-6 block">
          <span className="mb-2 block text-xs uppercase tracking-widest text-parchment/50">
            Player Name
          </span>
          <input
            type="text"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            maxLength={24}
            className="w-full rounded-lg border border-parchment-dark/40 bg-parchment/10 px-4 py-2 text-parchment outline-none focus:border-amber"
          />
        </label>

        <div className="mb-6 space-y-3 border-t border-parchment/10 pt-6">
          <p className="text-xs uppercase tracking-widest text-parchment/45">Playtest tools</p>
          <button
            type="button"
            onClick={() => {
              resetTutorials()
              setPhase('menu')
            }}
            className="w-full rounded-lg border border-vial/35 bg-vial/10 py-2.5 font-display text-xs uppercase tracking-widest text-vial"
          >
            Replay tutorials
          </button>
          <button
            type="button"
            onClick={handleResetProgress}
            className={`w-full rounded-lg border py-2.5 font-display text-xs uppercase tracking-widest ${
              confirmReset
                ? 'border-red-500/60 bg-red-950/40 text-red-300'
                : 'border-parchment-dark/40 text-parchment/55 hover:text-parchment'
            }`}
          >
            {confirmReset ? 'Confirm reset — erase all progress' : 'Reset all progress'}
          </button>
          {confirmReset && (
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="w-full text-[10px] uppercase tracking-widest text-parchment/40 hover:text-parchment/70"
            >
              Cancel reset
            </button>
          )}
        </div>

        <div className="mb-6 rounded-lg border border-parchment/10 bg-parchment/5 px-4 py-3 text-[11px] leading-relaxed text-parchment/50">
          <p>
            Progress saves automatically in your browser (
            {save.discoveredRecipeIds.length} recipes, {save.gold} gold, {save.reagents}{' '}
            reagents).
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg border border-amber bg-amber/15 py-2 font-display text-xs uppercase tracking-widest text-amber-light"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setPhase('menu')}
            className="flex-1 rounded-lg border border-parchment-dark/40 py-2 font-display text-xs uppercase tracking-widest text-parchment/60"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </main>
  )
}
