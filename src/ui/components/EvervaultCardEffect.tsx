import { cn } from '@/lib/utils'
import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function generateRandomString(length: number): string {
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return result
}

export function evervaultGradientForCard(card: {
  category: string
  element?: string
  rarity: string
}): string {
  if (card.rarity === 'mythic') {
    return 'from-amber via-orange-500 to-amber-light'
  }
  if (card.category === 'potion') {
    return 'from-violet-600 via-vial to-cyan-500'
  }
  if (card.category === 'technique') {
    return 'from-amber/90 via-orange-600 to-amber-light'
  }
  switch (card.element) {
    case 'fire':
      return 'from-red-700 via-amber to-orange-500'
    case 'water':
      return 'from-slate-600 via-vial to-cyan-600'
    case 'earth':
      return 'from-moss via-emerald-600 to-lime-700'
    case 'air':
      return 'from-slate-400 via-sky-400 to-indigo-500'
    case 'aether':
      return 'from-purple-700 via-vial to-fuchsia-500'
    default:
      return 'from-moss via-vial to-amber'
  }
}

interface EvervaultCardEffectProps {
  children: ReactNode
  enabled?: boolean
  className?: string
  gradientClass?: string
}

export function EvervaultCardEffect({
  children,
  enabled = true,
  className,
  gradientClass = 'from-moss via-vial to-amber',
}: EvervaultCardEffectProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [randomString, setRandomString] = useState('')

  const maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`

  useEffect(() => {
    setRandomString(generateRandomString(1200))
  }, [])

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { left, top } = event.currentTarget.getBoundingClientRect()
    mouseX.set(event.clientX - left)
    mouseY.set(event.clientY - top)
    setRandomString(generateRandomString(1200))
  }

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <div
      className={cn('group/evervault relative', className)}
      onMouseMove={handleMouseMove}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute inset-0 rounded-xl opacity-20 [mask-image:linear-gradient(white,transparent)] transition-opacity duration-500 group-hover/evervault:opacity-40" />

        <motion.div
          style={{
            maskImage,
            WebkitMaskImage: maskImage,
          }}
          className={cn(
            'absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover/evervault:opacity-100',
            gradientClass,
          )}
        />

        <motion.div
          style={{
            maskImage,
            WebkitMaskImage: maskImage,
          }}
          className="absolute inset-0 rounded-xl opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover/evervault:opacity-100"
        >
          <p className="absolute inset-0 overflow-hidden whitespace-pre-wrap break-all p-2 font-mono text-[8px] font-bold leading-tight text-white/90">
            {randomString}
          </p>
        </motion.div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  )
}
