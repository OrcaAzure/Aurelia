import type { GameState } from '@/models'

export interface SaveSlot {
  slotId: number
  label: string
  savedAt: number
  state: GameState
}

export interface SaveManager {
  save(slotId: number, state: GameState): Promise<void>
  load(slotId: number): Promise<GameState | undefined>
  delete(slotId: number): Promise<void>
  listSlots(): Promise<readonly SaveSlot[]>
  exportState(state: GameState): string
  importState(serialized: string): GameState
}
