import type { GamePhase, GameState } from '@/models'

export interface GameManager {
  getState(): GameState
  setPhase(phase: GamePhase): void
  advanceTurn(): void
  startSession(): GameState
  endSession(): void
}
