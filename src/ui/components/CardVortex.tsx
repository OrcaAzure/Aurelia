import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { createNoise3D } from 'simplex-noise'

interface CardVortexProps {
  className?: string
  baseHue?: number
  particleCount?: number
  backgroundColor?: string
  active?: boolean
}

export function CardVortex({
  className,
  baseHue = 35,
  particleCount = 120,
  backgroundColor = 'transparent',
  active = true,
}: CardVortexProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameId = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !active) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particlePropCount = 9
    const particlePropsLength = particleCount * particlePropCount
    const rangeY = 40
    const baseTTL = 40
    const rangeTTL = 80
    const baseSpeed = 0.1
    const rangeSpeed = 0.9
    const baseRadius = 0.6
    const rangeRadius = 1.2
    const rangeHue = 50
    const noiseSteps = 3
    const xOff = 0.0025
    const yOff = 0.0025
    const zOff = 0.001
    const noise3D = createNoise3D()

    let tick = 0
    let particleProps = new Float32Array(particlePropsLength)
    let center: [number, number] = [0, 0]
    const TAU = 2 * Math.PI
    const rand = (n: number) => n * Math.random()
    const randRange = (n: number) => n - rand(2 * n)
    const fadeInOut = (t: number, m: number) => {
      const hm = 0.5 * m
      return Math.abs(((t + hm) % m) - hm) / hm
    }
    const lerp = (n1: number, n2: number, speed: number) =>
      (1 - speed) * n1 + speed * n2

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      center[0] = 0.5 * width
      center[1] = 0.5 * height
    }

    const initParticle = (i: number) => {
      const w = canvas.width / Math.min(window.devicePixelRatio, 2)
      const x = rand(w)
      const y = center[1] + randRange(rangeY)
      particleProps.set(
        [
          x,
          y,
          0,
          0,
          0,
          baseTTL + rand(rangeTTL),
          baseSpeed + rand(rangeSpeed),
          baseRadius + rand(rangeRadius),
          baseHue + rand(rangeHue),
        ],
        i,
      )
    }

    const initParticles = () => {
      tick = 0
      particleProps = new Float32Array(particlePropsLength)
      for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        initParticle(i)
      }
    }

    const checkBounds = (x: number, y: number, w: number, h: number) =>
      x > w || x < 0 || y > h || y < 0

    const drawParticle = (
      x: number,
      y: number,
      x2: number,
      y2: number,
      life: number,
      ttl: number,
      radius: number,
      hue: number,
    ) => {
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineWidth = radius
      ctx.strokeStyle = `hsla(${hue},85%,58%,${fadeInOut(life, ttl) * 0.85})`
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.restore()
    }

    const updateParticle = (i: number, w: number, h: number) => {
      const i2 = 1 + i
      const i3 = 2 + i
      const i4 = 3 + i
      const i5 = 4 + i
      const i6 = 5 + i
      const i7 = 6 + i
      const i8 = 7 + i
      const i9 = 8 + i

      const x = particleProps[i]
      const y = particleProps[i2]
      const n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU
      const vx = lerp(particleProps[i3], Math.cos(n), 0.5)
      const vy = lerp(particleProps[i4], Math.sin(n), 0.5)
      let life = particleProps[i5]
      const ttl = particleProps[i6]
      const speed = particleProps[i7]
      const x2 = x + vx * speed
      const y2 = y + vy * speed
      const radius = particleProps[i8]
      const hue = particleProps[i9]

      drawParticle(x, y, x2, y2, life, ttl, radius, hue)

      life += 1
      particleProps[i] = x2
      particleProps[i2] = y2
      particleProps[i3] = vx
      particleProps[i4] = vy
      particleProps[i5] = life

      if (checkBounds(x, y, w, h) || life > ttl) {
        initParticle(i)
      }
    }

    const draw = () => {
      const w = canvas.width / Math.min(window.devicePixelRatio, 2)
      const h = canvas.height / Math.min(window.devicePixelRatio, 2)
      tick += 1

      ctx.clearRect(0, 0, w, h)
      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, w, h)
      }

      for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        updateParticle(i, w, h)
      }

      ctx.save()
      ctx.filter = 'blur(4px) brightness(160%)'
      ctx.globalCompositeOperation = 'lighter'
      ctx.drawImage(canvas, 0, 0, w, h)
      ctx.restore()

      animationFrameId.current = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    draw()

    const observer = new ResizeObserver(() => {
      resize()
      initParticles()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [active, backgroundColor, baseHue, particleCount])

  if (!active) return null

  return (
    <div ref={containerRef} className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}

export function vortexHueForCard(card: {
  category: string
  element?: string
  rarity: string
}): number {
  if (card.category === 'potion') return 265
  if (card.category === 'technique') return 38
  switch (card.element) {
    case 'fire':
      return 28
    case 'water':
      return 205
    case 'earth':
      return 115
    case 'air':
      return 195
    case 'aether':
      return 275
    default:
      return 35
  }
}

export function useVortexForRarity(rarity: string): boolean {
  return rarity === 'uncommon' || rarity === 'rare' || rarity === 'mythic'
}
