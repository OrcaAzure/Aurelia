export interface PlayerStats {
  experimentsRun: number
  potionsCrafted: number
  recipesDiscovered: number
  ingredientsFound: number
}

export interface Player {
  id: string
  name: string
  gold: number
  reagents: number
  experience: number
  stats: PlayerStats
}
