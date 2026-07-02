import type { GameCard } from '@/cards/types'
import './CardElementAnimation.css'

interface CardElementAnimationProps {
  card: GameCard
  compact?: boolean
  rack?: boolean
}

function modifierClass(card: GameCard): string {
  if (card.category !== 'ingredient') return ''
  if (card.properties.includes('volatile')) return 'card-element-anim--volatile'
  if (card.properties.includes('living')) return 'card-element-anim--living'
  if (card.properties.includes('crystalline')) return 'card-element-anim--crystalline'
  return ''
}

function FireAnimation() {
  return (
    <>
      <div className="card-flame-wrap">
        <div className="card-flame" />
        <div className="card-flame" />
        <div className="card-flame" />
      </div>
      <div className="card-ember-particle" style={{ left: '38%' }} />
      <div className="card-ember-particle" />
      <div className="card-ember-particle" />
      <div className="card-ember-particle" />
    </>
  )
}

function WaterAnimation() {
  return (
    <>
      <div className="card-water-shimmer" />
      <div className="card-water-ripple" />
      <div className="card-water-ripple" />
    </>
  )
}

function EarthAnimation({ living }: { living?: boolean }) {
  return (
    <>
      <div className="card-earth-mote" />
      <div className="card-earth-mote" />
      <div className="card-earth-mote" />
      {living && (
        <div
          className="card-earth-mote"
          style={{ left: '30%', top: '48%', animationDelay: '0.4s' }}
        />
      )}
    </>
  )
}

function AirAnimation() {
  return (
    <>
      <div className="card-air-wisp" />
      <div className="card-air-wisp" />
    </>
  )
}

function AetherAnimation() {
  return (
    <>
      <div className="card-aether-core" />
      <div className="card-aether-spark" />
      <div className="card-aether-spark" />
      <div className="card-aether-spark" />
    </>
  )
}

function PotionAnimation({ small }: { small: boolean }) {
  const size = small ? 4 : 6
  return (
    <>
      <div
        className="card-potion-bubble"
        style={{
          left: '46%',
          bottom: small ? '14%' : '18%',
          width: size,
          height: size,
        }}
      />
      <div
        className="card-potion-bubble"
        style={{
          left: '52%',
          bottom: small ? '20%' : '24%',
          width: size - 1,
          height: size - 1,
          animationDelay: '0.5s',
        }}
      />
      <div
        className="card-potion-bubble"
        style={{
          left: '49%',
          bottom: small ? '26%' : '30%',
          width: size - 2,
          height: size - 2,
          animationDelay: '1s',
        }}
      />
    </>
  )
}

function TechniqueAnimation() {
  return <div className="card-technique-ring" />
}

function animationForCard(card: GameCard) {
  if (card.category === 'potion') {
    return 'potion'
  }
  if (card.category === 'technique') {
    return 'technique'
  }

  switch (card.element) {
    case 'fire':
      return 'fire'
    case 'water':
      return 'water'
    case 'earth':
      return 'earth'
    case 'air':
      return 'air'
    case 'aether':
      return 'aether'
    default:
      return null
  }
}

export function CardElementAnimation({
  card,
  compact = false,
  rack = false,
}: CardElementAnimationProps) {
  const kind = animationForCard(card)
  if (!kind) return null

  const small = compact || rack
  const living = card.category === 'ingredient' && card.properties.includes('living')

  return (
    <div
      className={`card-element-anim ${small ? 'card-element-anim--small' : ''} ${modifierClass(card)}`}
      aria-hidden
    >
      {kind === 'fire' && <FireAnimation />}
      {kind === 'water' && <WaterAnimation />}
      {kind === 'earth' && <EarthAnimation living={living} />}
      {kind === 'air' && <AirAnimation />}
      {kind === 'aether' && <AetherAnimation />}
      {kind === 'potion' && <PotionAnimation small={small} />}
      {kind === 'technique' && <TechniqueAnimation />}
    </div>
  )
}
