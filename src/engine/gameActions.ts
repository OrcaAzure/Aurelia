import {
  isIngredientDeckId,
  isPotionDeckId,
  isTechniqueDeckId,
  potionDeckId,
  potionIdFromDeckId,
  techniqueIdFromDeckId,
} from '@/cards/types'
import { GAME_CONFIG, getRankForXp } from '@/config'
import {
  getDailyChallengeForDate,
  INGREDIENT_MAP,
  LOCATION_MAP,
  ORDER_TEMPLATE_MAP,
  POTION_MAP,
  PREPARATION_MAP,
  RECIPE_MAP,
  RECIPES,
  STARTER_TECHNIQUE_IDS,
  TECHNIQUE_MAP,
  biasPoolForTrait,
} from '@/data'
import type { ActiveOrder } from '@/data/orders'
import {
  canAddToDeck,
  countInDeck,
  createLabSession,
  drawFromLab,
  isResidueCard,
} from '@/engine/deckUtils'
import {
  deckIdForInstance,
  ensureLabInstances,
  moveDeskInstanceToHand,
  moveHandInstanceToDesk,
  nextCardInstanceId,
  pushCardsToHand,
  removeDeskInstance,
  removeFirstDeckIdFromHand,
  removeInstancesFromHand,
} from '@/engine/labInstances'
import { ingredientDisplayName, resolveDeckCard } from '@/lib/cardResolver'
import type { GameRuntimeState, GameSaveData, LabSession, ExplorationEncounter } from '@/engine/state'
import {
  createJournalEntry,
  getRecipeMasteryLevel,
  isVolatileIngredient,
  matchRecipe,
  recipeUsesElement,
} from '@/lib/recipeEngine'
import { saveGameSave } from '@/lib/persistence'
import type { GamePhase } from '@/engine'

function persist(save: GameSaveData): void {
  saveGameSave(save)
}

function pickRandom<T>(items: readonly T[], count: number): T[] {
  const pool = [...items]
  const result: T[] = []
  while (result.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(index, 1)[0])
  }
  return result
}

function uniquePick(pool: string[], count: number): string[] {
  const shuffled = pickRandom(pool, pool.length)
  const seen = new Set<string>()
  const result: string[] = []
  for (const id of shuffled) {
    if (seen.has(id)) continue
    seen.add(id)
    result.push(id)
    if (result.length >= count) break
  }
  return result
}

function syncSave(state: GameRuntimeState, save: GameSaveData): GameRuntimeState {
  const next = { ...state, save }
  persist(save)
  return next
}

function getMasteryCount(save: GameSaveData, recipeId: string): number {
  return save.recipeMastery[recipeId] ?? 0
}

function incrementMastery(save: GameSaveData, recipeId: string): GameSaveData {
  const count = getMasteryCount(save, recipeId) + 1
  return {
    ...save,
    recipeMastery: { ...save.recipeMastery, [recipeId]: count },
  }
}

function masteryBottleBonus(save: GameSaveData, recipeId: string, base: number): number {
  const level = getRecipeMasteryLevel(getMasteryCount(save, recipeId))
  if (level >= 2) {
    return Math.round(base * (1 + GAME_CONFIG.masteryBottleBonusPercent / 100))
  }
  return base
}

function masteryEffectBonus(save: GameSaveData, recipeId: string | undefined, base: number): number {
  if (!recipeId) return base
  const recipe = [...save.discoveredRecipeIds]
    .map((id) => RECIPE_MAP.get(id))
    .find((r) => r?.resultPotionId === recipeId)
  if (!recipe) return base
  const level = getRecipeMasteryLevel(getMasteryCount(save, recipe.id))
  return level >= 2 ? base + 1 : base
}

function brewReagentCostForRecipe(save: GameSaveData, recipeId: string): number {
  const level = getRecipeMasteryLevel(getMasteryCount(save, recipeId))
  if (level >= 3) return 0
  return GAME_CONFIG.brewReagentCost
}

function updateOrders(
  save: GameSaveData,
  event: {
    type: ActiveOrder['templateId'] extends string ? string : never
    amount?: number
    element?: string
    isTransmute?: boolean
    bottleGold?: number
    craftedPotion?: boolean
  },
): GameSaveData {
  const orders = save.activeOrders.map((order) => {
    if (order.completed || order.claimed) return order
    const template = ORDER_TEMPLATE_MAP.get(order.templateId)
    if (!template) return order

    let progress = order.progress
    switch (template.type) {
      case 'brew_count':
        if (event.type === 'brew') progress += event.amount ?? 1
        break
      case 'brew_element':
        if (event.type === 'brew' && event.element === template.element) {
          progress += event.amount ?? 1
        }
        break
      case 'bottle_gold':
        if (event.type === 'bottle') progress += event.bottleGold ?? 0
        break
      case 'explore':
        if (event.type === 'explore') progress += 1
        break
      case 'transmute':
        if (event.type === 'transmute') progress += 1
        break
      case 'craft_potion':
        if (event.type === 'craft') progress += 1
        break
      default:
        break
    }

    return {
      ...order,
      progress,
      completed: progress >= template.target,
    }
  })

  return { ...save, activeOrders: orders }
}

