import type { Recipe } from '@/models'

export interface RecipeMatchResult {
  recipeId: string
  matched: boolean
  missingRequirements: readonly string[]
}

export interface RecipeManager {
  getAll(): readonly Recipe[]
  getById(id: string): Recipe | undefined
  getDiscovered(): readonly Recipe[]
  getUndiscovered(): readonly Recipe[]
  matchIngredients(ingredientIds: readonly string[]): RecipeMatchResult[]
  discover(recipeId: string): Recipe | undefined
}
