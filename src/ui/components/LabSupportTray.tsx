import type { LabSession } from '@/engine/state'
import { isIngredientDeckId, isPotionDeckId } from '@/cards/types'
import { deckIdForInstance, ensureLabInstances } from '@/engine/labInstances'
import { isResidueCard } from '@/engine/deckUtils'

/** Ingredient cards scattered on the lab canvas. */
export function getIngredientTableIds(lab: LabSession): string[] {
  const session = ensureLabInstances(lab)
  const ids: string[] = []

  for (let index = 0; index < session.hand.length; index += 1) {
    const deckId = session.hand[index]
    if (isIngredientDeckId(deckId) && !isResidueCard(deckId)) {
      ids.push(session.handInstanceIds[index])
    }
  }

  return ids
}

/** Ingredient cards on the desk plus potions dragged out of the rack. */
export function getCanvasCardIds(lab: LabSession): string[] {
  const session = ensureLabInstances(lab)
  return [...getIngredientTableIds(session), ...session.deskInstanceIds]
}

export interface RackPotionEntry {
  instanceId: string
  deckId: string
}

/** Potion copies still on the rack (in hand but not placed on the desk). */
export function getRackPotionEntries(lab: LabSession): RackPotionEntry[] {
  const session = ensureLabInstances(lab)
  const onDesk = new Set(session.deskInstanceIds)
  const entries: RackPotionEntry[] = []

  for (let index = 0; index < session.hand.length; index += 1) {
    const deckId = session.hand[index]
    const instanceId = session.handInstanceIds[index]
    if (!isPotionDeckId(deckId) || onDesk.has(instanceId)) {
      continue
    }
    entries.push({ instanceId, deckId })
  }

  return entries
}

export function resolveCanvasDeckId(lab: LabSession, instanceId: string): string | undefined {
  return deckIdForInstance(ensureLabInstances(lab), instanceId)
}
