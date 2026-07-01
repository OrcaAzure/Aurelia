import { useRef, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface DraggableCardBodyProps {
  className?: string
  children: ReactNode
}

export function DraggableCardBody({
  className,
  children,
}: DraggableCardBodyProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const rotateX = useTransform(mouseY, [-160, 160], [10, -10])
  const rotateY = useTransform(mouseX, [-160, 160], [-10, 10])
  const glareOpacity = useTransform(mouseX, [-160, 0, 160], [0.18, 0, 0.18])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - (rect.left + rect.width / 2))
    mouseY.set(e.clientY - (rect.top + rect.height / 2))
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn('relative', className)}
    >
      {children}
      <motion.div
        style={{ opacity: glareOpacity }}
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 via-transparent to-transparent"
      />
    </motion.div>
  )
}

export function DraggableCardContainer({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('relative', className)}>{children}</div>
}
