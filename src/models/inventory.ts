export interface InventoryItem {
  id: string
  quantity: number
}

export interface Inventory {
  ingredients: readonly InventoryItem[]
  potions: readonly InventoryItem[]
  cards: readonly InventoryItem[]
  gold: number
  reagents: number
}
