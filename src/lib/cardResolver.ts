import type { GameCard, IngredientCard, PotionCard, TechniqueCard } from '@/cards/types'
import {
  isIngredientDeckId,
  isPotionDeckId,
  isTechniqueDeckId,
  potionIdFromDeckId,
  techniqueDeckId,
  techniqueIdFromDeckId,
} from '@/cards/types'
import { INGREDIENT_MAP } from '@/data/ingredients'
import { POTION_MAP } from '@/data/potions'
import { TECHNIQUE_MAP } from '@/data/techniques'

export function resolveDeckCard(deckId: string): GameCard | undefined {
  if (isIngredientDeckId(deckId)) {
    return INGREDIENT_MAP.get(deckId)
  }

  if (isPotionDeckId(deckId)) {
    const potionId = potionIdFromDeckId(deckId)
    if (!potionId) {
      return undefined
    }
    const potion = POTION_MAP.get(potionId)
    if (!potion) {
      return undefined
    }
    return potionToCard(potion)
  }

  if (isTechniqueDeckId(deckId)) {
    const techniqueId = techniqueIdFromDeckId(deckId)
    if (!techniqueId) {
      return undefined
    }
    const technique = TECHNIQUE_MAP.get(techniqueId)
    if (!technique) {
      return undefined
    }
    return techniqueToCard(technique)
  }

  return undefined
}

export function potionToCard(potion: {
  id: string
  name: string
  description: string
  rarity: PotionCard['rarity']
  effect: PotionCard['effect']
  effectLabel: string
  bottleValue: number
}): PotionCard {
  return {
    id: `pcard-${potion.id}`,
    potionId: potion.id,
    name: potion.name,
    description: potion.description,
    rarity: potion.rarity,
    category: 'potion',
    effect: potion.effect,
    effectLabel: potion.effectLabel,
    bottleValue: potion.bottleValue,
  }
}

export function techniqueToCard(technique: {
  id: string
  name: string
  description: string
  rarity: TechniqueCard['rarity']
  effect: TechniqueCard['effect']
  effectLabel: string
}): TechniqueCard {
  return {
    id: techniqueDeckId(technique.id),
    techniqueId: technique.id,
    name: technique.name,
    description: technique.description,
    rarity: technique.rarity,
    category: 'technique',
    effect: technique.effect,
    effectLabel: technique.effectLabel,
  }
}

export function resolveIngredient(deckId: string): IngredientCard | undefined {
  if (!isIngredientDeckId(deckId)) {
    return undefined
  }
  return INGREDIENT_MAP.get(deckId)
}

export function isIngredientCard(deckId: string): boolean {
  return isIngredientDeckId(deckId)
}

export function isPotionCard(deckId: string): boolean {
  return isPotionDeckId(deckId)
}

export function ingredientDisplayName(deckId: string): string {
  return INGREDIENT_MAP.get(deckId)?.name ?? deckId
}