function rollExplorationEvent(locationId: string): ExplorationEncounter['event'] {
  const location = LOCATION_MAP.get(locationId)
  if (!location || Math.random() > location.eventChance) {
    return undefined
  }

  const roll = Math.random()
  if (roll < 0.4) {
    return { type: 'bountiful' as const }
  }
  if (roll < 0.7) {
    const undiscovered = RECIPES.filter((r) => r.hint)
    const recipe = undiscovered[Math.floor(Math.random() * undiscovered.length)]
    return recipe
      ? { type: 'scroll' as const, hintRecipeId: recipe.id }
      : undefined
  }
  return { type: 'curse' as const }
}

function releaseFusedCardsToHand(lab: LabSession): LabSession {
  const [slotA, slotB] = lab.tableSlots
  return {
    ...lab,
    ...pushCardsToHand(lab, slotA, slotB),
    tableSlots: [null, null],
  }
}

function handleFailedBrew(
  lab: LabSession,
  slotA: string,
  slotB: string,
  resultMessage: string,
): { lab: Partial<LabSession> & { hand: string[]; handInstanceIds: string[]; discardPile: string[]; tableSlots: [string | null, string | null] }; message: string } {
  let message = resultMessage
  const returned: string[] = []

  for (const cardId of [slotA, slotB]) {
    const consumed =
      GAME_CONFIG.volatileConsumeChance > 0
      && isVolatileIngredient(cardId)
      && Math.random() < GAME_CONFIG.volatileConsumeChance
    if (consumed) {
      message += ` ${ingredientDisplayName(cardId)} was consumed by the volatile reaction.`
    } else {
      returned.push(cardId)
    }
  }

  let discardPile = [...lab.discardPile]
  if (
    GAME_CONFIG.residueOnFailChance > 0
    && Math.random() < GAME_CONFIG.residueOnFailChance
  ) {
    discardPile.push(GAME_CONFIG.residueCardId)
    message += ' A bit of Residue settles in your discard pile — use Filter to clear it.'
  }

  return {
    lab: {
      ...lab,
      ...pushCardsToHand(lab, ...returned),
      discardPile,
      tableSlots: [null, null] as [string | null, string | null],
    },
    message,
  }
}

export function createInitialState(save: GameSaveData): GameRuntimeState {
  return {
    phase: 'menu',
    journalReturnPhase: 'menu',
    selectedCardId: null,
    save,
    lab: null,
    exploration: null,
  }
}

export function setPhase(state: GameRuntimeState, phase: GamePhase): GameRuntimeState {
  return { ...state, phase }
}

export function openJournal(
  state: GameRuntimeState,
  returnPhase: GamePhase,
): GameRuntimeState {
  return { ...state, phase: 'journal', journalReturnPhase: returnPhase }
}

export function setPlayerName(
  state: GameRuntimeState,
  name: string,
): GameRuntimeState {
  const save = { ...state.save, playerName: name.trim() || 'Alchemist' }
  return syncSave(state, save)
}

export function completeTutorial(state: GameRuntimeState): GameRuntimeState {
  const save = { ...state.save, tutorialCompleted: true }
  return syncSave(state, save)
}

export function startLaboratory(state: GameRuntimeState): GameRuntimeState {
  if (state.save.playerDeck.length === 0) {
    return {
      ...state,
      phase: 'laboratory',
      lab: {
        drawPile: [],
        hand: [],
        handInstanceIds: [],
        discardPile: [],
        deskCards: [],
        deskInstanceIds: [],
        tableSlots: [null, null],
        resultPotionId: null,
        brewMessage: 'Your deck is empty. Visit the Deckbuilder first.',
        brewOutcome: 'fail',
        pendingBrew: null,
        heatBoostActive: false,
      },
    }
  }

  return {
    ...state,
    phase: 'laboratory',
    lab: createLabSession(state.save.playerDeck),
    selectedCardId: null,
  }
}

export function selectCard(
  state: GameRuntimeState,
  cardId: string | null,
): GameRuntimeState {
  return { ...state, selectedCardId: cardId }
}

export function placeCardInSlot(
  state: GameRuntimeState,
  cardId: string,
  slotIndex: 0 | 1,
): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const lab = state.lab
  if (
    !isIngredientDeckId(cardId)
    || isResidueCard(cardId)
    || !lab.hand.includes(cardId)
    || lab.tableSlots[slotIndex] !== null
  ) {
    return state
  }

  const other = slotIndex === 0 ? 1 : 0
  if (lab.tableSlots[other] === cardId) {
    return state
  }

  const nextSlots = [...lab.tableSlots] as [string | null, string | null]
  nextSlots[slotIndex] = cardId

  return {
    ...state,
    selectedCardId: null,
    lab: {
      ...lab,
      tableSlots: nextSlots,
      hand: lab.hand.filter((id) => id !== cardId),
      resultPotionId: null,
      brewMessage: null,
      brewOutcome: 'idle',
    },
  }
}

