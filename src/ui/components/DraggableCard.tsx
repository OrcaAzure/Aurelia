import { useRef } from 'react'
import { motion, type PanInfo } from 'framer-motion'
import type { GameCard } from '@/cards/types'
import { Card } from '@/ui/components/Card'

interface DraggableCardProps {
  card: GameCard
  selected?: boolean
  onDrop: (cardId: string, point: { x: number; y: number }) => void
  onSelect?: () => void
}

export function DraggableCard({
  card,
  selected,
  onDrop,
  onSelect,
}: DraggableCardProps) {
  const dragMoved = useRef(false)
  const elementRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (elementRef.current) {
      elementRef.current.style.pointerEvents = 'none'
    }
    onDrop(card.id, info.point)
    requestAnimationFrame(() => {
      if (elementRef.current) {
        elementRef.current.style.pointerEvents = ''
      }
    })
    dragMoved.current = false
  }

  return (
    <motion.div
      ref={elementRef}
      drag
      dragSnapToOrigin
      dragElastic={0.15}
      dragMomentum={false}
      whileDrag={{
        scale: 1.08,
        zIndex: 100,
        boxShadow: '0 24px 48px rgba(0,0,0,0.55)',
        cursor: 'grabbing',
      }}
      onDragStart={() => {
        dragMoved.current = false
      }}
      onDrag={(_e, info) => {
        if (Math.abs(info.offset.x) > 4 || Math.abs(info.offset.y) > 4) {
          dragMoved.current = true
        }
      }}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (!dragMoved.current) {
          onSelect?.()
        }
      }}
      className="cursor-grab touch-none active:cursor-grabbing"
      style={{ position: 'relative', zIndex: selected ? 20 : 1 }}
    >
      <Card card={card} selected={selected} motionless />
    </motion.div>
  )
}
