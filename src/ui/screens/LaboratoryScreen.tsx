import { useEffect, useRef } from 'react'
import { audioService } from '@/audio'
import { GAME_CONFIG } from '@/config'
import { getPlayerRank, resolveCard, useGameStore } from '@/stores/gameStore'
import { AlchemyCircle } from '@/ui/components/AlchemyCircle'
import { DeckStats } from '@/ui/components/DeckStats'
import { Hand } from '@/ui/components/Hand'
import { LaboratoryTopBar } from '@/ui/components/LaboratoryTopBar'

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
  const clearBrewMessage = useGameStore((state) => state.clearBrewMessage)

  const prevOutcome = useRef(lab?.brewOutcome ?? 'idle')
  const prevDiscoveredCount = useRef(save.discoveredRecipeIds.length)

  useEffect(() => {
    if (!lab) return
    if (lab.brewOutcome === prevOutcome.current) return

    if (lab.brewOutcome === 'success') {
      audioService.play('brew-success')
    } else if (lab.brewOutcome === 'fail') {
      audioService.play('brew-fail')
    }
    prevOutcome.current = lab.brewOutcome
  }, [lab?.brewOutcome, lab])

  useEffect(() => {
    if (save.discoveredRecipeIds.length > prevDiscoveredCount.current) {
      audioService.play('discover')
    }
    prevDiscoveredCount.current = save.discoveredRecipeIds.length
  }, [save.discoveredRecipeIds.length])

  if (!lab) {
    return null
  }

  const handEntries = lab.hand
    .map((id) => ({ id, card: resolveCard(id) }))
    .filter((entry): entry is { id: string; card: NonNullable<ReturnType<typeof resolveCard>> } => entry.card !== undefined)

  const rank = getPlayerRank(save)

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
          <AlchemyCircle
            slots={lab.tableSlots}
            resultPotionId={lab.resultPotionId}
            brewMessage={lab.brewMessage}
            brewOutcome={lab.brewOutcome}
            pendingBrew={lab.pendingBrew}
            selectedCardId={selectedCardId}
            resolveCard={resolveCard}
            onRemoveFromSlot={removeCardFromSlot}
            onPlaceInSlot={(slotIndex) => {
              if (selectedCardId) {
                placeCardInSlot(selectedCardId, slotIndex)
              }
            }}
            onBrew={brew}
            onCraft={craftPotionCard}
            onBottle={bottlePotion}
            onDismissMessage={clearBrewMessage}
          />
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
            />
          </div>
        </div>
      </div>
    </div>
  )
}