export function removeCardFromSlot(
  state: GameRuntimeState,
  slotIndex: 0 | 1,
): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const cardId = state.lab.tableSlots[slotIndex]
  if (!cardId) {
    return state
  }

  const nextSlots = [...state.lab.tableSlots] as [string | null, string | null]
  nextSlots[slotIndex] = null

  return {
    ...state,
    lab: {
      ...state.lab,
      tableSlots: nextSlots,
      hand: [...state.lab.hand, cardId],
      resultPotionId: null,
    },
  }
}

export function placePotionOnDesk(
  state: GameRuntimeState,
  instanceId: string,
): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const lab = ensureLabInstances(state.lab)
  const deckId = deckIdForInstance(lab, instanceId)
  if (!deckId || !isPotionDeckId(deckId)) {
    return state
  }

  const nextLab = moveHandInstanceToDesk(lab, instanceId)
  if (!nextLab) {
    return state
  }

  return {
    ...state,
    selectedCardId: null,
    lab: {
      ...nextLab,
      brewMessage: null,
      brewOutcome: 'idle',
    },
  }
}

export function returnPotionToRack(
  state: GameRuntimeState,
  instanceId: string,
): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const lab = ensureLabInstances(state.lab)
  if (lab.hand.length >= GAME_CONFIG.maxHandSize) {
    return {
      ...state,
      lab: {
        ...lab,
        brewMessage: 'Your hand is full — use or rack another potion first.',
        brewOutcome: 'fail',
      },
    }
  }

  const nextLab = moveDeskInstanceToHand(lab, instanceId)
  if (!nextLab) {
    return state
  }

  return {
    ...state,
    lab: {
      ...nextLab,
      brewMessage: null,
      brewOutcome: 'idle',
    },
  }
}

export function placeCardOnDesk(
  state: GameRuntimeState,
  cardId: string,
): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const lab = state.lab
  const deskCards = lab.deskCards ?? []
  if (
    !isIngredientDeckId(cardId)
    || isResidueCard(cardId)
    || !lab.hand.includes(cardId)
    || deskCards.includes(cardId)
  ) {
    return state
  }

  return {
    ...state,
    selectedCardId: null,
    lab: {
      ...lab,
      hand: lab.hand.filter((id) => id !== cardId),
      deskCards: [...deskCards, cardId],
      resultPotionId: null,
      brewMessage: null,
      brewOutcome: 'idle',
    },
  }
}

export function returnDeskCardToHand(
  state: GameRuntimeState,
  cardId: string,
): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const lab = state.lab
  const deskCards = lab.deskCards ?? []
  if (!deskCards.includes(cardId)) {
    return state
  }

  if (lab.hand.length >= GAME_CONFIG.maxHandSize) {
    return {
      ...state,
      lab: {
        ...lab,
        brewMessage: 'Your hand is full — make room before picking cards back up.',
        brewOutcome: 'fail',
      },
    }
  }

  return {
    ...state,
    lab: {
      ...lab,
      deskCards: deskCards.filter((id) => id !== cardId),
      hand: [...lab.hand, cardId],
      brewMessage: null,
      brewOutcome: 'idle',
    },
  }
}

export function fuseDeskCards(
  state: GameRuntimeState,
  cardA: string,
  cardB: string,
): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const lab = state.lab
  const deskCards = lab.deskCards ?? []
  if (
    cardA === cardB
    || !deskCards.includes(cardA)
    || !deskCards.includes(cardB)
  ) {
    return state
  }

  return {
    ...state,
    selectedCardId: null,
    lab: {
      ...lab,
      deskCards: deskCards.filter((id) => id !== cardA && id !== cardB),
      tableSlots: [cardA, cardB],
      resultPotionId: null,
      brewMessage: null,
      brewOutcome: 'idle',
    },
  }
}

export function fuseHandCards(
  state: GameRuntimeState,
  instanceA: string,
  instanceB: string,
): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const lab = ensureLabInstances(state.lab)
  const deckA = deckIdForInstance(lab, instanceA)
  const deckB = deckIdForInstance(lab, instanceB)
  if (
    instanceA === instanceB
    || !deckA
    || !deckB
    || !isIngredientDeckId(deckA)
    || !isIngredientDeckId(deckB)
    || isResidueCard(deckA)
    || isResidueCard(deckB)
  ) {
    return state
  }

  return {
    ...state,
    selectedCardId: null,
    lab: {
      ...lab,
      ...removeInstancesFromHand(lab, instanceA, instanceB),
      tableSlots: [deckA, deckB],
      resultPotionId: null,
      brewMessage: null,
      brewOutcome: 'idle',
    },
  }
}

export function mergeDeskIntoHand(state: GameRuntimeState): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const lab = ensureLabInstances(state.lab)
  let hand = [...lab.hand]
  let handInstanceIds = [...lab.handInstanceIds]

  for (let index = 0; index < lab.deskCards.length; index += 1) {
    hand.push(lab.deskCards[index])
    handInstanceIds.push(lab.deskInstanceIds[index])
  }

  const [slotA, slotB] = lab.tableSlots
  const withReturned = pushCardsToHand(
    { ...lab, hand, handInstanceIds },
    slotA,
    slotB,
  )

  return {
    ...state,
    lab: {
      ...lab,
      ...withReturned,
      deskCards: [],
      deskInstanceIds: [],
      tableSlots: [null, null],
    },
  }
}

