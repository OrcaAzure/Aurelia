import { useRef, useState } from 'react'
import { motion, type PanInfo } from 'framer-motion'
import type { GameCard } from '@/cards/types'
import { detectLabCanvasAtPoint } from '@/lib/dragDrop'
import { Card } from '@/ui/components/Card'
import { DraggableCardBody } from '@/ui/components/DraggableCardBody'

interface RackDraggablePotionProps {
  instanceId: string
  card: GameCard
  onPlaceOnDesk: (instanceId: string, point: { x: number; y: number }) => void
}

export function RackDraggablePotion({
  instanceId,
  card,
  onPlaceOnDesk,
}: RackDraggablePotionProps) {
  const dragMoved = useRef(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (elementRef.current) {
      elementRef.current.style.pointerEvents = 'none'
    }

    if (dragMoved.current && detectLabCanvasAtPoint(info.point)) {
      onPlaceOnDesk(instanceId, info.point)
    }

    requestAnimationFrame(() => {
      if (elementRef.current) {
        elementRef.current.style.pointerEvents = ''
      }
    })
    dragMoved.current = false
  }

  const canDrag = !flipped

  return (
    <motion.div
      ref={elementRef}
      drag={canDrag}
      dragSnapToOrigin
      dragElastic={0.12}
      dragMomentum={false}
      whileDrag={{
        scale: 1.08,
        zIndex: 200,
        rotate: 5,
        boxShadow: '0 28px 56px rgba(0,0,0,0.6)',
        cursor: 'grabbing',
      }}
      onDragStart={() => {
        dragMoved.current = false
      }}
      onDrag={(_event, info) => {
        if (Math.abs(info.offset.x) > 4 || Math.abs(info.offset.y) > 4) {
          dragMoved.current = true
        }
      }}
      onDragEnd={handleDragEnd}
      className="cursor-grab touch-none active:cursor-grabbing"
    >
      <DraggableCardBody>
        <Card
          card={card}
          rack
          motionless
          flippable
          flipped={flipped}
          onFlipChange={setFlipped}
          showFlipControl
        />
      </DraggableCardBody>
    </motion.div>
  )
}
