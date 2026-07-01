import type { Ingredient, JournalEntry, Potion, Recipe } from '@/models'

export type DiscoverableType = 'ingredient' | 'recipe' | 'potion'

export interface DiscoveryEvent {
  type: DiscoverableType
  entityId: string
  timestamp: number
}

export interface DiscoveryManager {
  discoverIngredient(ingredientId: string): Ingredient | undefined
  discoverRecipe(recipeId: string): Recipe | undefined
  discoverPotion(potionId: string): Potion | undefined
  isDiscovered(type: DiscoverableType, entityId: string): boolean
  getDiscoveryHistory(): readonly DiscoveryEvent[]
  recordExperiment(ingredientIds: readonly string[], outcome: string): JournalEntry
}
