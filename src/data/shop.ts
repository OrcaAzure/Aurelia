export interface ShopItem {
  id: string
  ingredientId: string
  price: number
  stock: number
}

export const SHOP_ITEMS: readonly ShopItem[] = [
  { id: 'shop-sulfur', ingredientId: 'ing-sulfur', price: 20, stock: 3 },
  { id: 'shop-pearl-dust', ingredientId: 'ing-pearl-dust', price: 45, stock: 2 },
  { id: 'shop-crystal-dust', ingredientId: 'ing-crystal-dust', price: 25, stock: 3 },
  { id: 'shop-phoenix-ash', ingredientId: 'ing-phoenix-ash', price: 80, stock: 1 },
  { id: 'shop-reagents', ingredientId: 'reagent-pack', price: 15, stock: 99 },
] as const
