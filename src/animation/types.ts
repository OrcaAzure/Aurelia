import type { Transition, Variants } from 'framer-motion'

export interface AnimationPreset {
  id: string
  variants: Variants
  transition?: Transition
}

export interface AnimationService {
  getPreset(id: string): AnimationPreset | undefined
}
