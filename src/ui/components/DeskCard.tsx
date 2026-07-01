import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, type PanInfo } from 'framer-motion'
import type { GameCard } from '@/cards/types'
import {
  DESK_CARD_HEIGHT,
  DESK_CARD_WIDTH,
  type CardTransform,
} from '@/lib/dragDrop'
import { Card } from '@/ui/components/Card'
import { DraggableCardBody } from '@/ui/components/DraggableCardBody'

interface DeskCardProps {
  cardId: string
  card: GameCard
  transform: CardTransform
  zIndex: number
  disabled?: boolean
  onFocus: () => void
  onMove: (transform: CardTransform) => void
  onFuse: (targetId: string) => void
  onCheckOverlap: (center: { x: number; y: number }, excludeId: string) => string | null
  onUse?: () => void
}

export function DeskCard({
  cardId,
  card,
  transform,
  zIndex,
  disabled,
  onFocus,
  onMove,
  onFuse,
  onCheckOverlap,
  onUse,
}: DeskCardProps) {
  const x = useMotionValue(transform.x)
  const y = useMotionValue(transform.y)
  const dragOrigin = useRef(transform)
  const [isDragging, setIsDragging] = useState(false)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (isDragging) return
    x.set(transform.x)
    y.set(transform.y)
  }, [transform.x, transform.y, isDragging, x, y])

  const handleDragStart = () => {
    dragOrigin.current = transform
    setIsDragging(true)
    onFocus()
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false)
    if (disabled || flipped) return

    const next: CardTransform = {
      x: dragOrigin.current.x + info.offset.x,
      y: dragOrigin.current.y + info.offset.y,
      rotate: dragOrigin.current.rotate + info.offset.x * 0.02,
    }

    x.set(next.x)
    y.set(next.y)
    onMove(next)

    const center = {
      x: next.x + DESK_CARD_WIDTH / 2,
      y: next.y + DESK_CARD_HEIGHT / 2,
    }
    const overlap = onCheckOverlap(center, cardId)
    if (overlap) {
      onFuse(overlap)
    }
  }

  const canDrag = !disabled && !flipped
  const showTilt = canDrag && !isDragging

  const cardNode = (
    <Card
      card={card}
      motionless
      flippable
      flipped={flipped}
      onFlipChange={setFlipped}
      showFlipControl
    />
  )

  return (
    <motion.div
      layout={false}
      drag={canDrag}
      dragMomentum={false}
      dragElastic={0}
      dragPropagation={false}
      style={{
        x,
        y,
        rotate: transform.rotate,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: isDragging || flipped ? 500 : zIndex,
        width: DESK_CARD_WIDTH,
        touchAction: 'none',
      }}
      whileDrag={{
        scale: 1.03,
        cursor: 'grabbing',
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={[
        'select-none',
        isDragging
          ? 'cursor-grabbing shadow-[0_24px_48px_rgba(0,0,0,0.55)]'
          : 'cursor-grab drop-shadow-[0_12px_28px_rgba(0,0,0,0.4)] active:cursor-grabbing',
      ].join(' ')}
    >
      {showTilt ? (
        <DraggableCardBody>{cardNode}</DraggableCardBody>
      ) : (
        cardNode
      )}
      {onUse && !isDragging && !flipped && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onUse()
          }}
          className="absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-vial/45 bg-ink/90 px-3 py-0.5 text-[9px] uppercase tracking-widest text-vial shadow-md hover:border-vial hover:bg-vial/15"
        >
          Use
        </button>
      )}
    </motion.div>
  )
}
