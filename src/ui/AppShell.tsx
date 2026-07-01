import { HomeScreen } from '@/ui/screens/HomeScreen'

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, #c47a2c33 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, #3d5a3e33 0%, transparent 50%)',
        }}
      />
      <HomeScreen />
    </div>
  )
}
