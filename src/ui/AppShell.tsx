import { useGameStore } from '@/stores/gameStore'
import { AppBackground } from '@/ui/components/AppBackground'
import { PageTransition } from '@/ui/components/PageTransition'
import { DeckbuildingScreen } from '@/ui/screens/DeckbuildingScreen'
import { ExplorationScreen } from '@/ui/screens/ExplorationScreen'
import { JournalScreen } from '@/ui/screens/JournalScreen'
import { LaboratoryScreen } from '@/ui/screens/LaboratoryScreen'
import { MainMenuScreen } from '@/ui/screens/MainMenuScreen'
import { SettingsScreen } from '@/ui/screens/SettingsScreen'
import { ShopScreen } from '@/ui/screens/ShopScreen'
import { PreparationScreen } from '@/ui/screens/PreparationScreen'

export function AppShell() {
  const phase = useGameStore((state) => state.phase)

  const screen = (() => {
    switch (phase) {
      case 'menu':
        return <MainMenuScreen />
      case 'laboratory':
        return <LaboratoryScreen />
      case 'journal':
        return <JournalScreen />
      case 'settings':
        return <SettingsScreen />
      case 'exploration':
        return <ExplorationScreen />
      case 'deckbuilding':
        return <DeckbuildingScreen />
      case 'shop':
        return <ShopScreen />
      case 'preparation':
        return <PreparationScreen />
      default:
        return <MainMenuScreen />
    }
  })()

  return (
    <div className="relative min-h-screen bg-ink">
      <AppBackground />
      <div className="relative z-10">
        <PageTransition phaseKey={phase}>{screen}</PageTransition>
      </div>
    </div>
  )
}
