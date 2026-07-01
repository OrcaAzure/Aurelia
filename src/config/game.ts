export const GAME_CONFIG = {
  handSizeOnLabStart: 5,
  maxHandSize: 7,
  maxIngredientDeckSize: 20,
  maxSupportDeckSize: 10,
  maxDeckSize: 30,
  maxCopiesPerCard: 3,
  brewReagentCost: 1,
  startingReagents: 8,
  startingGold: 50,
  explorationRunsPerDay: 3,
  xpPerDiscovery: 40,
  xpPerBrew: 10,
  xpPerExploration: 15,
  goldPerDiscovery: 10,
  reshuffleDiscardWhenEmpty: true,
  volatileConsumeChance: 0.25,
  residueCardId: 'ing-residue',
  masteryBrewsForBonus: 3,
  masteryBrewsForMaster: 5,
  masteryBottleBonusPercent: 20,
  preparationGoldCost: 8,
  locationEventChance: 0.35,
  ordersPerDay: 3,
} as const

export const RANKS = [
  { id: 'apprentice', name: 'Apprentice', minXp: 0 },
  { id: 'adept', name: 'Adept', minXp: 100 },
  { id: 'master', name: 'Master Alchemist', minXp: 300 },
] as const

export function getRankForXp(xp: number): (typeof RANKS)[number] {
  return [...RANKS].reverse().find((entry) => xp >= entry.minXp) ?? RANKS[0]
}
