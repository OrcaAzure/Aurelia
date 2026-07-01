export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic'

export type CardCategory = 'ingredient' | 'potion' | 'tool' | 'technique'

export type IngredientElement =
  | 'earth'
  | 'water'
  | 'fire'
  | 'air'
  | 'aether'

export type IngredientProperty =
  | 'volatile'
  | 'stable'
  | 'living'
  | 'crystalline'
  | 'refined'

export interface CardBase {
  id: string
  name: string
  description: string
  rarity: CardRarity
  category: CardCategory
}

export interface IngredientCard extends CardBase {
  category: 'ingredient'
  element: IngredientElement
  potency: number
  properties: readonly IngredientProperty[]
}

export type PotionEffect =
  | 'restore-reagents'
  | 'draw-cards'
  | 'reveal-hint'
  | 'gain-gold'

export interface PotionCard extends CardBase {
  category: 'potion'
  potionId: string
  effect: PotionEffect
  effectLabel: string
  bottleValue: number
}

export type TechniqueEffect =
  | 'recover-discard'
  | 'boost-fire'
  | 'remove-residue'
  | 'swap-slots'

export interface TechniqueCard extends CardBase {
  category: 'technique'
  techniqueId: string
  effect: TechniqueEffect
  effectLabel: string
}

export type GameCard = IngredientCard | PotionCard | TechniqueCard

export const POTION_CARD_PREFIX = 'pcard-'
export const TECHNIQUE_CARD_PREFIX = 'tech-'

export function isPotionDeckId(id: string): boolean {
  return id.startsWith(POTION_CARD_PREFIX)
}

export function isIngredientDeckId(id: string): boolean {
  return id.startsWith('ing-')
}

export function isTechniqueDeckId(id: string): boolean {
  return id.startsWith(TECHNIQUE_CARD_PREFIX)
}

export function isSupportDeckId(id: string): boolean {
  return isPotionDeckId(id) || isTechniqueDeckId(id)
}

export function potionDeckId(potionId: string): string {
  return `${POTION_CARD_PREFIX}${potionId}`
}

export function techniqueDeckId(techniqueId: string): string {
  return `${TECHNIQUE_CARD_PREFIX}${techniqueId}`
}

export function potionIdFromDeckId(deckId: string): string | undefined {
  if (!isPotionDeckId(deckId)) {
    return undefined
  }
  return deckId.slice(POTION_CARD_PREFIX.length)
}

export function techniqueIdFromDeckId(deckId: string): string | undefined {
  if (!isTechniqueDeckId(deckId)) {
    return undefined
  }
  return deckId.slice(TECHNIQUE_CARD_PREFIX.length)
}

// Legacy alias
export type Card = IngredientCard