export function drawCard(state: GameRuntimeState): GameRuntimeState {
  if (!state.lab) {
    return state
  }
  return { ...state, lab: drawFromLab(ensureLabInstances(state.lab), 1) }
}

export function brew(state: GameRuntimeState): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const lab = state.lab
  const [slotA, slotB] = lab.tableSlots

  if (!slotA || !slotB) {
    return {
      ...state,
      lab: {
        ...lab,
        brewMessage: 'Stack two ingredients on the desk by dragging one onto another.',
        brewOutcome: 'fail',
      },
    }
  }

  const result = matchRecipe(slotA, slotB, state.save.discoveredRecipeIds)
  const recipeId = result.recipe?.id
  const hadHeatBoost = lab.heatBoostActive
  const reagentCost = recipeId
    ? brewReagentCostForRecipe(state.save, recipeId)
    : GAME_CONFIG.brewReagentCost

  if (state.save.reagents < reagentCost) {
    return {
      ...state,
      lab: {
        ...releaseFusedCardsToHand(lab),
        brewMessage: `Not enough reagents. You need ${reagentCost} reagent(s) to brew.`,
        brewOutcome: 'fail',
      },
    }
  }

  const entries = [...state.save.journalEntries]
  let save = { ...state.save }
  let labNext: LabSession = {
    ...lab,
    tableSlots: [null, null],
    brewMessage: result.message,
    brewOutcome: result.success ? 'success' : 'fail',
    resultPotionId: null,
    pendingBrew: null,
    heatBoostActive: false,
  }

  if (result.success && result.recipe) {
    save = {
      ...save,
      reagents: save.reagents - reagentCost,
    }

    labNext = {
      ...labNext,
      discardPile: [...lab.discardPile, slotA, slotB],
    }

    save = incrementMastery(save, result.recipe.id)
    const masteryLevel = getRecipeMasteryLevel(getMasteryCount(save, result.recipe.id))
    const isNew = !save.discoveredRecipeIds.includes(result.recipe.id)

    save = {
      ...save,
      experience: save.experience + (isNew ? GAME_CONFIG.xpPerDiscovery : GAME_CONFIG.xpPerBrew),
      gold: save.gold + (isNew ? GAME_CONFIG.goldPerDiscovery : 0),
    }

    if (
      hadHeatBoost
      && (INGREDIENT_MAP.get(slotA)?.element === 'fire'
        || INGREDIENT_MAP.get(slotB)?.element === 'fire')
    ) {
      save = { ...save, gold: save.gold + 5 }
      labNext.brewMessage += ' Heat amplified the reaction (+5 gold).'
    }

    if (isNew) {
      save = {
        ...save,
        discoveredRecipeIds: [...save.discoveredRecipeIds, result.recipe.id],
      }
      entries.unshift(
        createJournalEntry({
          kind: 'recipe',
          title: result.isTransmute
            ? `Transmutation: ${result.transmuteName}`
            : `Discovered: ${result.potionName}`,
          body: result.recipe.description,
          relatedIds: [result.recipe.id],
        }),
      )

      const challenge = getDailyChallengeForDate(new Date())
      if (
        !save.dailyChallengeCompleted
        && save.dailyChallengeId === challenge.id
        && recipeUsesElement(result.recipe.id, challenge.requiredElement)
      ) {
        save = {
          ...save,
          dailyChallengeCompleted: true,
          gold: save.gold + challenge.rewardGold,
          experience: save.experience + challenge.rewardXp,
        }
        entries.unshift(
          createJournalEntry({
            kind: 'milestone',
            title: 'Daily Challenge Complete!',
            body: `${challenge.title}: ${challenge.description}`,
            relatedIds: [challenge.id],
          }),
        )
      }
    } else if (masteryLevel >= 2) {
      labNext.brewMessage += ` (Mastery ${masteryLevel})`
    }

    const brewElement = INGREDIENT_MAP.get(slotA)?.element ?? INGREDIENT_MAP.get(slotB)?.element
    save = updateOrders(save, { type: 'brew', amount: 1, element: brewElement })

    if (result.isTransmute && result.recipe.transmuteResultId) {
      save = updateOrders(save, { type: 'transmute' })
      const transmuteId = result.recipe.transmuteResultId
      if (!save.ownedIngredientIds.includes(transmuteId)) {
        save.ownedIngredientIds = [...save.ownedIngredientIds, transmuteId]
      }
      if (!save.discoveredIngredientIds.includes(transmuteId)) {
        save.discoveredIngredientIds = [...save.discoveredIngredientIds, transmuteId]
      }
      if (canAddToDeck(save.playerDeck, transmuteId)) {
        save.playerDeck = [...save.playerDeck, transmuteId]
      }
      if (lab.hand.length < GAME_CONFIG.maxHandSize) {
        const pushed = pushCardsToHand(lab, transmuteId)
        labNext = {
          ...labNext,
          ...pushed,
          resultPotionId: null,
        }
      } else {
        labNext = {
          ...labNext,
          resultPotionId: null,
        }
      }
      if (!save.discoveredIngredientIds.includes(transmuteId)) {
        entries.unshift(
          createJournalEntry({
            kind: 'experiment',
            title: `Transmuted ${result.transmuteName}`,
            body: 'A new material has been added to your collection.',
            relatedIds: [transmuteId],
          }),
        )
      }
    } else if (result.recipe.resultPotionId) {
      labNext = {
        ...labNext,
        resultPotionId: result.recipe.resultPotionId,
        pendingBrew: {
          recipeId: result.recipe.id,
          potionId: result.recipe.resultPotionId,
        },
      }
    }

    if (GAME_CONFIG.drawAfterSuccessfulBrew > 0) {
      labNext = drawFromLab(labNext, GAME_CONFIG.drawAfterSuccessfulBrew)
    }
  } else {
    const failed = handleFailedBrew(lab, slotA, slotB, result.message)
    labNext = {
      ...labNext,
      hand: failed.lab.hand,
      handInstanceIds: failed.lab.handInstanceIds,
      discardPile: failed.lab.discardPile,
      tableSlots: failed.lab.tableSlots,
      brewMessage: failed.message,
    }
    if (result.nearMiss) {
      entries.unshift(
        createJournalEntry({
          kind: 'experiment',
          title: 'Almost…',
          body: failed.message,
          relatedIds: [slotA, slotB],
        }),
      )
    }
  }

  save = { ...save, journalEntries: entries }
  return syncSave({ ...state, lab: labNext, save }, save)
}

