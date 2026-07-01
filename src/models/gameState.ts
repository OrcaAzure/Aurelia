import type { AlchemyJournal } from './journal'
import type { Inventory } from './inventory'
import type { Player } from './player'

export type GamePhase =
  | 'menu'
  | 'laboratory'
  | 'journal'
  | 'settings'
  | 'exploration'
  | 'deckbuilding'
  | 'shop'
  | 'preparation'

export interface DeckState {
  drawPile: readonly string[]
  hand: readonly string[]
  discardPile: readonly string[]
  exhaustPile: readonly string[]
}

export interface GameState {
  phase: GamePhase
  turn: number
  player: Player
  inventory: Inventory
  deck: DeckState
  journal: AlchemyJournal
  activeExperimentId?: string
  sessionStartedAt: number
}
