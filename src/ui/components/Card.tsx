import { useState, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import type { GameCard, IngredientCard, IngredientProperty } from '@/cards/types'
import { EvervaultCardEffect, evervaultGradientForCard } from '@/ui/components/EvervaultCardEffect'
import { CardElementAnimation } from '@/ui/components/CardElementAnimation'
import { CardVortex, vortexHueForCard } from '@/ui/components/CardVortex'

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
  rack?: boolean
  motionless?: boolean
  flippable?: boolean
  flipped?: boolean
  onFlipChange?: (flipped: boolean) => void
  showFlipControl?: boolean
  onClick?: () => void
}

function cardDimensions(compact: boolean, rack: boolean) {
  if (rack) {
    return { width: 'w-[7.25rem]', height: 'h-[9.75rem]', art: 'h-12', title: 'text-xs' }
  }
  if (compact) {
    return { width: 'w-32', height: 'h-[11.5rem]', art: 'h-16', title: 'text-sm' }
  }
  return { width: 'w-44', height: 'h-[18rem]', art: 'h-24', title: 'text-lg' }
}

function CardArt({
  card,
  compact,
  rack,
  showVortex,
  active,
}: {
  card: GameCard
  compact: boolean
  rack: boolean
  showVortex: boolean
  active: boolean
}) {
  const dims = cardDimensions(compact, rack)
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

  const styles = rarityStyles[card.rarity]

  return (
    <div className={`relative bg-gradient-to-br ${artClass} ${dims.art}`}>
      {showVortex && (
        <CardVortex
          baseHue={vortexHueForCard(card)}
          particleCount={card.rarity === 'mythic' ? 160 : card.rarity === 'rare' ? 130 : 100}
          active={active}
        />
      )}
      <CardElementAnimation card={card} compact={compact} rack={rack} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(196,122,44,0.2),transparent_60%)]" />
      {card.category === 'potion' && (
        <div className="absolute bottom-2 left-1/2 z-10 h-10 w-6 -translate-x-1/2 rounded-b-full border-2 border-vial/50 bg-vial/20" />
      )}
      {card.category === 'technique' && (
        <div className="absolute bottom-3 left-1/2 z-10 h-8 w-8 -translate-x-1/2 rotate-45 border-2 border-amber/50 bg-amber/15" />
      )}
      <span className="absolute left-2 top-2 z-10 rounded px-1.5 py-0.5 font-display text-[10px] uppercase tracking-widest text-parchment/90">
        {typeLabel}
      </span>
      <span
        className={`absolute right-2 top-2 z-10 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
      >
        {card.rarity}
      </span>
    </div>
  )
}

function CardFront({
  card,
  compact,
  rack,
  showVortex,
  active,
}: {
  card: GameCard
  compact: boolean
  rack: boolean
  showVortex: boolean
  active: boolean
}) {
  const dims = cardDimensions(compact, rack)
  const tight = compact || rack

  return (
    <>
      <CardArt card={card} compact={compact} rack={rack} showVortex={showVortex} active={active} />
      <div className={`flex flex-1 flex-col p-3 ${tight ? 'p-2' : ''}`}>
        <h3 className={`font-display leading-tight text-ink ${dims.title}`}>
          {card.name}
        </h3>

        {!tight && (
          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-ink/75">
            {card.description}
          </p>
        )}

        {card.category === 'ingredient' && card.properties.length > 0 && !tight && (
          <div className="mt-2 flex flex-wrap gap-1">
            {card.properties.slice(0, 2).map((prop) => (
              <span
                key={prop}
                className="rounded bg-ink/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-ink/55"
              >
                {propertyLabel[prop]}
              </span>
            ))}
          </div>
        )}

        <footer className={`mt-auto flex items-center justify-between border-t border-parchment-dark pt-1.5 text-[9px] uppercase tracking-wide text-ink/60 ${rack ? 'flex-col items-start gap-0.5' : ''}`}>
          {card.category === 'potion' ? (
            <>
              <span className={`text-vial ${rack ? 'line-clamp-1' : ''}`}>{card.effectLabel}</span>
              {!rack && <span>Bottle {card.bottleValue}g</span>}
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
}

function CardBack({ card, compact, rack }: { card: GameCard; compact: boolean; rack: boolean }) {
  const tight = compact || rack
  return (
    <div className={`flex h-full flex-col bg-ink p-3 text-parchment ${tight ? 'p-2' : ''}`}>
      <p className="font-display text-[10px] uppercase tracking-[0.3em] text-amber/80">
        Info
      </p>
      <h3 className={`mt-1.5 font-display text-amber-light ${rack ? 'text-xs' : compact ? 'text-sm' : 'text-lg'}`}>
        {card.name}
      </h3>
      <p className={`mt-1.5 flex-1 overflow-y-auto leading-relaxed text-parchment/80 ${rack ? 'text-[9px]' : compact ? 'text-[10px]' : 'text-xs'}`}>
        {card.description}
      </p>

      <div className="mt-3 space-y-1.5 border-t border-parchment/15 pt-2 text-[10px] text-parchment/65">
        <p>
          <span className="text-parchment/40">Rarity · </span>
          <span className="capitalize">{card.rarity}</span>
        </p>
        {card.category === 'ingredient' && (
          <>
            <p>
              <span className="text-parchment/40">Element · </span>
              {elementLabel[card.element]}
            </p>
            <p>
              <span className="text-parchment/40">Potency · </span>
              {card.potency}
            </p>
            {card.properties.length > 0 && (
              <p>
                <span className="text-parchment/40">Properties · </span>
                {card.properties.map((p) => propertyLabel[p]).join(', ')}
              </p>
            )}
          </>
        )}
        {card.category === 'potion' && (
          <>
            <p>
              <span className="text-parchment/40">Effect · </span>
              {card.effectLabel}
            </p>
            <p>
              <span className="text-parchment/40">Bottle value · </span>
              {card.bottleValue}g
            </p>
          </>
        )}
        {card.category === 'technique' && (
          <p>
            <span className="text-parchment/40">Effect · </span>
            {card.effectLabel}
          </p>
        )}
      </div>

      <p className="mt-1.5 text-center text-[8px] uppercase tracking-widest text-parchment/35">
        Tap ↩ to close
      </p>
    </div>
  )
}

function FlipShell({
  card,
  compact,
  rack,
  showVortex,
  flipped,
  faceClass,
  widthClass,
  heightClass,
  showFlipControl,
  onFlipToggle,
}: {
  card: GameCard
  compact: boolean
  rack: boolean
  showVortex: boolean
  flipped: boolean
  faceClass: string
  widthClass: string
  heightClass: string
  showFlipControl: boolean
  onFlipToggle: () => void
}) {
  return (
    <div
      className={`relative ${widthClass} ${heightClass}`}
      style={{ perspective: '1200px' }}
    >
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className={`absolute inset-0 flex w-full flex-col overflow-hidden rounded-xl border-2 bg-parchment ${faceClass}`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <CardFront card={card} compact={compact} rack={rack} showVortex={showVortex} active={!flipped} />
        </div>
        <div
          className="absolute inset-0 w-full overflow-hidden rounded-xl border-2 border-amber/30 bg-ink shadow-[0_0_20px_rgba(196,122,44,0.15)]"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardBack card={card} compact={compact} rack={rack} />
        </div>
      </motion.div>

      {showFlipControl && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onFlipToggle()
          }}
          className="absolute right-1.5 top-1.5 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-amber/45 bg-ink/95 text-[10px] font-bold text-amber-light shadow-md transition hover:border-amber-light hover:bg-amber/25"
          title={flipped ? 'Show front' : 'Card info'}
        >
          {flipped ? '↩' : 'i'}
        </button>
      )}
    </div>
  )
}

export function Card({
  card,
  selected = false,
  compact = false,
  rack = false,
  motionless = false,
  flippable = false,
  flipped: flippedProp,
  onFlipChange,
  showFlipControl = false,
  onClick,
}: CardProps) {
  const [flippedInternal, setFlippedInternal] = useState(false)
  const flipped = flippedProp ?? flippedInternal
  const setFlipped = onFlipChange ?? setFlippedInternal

  const styles = rarityStyles[card.rarity]
  const showVortex = card.rarity === 'mythic' && !compact && !rack
  const dims = cardDimensions(compact, rack)

  const categoryBorder =
    card.category === 'potion'
      ? 'border-vial/60'
      : card.category === 'technique'
        ? 'border-amber/50'
        : ''

  const faceClass = [
    styles.border,
    styles.glow,
    categoryBorder,
    selected ? 'ring-2 ring-amber-light ring-offset-1 ring-offset-ink' : '',
    onClick || flippable ? 'cursor-pointer' : '',
    motionless ? 'select-none' : '',
  ].join(' ')

  const handleDoubleClick = (e: MouseEvent) => {
    if (!flippable) return
    e.stopPropagation()
    e.preventDefault()
    setFlipped(!flipped)
  }

  const body = flippable ? (
    <FlipShell
      card={card}
      compact={compact}
      rack={rack}
      showVortex={showVortex}
      flipped={flipped}
      faceClass={faceClass}
      widthClass={dims.width}
      heightClass={dims.height}
      showFlipControl={showFlipControl}
      onFlipToggle={() => setFlipped(!flipped)}
    />
  ) : (
    <article className={`flex flex-col overflow-hidden rounded-xl border-2 bg-parchment ${dims.width} ${dims.height} ${faceClass}`}>
      <CardFront card={card} compact={compact} rack={rack} showVortex={showVortex} active />
    </article>
  )

  const wrappedBody = (
    <EvervaultCardEffect
      enabled={!compact && !rack && !flipped}
      gradientClass={evervaultGradientForCard(card)}
      className="inline-block"
    >
      {body}
    </EvervaultCardEffect>
  )

  if (motionless) {
    return (
      <div onClick={onClick} onDoubleClick={handleDoubleClick} className="inline-block">
        {wrappedBody}
      </div>
    )
  }

  return (
    <motion.div
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      className="inline-block"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {wrappedBody}
    </motion.div>
  )
}

export type { GameCard }
