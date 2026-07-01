export interface DailyChallenge {
  id: string
  title: string
  description: string
  requiredElement: 'earth' | 'water' | 'fire' | 'air' | 'aether'
  rewardGold: number
  rewardXp: number
}

export const DAILY_CHALLENGES: readonly DailyChallenge[] = [
  {
    id: 'chal-fire-brew',
    title: 'Heart of Flame',
    description: 'Discover any recipe using a fire ingredient today.',
    requiredElement: 'fire',
    rewardGold: 25,
    rewardXp: 30,
  },
  {
    id: 'chal-water-brew',
    title: 'Tides of Knowledge',
    description: 'Discover any recipe using a water ingredient today.',
    requiredElement: 'water',
    rewardGold: 25,
    rewardXp: 30,
  },
  {
    id: 'chal-aether-brew',
    title: 'Arcane Resonance',
    description: 'Discover any recipe using an aether ingredient today.',
    requiredElement: 'aether',
    rewardGold: 35,
    rewardXp: 40,
  },
  {
    id: 'chal-earth-brew',
    title: 'Roots and Stone',
    description: 'Discover any recipe using an earth ingredient today.',
    requiredElement: 'earth',
    rewardGold: 25,
    rewardXp: 30,
  },
] as const

export function getDailyChallengeForDate(date: Date): DailyChallenge {
  const dayIndex = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  )
  return DAILY_CHALLENGES[dayIndex % DAILY_CHALLENGES.length]
}
