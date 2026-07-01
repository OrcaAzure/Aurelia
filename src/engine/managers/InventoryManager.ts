import type { Inventory, InventoryItem } from '@/models'

export interface InventoryManager {
  getInventory(): Inventory
  getItem(category: keyof Pick<Inventory, 'ingredients' | 'potions' | 'cards'>, id: string): InventoryItem | undefined
  addItem(category: keyof Pick<Inventory, 'ingredients' | 'potions' | 'cards'>, id: string, quantity?: number): void
  removeItem(category: keyof Pick<Inventory, 'ingredients' | 'potions' | 'cards'>, id: string, quantity?: number): boolean
  hasEnough(category: keyof Pick<Inventory, 'ingredients' | 'potions' | 'cards'>, id: string, quantity: number): boolean
  addGold(amount: number): void
  spendGold(amount: number): boolean
  addReagents(amount: number): void
  spendReagents(amount: number): boolean
}
