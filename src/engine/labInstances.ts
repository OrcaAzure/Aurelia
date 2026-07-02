import type { LabSession } from '@/engine/state'
import type { CardTransform } from '@/lib/dragDrop'

let instanceCounter = 0

export function nextCardInstanceId(): string {
  instanceCounter += 1
  return `ci-${instanceCounter}`
}

export function ensureLabInstances(lab: LabSession): LabSession {
  const deskCards = lab.deskCards ?? []
  let deskInstanceIds = lab.deskInstanceIds ?? []
  let handInstanceIds = lab.handInstanceIds ?? []

  if (handInstanceIds.length !== lab.hand.length) {
    if (handInstanceIds.length > lab.hand.length) {
      handInstanceIds = handInstanceIds.slice(0, lab.hand.length)
    } else {
      const missing = lab.hand.length - handInstanceIds.length
      handInstanceIds = [
        ...handInstanceIds,
        ...Array.from({ length: missing }, () => nextCardInstanceId()),
      ]
    }
  }

  if (deskInstanceIds.length !== deskCards.length) {
    if (deskInstanceIds.length > deskCards.length) {
      deskInstanceIds = deskInstanceIds.slice(0, deskCards.length)
    } else {
      const missing = deskCards.length - deskInstanceIds.length
      deskInstanceIds = [
        ...deskInstanceIds,
        ...Array.from({ length: missing }, () => nextCardInstanceId()),
      ]
    }
  }

  return {
    ...lab,
    deskCards,
    deskInstanceIds,
    handInstanceIds,
    catalystSlot: lab.catalystSlot ?? null,
    catalystInstance: lab.catalystInstance ?? null,
    cardLayouts: lab.cardLayouts ?? {},
    canvasInitialized: lab.canvasInitialized ?? false,
  }
}

export function deckIdForInstance(lab: LabSession, instanceId: string): string | undefined {
  const slotInstances = lab.tableSlotInstances ?? [null, null]
  const slotIndex = slotInstances.indexOf(instanceId)
  if (slotIndex !== -1) {
    return lab.tableSlots[slotIndex] ?? undefined
  }

  if (lab.catalystInstance === instanceId) {
    return lab.catalystSlot ?? undefined
  }

  const handIndex = lab.handInstanceIds.indexOf(instanceId)
  if (handIndex !== -1) {
    return lab.hand[handIndex]
  }

  const deskIndex = lab.deskInstanceIds.indexOf(instanceId)
  if (deskIndex !== -1) {
    return lab.deskCards[deskIndex]
  }

  return undefined
}

export function removeInstancesFromHand(
  lab: LabSession,
  ...instanceIds: string[]
): Pick<LabSession, 'hand' | 'handInstanceIds'> {
  const remove = new Set(instanceIds)
  const hand: string[] = []
  const handInstanceIds: string[] = []

  for (let index = 0; index < lab.hand.length; index += 1) {
    const instanceId = lab.handInstanceIds[index]
    if (remove.has(instanceId)) {
      continue
    }
    hand.push(lab.hand[index])
    handInstanceIds.push(instanceId)
  }

  return { hand, handInstanceIds }
}

export function pushCardsToHand(
  lab: LabSession,
  ...deckIds: (string | null | undefined)[]
): Pick<LabSession, 'hand' | 'handInstanceIds'> {
  const hand = [...lab.hand]
  const handInstanceIds = [...lab.handInstanceIds]

  for (const deckId of deckIds) {
    if (!deckId) continue
    hand.push(deckId)
    handInstanceIds.push(nextCardInstanceId())
  }

  return { hand, handInstanceIds }
}

export function removeFirstDeckIdFromHand(
  lab: LabSession,
  deckId: string,
): Pick<LabSession, 'hand' | 'handInstanceIds'> | null {
  const index = lab.hand.indexOf(deckId)
  if (index === -1) {
    return null
  }

  return {
    hand: [...lab.hand.slice(0, index), ...lab.hand.slice(index + 1)],
    handInstanceIds: [
      ...lab.handInstanceIds.slice(0, index),
      ...lab.handInstanceIds.slice(index + 1),
    ],
  }
}

