export interface InventorySlot {
  cardId: string
  quantity: number
}

export interface Inventory {
  slots: InventorySlot[]
  gold: number
  reagents: number
}

export interface InventoryManager {
  getInventory(): Inventory
  addCard(cardId: string, quantity?: number): void
  removeCard(cardId: string, quantity?: number): boolean
}
