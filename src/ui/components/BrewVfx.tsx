import { AnimatePresence, motion } from 'framer-motion'
import type { IngredientElement } from '@/cards/types'
import { INGREDIENT_MAP } from '@/data'

export type BrewAnimPhase = 'idle' | 'swirling' | 'flash'

interface BrewVfxProps {
  phase: BrewAnimPhase
  outcome: 'idle' | 'success' | 'fail'
  slotA: string | null
  slotB: string | null
}

const elementColor: Record<IngredientElement, string> = {
  earth: 'rgba(61,90,62,0.9)',
  water: 'rgba(107,140,174,0.9)',
  fire: 'rgba(196,122,44,0.95)',
  air: 'rgba(200,210,220,0.85)',
  aether: 'rgba(160,120,200,0.9)',
}

function particleColor(id: string | null): string {
  if (!id) return 'rgba(196,122,44,0.8)'
  const element = INGREDIENT_MAP.get(id)?.element ?? 'earth'
  return elementColor[element]
}

export function BrewVfx({ phase, outcome, slotA, slotB }: BrewVfxProps) {
  const colors = [particleColor(slotA), particleColor(slotB)]
  const flashColor =
    outcome === 'success'
      ? 'rgba(61,90,62,0.65)'
      : outcome === 'fail'
        ? 'rgba(140,45,35,0.55)'
        : 'rgba(196,122,44,0.4)'

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {phase === 'swirling' && (
          <motion.div
            key="swirl"
            className="absolute h-72 w-72"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2
              const startX = Math.cos(angle) * 140
              const startY = Math.sin(angle) * 140
              const color = colors[i % 2]
              return (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[1px]"
                  style={{ backgroundColor: color }}
                  initial={{ x: startX, y: startY, scale: 1, opacity: 0.9 }}
                  animate={{
                    x: [startX, startX * 0.4, 0],
                    y: [startY, startY * 0.4, 0],
                    scale: [1, 1.4, 0.2],
                    opacity: [0.9, 1, 0],
                  }}
                  transition={{
                    duration: 0.95,
                    ease: 'easeIn',
                    delay: i * 0.03,
                  }}
                />
              )
            })}
            <motion.div
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(196,122,44,0.5) 0%, transparent 70%)',
              }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 1.2, 0.8], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.95, ease: 'linear' }}
            />
          </motion.div>
        )}

        {phase === 'flash' && (
          <motion.div
            key="flash"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute h-96 w-96 rounded-full"
              style={{
                background: `radial-gradient(circle, ${flashColor} 0%, transparent 65%)`,
              }}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.4, 1.8], opacity: [0, 1, 0] }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
            />
            {outcome === 'success' && (
              <motion.div
                className="absolute h-40 w-40 rounded-full border-2 border-moss/60"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )}
            {outcome === 'fail' && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-red-800/80"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos((i / 8) * Math.PI * 2) * 90,
                      y: Math.sin((i / 8) * Math.PI * 2) * 90,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
