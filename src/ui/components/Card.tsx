import { motion } from 'framer-motion'
import type { GameCard, IngredientCard, IngredientProperty } from '@/cards/types'

const rarityStyles: Record<
  GameCard['rarity'],
  { border: string; badge: string; glow: string }
> = {
  common: {
    border: 'border-parchment-dark',
    badge: 'bg-parchment-dark text-ink/70',
    glow: 'shadow-[0_0_12px_rgba(244,234,213,0.15)]',
  },
  uncommon: {
    border: 'border-moss',
    badge: 'bg-moss/20 text-moss',
    glow: 'shadow-[0_0_16px_rgba(61,90,62,0.35)]',
  },
  rare: {
    border: 'border-vial',
    badge: 'bg-vial/20 text-vial',
    glow: 'shadow-[0_0_16px_rgba(107,140,174,0.35)]',
  },
  mythic: {
    border: 'border-amber-light',
    badge: 'bg-amber/30 text-amber-light',
    glow: 'shadow-[0_0_20px_rgba(232,168,74,0.45)]',
  },
}

const elementArt: Record<IngredientCard['element'], string> = {
  earth: 'from-moss/60 via-parchment-dark to-ink/40',
  water: 'from-vial/70 via-slate-600/50 to-ink/40',
  fire: 'from-amber/70 via-red-900/40 to-ink/40',
  air: 'from-parchment/50 via-slate-400/30 to-ink/30',
  aether: 'from-purple-500/50 via-vial/40 to-amber/30',
}

const elementLabel: Record<IngredientCard['element'], string> = {
  earth: 'Earth',
  water: 'Water',
  fire: 'Fire',
  air: 'Air',
  aether: 'Aether',
}

const propertyLabel: Record<IngredientProperty, string> = {
  volatile: 'Volatile',
  stable: 'Stable',
  living: 'Living',
  crystalline: 'Crystal',
  refined: 'Refined',
}

export interface CardProps {
  card: GameCard
  selected?: boolean
  compact?: boolean
  motionless?: boolean
  onClick?: () => void
}

export function Card({
  card,
  selected = false,
  compact = false,
  motionless = false,
  onClick,
}: CardProps) {
  const styles = rarityStyles[card.rarity]

  const categoryBorder =
    card.category === 'potion'
      ? 'border-vial/60'
      : card.category === 'technique'
        ? 'border-amber/50'
        : ''

  const className = [
    'relative flex flex-col overflow-hidden rounded-xl border-2 bg-parchment text-ink',
    styles.border,
    styles.glow,
    compact ? 'w-32' : 'w-44',
    selected ? 'ring-2 ring-amber-light ring-offset-2 ring-offset-ink' : '',
    onClick ? 'cursor-pointer' : '',
    motionless ? 'select-none' : '',
    categoryBorder,
  ].join(' ')

  const artClass =
    card.category === 'potion'
      ? 'from-vial/80 via-purple-900/40 to-amber/30'
      : card.category === 'technique'
        ? 'from-amber/60 via-parchment-dark to-ink/40'
        : elementArt[card.element]

  const typeLabel =
    card.category === 'potion'
      ? 'Potion'
      : card.category === 'technique'
        ? 'Technique'
        : elementLabel[card.element]

  const content = (
    <>
      <div
        className={`relative h-24 bg-gradient-to-br ${artClass} ${compact ? 'h-16' : ''}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(196,122,44,0.25),transparent_60%)]" />
        {card.category === 'potion' && (
          <div className="absolute bottom-2 left-1/2 h-10 w-6 -translate-x-1/2 rounded-b-full border-2 border-vial/50 bg-vial/20" />
        )}
        {card.category === 'technique' && (
          <div className="absolute bottom-3 left-1/2 h-8 w-8 -translate-x-1/2 rotate-45 border-2 border-amber/50 bg-amber/15" />
        )}
        <span className="absolute left-2 top-2 rounded px-1.5 py-0.5 font-display text-[10px] uppercase tracking-widest text-parchment/90">
          {typeLabel}
        </span>
        <span
          className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
        >
          {card.rarity}
        </span>
      </div>

      <div className={`flex flex-1 flex-col p-3 ${compact ? 'p-2' : ''}`}>
        <h3 className={`font-display leading-tight text-ink ${compact ? 'text-sm' : 'text-lg'}`}>
          {card.name}
        </h3>

        {!compact && (
          <p className="mt-2 flex-1 text-xs leading-relaxed text-ink/75">
            {card.description}
          </p>
        )}

        {card.category === 'ingredient' && card.properties.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {card.properties.map((prop) => (
              <span
                key={prop}
                className="rounded bg-ink/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-ink/55"
              >
                {propertyLabel[prop]}
              </span>
            ))}
          </div>
        )}

        <footer className="mt-2 flex items-center justify-between border-t border-parchment-dark pt-2 text-[10px] uppercase tracking-wide text-ink/60">
          {card.category === 'potion' ? (
            <>
              <span className="text-vial">{card.effectLabel}</span>
              <span>Bottle {card.bottleValue}g</span>
            </>
          ) : card.category === 'technique' ? (
            <>
              <span className="text-amber">{card.effectLabel}</span>
              <span>Tool</span>
            </>
          ) : (
            <>
              <span>Potency {card.potency}</span>
              <span>Ingredient</span>
            </>
          )}
        </footer>
      </div>
    </>
  )

  if (motionless) {
    return (
      <article onClick={onClick} className={className}>
        {content}
      </article>
    )
  }

  return (
    <motion.article
      onClick={onClick}
      className={className}
      whileHover={onClick ? { y: -8, scale: 1.02 } : { y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {content}
    </motion.article>
  )
}

export type { GameCard }
