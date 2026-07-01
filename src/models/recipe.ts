import type { Element } from './ingredient'

export interface RecipeRequirement {
  element: Element
  minPotency: number
  count: number
}

export interface Recipe {
  id: string
  name: string
  description: string
  requirements: readonly RecipeRequirement[]
  resultPotionId: string
  discovered: boolean
  difficulty: number
  hint?: string
}