export function moveHandInstanceToDesk(
  lab: LabSession,
  instanceId: string,
): LabSession | null {
  const handIndex = lab.handInstanceIds.indexOf(instanceId)
  if (handIndex === -1) {
    return null
  }

  const deckId = lab.hand[handIndex]
  return {
    ...lab,
    hand: [...lab.hand.slice(0, handIndex), ...lab.hand.slice(handIndex + 1)],
    handInstanceIds: [
      ...lab.handInstanceIds.slice(0, handIndex),
      ...lab.handInstanceIds.slice(handIndex + 1),
    ],
    deskCards: [...lab.deskCards, deckId],
    deskInstanceIds: [...lab.deskInstanceIds, instanceId],
  }
}

export function moveDeskInstanceToHand(lab: LabSession, instanceId: string): LabSession | null {
  const deskIndex = lab.deskInstanceIds.indexOf(instanceId)
  if (deskIndex === -1) {
    return null
  }

  const deckId = lab.deskCards[deskIndex]
  return {
    ...lab,
    deskCards: [...lab.deskCards.slice(0, deskIndex), ...lab.deskCards.slice(deskIndex + 1)],
    deskInstanceIds: [
      ...lab.deskInstanceIds.slice(0, deskIndex),
      ...lab.deskInstanceIds.slice(deskIndex + 1),
    ],
    hand: [...lab.hand, deckId],
    handInstanceIds: [...lab.handInstanceIds, instanceId],
  }
}

export function fusedEntriesFromLab(
  lab: LabSession,
): { deckId: string; instanceId: string }[] {
  const [deckA, deckB] = lab.tableSlots
  const [instanceA, instanceB] = lab.tableSlotInstances ?? [null, null]
  const entries: { deckId: string; instanceId: string }[] = []

  if (deckA && instanceA) {
    entries.push({ deckId: deckA, instanceId: instanceA })
  }
  if (deckB && instanceB) {
    entries.push({ deckId: deckB, instanceId: instanceB })
  }

  return entries
}

export function getActiveFusionInstanceIds(lab: LabSession): string[] {
  const ids: string[] = []
  const [slotA, slotB] = lab.tableSlotInstances ?? [null, null]
  if (slotA) ids.push(slotA)
  if (slotB) ids.push(slotB)
  if (lab.catalystInstance) ids.push(lab.catalystInstance)
  return ids
}

export function restoreFusedInstancesToHand(
  lab: LabSession,
  entries: readonly { deckId: string; instanceId: string }[],
): Pick<LabSession, 'hand' | 'handInstanceIds'> {
  const hand = [...lab.hand]
  const handInstanceIds = [...lab.handInstanceIds]
  const held = new Set(handInstanceIds)

  for (const { deckId, instanceId } of entries) {
    if (held.has(instanceId)) {
      continue
    }
    hand.push(deckId)
    handInstanceIds.push(instanceId)
    held.add(instanceId)
  }

  return { hand, handInstanceIds }
}

export function pruneCardLayouts(
  layouts: Record<string, CardTransform>,
  instanceIds: readonly string[],
): Record<string, CardTransform> {
  if (instanceIds.length === 0) {
    return layouts
  }

  const remove = new Set(instanceIds)
  const next = { ...layouts }
  for (const id of remove) {
    delete next[id]
  }
  return next
}

export function clearFusionSlots(): Pick<
  LabSession,
  'tableSlots' | 'tableSlotInstances' | 'catalystSlot' | 'catalystInstance'
> {
  return {
    tableSlots: [null, null],
    tableSlotInstances: [null, null],
    catalystSlot: null,
    catalystInstance: null,
  }
}

export function removeDeskInstance(lab: LabSession, instanceId: string): LabSession | null {
  const deskIndex = lab.deskInstanceIds.indexOf(instanceId)
  if (deskIndex === -1) {
    return null
  }

  return {
    ...lab,
    deskCards: [...lab.deskCards.slice(0, deskIndex), ...lab.deskCards.slice(deskIndex + 1)],
    deskInstanceIds: [
      ...lab.deskInstanceIds.slice(0, deskIndex),
      ...lab.deskInstanceIds.slice(deskIndex + 1),
    ],
  }
}
