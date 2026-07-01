import type { Rarity } from './ingredient'

export type PotionEffectType =
  | 'healing'
  | 'transmutation'
  | 'amplification'
  | 'purification'
  | 'revealing'

export interface PotionEffect {
  type: PotionEffectType
  magnitude: number
  duration?: number
}

export interface Potion {
  id: string
  name: string
  description: string
  rarity: Rarity
  effects: readonly PotionEffect[]
  recipeId: string
  artId?: string
}
