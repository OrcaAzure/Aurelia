export type GamePhase =
  | 'laboratory'
  | 'exploration'
  | 'journal'
  | 'deckbuilding'

export interface GameSession {
  phase: GamePhase
  turn: number
}

export interface GameEngine {
  getSession(): GameSession
  setPhase(phase: GamePhase): void
}