export function craftPotionCard(state: GameRuntimeState): GameRuntimeState {
  if (!state.lab?.pendingBrew) {
    return state
  }

  const { potionId } = state.lab.pendingBrew
  const deckId = potionDeckId(potionId)
  let save = updateOrders(state.save, { type: 'craft' })
  const labBase = ensureLabInstances(state.lab)
  let hand = [...labBase.hand]
  let handInstanceIds = [...labBase.handInstanceIds]
  let discardPile = [...labBase.discardPile]
  let brewMessage = `${POTION_MAP.get(potionId)?.name ?? 'Potion'} crafted as a card!`

  if (canAddToDeck(save.playerDeck, deckId)) {
    save.playerDeck = [...save.playerDeck, deckId]
    if (hand.length < GAME_CONFIG.maxHandSize) {
      hand.push(deckId)
      handInstanceIds.push(nextCardInstanceId())
    } else {
      discardPile.push(deckId)
      brewMessage += ' (Added to deck — draw pile full, card went to discard.)'
    }
  } else if (hand.length < GAME_CONFIG.maxHandSize) {
    hand.push(deckId)
    handInstanceIds.push(nextCardInstanceId())
    brewMessage += ' (Support deck full — card is in your hand for this visit only.)'
  } else {
    discardPile.push(deckId)
    brewMessage += ' (Support deck full — card went to discard for this visit.)'
  }

  const lab: LabSession = {
    ...labBase,
    hand,
    handInstanceIds,
    discardPile,
    pendingBrew: null,
    brewMessage,
    brewOutcome: 'success',
  }

  return syncSave({ ...state, lab, save }, save)
}

export function bottlePotion(state: GameRuntimeState): GameRuntimeState {
  if (!state.lab?.pendingBrew) {
    return state
  }

  const { potionId, recipeId } = state.lab.pendingBrew
  const potion = POTION_MAP.get(potionId)
  if (!potion) {
    return state
  }

  const bottleValue = masteryBottleBonus(state.save, recipeId, potion.bottleValue)
  let save = updateOrders(state.save, { type: 'bottle', bottleGold: bottleValue })
  save = {
    ...save,
    gold: save.gold + bottleValue,
    reagents: save.reagents + 1,
  }

  const lab: LabSession = {
    ...state.lab,
    pendingBrew: null,
    brewMessage: `Bottled for ${bottleValue} gold and 1 reagent.`,
  }

  return syncSave({ ...state, lab, save }, save)
}

export function playPotionCard(
  state: GameRuntimeState,
  instanceId: string,
): GameRuntimeState {
  const labBase = state.lab ? ensureLabInstances(state.lab) : null
  const deckId = labBase ? deckIdForInstance(labBase, instanceId) : undefined
  if (!labBase || !deckId || !isPotionDeckId(deckId)) {
    return state
  }

  const potionId = potionIdFromDeckId(deckId)
  const potion = potionId ? POTION_MAP.get(potionId) : undefined
  if (!potion) {
    return state
  }

  let save = state.save
  let lab: LabSession

  if (labBase.deskInstanceIds.includes(instanceId)) {
    const withoutDesk = removeDeskInstance(labBase, instanceId)
    if (!withoutDesk) {
      return state
    }
    lab = {
      ...withoutDesk,
      discardPile: [...withoutDesk.discardPile, deckId],
    }
  } else if (labBase.handInstanceIds.includes(instanceId)) {
    lab = {
      ...labBase,
      ...removeInstancesFromHand(labBase, instanceId),
      discardPile: [...labBase.discardPile, deckId],
    }
  } else {
    return state
  }

  const effectAmount = masteryEffectBonus(save, potionId, potion.effectAmount)
  let brewMessage = `Used ${potion.name}.`

  switch (potion.effect) {
    case 'restore-reagents':
      save = { ...save, reagents: save.reagents + effectAmount }
      brewMessage = `${potion.name}: restored ${effectAmount} reagents.`
      break
    case 'gain-gold':
      save = { ...save, gold: save.gold + effectAmount }
      brewMessage = `${potion.name}: gained ${effectAmount} gold.`
      break
    case 'draw-cards':
      lab = drawFromLab(lab, effectAmount)
      brewMessage = `${potion.name}: drew ${effectAmount} card(s).`
      break
    case 'reveal-hint': {
      const hints = getUndiscoveredRecipeHints(save).slice(0, effectAmount)
      brewMessage =
        hints.length > 0
          ? `Hints: ${hints.map((h) => `"${h.hint}"`).join(' · ')}`
          : 'No undiscovered hints remain.'
      break
    }
    default:
      break
  }

  lab = { ...lab, brewMessage, brewOutcome: 'success' }
  return syncSave({ ...state, lab, save }, save)
}

