import type { LabSession } from '@/engine/state'

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
    handInstanceIds = lab.hand.map((_, index) => handInstanceIds[index] ?? nextCardInstanceId())
  }

  if (deskInstanceIds.length !== deskCards.length) {
    deskInstanceIds = deskCards.map((_, index) => deskInstanceIds[index] ?? nextCardInstanceId())
  }

  return {
    ...lab,
    deskCards,
    deskInstanceIds,
    handInstanceIds,
  }
}

export function deckIdForInstance(lab: LabSession, instanceId: string): string | undefined {
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
