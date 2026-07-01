import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  phaseKey: string
  children: ReactNode
}

export function PageTransition({ phaseKey, children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phaseKey}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
