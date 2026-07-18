import { lazy, Suspense } from 'react'
import { useGameStore } from '@/stores/gameStore'

const Ferrofluid = lazy(() =>
  import('@/ui/components/Ferrofluid').then((module) => ({
    default: module.Ferrofluid,
  })),
)

const AURELIA_FLUID_COLORS: string[] = ['#c47a2c', '#e8a84a', '#3d5a3e', '#6b8cae']

export function AppBackground() {
  const phase = useGameStore((state) => state.phase)
  const showFluid = phase !== 'laboratory'

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink">
      {showFluid && (
        <>
          <Suspense fallback={null}>
            <Ferrofluid
              colors={AURELIA_FLUID_COLORS}
              speed={0.45}
              scale={1.6}
              turbulence={0.9}
              fluidity={0.12}
              rimWidth={0.22}
              sharpness={2.5}
              shimmer={1.4}
              glow={1.8}
              flowDirection="down"
              opacity={0.85}
              mouseInteraction
              mouseStrength={0.9}
              mouseRadius={0.3}
              mouseDampening={0.18}
              mixBlendMode="screen"
            />
          </Suspense>
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(26, 20, 16, 0.35) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(26, 20, 16, 0.55) 0%, transparent 60%)',
            }}
          />
        </>
      )}
    </div>
  )
}
