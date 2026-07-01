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
}: DeskCardProps) {
  const x = useMotionValue(transform.x)
  const y = useMotionValue(transform.y)
  const dragMoved = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (!isDragging) {
      x.set(transform.x)
      y.set(transform.y)
    }
  }, [transform.x, transform.y, isDragging, x, y])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false)
    if (disabled || flipped) return

    const next: CardTransform = {
      x: transform.x + info.offset.x,
      y: transform.y + info.offset.y,
      rotate: transform.rotate + info.offset.x * 0.035,
    }
    onMove(next)

    const center = {
      x: next.x + DESK_CARD_WIDTH / 2,
      y: next.y + DESK_CARD_HEIGHT / 2,
    }
    const overlap = onCheckOverlap(center, cardId)
    if (overlap) {
      onFuse(overlap)
    }

    dragMoved.current = false
  }

  const canDrag = !disabled && !flipped

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
      drag={canDrag}
      dragMomentum={false}
      dragElastic={0.05}
      style={{
        x,
        y,
        rotate: flipped ? 0 : transform.rotate,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: isDragging || flipped ? 500 : zIndex,
        width: DESK_CARD_WIDTH,
      }}
      whileDrag={
        canDrag
          ? {
              scale: 1.05,
              rotate: transform.rotate + 4,
              boxShadow: '0 36px 72px rgba(0,0,0,0.7)',
              cursor: 'grabbing',
            }
          : undefined
      }
      onDragStart={() => {
        if (!canDrag) return
        dragMoved.current = false
        setIsDragging(true)
        onFocus()
      }}
      onDrag={(_e, info) => {
        if (Math.abs(info.offset.x) > 4 || Math.abs(info.offset.y) > 4) {
          dragMoved.current = true
        }
      }}
      onDragEnd={handleDragEnd}
      className={[
        'touch-none drop-shadow-[0_18px_36px_rgba(0,0,0,0.45)]',
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
      ].join(' ')}
    >
      {flipped ? (
        cardNode
      ) : (
        <DraggableCardBody interactive={canDrag && !isDragging}>
          {cardNode}
        </DraggableCardBody>
      )}
    </motion.div>
  )
}
