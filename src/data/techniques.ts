import type { TechniqueCard, TechniqueEffect } from '@/cards/types'

export interface TechniqueDefinition extends TechniqueCard {
  unlock: 'starter' | 'order' | 'mastery'
}

export const TECHNIQUES: readonly TechniqueDefinition[] = [
  {
    id: 'distill',
    techniqueId: 'distill',
    name: 'Distill',
    description: 'Recover one random card from your discard pile into your hand.',
    rarity: 'common',
    category: 'technique',
    effect: 'recover-discard',
    effectLabel: 'Recover from discard',
    unlock: 'starter',
  },
  {
    id: 'heat',
    techniqueId: 'heat',
    name: 'Heat',
    description: 'Your next brew treats all fire ingredients as +1 potency.',
    rarity: 'common',
    category: 'technique',
    effect: 'boost-fire',
    effectLabel: 'Boost fire potency',
    unlock: 'starter',
  },
  {
    id: 'filter',
    techniqueId: 'filter',
    name: 'Filter',
    description: 'Remove all Residue cards from your hand and discard pile.',
    rarity: 'uncommon',
    category: 'technique',
    effect: 'remove-residue',
    effectLabel: 'Purge residue',
    unlock: 'starter',
  },
  {
    id: 'stir',
    techniqueId: 'stir',
    name: 'Stir',
    description: 'Swap the two ingredients currently in the alchemy circle.',
    rarity: 'uncommon',
    category: 'technique',
    effect: 'swap-slots',
    effectLabel: 'Swap circle slots',
    unlock: 'order',
  },
] as const

export const TECHNIQUE_MAP = new Map(
  TECHNIQUES.map((technique) => [technique.id, technique]),
)

export const STARTER_TECHNIQUE_IDS: readonly string[] = TECHNIQUES.filter(
  (t) => t.unlock === 'starter',
).map((t) => t.id)

export type { TechniqueEffect }