export function playTechniqueCard(
  state: GameRuntimeState,
  deckId: string,
): GameRuntimeState {
  if (!state.lab || !isTechniqueDeckId(deckId)) {
    return state
  }

  const labBase = ensureLabInstances(state.lab)
  const removed = removeFirstDeckIdFromHand(labBase, deckId)
  if (!removed) {
    return state
  }

  const techniqueId = techniqueIdFromDeckId(deckId)
  const technique = techniqueId ? TECHNIQUE_MAP.get(techniqueId) : undefined
  if (!technique) {
    return state
  }

  let lab: LabSession = {
    ...labBase,
    ...removed,
    discardPile: [...labBase.discardPile, deckId],
  }

  let brewMessage = `Used ${technique.name}.`

  switch (technique.effect) {
    case 'recover-discard': {
      const recoverable = lab.discardPile.filter((id) => !isResidueCard(id))
      if (recoverable.length === 0) {
        brewMessage = 'Distill: nothing in the discard pile to recover.'
      } else {
        const pick = recoverable[Math.floor(Math.random() * recoverable.length)]
        if (lab.hand.length < GAME_CONFIG.maxHandSize) {
          const pushed = pushCardsToHand(lab, pick)
          lab = {
            ...lab,
            ...pushed,
            discardPile: lab.discardPile.filter((id) => id !== pick),
          }
        } else {
          lab = {
            ...lab,
            discardPile: lab.discardPile.filter((id) => id !== pick),
          }
        }
        brewMessage = `Distill: recovered ${ingredientDisplayName(pick)} from discard.`
      }
      break
    }
    case 'boost-fire':
      lab = { ...lab, heatBoostActive: true }
      brewMessage = 'Heat: your next brew boosts fire ingredient potency.'
      break
    case 'remove-residue': {
      const residueCount =
        lab.hand.filter(isResidueCard).length
        + lab.discardPile.filter(isResidueCard).length
      const hand: string[] = []
      const handInstanceIds: string[] = []
      for (let index = 0; index < lab.hand.length; index += 1) {
        if (isResidueCard(lab.hand[index])) continue
        hand.push(lab.hand[index])
        handInstanceIds.push(lab.handInstanceIds[index])
      }
      lab = {
        ...lab,
        hand,
        handInstanceIds,
        discardPile: lab.discardPile.filter((id) => !isResidueCard(id)),
      }
      brewMessage =
        residueCount > 0
          ? `Filter: purged ${residueCount} Residue card(s).`
          : 'Filter: no Residue to purge.'
      break
    }
    case 'swap-slots': {
      const [a, b] = lab.tableSlots
      if (!a || !b) {
        brewMessage = 'Stir: both circle slots must be filled to swap.'
        const rolledBack = pushCardsToHand(lab, deckId)
        lab = {
          ...lab,
          ...rolledBack,
          discardPile: lab.discardPile.filter((id) => id !== deckId),
        }
      } else {
        lab = { ...lab, tableSlots: [b, a] }
        brewMessage = 'Stir: swapped the ingredients in the circle.'
      }
      break
    }
    default:
      break
  }

  lab = { ...lab, brewMessage, brewOutcome: 'success' }
  return { ...state, lab }
}

export function clearBrewMessage(state: GameRuntimeState): GameRuntimeState {
  if (!state.lab) {
    return state
  }
  return {
    ...state,
    lab: {
      ...state.lab,
      brewMessage: null,
      brewOutcome: state.lab.pendingBrew ? state.lab.brewOutcome : 'idle',
    },
  }
}

export function discardFromHand(
  state: GameRuntimeState,
  deckId: string,
): GameRuntimeState {
  if (!state.lab) {
    return state
  }

  const labBase = ensureLabInstances(state.lab)
  const removed = removeFirstDeckIdFromHand(labBase, deckId)
  if (!removed) {
    return state
  }

  const lab: LabSession = {
    ...labBase,
    ...removed,
    discardPile: [...labBase.discardPile, deckId],
    brewMessage: isResidueCard(deckId)
      ? 'Residue discarded.'
      : `Discarded ${ingredientDisplayName(deckId)}.`,
    brewOutcome: 'idle',
  }

  return { ...state, lab }
}

