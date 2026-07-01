import type { AnimationPreset } from './types'

const cardRevealPreset: AnimationPreset = {
  id: 'card-reveal',
  variants: {
    hidden: { opacity: 0, y: 24, scale: 0.92 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  transition: { duration: 0.35, ease: 'easeOut' },
}

export type { AnimationPreset, AnimationService } from './types'
export { cardRevealPreset }
