import { GAME_CONFIG } from '@/config'
import {
  DEFAULT_PLAYER_DECK,
  STARTER_DISCOVERED_INGREDIENT_IDS,
  STARTER_OWNED_IDS,
  STARTER_TECHNIQUE_IDS,
} from '@/data'
import { getDailyChallengeForDate } from '@/data/challenges'
import { generateDailyOrders } from '@/data/orders'
import type { GameSaveData } from '@/engine/state'

const STORAGE_KEY = 'aurelia-v1-save'

function todayKey(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createDefaultSave(): GameSaveData {
  const challenge = getDailyChallengeForDate(new Date())
  const today = todayKey()
  return {
    playerName: 'Alchemist',
    tutorialCompleted: false,
    labTutorialCompleted: false,
    discoveredRecipeIds: [],
    discoveredIngredientIds: [...STARTER_DISCOVERED_INGREDIENT_IDS],
    journalEntries: [],
    ownedIngredientIds: [...STARTER_OWNED_IDS],
    ownedTechniqueIds: [...STARTER_TECHNIQUE_IDS],
    playerDeck: [...DEFAULT_PLAYER_DECK],
    gold: GAME_CONFIG.startingGold,
    reagents: GAME_CONFIG.startingReagents,
    experience: 0,
    potions: [],
    explorationRunsRemaining: GAME_CONFIG.explorationRunsPerDay,
    lastSessionDate: today,
    dailyChallengeId: challenge.id,
    dailyChallengeCompleted: false,
    recipeMastery: {},
    activeOrders: generateDailyOrders(new Date()),
    ordersDate: today,
    revealedHints: [],
  }
}

export function loadGameSave(): GameSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return createDefaultSave()
    }

    const parsed = JSON.parse(raw) as Partial<GameSaveData>
    const defaults = createDefaultSave()
    const save: GameSaveData = {
      ...defaults,
      ...parsed,
      discoveredRecipeIds: parsed.discoveredRecipeIds ?? defaults.discoveredRecipeIds,
      discoveredIngredientIds:
        parsed.discoveredIngredientIds ?? defaults.discoveredIngredientIds,
      journalEntries: parsed.journalEntries ?? defaults.journalEntries,
      ownedIngredientIds: parsed.ownedIngredientIds ?? defaults.ownedIngredientIds,
      ownedTechniqueIds: parsed.ownedTechniqueIds ?? defaults.ownedTechniqueIds,
      playerDeck: (parsed.playerDeck ?? defaults.playerDeck).filter(
        (id) => id !== GAME_CONFIG.residueCardId,
      ),
      potions: parsed.potions ?? defaults.potions,
      recipeMastery: parsed.recipeMastery ?? defaults.recipeMastery,
      activeOrders: parsed.activeOrders ?? defaults.activeOrders,
      ordersDate: parsed.ordersDate ?? defaults.ordersDate,
      revealedHints: parsed.revealedHints ?? defaults.revealedHints,
      tutorialCompleted: parsed.tutorialCompleted ?? defaults.tutorialCompleted,
      labTutorialCompleted: parsed.labTutorialCompleted ?? defaults.labTutorialCompleted,
    }

    return refreshDailyState(save)
  } catch {
    try {
      const backup = localStorage.getItem(`${STORAGE_KEY}-backup`)
      if (backup) {
        const parsed = JSON.parse(backup) as Partial<GameSaveData>
        const defaults = createDefaultSave()
        return refreshDailyState({
          ...defaults,
          ...parsed,
          discoveredRecipeIds: parsed.discoveredRecipeIds ?? defaults.discoveredRecipeIds,
          discoveredIngredientIds:
            parsed.discoveredIngredientIds ?? defaults.discoveredIngredientIds,
          journalEntries: parsed.journalEntries ?? defaults.journalEntries,
          ownedIngredientIds: parsed.ownedIngredientIds ?? defaults.ownedIngredientIds,
          ownedTechniqueIds: parsed.ownedTechniqueIds ?? defaults.ownedTechniqueIds,
          playerDeck: (parsed.playerDeck ?? defaults.playerDeck).filter(
            (id) => id !== GAME_CONFIG.residueCardId,
          ),
          potions: parsed.potions ?? defaults.potions,
          recipeMastery: parsed.recipeMastery ?? defaults.recipeMastery,
          activeOrders: parsed.activeOrders ?? defaults.activeOrders,
          ordersDate: parsed.ordersDate ?? defaults.ordersDate,
          revealedHints: parsed.revealedHints ?? defaults.revealedHints,
          tutorialCompleted: parsed.tutorialCompleted ?? defaults.tutorialCompleted,
          labTutorialCompleted: parsed.labTutorialCompleted ?? defaults.labTutorialCompleted,
        })
      }
    } catch {
      // fall through to default save
    }
    return createDefaultSave()
  }
}

export function saveGameSave(save: GameSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
    localStorage.setItem(`${STORAGE_KEY}-backup`, JSON.stringify(save))
  } catch (error) {
    console.warn('Aurelia: could not save progress to localStorage.', error)
  }
}

export function resetGameSave(playerName?: string): GameSaveData {
  const save = createDefaultSave()
  if (playerName?.trim()) {
    save.playerName = playerName.trim()
  }
  saveGameSave(save)
  return save
}

export function clearTutorialFlags(): GameSaveData {
  const save = loadGameSave()
  const next = {
    ...save,
    tutorialCompleted: false,
    labTutorialCompleted: false,
  }
  saveGameSave(next)
  return next
}

export function refreshDailyState(save: GameSaveData): GameSaveData {
  const today = todayKey()
  if (save.lastSessionDate === today && save.ordersDate === today) {
    return save
  }

  const challenge = getDailyChallengeForDate(new Date())
  const needsOrderRefresh = save.ordersDate !== today

  return {
    ...save,
    lastSessionDate: today,
    explorationRunsRemaining: GAME_CONFIG.explorationRunsPerDay,
    dailyChallengeId: challenge.id,
    dailyChallengeCompleted: false,
    activeOrders: needsOrderRefresh
      ? generateDailyOrders(new Date())
      : save.activeOrders,
    ordersDate: today,
  }
}

// Legacy key migration
export function migrateLegacySave(): void {
  const legacyKey = 'aurelia-v0.1-discoveries'
  const legacyRaw = localStorage.getItem(legacyKey)
  if (!legacyRaw || localStorage.getItem(STORAGE_KEY)) {
    return
  }

  try {
    const legacy = JSON.parse(legacyRaw) as {
      discoveredRecipeIds?: string[]
      journalEntries?: GameSaveData['journalEntries']
      playerName?: string
      tutorialCompleted?: boolean
    }
    const save = createDefaultSave()
    save.discoveredRecipeIds = legacy.discoveredRecipeIds ?? []
    save.journalEntries = legacy.journalEntries ?? []
    save.playerName = legacy.playerName ?? save.playerName
    save.tutorialCompleted = legacy.tutorialCompleted ?? false
    saveGameSave(save)
  } catch {
    // ignore corrupt legacy save
  }
}
