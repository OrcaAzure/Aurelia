import { isIngredientDeckId } from '@/cards/types'
import { isResidueCard } from '@/engine/deckUtils'

export function getIngredientTableIds(hand: readonly string[]): string[] {
  const seen = new Set<string>()
  const ids: string[] = []

  for (const id of hand) {
    if (!isIngredientDeckId(id) || isResidueCard(id) || seen.has(id)) {
      continue
    }
    seen.add(id)
    ids.push(id)
  }

  return ids
}
