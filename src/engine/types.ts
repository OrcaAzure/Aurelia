export type GamePhase =
  | 'menu'
  | 'laboratory'
  | 'journal'
  | 'settings'
  | 'exploration'
  | 'deckbuilding'
  | 'shop'
  | 'preparation'

export interface GameSession {
  phase: GamePhase
  turn: number
}

export interface GameEngine {
  getSession(): GameSession
  setPhase(phase: GamePhase): void
}
