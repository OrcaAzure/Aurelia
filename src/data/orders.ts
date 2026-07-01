import type { IngredientElement } from '@/cards/types'

export type OrderType =
  | 'brew_element'
  | 'brew_count'
  | 'bottle_gold'
  | 'explore'
  | 'transmute'
  | 'craft_potion'

export interface OrderTemplate {
  id: string
  title: string
  description: string
  type: OrderType
  target: number
  element?: IngredientElement
  rewardGold: number
  rewardXp: number
  rewardTechniqueId?: string
}

export interface ActiveOrder {
  templateId: string
  progress: number
  completed: boolean
  claimed: boolean
}

export const ORDER_TEMPLATES: readonly OrderTemplate[] = [
  {
    id: 'ord-brew-fire',
    title: 'Kindle the Crucible',
    description: 'Brew 2 recipes using fire ingredients.',
    type: 'brew_element',
    target: 2,
    element: 'fire',
    rewardGold: 25,
    rewardXp: 30,
  },
  {
    id: 'ord-brew-water',
    title: 'Tidal Studies',
    description: 'Brew 2 recipes using water ingredients.',
    type: 'brew_element',
    target: 2,
    element: 'water',
    rewardGold: 25,
    rewardXp: 30,
  },
  {
    id: 'ord-brew-any',
    title: 'Steady Practice',
    description: 'Successfully brew 3 potions.',
    type: 'brew_count',
    target: 3,
    rewardGold: 20,
    rewardXp: 25,
  },
  {
    id: 'ord-bottle',
    title: 'Merchant\'s Request',
    description: 'Bottle potions worth 40 gold total.',
    type: 'bottle_gold',
    target: 40,
    rewardGold: 15,
    rewardXp: 20,
  },
  {
    id: 'ord-explore',
    title: 'Field Research',
    description: 'Complete 2 exploration runs.',
    type: 'explore',
    target: 2,
    rewardGold: 30,
    rewardXp: 35,
  },
  {
    id: 'ord-transmute',
    title: 'Material Fusion',
    description: 'Perform 1 transmutation.',
    type: 'transmute',
    target: 1,
    rewardGold: 35,
    rewardXp: 40,
  },
  {
    id: 'ord-craft',
    title: 'Card Binder',
    description: 'Craft 2 potion cards into your deck.',
    type: 'craft_potion',
    target: 2,
    rewardGold: 20,
    rewardXp: 25,
    rewardTechniqueId: 'stir',
  },
  {
    id: 'ord-brew-aether',
    title: 'Arcane Calibration',
    description: 'Brew 2 recipes using aether ingredients.',
    type: 'brew_element',
    target: 2,
    element: 'aether',
    rewardGold: 35,
    rewardXp: 45,
  },
] as const

export const ORDER_TEMPLATE_MAP = new Map(
  ORDER_TEMPLATES.map((order) => [order.id, order]),
)

function hashDate(date: Date): number {
  const key = date.toISOString().slice(0, 10)
  let hash = 0
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return hash
}

export function generateDailyOrders(date: Date): ActiveOrder[] {
  const hash = hashDate(date)
  const pool = [...ORDER_TEMPLATES]
  const selected: ActiveOrder[] = []

  for (let i = 0; i < 3 && pool.length > 0; i += 1) {
    const index = (hash + i * 17) % pool.length
    const template = pool.splice(index, 1)[0]
    selected.push({
      templateId: template.id,
      progress: 0,
      completed: false,
      claimed: false,
    })
  }

  return selected
}