export function startExploration(
  state: GameRuntimeState,
  locationId: string,
): GameRuntimeState {
  if (state.save.explorationRunsRemaining <= 0) {
    return state
  }

  const location = LOCATION_MAP.get(locationId)
  if (!location) {
    return state
  }

  const propertyMap = new Map(
    [...INGREDIENT_MAP.values()].map((ing) => [ing.id, ing.properties]),
  )
  const biased = biasPoolForTrait(location.ingredientPool, location.trait, propertyMap)
  const pool = biased.filter((id: string) => INGREDIENT_MAP.has(id))
  const event = rollExplorationEvent(locationId)
  const choiceCount = event?.type === 'bountiful' ? 4 : 3
  const choices = uniquePick(pool, choiceCount)

  return {
    ...state,
    phase: 'exploration',
    exploration: { locationId, choices, event },
  }
}

export function completeExploration(
  state: GameRuntimeState,
  ingredientId: string,
): GameRuntimeState {
  if (!state.exploration) {
    return state
  }

  if (!state.exploration.choices.includes(ingredientId)) {
    return state
  }

  let save: GameSaveData = {
    ...state.save,
    explorationRunsRemaining: state.save.explorationRunsRemaining - 1,
    experience: state.save.experience + GAME_CONFIG.xpPerExploration,
    ownedIngredientIds: state.save.ownedIngredientIds.includes(ingredientId)
      ? state.save.ownedIngredientIds
      : [...state.save.ownedIngredientIds, ingredientId],
    discoveredIngredientIds: state.save.discoveredIngredientIds.includes(ingredientId)
      ? state.save.discoveredIngredientIds
      : [...state.save.discoveredIngredientIds, ingredientId],
    journalEntries: state.save.discoveredIngredientIds.includes(ingredientId)
      ? state.save.journalEntries
      : [
          createJournalEntry({
            kind: 'discovery',
            title: `Found: ${INGREDIENT_MAP.get(ingredientId)?.name ?? 'Unknown Ingredient'}`,
            body: INGREDIENT_MAP.get(ingredientId)?.description ?? '',
            relatedIds: [ingredientId],
          }),
          ...state.save.journalEntries,
        ],
  }

  save = updateOrders(save, { type: 'explore' })

  const event = state.exploration.event
  if (event?.type === 'scroll' && event.hintRecipeId) {
    const recipe = RECIPE_MAP.get(event.hintRecipeId)
    if (recipe && !save.revealedHints.includes(recipe.id)) {
      save = {
        ...save,
        revealedHints: [...save.revealedHints, recipe.id],
        journalEntries: [
          createJournalEntry({
            kind: 'discovery',
            title: 'Recipe Scroll Found',
            body: recipe.hint,
            relatedIds: [recipe.id],
          }),
          ...save.journalEntries,
        ],
      }
    }
  }

  if (event?.type === 'curse') {
    save = {
      ...save,
      gold: Math.max(0, save.gold - 8),
      journalEntries: [
        createJournalEntry({
          kind: 'experiment',
          title: 'Ominous Ground',
          body: 'Something foul lingered at the site. You lost 8 gold shaking it off.',
          relatedIds: [],
        }),
        ...save.journalEntries,
      ],
    }
  }

  return syncSave(
    {
      ...state,
      phase: 'exploration',
      exploration: null,
    },
    save,
  )
}

export function addCardToDeck(
  state: GameRuntimeState,
  cardId: string,
): GameRuntimeState {
  if (isPotionDeckId(cardId)) {
    const potionId = potionIdFromDeckId(cardId)
    const unlocked = potionId && saveHasDiscoveredPotion(state.save, potionId)
    if (!unlocked || !canAddToDeck(state.save.playerDeck, cardId)) {
      return state
    }
    const save = {
      ...state.save,
      playerDeck: [...state.save.playerDeck, cardId],
    }
    return syncSave(state, save)
  }

  if (isTechniqueDeckId(cardId)) {
    const techniqueId = techniqueIdFromDeckId(cardId)
    if (
      !techniqueId
      || !state.save.ownedTechniqueIds.includes(techniqueId)
      || !canAddToDeck(state.save.playerDeck, cardId)
    ) {
      return state
    }
    const save = {
      ...state.save,
      playerDeck: [...state.save.playerDeck, cardId],
    }
    return syncSave(state, save)
  }

  if (!state.save.ownedIngredientIds.includes(cardId)) {
    return state
  }
  if (!canAddToDeck(state.save.playerDeck, cardId)) {
    return state
  }

  const save = {
    ...state.save,
    playerDeck: [...state.save.playerDeck, cardId],
  }
  return syncSave(state, save)
}

export function removeCardFromDeck(
  state: GameRuntimeState,
  cardId: string,
): GameRuntimeState {
  const index = state.save.playerDeck.indexOf(cardId)
  if (index < 0) {
    return state
  }

  const deck = [...state.save.playerDeck]
  deck.splice(index, 1)
  const save = { ...state.save, playerDeck: deck }
  return syncSave(state, save)
}

