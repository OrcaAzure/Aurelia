import type { IngredientCard } from './types'

export const STARTER_INGREDIENTS: readonly IngredientCard[] = [
  {
    id: 'ing-moon-dew',
    name: 'Moon Dew',
    description: 'Condensed mist gathered beneath a waxing moon. Calms volatile mixtures.',
    rarity: 'common',
    category: 'ingredient',
    element: 'water',
    potency: 1,
  },
  {
    id: 'ing-ember-root',
    name: 'Ember Root',
    description: 'A fibrous root that smolders without flame. Anchors heat in a brew.',
    rarity: 'common',
    category: 'ingredient',
    element: 'fire',
    potency: 1,
  },
  {
    id: 'ing-whisper-moss',
    name: 'Whisper Moss',
    description: 'Soft lichen that hums when crushed. Carries subtle earthy notes.',
    rarity: 'uncommon',
    category: 'ingredient',
    element: 'earth',
    potency: 2,
  },
] as const
