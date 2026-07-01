import { isIngredientDeckId, isPotionDeckId, potionIdFromDeckId } from '@/cards/types'
import { findCatalystRecipe } from '@/lib/recipeEngine'
import { isResidueCard } from '@/engine/deckUtils'
import {
  DESK_CARD_HEIGHT,
  DESK_CARD_WIDTH,
  DESK_OVERLAP_RADIUS,
  findOverlappingCard,
  type CardTransform,
} from '@/lib/dragDrop'

function cardCenter(transform: CardTransform): { x: number; y: number } {
  return {
    x: transform.x + DESK_CARD_WIDTH / 2,
    y: transform.y + DESK_CARD_HEIGHT / 2,
  }
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function isFusableIngredient(deckId: string | undefined): deckId is string {
  return Boolean(deckId && isIngredientDeckId(deckId) && !isResidueCard(deckId))
}

function catalystPairFromIngredients(
  ingredientIds: readonly string[],
  positions: Record<string, CardTransform>,
  resolveDeckId: (instanceId: string) => string | undefined,
  catalystPotionId: string,
): [string, string] | null {
  for (let i = 0; i < ingredientIds.length; i += 1) {
    for (let j = i + 1; j < ingredientIds.length; j += 1) {
      const deckA = resolveDeckId(ingredientIds[i])
      const deckB = resolveDeckId(ingredientIds[j])
      if (findCatalystRecipe(deckA ?? '', deckB ?? '', catalystPotionId)) {
        return [ingredientIds[i], ingredientIds[j]]
      }
    }
  }

  for (const first of ingredientIds) {
    const pos = positions[first]
    if (!pos) continue
    const second = findOverlappingCard(
      cardCenter(pos),
      positions,
      ingredientIds,
      first,
    )
    if (!second) continue
    const deckA = resolveDeckId(first)
    const deckB = resolveDeckId(second)
    if (findCatalystRecipe(deckA ?? '', deckB ?? '', catalystPotionId)) {
      return [first, second]
    }
  }

  return null
}

export function findCatalystIngredientPairForPotion(
  potionInstanceId: string,
  potionCenter: { x: number; y: number },
  canvasCardIds: readonly string[],
  positions: Record<string, CardTransform>,
  resolveDeckId: (instanceId: string) => string | undefined,
): [string, string] | null {
  const potionDeckId = resolveDeckId(potionInstanceId)
  const catalystPotionId = potionDeckId ? potionIdFromDeckId(potionDeckId) : undefined
  if (!catalystPotionId) {
    return null
  }

  const ingredientIds = canvasCardIds.filter((id) => {
    if (id === potionInstanceId) return false
    return isFusableIngredient(resolveDeckId(id))
  })

  const nearPotion = ingredientIds.filter((id) => {
    const pos = positions[id]
    if (!pos) return false
    return distance(potionCenter, cardCenter(pos)) < DESK_OVERLAP_RADIUS
  })

  const nearPair = catalystPairFromIngredients(
    nearPotion,
    positions,
    resolveDeckId,
    catalystPotionId,
  )
  if (nearPair) {
    return nearPair
  }

  return catalystPairFromIngredients(
    ingredientIds,
    positions,
    resolveDeckId,
    catalystPotionId,
  )
}

export function findCatalystPotionForIngredientPair(
  instanceA: string,
  instanceB: string,
  positions: Record<string, CardTransform>,
  canvasCardIds: readonly string[],
  resolveDeckId: (instanceId: string) => string | undefined,
): string | null {
  const deckA = resolveDeckId(instanceA)
  const deckB = resolveDeckId(instanceB)
  if (!isFusableIngredient(deckA) || !isFusableIngredient(deckB)) {
    return null
  }

  const posA = positions[instanceA]
  const posB = positions[instanceB]
  if (!posA || !posB) {
    return null
  }

  const mergeCenter = {
    x: (cardCenter(posA).x + cardCenter(posB).x) / 2,
    y: (cardCenter(posA).y + cardCenter(posB).y) / 2,
  }

  for (const id of canvasCardIds) {
    if (id === instanceA || id === instanceB) continue
    const deckId = resolveDeckId(id)
    if (!deckId || !isPotionDeckId(deckId)) continue
    const pos = positions[id]
    if (!pos) continue
    if (distance(mergeCenter, cardCenter(pos)) >= DESK_OVERLAP_RADIUS) continue

    const catalystPotionId = potionIdFromDeckId(deckId)
    if (catalystPotionId && findCatalystRecipe(deckA, deckB, catalystPotionId)) {
      return id
    }
  }

  return null
}
