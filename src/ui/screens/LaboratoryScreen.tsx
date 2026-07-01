import { useCallback, useEffect, useRef, useState } from 'react'
import { audioService } from '@/audio'
import { GAME_CONFIG } from '@/config'
import { getPlayerRank, resolveCard, useGameStore } from '@/stores/gameStore'
import { AlchemyCircle } from '@/ui/components/AlchemyCircle'
import { BrewVfx, type BrewAnimPhase } from '@/ui/components/BrewVfx'
import { DeckStats } from '@/ui/components/DeckStats'
import { Hand } from '@/ui/components/Hand'
import { LaboratoryTopBar } from '@/ui/components/LaboratoryTopBar'

const SWIRL_MS = 650
const FLASH_MS = 500

export function LaboratoryScreen() {
  const save = useGameStore((state) => state.save)
  const lab = useGameStore((state) => state.lab)
  const selectedCardId = useGameStore((state) => state.selectedCardId)
  const setPhase = useGameStore((state) => state.setPhase)
  const openJournal = useGameStore((state) => state.openJournal)
  const selectCard = useGameStore((state) => state.selectCard)
  const placeCardInSlot = useGameStore((state) => state.placeCardInSlot)
  const removeCardFromSlot = useGameStore((state) => state.removeCardFromSlot)
  const drawCard = useGameStore((state) => state.drawCard)
  const brew = useGameStore((state) => state.brew)
  const craftPotionCard = useGameStore((state) => state.craftPotionCard)
  const bottlePotion = useGameStore((state) => state.bottlePotion)
  const playPotionCard = useGameStore((state) => state.playPotionCard)
  const playTechniqueCard = useGameStore((state) => state.playTechniqueCard)
  const discardFromHand = useGameStore((state) => state.discardFromHand)
  const clearBrewMessage = useGameStore((state) => state.clearBrewMessage)

  const [brewAnim, setBrewAnim] = useState<BrewAnimPhase>('idle')
  const [isBrewing, setIsBrewing] = useState(false)
  const [brewSlots, setBrewSlots] = useState<[string | null, string | null]>([null, null])
  const brewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const prevDiscoveredCount = useRef(save.discoveredRecipeIds.length)
  const pendingOutcome = useRef<'success' | 'fail'>('success')

  useEffect(() => {
    return () => {
      if (brewTimer.current) clearTimeout(brewTimer.current)
    }
  }, [])

  useEffect(() => {
    if (save.discoveredRecipeIds.length > prevDiscoveredCount.current) {
      audioService.play('discover')
    }
    prevDiscoveredCount.current = save.discoveredRecipeIds.length
  }, [save.discoveredRecipeIds.length])

  const handleBrew = useCallback(() => {
    if (!lab || isBrewing) return
    const [slotA, slotB] = lab.tableSlots
    if (!slotA || !slotB) return

    if (save.reagents < GAME_CONFIG.brewReagentCost) {
      brew()
      return
    }

    setBrewSlots([slotA, slotB])
    setIsBrewing(true)
    setBrewAnim('swirling')
    audioService.play('click')

    brewTimer.current = setTimeout(() => {
      brew()
      const outcome = useGameStore.getState().lab?.brewOutcome
      pendingOutcome.current = outcome === 'fail' ? 'fail' : 'success'
      if (outcome === 'success') {
        audioService.play('brew-success')
      } else if (outcome === 'fail') {
        audioService.play('brew-fail')
      }
      setBrewAnim('flash')

      brewTimer.current = setTimeout(() => {
        setBrewAnim('idle')
        setIsBrewing(false)
      }, FLASH_MS)
    }, SWIRL_MS)
  }, [lab, isBrewing, brew, save.reagents])

  if (!lab) {
    return null
  }

  const handEntries = lab.hand
    .map((id) => ({ id, card: resolveCard(id) }))
    .filter((entry): entry is { id: string; card: NonNullable<ReturnType<typeof resolveCard>> } => entry.card !== undefined)

  const rank = getPlayerRank(save)
  const flashOutcome =
    brewAnim === 'flash'
      ? pendingOutcome.current
      : lab.brewOutcome === 'success' || lab.brewOutcome === 'fail'
        ? lab.brewOutcome
        : 'idle'

  return (
    <div className="flex min-h-screen flex-col">
      <LaboratoryTopBar
        playerName={save.playerName}
        rank={rank}
        gold={save.gold}
        reagents={save.reagents}
        brewCost={GAME_CONFIG.brewReagentCost}
        onOpenJournal={() => openJournal('laboratory')}
        onOpenSettings={() => setPhase('settings')}
        onBack={() => setPhase('menu')}
      />

      <div className="lab-desk relative flex flex-1 flex-col overflow-visible">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(196,122,44,0.12),transparent_55%)]" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
          <div className="relative">
            <BrewVfx
              phase={brewAnim}
              outcome={flashOutcome}
              slotA={brewSlots[0]}
              slotB={brewSlots[1]}
            />
            <AlchemyCircle
              slots={isBrewing ? brewSlots : lab.tableSlots}
              resultPotionId={lab.resultPotionId}
              brewMessage={lab.brewMessage}
              brewOutcome={lab.brewOutcome}
              pendingBrew={lab.pendingBrew}
              selectedCardId={selectedCardId}
              isBrewing={isBrewing}
              resolveCard={resolveCard}
              onRemoveFromSlot={removeCardFromSlot}
              onPlaceInSlot={(slotIndex) => {
                if (selectedCardId && !isBrewing) {
                  placeCardInSlot(selectedCardId, slotIndex)
                }
              }}
              onBrew={handleBrew}
              onCraft={craftPotionCard}
              onBottle={bottlePotion}
              onDismissMessage={clearBrewMessage}
            />
          </div>
        </div>

        <div className="relative z-10 border-t border-amber/15 bg-ink/70 px-6 py-6 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <DeckStats
              deckCount={lab.drawPile.length}
              discardCount={lab.discardPile.length}
              onDraw={() => {
                audioService.play('draw')
                drawCard()
              }}
            />
            <Hand
              cards={handEntries.map((e) => e.card)}
              cardIds={handEntries.map((e) => e.id)}
              selectedCardId={selectedCardId}
              onSelectCard={(cardId) =>
                selectCard(selectedCardId === cardId ? null : cardId)
              }
              onCardDrop={(cardId, slotIndex) => placeCardInSlot(cardId, slotIndex)}
              onUsePotion={(cardId) => {
                audioService.play('click')
                playPotionCard(cardId)
              }}
              onUseTechnique={(cardId) => {
                audioService.play('click')
                playTechniqueCard(cardId)
              }}
              onDiscard={(cardId) => discardFromHand(cardId)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
