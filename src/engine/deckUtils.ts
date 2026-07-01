import { GAME_CONFIG } from '@/config'
import {
  isIngredientDeckId,
  isPotionDeckId,
  isSupportDeckId,
  isTechniqueDeckId,
} from '@/cards/types'
import { nextCardInstanceId } from '@/engine/labInstances'
import type { GameSaveData, LabSession } from '@/engine/state'

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function createLabSession(deck: readonly string[]): LabSession {
  const drawPile = shuffle(deck)
  const hand = drawPile.splice(0, GAME_CONFIG.handSizeOnLabStart)

  return {
    drawPile,
    hand,
    handInstanceIds: hand.map(() => nextCardInstanceId()),
    discardPile: [],
    deskCards: [],
    deskInstanceIds: [],
    tableSlots: [null, null],
    tableSlotInstances: [null, null],
    catalystSlot: null,
    catalystInstance: null,
    resultPotionId: null,
    brewMessage: null,
    brewOutcome: 'idle',
    pendingBrew: null,
    heatBoostActive: false,
    cardLayouts: {},
    canvasInitialized: false,
  }
}

export function countIngredientsInHand(hand: readonly string[]): number {
  return hand.filter((id) => isIngredientDeckId(id) && !isResidueCard(id)).length
}

export function canDrawFromLab(lab: LabSession): boolean {
  if (lab.drawPile.length > 0) {
    return true
  }
  return GAME_CONFIG.reshuffleDiscardWhenEmpty && lab.discardPile.length > 0
}

export function drawFromLab(lab: LabSession, count = 1): LabSession {
  let drawPile = [...lab.drawPile]
  let discardPile = [...lab.discardPile]
  const hand = [...lab.hand]
  const handInstanceIds = [...lab.handInstanceIds]

  for (let i = 0; i < count; i += 1) {
    if (countIngredientsInHand(hand) >= GAME_CONFIG.maxHandSize) {
      break
    }

    if (drawPile.length === 0 && GAME_CONFIG.reshuffleDiscardWhenEmpty && discardPile.length > 0) {
      drawPile = shuffle(discardPile)
      discardPile = []
    }

    if (drawPile.length === 0) {
      break
    }

    const [card, ...rest] = drawPile
    drawPile = rest
    hand.push(card)
    handInstanceIds.push(nextCardInstanceId())
  }

  return { ...lab, drawPile, discardPile, hand, handInstanceIds }
}

export function addPotionToInventory(
  save: GameSaveData,
  potionId: string,
): GameSaveData {
  const potions = [...save.potions]
  const existing = potions.find((stack) => stack.potionId === potionId)
  if (existing) {
    existing.quantity += 1
  } else {
    potions.push({ potionId, quantity: 1 })
  }
  return { ...save, potions }
}

export function countInDeck(deck: readonly string[], cardId: string): number {
  return deck.filter((id) => id === cardId).length
}

export function countIngredientsInDeck(deck: readonly string[]): number {
  return deck.filter((id) => isIngredientDeckId(id)).length
}

export function countSupportInDeck(deck: readonly string[]): number {
  return deck.filter((id) => isSupportDeckId(id)).length
}

export function canAddToDeck(
  deck: readonly string[],
  cardId: string,
): boolean {
  if (isResidueCard(cardId)) {
    return false
  }

  if (countInDeck(deck, cardId) >= GAME_CONFIG.maxCopiesPerCard) {
    return false
  }

  if (isIngredientDeckId(cardId)) {
    return countIngredientsInDeck(deck) < GAME_CONFIG.maxIngredientDeckSize
  }

  if (isSupportDeckId(cardId)) {
    return countSupportInDeck(deck) < GAME_CONFIG.maxSupportDeckSize
  }

  return false
}

export function isResidueCard(cardId: string): boolean {
  return cardId === GAME_CONFIG.residueCardId
}

export function splitDeckCounts(deck: readonly string[]) {
  return {
    ingredients: countIngredientsInDeck(deck),
    support: countSupportInDeck(deck),
    potions: deck.filter((id) => isPotionDeckId(id)).length,
    techniques: deck.filter((id) => isTechniqueDeckId(id)).length,
    total: deck.length,
  }
}
