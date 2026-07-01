import type { IngredientElement, IngredientProperty } from '@/cards/types'

export type LocationTrait = 'lush' | 'volcanic' | 'tidal'

export type ExplorationEventType = 'scroll' | 'curse' | 'bountiful'

export interface ExplorationLocation {
  id: string
  name: string
  description: string
  ingredientPool: readonly string[]
  trait: LocationTrait
  traitLabel: string
  eventChance: number
}

export const EXPLORATION_LOCATIONS: readonly ExplorationLocation[] = [
  {
    id: 'loc-forest',
    name: 'Whispering Forest',
    description: 'Mossy groves and hidden springs. Herbs and spores grow in abundance.',
    ingredientPool: [
      'ing-nightshade',
      'ing-moonpetal',
      'ing-herb',
      'ing-wind-spore',
      'ing-dewdrop',
      'ing-glow-moss',
      'ing-bellflower',
      'ing-mycelium',
      'ing-sunbloom',
      'ing-witch-lichen',
      'ing-ash-root',
    ],
    trait: 'lush',
    traitLabel: 'Living ingredients appear more often',
    eventChance: 0.35,
  },
  {
    id: 'loc-caves',
    name: 'Rune Caves',
    description: 'Ancient tunnels beneath the hills. Minerals and embers line the walls.',
    ingredientPool: [
      'ing-iron-shavings',
      'ing-stone',
      'ing-ember',
      'ing-charcoal',
      'ing-sulfur',
      'ing-glow-moss',
      'ing-obsidian-shard',
      'ing-volcanic-glass',
      'ing-ash-root',
    ],
    trait: 'volcanic',
    traitLabel: 'Volatile and crystalline finds are common',
    eventChance: 0.4,
  },
  {
    id: 'loc-shoals',
    name: 'Western Shoals',
    description: 'Salt-spray cliffs and tide pools. Water ingredients wash ashore.',
    ingredientPool: [
      'ing-sea-salt',
      'ing-water',
      'ing-dewdrop',
      'ing-pearl-dust',
      'ing-moonpetal',
      'ing-crystal-dust',
      'ing-bellflower',
      'ing-frost-petal',
    ],
    trait: 'tidal',
    traitLabel: 'Stable water reagents drift ashore',
    eventChance: 0.3,
  },
] as const

export const LOCATION_MAP = new Map(
  EXPLORATION_LOCATIONS.map((location) => [location.id, location]),
)

export function biasPoolForTrait(
  pool: readonly string[],
  trait: LocationTrait,
  ingredientProperties: Map<string, readonly IngredientProperty[]>,
): string[] {
  const weighted = pool.flatMap((id) => {
    const props = ingredientProperties.get(id) ?? []
    let weight = 1
    if (trait === 'lush' && props.includes('living')) weight = 3
    if (trait === 'volcanic' && (props.includes('volatile') || props.includes('crystalline'))) {
      weight = 2
    }
    if (trait === 'tidal' && props.includes('stable')) weight = 2
    return Array.from({ length: weight }, () => id)
  })
  return weighted
}

export type { IngredientElement }
