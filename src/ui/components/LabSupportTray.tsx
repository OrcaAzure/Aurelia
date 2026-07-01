import { isIngredientDeckId, isPotionDeckId } from '@/cards/types'
import { isResidueCard } from '@/engine/deckUtils'

function collectUniqueCanvasIds(
  hand: readonly string[],
  include: (id: string) => boolean,
): string[] {
  const seen = new Set<string>()
  const ids: string[] = []

  for (const id of hand) {
    if (!include(id) || seen.has(id)) {
      continue
    }
    seen.add(id)
    ids.push(id)
  }

  return ids
}

/** Ingredient cards scattered on the lab canvas. */
export function getIngredientTableIds(hand: readonly string[]): string[] {
  return collectUniqueCanvasIds(
    hand,
    (id) => isIngredientDeckId(id) && !isResidueCard(id),
  )
}

/** Ingredient and potion cards on the lab canvas. */
export function getCanvasCardIds(hand: readonly string[]): string[] {
  return collectUniqueCanvasIds(
    hand,
    (id) =>
      (isIngredientDeckId(id) && !isResidueCard(id))
      || isPotionDeckId(id),
  )
}
