import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadGameSave } from '@/lib/persistence'

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Aurelia',
    body: 'You are an alchemist building a deck of ingredients and support cards. Enter the Laboratory to brew potions, explore for new materials, and fill your journal with discoveries.',
  },
  {
    title: 'Your Deck',
    body: 'Build a deck in the Deckbuilder: up to 20 ingredient cards and 10 support cards (potions + techniques). The lab draws from this deck each visit.',
  },
  {
    title: 'Explore & Shop',
    body: 'Visit Exploration to find new ingredients (3 runs per day). The Shop sells rare reagents and ingredients for gold. Use Prepare to upgrade materials.',
  },
  {
    title: 'Orders & Challenges',
    body: 'Complete daily Alchemist\'s Orders and the Daily Challenge for bonus gold and XP. Check the main menu for progress.',
  },
  {
    title: 'Enter the Laboratory',
    body: 'The full lab tutorial walks you through dragging ingredients, brewing, crafting, catalyst combos, and more — it starts automatically the first time you enter.',
  },
] as const

interface TutorialModalProps {
  open: boolean
  onClose: () => void
}

export function TutorialModal({ open, onClose }: TutorialModalProps) {
  const [step, setStep] = useState(0)
  const current = TUTORIAL_STEPS[step]
  const isLast = step === TUTORIAL_STEPS.length - 1

  const handleClose = () => {
    setStep(0)
    onClose()
  }

  const handleNext = () => {
    if (isLast) {
      handleClose()
      return
    }
    setStep((value) => value + 1)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-amber/30 bg-[linear-gradient(180deg,#2a2018,#1a1410)] p-8 shadow-[0_0_60px_rgba(196,122,44,0.2)]"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
          >
            <p className="mb-2 font-display text-xs uppercase tracking-[0.35em] text-amber/60">
              Tutorial · Step {step + 1} of {TUTORIAL_STEPS.length}
            </p>
            <h2 className="font-display text-2xl text-amber-light">{current.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-parchment/75">{current.body}</p>

            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs uppercase tracking-widest text-parchment/50 hover:text-parchment"
              >
                Skip
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((value) => value - 1)}
                    className="rounded-lg border border-parchment-dark/40 px-4 py-2 text-xs uppercase tracking-widest text-parchment/60"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg border border-amber bg-amber/15 px-6 py-2 font-display text-xs uppercase tracking-widest text-amber-light"
                >
                  {isLast ? 'Start Playing' : 'Next'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function shouldShowTutorial(): boolean {
  return !loadGameSave().tutorialCompleted
}
