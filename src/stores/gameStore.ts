import { create } from 'zustand'
import type { GamePhase } from '@/engine'
import {
  addCardToDeck,
  bottlePotion,
  brew,
  buyShopItem,
  cancelExplorationEncounter,
  claimOrderReward,
  clearBrewMessage,
  completeExploration,
  completeTutorial,
  completeLabTutorial,
  craftPotionCard,
  createInitialState,
  discardFromHand,
  drawCard,
  getOwnedTechniques,
  getPlayerRank,
  getRecipeMasteryInfo,
  getRevealedHints,
  getUndiscoveredRecipeHints,
  openJournal,
  placeCardInSlot,
  placeCardOnDesk,
  placePotionOnDesk,
  returnDeskCardToHand,
  returnPotionToRack,
  fuseDeskCards,
  fuseHandCards,
  fuseHandCardsWithCatalyst,
  initializeLabCanvas,
  mergeDeskIntoHand,
  prepareLabSession,
  updateLabCardLayouts,
  playPotionCard,
  playTechniqueCard,
  prepareIngredient,
  removeCardFromDeck,
  removeCardFromSlot,
  resolveCard,
  resolvePotion,
  selectCard,
  setPhase,
  setPlayerName,
  startExploration,
  startLaboratory,
} from '@/engine/gameActions'
import type { GameRuntimeState } from '@/engine/state'
import { loadGameSave, migrateLegacySave } from '@/lib/persistence'

migrateLegacySave()

type GameStore = GameRuntimeState & {
  setPhase: (phase: GamePhase) => void
  openJournal: (returnPhase: GamePhase) => void
  setPlayerName: (name: string) => void
  completeTutorial: () => void
  completeLabTutorial: () => void
  startLaboratory: () => void
  selectCard: (cardId: string | null) => void
  placeCardInSlot: (cardId: string, slotIndex: 0 | 1) => void
  placeCardOnDesk: (cardId: string) => void
  placePotionOnDesk: (instanceId: string) => void
  returnDeskCardToHand: (cardId: string) => void
  returnPotionToRack: (instanceId: string) => void
  fuseDeskCards: (cardA: string, cardB: string) => void
  fuseHandCards: (instanceA: string, instanceB: string) => void
  fuseHandCardsWithCatalyst: (
    instanceA: string,
    instanceB: string,
    catalystInstance: string,
  ) => void
  mergeDeskIntoHand: () => void
  initializeLabCanvas: () => void
  prepareLabSession: () => void
  updateLabCardLayouts: (layouts: Record<string, import('@/lib/dragDrop').CardTransform>) => void
  removeCardFromSlot: (slotIndex: 0 | 1) => void
  drawCard: () => void
  brew: () => void
  craftPotionCard: () => void
  bottlePotion: () => void
  playPotionCard: (instanceId: string) => void
  playTechniqueCard: (instanceId: string) => void
  clearBrewMessage: () => void
  discardFromHand: (instanceId: string) => void
  startExploration: (locationId: string) => void
  completeExploration: (ingredientId: string) => void
  addCardToDeck: (cardId: string) => void
  removeCardFromDeck: (cardId: string) => void
  buyShopItem: (shopItemId: string, ingredientId: string, price: number) => void
  cancelExplorationEncounter: () => void
  prepareIngredient: (preparationId: string) => void
  claimOrderReward: (templateId: string) => void
}

const initial = createInitialState(loadGameSave())

export const useGameStore = create<GameStore>((set, get) => ({
  ...initial,

  setPhase: (phase) => set(setPhase(get(), phase)),
  openJournal: (returnPhase) => set(openJournal(get(), returnPhase)),
  setPlayerName: (name) => set(setPlayerName(get(), name)),
  completeTutorial: () => set(completeTutorial(get())),
  completeLabTutorial: () => set(completeLabTutorial(get())),
  startLaboratory: () => set(startLaboratory(get())),
  selectCard: (cardId) => set(selectCard(get(), cardId)),
  placeCardInSlot: (cardId, slotIndex) =>
    set(placeCardInSlot(get(), cardId, slotIndex)),
  placeCardOnDesk: (cardId) => set(placeCardOnDesk(get(), cardId)),
  placePotionOnDesk: (instanceId) => set(placePotionOnDesk(get(), instanceId)),
  returnDeskCardToHand: (cardId) => set(returnDeskCardToHand(get(), cardId)),
  returnPotionToRack: (instanceId) => set(returnPotionToRack(get(), instanceId)),
  fuseDeskCards: (cardA, cardB) => set(fuseDeskCards(get(), cardA, cardB)),
  fuseHandCards: (instanceA, instanceB) => set(fuseHandCards(get(), instanceA, instanceB)),
  fuseHandCardsWithCatalyst: (instanceA, instanceB, catalystInstance) =>
    set(fuseHandCardsWithCatalyst(get(), instanceA, instanceB, catalystInstance)),
  mergeDeskIntoHand: () => set(mergeDeskIntoHand(get())),
  initializeLabCanvas: () => set(initializeLabCanvas(get())),
  prepareLabSession: () => set(prepareLabSession(get())),
  updateLabCardLayouts: (layouts) => set(updateLabCardLayouts(get(), layouts)),
  removeCardFromSlot: (slotIndex) => set(removeCardFromSlot(get(), slotIndex)),
  drawCard: () => set(drawCard(get())),
  brew: () => set(brew(get())),
  craftPotionCard: () => set(craftPotionCard(get())),
  bottlePotion: () => set(bottlePotion(get())),
  playPotionCard: (instanceId) => set(playPotionCard(get(), instanceId)),
  playTechniqueCard: (deckId) => set(playTechniqueCard(get(), deckId)),
  clearBrewMessage: () => set(clearBrewMessage(get())),
  discardFromHand: (deckId) => set(discardFromHand(get(), deckId)),
  startExploration: (locationId) => set(startExploration(get(), locationId)),
  completeExploration: (ingredientId) =>
    set(completeExploration(get(), ingredientId)),
  addCardToDeck: (cardId) => set(addCardToDeck(get(), cardId)),
  removeCardFromDeck: (cardId) => set(removeCardFromDeck(get(), cardId)),
  buyShopItem: (shopItemId, ingredientId, price) =>
    set(buyShopItem(get(), shopItemId, ingredientId, price)),
  cancelExplorationEncounter: () =>
    set(cancelExplorationEncounter(get())),
  prepareIngredient: (preparationId) =>
    set(prepareIngredient(get(), preparationId)),
  claimOrderReward: (templateId) => set(claimOrderReward(get(), templateId)),
}))

export {
  resolveCard,
  resolvePotion,
  getPlayerRank,
  getUndiscoveredRecipeHints,
  getRevealedHints,
  getRecipeMasteryInfo,
  getOwnedTechniques,
}
