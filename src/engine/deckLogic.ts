import { GAME_CONFIG } from '@/config'

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function drawFromPile(
  drawPile: string[],
  hand: string[],
  discardPile: string[],
  count: number,
): { drawPile: string[]; hand: string[]; discardPile: string[] } {
  let pile = [...drawPile]
  let disc = [...discardPile]
  let nextHand = [...hand]
  let remaining = count

  while (remaining > 0) {
    if (pile.length === 0) {
      if (!GAME_CONFIG.reshuffleDiscardWhenEmpty || disc.length === 0) {
        break
      }
      pile = shuffle(disc)
      disc = []
    }

    const [card, ...rest] = pile
    if (nextHand.length < GAME_CONFIG.maxHandSize) {
      nextHand = [...nextHand, card]
      remaining -= 1
    } else {
      break
    }
    pile = rest
  }

  return { drawPile: pile, hand: nextHand, discardPile: disc }
}

export function startLabDeck(playerDeck: string[]): {
  drawPile: string[]
  hand: string[]
} {
  const shuffled = shuffle(playerDeck)
  const hand = shuffled.slice(0, GAME_CONFIG.handSizeOnLabStart)
  const drawPile = shuffled.slice(GAME_CONFIG.handSizeOnLabStart)
  return { drawPile, hand }
}

export function countInDeck(deck: string[], cardId: string): number {
  return deck.filter((id) => id === cardId).length
}

export function canAddToDeck(deck: string[], cardId: string): boolean {
  if (deck.length >= GAME_CONFIG.maxDeckSize) {
    return false
  }
  return countInDeck(deck, cardId) < GAME_CONFIG.maxCopiesPerCard
}
