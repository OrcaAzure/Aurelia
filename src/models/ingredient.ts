export type Element = 'earth' | 'water' | 'fire' | 'air' | 'aether'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic'

export type IngredientTag =
  | 'herb'
  | 'mineral'
  | 'creature'
  | 'essence'
  | 'catalyst'

export interface Ingredient {
  id: string
  name: string
  description: string
  element: Element
  potency: number
  rarity: Rarity
  tags: readonly IngredientTag[]
  discovered: boolean
}
