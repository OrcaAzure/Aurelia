export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic'

export type CardCategory = 'ingredient' | 'tool' | 'technique' | 'potion'

export interface CardBase {
  id: string
  name: string
  description: string
  rarity: CardRarity
  category: CardCategory
}

export interface IngredientCard extends CardBase {
  category: 'ingredient'
  element: IngredientElement
  potency: number
}

export type IngredientElement =
  | 'earth'
  | 'water'
  | 'fire'
  | 'air'
  | 'aether'

export type Card = IngredientCard
