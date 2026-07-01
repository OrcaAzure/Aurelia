import { GAME_CONFIG } from '@/config'
import type { IngredientProperty } from '@/cards/types'
import { RECIPES, RECIPE_MAP, INGREDIENT_MAP, POTION_MAP } from '@/data'
import type { RecipeDefinition } from '@/data/recipes'
import type { JournalEntry } from '@/models'
import { ingredientDisplayName } from '@/lib/cardResolver'

export interface BrewResult {
  success: boolean
  recipe?: RecipeDefinition
  potionName?: string
  message: string
  isTransmute?: boolean
  transmuteName?: string
  nearMiss?: string
}

function ingredientKey(first: string, second: string): string {
  return [first, second].sort().join('+')
}

function hasAnyProperty(
  ingredientId: string,
  required: readonly IngredientProperty[],
): boolean {
  const ingredient = INGREDIENT_MAP.get(ingredientId)
  if (!ingredient) {
    return false
  }
  return required.some((prop) => ingredient.properties.includes(prop))
}

function matchesPropertyRecipe(
  slotA: string,
  slotB: string,
  recipe: RecipeDefinition,
): boolean {
  if (!recipe.propertyRequirements) {
    return false
  }
  const [reqA, reqB] = recipe.propertyRequirements
  return (
    (hasAnyProperty(slotA, reqA) && hasAnyProperty(slotB, reqB))
    || (hasAnyProperty(slotA, reqB) && hasAnyProperty(slotB, reqA))
  )
}

const INGREDIENT_RECIPE_LOOKUP = new Map<string, RecipeDefinition>(
  RECIPES.filter((r) => r.matchType === 'ingredients' && r.ingredientIds).map(
    (recipe) => [
      ingredientKey(recipe.ingredientIds![0], recipe.ingredientIds![1]),
      recipe,
    ],
  ),
)

const PROPERTY_RECIPES = RECIPES.filter((r) => r.matchType === 'properties')

function findNearMiss(slotA: string, slotB: string): string | undefined {
  const undiscovered = RECIPES.filter((r) => r.matchType === 'ingredients' && r.ingredientIds)
  for (const recipe of undiscovered) {
    const [a, b] = recipe.ingredientIds!
    if (slotA === a || slotA === b || slotB === a || slotB === b) {
      const ingA = INGREDIENT_MAP.get(slotA)
      const ingB = INGREDIENT_MAP.get(slotB)
      if (ingA && ingB) {
        const sharedElement = ingA.element === ingB.element
        const otherId = slotA === a || slotA === b ? (slotA === a ? b : a) : undefined
        if (otherId && (slotA === otherId || slotB === otherId)) {
          continue
        }
        if (sharedElement || slotA === a || slotA === b || slotB === a || slotB === b) {
          return `Almost… ${recipe.hint}`
        }
      }
    }
  }
  return undefined
}

export function matchRecipe(slotA: string, slotB: string): BrewResult {
  if (slotA === GAME_CONFIG.residueCardId || slotB === GAME_CONFIG.residueCardId) {
    return {
      success: false,
      message: 'Residue cannot be brewed. Use Filter to purge it from your deck.',
    }
  }

  const exactRecipe = INGREDIENT_RECIPE_LOOKUP.get(ingredientKey(slotA, slotB))

  let recipe = exactRecipe
  if (!recipe) {
    recipe = PROPERTY_RECIPES.find((r) => matchesPropertyRecipe(slotA, slotB, r))
  }

  if (!recipe) {
    const nameA = ingredientDisplayName(slotA)
    const nameB = ingredientDisplayName(slotB)
    const nearMiss = findNearMiss(slotA, slotB)
    return {
      success: false,
      message: nearMiss
        ? `${nameA} and ${nameB} refuse to bond. ${nearMiss}`
        : `${nameA} and ${nameB} refuse to bond. The mixture fizzles into nothing.`,
      nearMiss,
    }
  }

  if (recipe.outcome === 'transmute' && recipe.transmuteResultId) {
    const transmuted = INGREDIENT_MAP.get(recipe.transmuteResultId)
    return {
      success: true,
      recipe,
      isTransmute: true,
      transmuteName: transmuted?.name ?? 'Unknown material',
      message: `Transmutation! ${ingredientDisplayName(slotA)} and ${ingredientDisplayName(slotB)} fused into ${transmuted?.name ?? 'something new'}.`,
    }
  }

  const potion = POTION_MAP.get(recipe.resultPotionId ?? '')

  return {
    success: true,
    recipe,
    potionName: potion?.name ?? recipe.name,
    message: `Success! Choose to craft ${potion?.name ?? recipe.name} as a card or bottle it for gold.`,
  }
}

export function recipeUsesElement(
  recipeId: string,
  element: string,
): boolean {
  const recipe = RECIPE_MAP.get(recipeId)
  if (!recipe) {
    return false
  }

  if (recipe.ingredientIds) {
    return recipe.ingredientIds.some((id) => {
      return INGREDIENT_MAP.get(id)?.element === element
    })
  }

  return false
}

export function getRecipeMasteryLevel(brewCount: number): number {
  if (brewCount >= 5) return 3
  if (brewCount >= 3) return 2
  if (brewCount >= 1) return 1
  return 0
}

export function createEntryId(): string {
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createJournalEntry(
  entry: Omit<JournalEntry, 'id' | 'timestamp'>,
): JournalEntry {
  return {
    ...entry,
    id: createEntryId(),
    timestamp: Date.now(),
  }
}

export function ingredientHasProperty(
  ingredientId: string,
  property: IngredientProperty,
): boolean {
  return INGREDIENT_MAP.get(ingredientId)?.properties.includes(property) ?? false
}

export function isVolatileIngredient(ingredientId: string): boolean {
  return ingredientHasProperty(ingredientId, 'volatile')
}
