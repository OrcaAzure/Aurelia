import type { Rarity } from './ingredient'

export type CardType = 'ingredient' | 'potion' | 'tool' | 'technique'

export interface Card {
  id: string
  name: string
  description: string
  rarity: Rarity
  type: CardType
  referenceId: string
  cost: number
}
