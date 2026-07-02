import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react'
import { GAME_CONFIG } from '@/config'

export type LabTutorialTarget = 'desk' | 'deck' | 'rack' | 'topbar' | 'journal'

interface LabTutorialStep {
  title: string
  body: string
  target?: LabTutorialTarget
  tip?: string
}

const LAB_TUTORIAL_STEPS: LabTutorialStep[] = [
  {
    title: 'Welcome to the Laboratory',
    body: `This is your alchemy workspace. You start with ${GAME_CONFIG.handSizeOnLabStart} cards on the desk each visit. Experiment freely — failed brews never destroy your ingredients.`,
  },
  {
    title: 'The Alchemist\'s Desk',
    target: 'desk',
    body: 'Ingredient cards sit on the desk. Drag them anywhere. To brew, drag one ingredient and drop it on another — order does not matter. They fuse automatically and the reaction begins.',
    tip: 'Try stacking two ingredients you think might combine.',
  },
  {
    title: 'Draw & Track Cards',
    target: 'deck',
    body: 'Use Draw to pull from your deck. When the deck runs out, your discard pile reshuffles into it. The availability list shows how many copies you hold on the desk versus still in the deck.',
  },
  {
    title: 'The Rack',
    target: 'rack',
    body: 'Potions, techniques, and residue appear on the rack. Drag potions onto the desk for catalyst brews. Tap Use on techniques (Stir, Filter, Heat, Distill…) or Discard on residue clutter.',
    tip: 'Techniques cannot be used while a brew animation is running.',
  },
  {
    title: 'Reagents & Resources',
    target: 'topbar',
    body: `Successful brews cost ${GAME_CONFIG.brewReagentCost} reagent each (free once you master a recipe at level 3). Watch your gold and reagents here. After each success you also draw ${GAME_CONFIG.drawAfterSuccessfulBrew} card.`,
  },
  {
    title: 'Craft or Bottle',
    target: 'desk',
    body: 'When a potion brew succeeds, choose Craft to add the potion card to your rack/deck, or Bottle to sell it for gold and earn a reagent. You must craft or bottle before fusing again.',
    tip: 'Crafted potions can later catalyze enhanced recipes.',
  },
  {
    title: 'Catalyst Brews',
    target: 'desk',
    body: 'Advanced recipes need a catalyst: fuse two ingredients, then drag a matching potion from the rack and stack it on the pair. The potion is consumed and you get an enhanced result.',
  },
  {
    title: 'Transmutations & Journal',
    target: 'journal',
    body: 'Some ingredient pairs transmute into new materials instead of potions — these are added to your collection. Every discovery is recorded in the Journal, along with hints for recipes you have not found yet.',
    tip: 'Herb + Water is a classic first discovery: Healing Infusion.',
  },
  {
    title: 'You\'re Ready',
    body: 'Explore combinations, build your deck, and climb from Apprentice to Master Alchemist. Open this guide anytime from the ? button in the lab.',
  },
]

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

interface LabTutorialOverlayProps {
  open: boolean
  onComplete: () => void
}

function measureTarget(target: LabTutorialTarget | undefined): SpotlightRect | null {
  if (!target) return null
  const el = document.querySelector(`[data-lab-tutorial="${target}"]`)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const pad = 8
  return {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  }
}

function tooltipStyle(rect: SpotlightRect | null): CSSProperties {
  if (!rect) {
    return {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(28rem, calc(100vw - 2rem))',
    }
  }

  const cardWidth = Math.min(360, window.innerWidth - 32)
  const preferBelow = rect.top + rect.height + 220 < window.innerHeight
  const top = preferBelow
    ? rect.top + rect.height + 16
    : Math.max(16, rect.top - 200)
  let left = rect.left + rect.width / 2 - cardWidth / 2
  left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16))

  return {
    position: 'fixed',
    top,
    left,
    width: cardWidth,
  }
}

export function LabTutorialOverlay({ open, onComplete }: LabTutorialOverlayProps) {
  const [step, setStep] = useState(0)
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)

  const current = LAB_TUTORIAL_STEPS[step]
  const isLast = step === LAB_TUTORIAL_STEPS.length - 1

  const updateSpotlight = useCallback(() => {
    setSpotlight(measureTarget(current.target))
  }, [current.target])

  useLayoutEffect(() => {
    if (!open) return
    updateSpotlight()
  }, [open, step, updateSpotlight])

  useEffect(() => {
    if (!open) return
    const onResize = () => updateSpotlight()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open, updateSpotlight])

  useEffect(() => {
    if (!open) setStep(0)
  }, [open])

  const handleClose = () => {
    setStep(0)
    onComplete()
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
          className="fixed inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden={!open}
        >
          {spotlight ? (
            <motion.div
              className="pointer-events-none rounded-xl border-2 border-amber-light/70 ring-4 ring-amber/20"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'fixed',
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
                boxShadow: '0 0 0 9999px rgba(10, 8, 6, 0.82)',
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-ink/82 backdrop-blur-[2px]" />
          )}

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lab-tutorial-title"
            className="z-[201] rounded-2xl border border-amber/35 bg-[linear-gradient(180deg,#2a2018,#1a1410)] p-6 shadow-[0_0_60px_rgba(196,122,44,0.25)]"
            style={tooltipStyle(spotlight)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.05 }}
          >
            <p className="mb-2 font-display text-[10px] uppercase tracking-[0.35em] text-amber/60">
              Laboratory Guide · {step + 1} / {LAB_TUTORIAL_STEPS.length}
            </p>
            <h2
              id="lab-tutorial-title"
              className="font-display text-xl text-amber-light"
            >
              {current.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-parchment/78">
              {current.body}
            </p>
            {current.tip && (
              <p className="mt-3 rounded-lg border border-moss/25 bg-moss/10 px-3 py-2 text-xs leading-relaxed text-moss">
                Tip: {current.tip}
              </p>
            )}

            <div className="mt-3 flex gap-1">
              {LAB_TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= step ? 'bg-amber/70' : 'bg-parchment/15'
                  }`}
                />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="text-[10px] uppercase tracking-widest text-parchment/50 hover:text-parchment"
              >
                Skip
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((value) => value - 1)}
                    className="rounded-lg border border-parchment-dark/40 px-4 py-2 text-[10px] uppercase tracking-widest text-parchment/60"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg border border-amber bg-amber/15 px-5 py-2 font-display text-[10px] uppercase tracking-widest text-amber-light"
                >
                  {isLast ? 'Start Brewing' : 'Next'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function shouldShowLabTutorial(): boolean {
  try {
    const raw = localStorage.getItem('aurelia-v1-save')
    if (!raw) return true
    const parsed = JSON.parse(raw) as { labTutorialCompleted?: boolean }
    return !parsed.labTutorialCompleted
  } catch {
    return true
  }
}
