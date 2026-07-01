import type { Card, DeckState } from '@/models'

export interface DeckManager {
  getDeck(): DeckState
  getHand(): readonly string[]
  getDrawPile(): readonly string[]
  addToDeck(cardId: string): void
  removeFromDeck(cardId: string): void
  draw(count: number): readonly string[]
  discard(cardIds: readonly string[]): void
  shuffle(): void
  resolveCard(cardId: string): Card | undefined
}
