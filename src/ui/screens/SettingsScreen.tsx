import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'

export function SettingsScreen() {
  const setPhase = useGameStore((state) => state.setPhase)
  const save = useGameStore((state) => state.save)
  const setPlayerName = useGameStore((state) => state.setPlayerName)
  const [nameInput, setNameInput] = useState(save.playerName)

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber/20 bg-ink/80 p-8"
      >
        <h1 className="mb-6 font-display text-2xl text-parchment">Settings</h1>

        <label className="mb-6 block">
          <span className="mb-2 block text-xs uppercase tracking-widest text-parchment/50">
            Player Name
          </span>
          <input
            type="text"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            className="w-full rounded-lg border border-parchment-dark/40 bg-parchment/10 px-4 py-2 text-parchment outline-none focus:border-amber"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setPlayerName(nameInput.trim() || 'Alchemist')
              setPhase('menu')
            }}
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
