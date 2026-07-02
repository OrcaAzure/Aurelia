import { isIngredientDeckId } from '@/cards/types'
import { INGREDIENT_MAP } from '@/data'
import { deckIdForInstance, getActiveFusionInstanceIds } from '@/engine/labInstances'
import { isResidueCard } from '@/engine/deckUtils'
import type { LabSession } from '@/engine/state'

export interface IngredientAvailability {
  deckId: string
  name: string
  held: number
  inDeck: number
}

function countIngredientCopies(ids: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const id of ids) {
    if (!isIngredientDeckId(id) || isResidueCard(id)) continue
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}

export function getLabIngredientAvailability(lab: LabSession): IngredientAvailability[] {
  const heldIds = [
    ...lab.hand,
    ...lab.deskCards,
    ...lab.tableSlots.filter((id): id is string => id !== null),
  ]
  const fusionDeckIds = new Set(
    getActiveFusionInstanceIds(lab)
      .map((instanceId) => deckIdForInstance(lab, instanceId))
      .filter((id): id is string => Boolean(id)),
  )

  const held = countIngredientCopies(
    heldIds.filter((deckId) => !fusionDeckIds.has(deckId)),
  )
  const inDeck = countIngredientCopies(lab.drawPile)
  const keys = new Set([...held.keys(), ...inDeck.keys()])

  return [...keys]
    .map((deckId) => ({
      deckId,
      name: INGREDIENT_MAP.get(deckId)?.name ?? deckId.replace('ing-', ''),
      held: held.get(deckId) ?? 0,
      inDeck: inDeck.get(deckId) ?? 0,
    }))
    .filter((entry) => entry.held > 0 || entry.inDeck > 0)
    .sort((a, b) => {
      if (a.held !== b.held) return b.held - a.held
      if (a.inDeck !== b.inDeck) return b.inDeck - a.inDeck
      return a.name.localeCompare(b.name)
    })
}
