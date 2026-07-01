import type { GamePhase } from '@/engine'
import type { JournalEntry } from '@/models'
import type { ActiveOrder } from '@/data/orders'

export interface PotionStack {
  potionId: string
  quantity: number
}

export interface GameSaveData {
  playerName: string
  tutorialCompleted: boolean
  discoveredRecipeIds: string[]
  discoveredIngredientIds: string[]
  journalEntries: JournalEntry[]
  ownedIngredientIds: string[]
  ownedTechniqueIds: string[]
  playerDeck: string[]
  gold: number
  reagents: number
  experience: number
  potions: PotionStack[]
  explorationRunsRemaining: number
  lastSessionDate: string
  dailyChallengeId: string | null
  dailyChallengeCompleted: boolean
  recipeMastery: Record<string, number>
  activeOrders: ActiveOrder[]
  ordersDate: string
  revealedHints: string[]
}

export interface LabSession {
  drawPile: string[]
  hand: string[]
  discardPile: string[]
  tableSlots: [string | null, string | null]
  resultPotionId: string | null
  brewMessage: string | null
  brewOutcome: 'idle' | 'success' | 'fail'
  pendingBrew: { recipeId: string; potionId: string } | null
  heatBoostActive: boolean
}

export type ExplorationEventType = 'scroll' | 'curse' | 'bountiful'

export interface ExplorationEncounter {
  locationId: string
  choices: string[]
  event?: {
    type: ExplorationEventType
    hintRecipeId?: string
  }
}

export interface GameRuntimeState {
  phase: GamePhase
  journalReturnPhase: GamePhase
  selectedCardId: string | null
  save: GameSaveData
  lab: LabSession | null
  exploration: ExplorationEncounter | null
}
