import type { LabSession } from '@/engine/state'
import { isIngredientDeckId, isPotionDeckId } from '@/cards/types'
import { deckIdForInstance, getActiveFusionInstanceIds } from '@/engine/labInstances'
import { isResidueCard } from '@/engine/deckUtils'

/** Ingredient instance ids scattered on the lab canvas. */
export function getIngredientTableIds(lab: LabSession): string[] {
  const fusionIds = new Set(getActiveFusionInstanceIds(lab))
  const ids: string[] = []

  for (let index = 0; index < lab.hand.length; index += 1) {
    const deckId = lab.hand[index]
    const instanceId = lab.handInstanceIds[index]
    if (!instanceId) continue
    if (fusionIds.has(instanceId)) continue
    if (isIngredientDeckId(deckId) && !isResidueCard(deckId)) {
      ids.push(instanceId)
    }
  }

  return ids
}

/** Instance ids locked in an active fusion (ingredients + optional catalyst). */
export { getActiveFusionInstanceIds } from '@/engine/labInstances'

/** Ingredient cards on the desk plus potions dragged out of the rack. */
export function getCanvasCardIds(lab: LabSession): string[] {
  const seen = new Set<string>()
  const ids: string[] = []

  const push = (instanceId: string) => {
    if (!seen.has(instanceId)) {
      seen.add(instanceId)
      ids.push(instanceId)
    }
  }

  for (const instanceId of getIngredientTableIds(lab)) {
    push(instanceId)
  }
  for (const instanceId of lab.deskInstanceIds) {
    push(instanceId)
  }
  for (const instanceId of getActiveFusionInstanceIds(lab)) {
    push(instanceId)
  }

  return ids
}

export interface RackPotionEntry {
  instanceId: string
  deckId: string
}

/** Potion copies still on the rack (in hand but not placed on the desk). */
export function getRackPotionEntries(lab: LabSession): RackPotionEntry[] {
  const onDesk = new Set(lab.deskInstanceIds)
  const fusing = new Set(getActiveFusionInstanceIds(lab))
  const entries: RackPotionEntry[] = []

  for (let index = 0; index < lab.hand.length; index += 1) {
    const deckId = lab.hand[index]
    const instanceId = lab.handInstanceIds[index]
    if (
      !instanceId
      || !isPotionDeckId(deckId)
      || onDesk.has(instanceId)
      || fusing.has(instanceId)
    ) {
      continue
    }
    entries.push({ instanceId, deckId })
  }

  return entries
}

export function resolveCanvasDeckId(lab: LabSession, instanceId: string): string | undefined {
  return deckIdForInstance(lab, instanceId)
}
