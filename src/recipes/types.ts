import type { IngredientElement } from '@/cards/types'

export interface RecipeIngredient {
  element: IngredientElement
  count: number
}

export interface Recipe {
  id: string
  name: string
  description: string
  ingredients: RecipeIngredient[]
  discovered: boolean
}

export interface RecipeRegistry {
  getAll(): readonly Recipe[]
  getById(id: string): Recipe | undefined
  discover(id: string): void
}
