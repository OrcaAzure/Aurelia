export type JournalEntryType = 'discovery' | 'experiment' | 'recipe' | 'note'

export interface JournalEntry {
  id: string
  type: JournalEntryType
  title: string
  body: string
  timestamp: number
}

export interface Journal {
  entries: JournalEntry[]
}

export interface JournalService {
  getEntries(): readonly JournalEntry[]
  addEntry(entry: Omit<JournalEntry, 'id' | 'timestamp'>): JournalEntry
}