export function buyShopItem(
  state: GameRuntimeState,
  _shopItemId: string,
  ingredientId: string,
  price: number,
): GameRuntimeState {
  if (ingredientId === 'reagent-pack') {
    if (state.save.gold < price) {
      return state
    }
    const save = {
      ...state.save,
      gold: state.save.gold - price,
      reagents: state.save.reagents + 3,
    }
    return syncSave(state, save)
  }

  if (state.save.gold < price) {
    return state
  }
  if (!state.save.ownedIngredientIds.includes(ingredientId)) {
    const save = {
      ...state.save,
      gold: state.save.gold - price,
      ownedIngredientIds: [...state.save.ownedIngredientIds, ingredientId],
      discoveredIngredientIds: state.save.discoveredIngredientIds.includes(ingredientId)
        ? state.save.discoveredIngredientIds
        : [...state.save.discoveredIngredientIds, ingredientId],
    }
    return syncSave(state, save)
  }

  if (!canAddToDeck(state.save.playerDeck, ingredientId)) {
    return state
  }

  const save = {
    ...state.save,
    gold: state.save.gold - price,
    playerDeck: [...state.save.playerDeck, ingredientId],
  }
  return syncSave(state, save)
}

export function prepareIngredient(
  state: GameRuntimeState,
  preparationId: string,
): GameRuntimeState {
  const prep = PREPARATION_MAP.get(preparationId)
  if (!prep) {
    return state
  }

  if (
    !state.save.ownedIngredientIds.includes(prep.inputId)
    || state.save.gold < prep.goldCost
    || state.save.ownedIngredientIds.includes(prep.outputId)
  ) {
    return state
  }

  const save = {
    ...state.save,
    gold: state.save.gold - prep.goldCost,
    ownedIngredientIds: [...state.save.ownedIngredientIds, prep.outputId],
    discoveredIngredientIds: state.save.discoveredIngredientIds.includes(prep.outputId)
      ? state.save.discoveredIngredientIds
      : [...state.save.discoveredIngredientIds, prep.outputId],
    journalEntries: [
      createJournalEntry({
        kind: 'experiment',
        title: `Prepared: ${INGREDIENT_MAP.get(prep.outputId)?.name ?? prep.name}`,
        body: prep.description,
        relatedIds: [prep.outputId],
      }),
      ...state.save.journalEntries,
    ],
  }

  return syncSave(state, save)
}

export function claimOrderReward(
  state: GameRuntimeState,
  templateId: string,
): GameRuntimeState {
  const order = state.save.activeOrders.find((o) => o.templateId === templateId)
  const template = ORDER_TEMPLATE_MAP.get(templateId)
  if (!order || !template || !order.completed || order.claimed) {
    return state
  }

  let ownedTechniqueIds = [...state.save.ownedTechniqueIds]
  if (
    template.rewardTechniqueId
    && !ownedTechniqueIds.includes(template.rewardTechniqueId)
  ) {
    ownedTechniqueIds = [...ownedTechniqueIds, template.rewardTechniqueId]
  }

  const orders = state.save.activeOrders.map((o) =>
    o.templateId === templateId ? { ...o, claimed: true } : o,
  )

  const save = {
    ...state.save,
    gold: state.save.gold + template.rewardGold,
    experience: state.save.experience + template.rewardXp,
    ownedTechniqueIds,
    activeOrders: orders,
    journalEntries: [
      createJournalEntry({
        kind: 'milestone',
        title: `Order Complete: ${template.title}`,
        body: `Reward: ${template.rewardGold} gold, ${template.rewardXp} XP`,
        relatedIds: [template.id],
      }),
      ...state.save.journalEntries,
    ],
  }

  return syncSave(state, save)
}

export function cancelExplorationEncounter(
  state: GameRuntimeState,
): GameRuntimeState {
  return { ...state, exploration: null }
}

export function getUndiscoveredRecipeHints(
  save: GameSaveData,
): { id: string; hint: string }[] {
  return RECIPES.filter((r) => !save.discoveredRecipeIds.includes(r.id)).map(
    (r) => ({ id: r.id, hint: r.hint }),
  )
}

export function getRevealedHints(save: GameSaveData): { id: string; hint: string }[] {
  return save.revealedHints
    .map((id) => {
      const recipe = RECIPE_MAP.get(id)
      return recipe ? { id, hint: recipe.hint } : null
    })
    .filter((entry): entry is { id: string; hint: string } => entry !== null)
}

export function getPlayerRank(save: GameSaveData): string {
  return getRankForXp(save.experience).name
}

export function getRecipeMasteryInfo(save: GameSaveData, recipeId: string) {
  const count = getMasteryCount(save, recipeId)
  return { count, level: getRecipeMasteryLevel(count) }
}

export function resolveCard(cardId: string) {
  return resolveDeckCard(cardId)
}

function saveHasDiscoveredPotion(save: GameSaveData, potionId: string): boolean {
  return save.discoveredRecipeIds.some((recipeId) => {
    const recipe = RECIPE_MAP.get(recipeId)
    return recipe?.resultPotionId === potionId
  })
}

export function resolvePotion(potionId: string) {
  return POTION_MAP.get(potionId)
}

export function getOwnedTechniques(save: GameSaveData): string[] {
  const owned = new Set([...STARTER_TECHNIQUE_IDS, ...save.ownedTechniqueIds])
  return [...owned]
}

export { countInDeck, ingredientDisplayName }
