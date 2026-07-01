import { useRef, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationControls,
} from 'framer-motion'

const springConfig = {
  stiffness: 100,
  damping: 20,
  mass: 0.5,
}

interface DraggableCardBodyProps {
  className?: string
  children: ReactNode
  /** Disable tilt while the outer wrapper is being dragged */
  interactive?: boolean
}

export function DraggableCardBody({
  className,
  children,
  interactive = true,
}: DraggableCardBodyProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const controls = useAnimationControls()

  const rotateX = useSpring(
    useTransform(mouseY, [-200, 200], [18, -18]),
    springConfig,
  )
  const rotateY = useSpring(
    useTransform(mouseX, [-200, 200], [-18, 18]),
    springConfig,
  )
  const opacity = useSpring(
    useTransform(mouseX, [-200, 0, 200], [0.92, 1, 0.92]),
    springConfig,
  )
  const glareOpacity = useSpring(
    useTransform(mouseX, [-200, 0, 200], [0.25, 0, 0.25]),
    springConfig,
  )

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!interactive) return
    const { clientX, clientY } = e
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(clientX - centerX)
    mouseY.set(clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    controls.start({
      rotateX: 0,
      rotateY: 0,
      transition: { type: 'spring', ...springConfig },
    })
  }

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
        opacity: interactive ? opacity : 1,
        willChange: 'transform',
      }}
      animate={controls}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('relative transform-3d', className)}
    >
      {children}
      <motion.div
        style={{ opacity: interactive ? glareOpacity : 0 }}
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/35 via-white/5 to-transparent"
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
  return (
    <div className={cn('[perspective:2400px]', className)}>{children}</div>
  )
}
