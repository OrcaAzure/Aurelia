import { create } from 'zustand'
import type { GamePhase } from '@/engine'
import { STARTER_INGREDIENTS } from '@/cards'

interface GameState {
  phase: GamePhase
  hand: string[]
  setPhase: (phase: GamePhase) => void
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'laboratory',
  hand: STARTER_INGREDIENTS.map((card) => card.id),
  setPhase: (phase) => set({ phase }),
}))
