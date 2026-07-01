import { useRef, useState } from 'react'
import { motion, type PanInfo } from 'framer-motion'
import type { GameCard } from '@/cards/types'
import { Card } from '@/ui/components/Card'
import { DraggableCardBody } from '@/ui/components/DraggableCardBody'

interface DraggableCardProps {
  deckId: string
  card: GameCard
  selected?: boolean
  onDrop: (deckId: string, point: { x: number; y: number }) => void
  onSelect?: () => void
}

export function DraggableCard({
  deckId,
  card,
  selected,
  onDrop,
  onSelect,
}: DraggableCardProps) {
  const dragMoved = useRef(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false)
    if (elementRef.current) {
      elementRef.current.style.pointerEvents = 'none'
    }
    onDrop(deckId, info.point)
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
      dragElastic={0.12}
      dragMomentum={false}
      whileDrag={{
        scale: 1.1,
        zIndex: 100,
        rotate: 4,
        boxShadow: '0 28px 56px rgba(0,0,0,0.6)',
        cursor: 'grabbing',
      }}
      onDragStart={() => {
        dragMoved.current = false
        setIsDragging(true)
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
      <DraggableCardBody interactive={!isDragging}>
        <Card
          card={card}
          selected={selected}
          motionless
          flippable
          flipped={flipped}
          onFlipChange={setFlipped}
        />
      </DraggableCardBody>
    </motion.div>
  )
}
