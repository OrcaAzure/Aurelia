import { motion } from 'framer-motion'
import type { Card } from '@/cards'
import { cardRevealPreset } from '@/animation'

const rarityBorder: Record<Card['rarity'], string> = {
  common: 'border-parchment-dark',
  uncommon: 'border-moss',
  rare: 'border-vial',
  mythic: 'border-amber-light',
}

const elementAccent: Record<
  Extract<Card, { element: string }>['element'],
  string
> = {
  earth: 'text-moss',
  water: 'text-vial',
  fire: 'text-amber-light',
  air: 'text-parchment',
  aether: 'text-amber',
}

interface CardProps {
  card: Card
  index?: number
}

export function CardView({ card, index = 0 }: CardProps) {
  const element = card.category === 'ingredient' ? card.element : null

  return (
    <motion.article
      className={`flex w-44 flex-col rounded-xl border-2 bg-parchment p-4 text-ink shadow-lg ${rarityBorder[card.rarity]}`}
      variants={cardRevealPreset.variants}
      initial="hidden"
      animate="visible"
      transition={{
        ...cardRevealPreset.transition,
        delay: index * 0.08,
      }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <header className="mb-3 border-b border-parchment-dark pb-2">
        <p className="font-display text-xs uppercase tracking-widest text-amber">
          {card.rarity}
        </p>
        <h3 className="font-display text-lg leading-tight">{card.name}</h3>
      </header>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-ink/80">
        {card.description}
      </p>

      {element && (
        <footer className="flex items-center justify-between text-xs uppercase tracking-wide">
          <span className={elementAccent[element]}>{element}</span>
          <span className="font-semibold">Potency {card.potency}</span>
        </footer>
      )}
    </motion.article>
  )
}
