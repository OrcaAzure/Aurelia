export interface PreparationRecipe {
  id: string
  name: string
  description: string
  inputId: string
  outputId: string
  goldCost: number
}

export const PREPARATIONS: readonly PreparationRecipe[] = [
  {
    id: 'prep-dry-herb',
    name: 'Dry Herb',
    description: 'Hang herbs to dry. Loses living essence but gains potency and stability.',
    inputId: 'ing-herb',
    outputId: 'ing-dried-herb',
    goldCost: 8,
  },
  {
    id: 'prep-grind-crystal',
    name: 'Grind Crystal',
    description: 'Pulverize crystal dust into a finer, more reactive powder.',
    inputId: 'ing-crystal-dust',
    outputId: 'ing-fine-crystal',
    goldCost: 8,
  },
  {
    id: 'prep-soak-salt',
    name: 'Brine Soak',
    description: 'Soak sea salt in purified water until it crystallizes further.',
    inputId: 'ing-sea-salt',
    outputId: 'ing-brined-salt',
    goldCost: 8,
  },
] as const

export const PREPARATION_MAP = new Map(
  PREPARATIONS.map((prep) => [prep.id, prep]),
)
