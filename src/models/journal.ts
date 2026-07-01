export type JournalEntryKind =
  | 'discovery'
  | 'experiment'
  | 'recipe'
  | 'note'
  | 'milestone'

export interface JournalEntry {
  id: string
  kind: JournalEntryKind
  title: string
  body: string
  relatedIds: readonly string[]
  timestamp: number
}

export interface AlchemyJournal {
  entries: readonly JournalEntry[]
  discoveredIngredientIds: readonly string[]
  discoveredRecipeIds: readonly string[]
  discoveredPotionIds: readonly string[]
}
