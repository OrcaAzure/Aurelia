import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { audioService } from '@/audio'
import { GAME_CONFIG } from '@/config'
import { canDrawFromLab, countIngredientsInHand } from '@/engine/deckUtils'
import {
  clampToCanvas,
  findOverlappingCard,
  pointToCanvasPosition,
  scatterTransform,
  type CardTransform,
} from '@/lib/dragDrop'
import {
  findCatalystIngredientPairForPotion,
  findCatalystPotionForIngredientPair,
} from '@/lib/catalystFusion'
import { getLabIngredientAvailability } from '@/lib/labAvailability'
import { getPlayerRank, resolveCard, useGameStore } from '@/stores/gameStore'
import { BrewVfx, type BrewAnimPhase } from '@/ui/components/BrewVfx'
import { LabDeckPanel } from '@/ui/components/LabDeckPanel'
import { LabDesk } from '@/ui/components/LabDesk'
import { isIngredientDeckId, isPotionDeckId } from '@/cards/types'
import { isResidueCard } from '@/engine/deckUtils'
import { resolveCanvasDeckId, getCanvasCardIds, getRackPotionEntries } from '@/ui/components/LabSupportTray'
import { LabSupportSidebar } from '@/ui/components/LabSupportSidebar'
import { LaboratoryTopBar } from '@/ui/components/LaboratoryTopBar'

const MERGE_MS = 400
const SWIRL_MS = 650
const FLASH_MS = 500

export function LaboratoryScreen() {
  const save = useGameStore((state) => state.save)
  const lab = useGameStore((state) => state.lab)
  const setPhase = useGameStore((state) => state.setPhase)
  const openJournal = useGameStore((state) => state.openJournal)
  const mergeDeskIntoHand = useGameStore((state) => state.mergeDeskIntoHand)
  const prepareLabSession = useGameStore((state) => state.prepareLabSession)
  const fuseHandCards = useGameStore((state) => state.fuseHandCards)
  const fuseHandCardsWithCatalyst = useGameStore((state) => state.fuseHandCardsWithCatalyst)
  const drawCard = useGameStore((state) => state.drawCard)
  const brew = useGameStore((state) => state.brew)
  const craftPotionCard = useGameStore((state) => state.craftPotionCard)
  const bottlePotion = useGameStore((state) => state.bottlePotion)
  const playPotionCard = useGameStore((state) => state.playPotionCard)
  const placePotionOnDesk = useGameStore((state) => state.placePotionOnDesk)
  const returnPotionToRack = useGameStore((state) => state.returnPotionToRack)
  const playTechniqueCard = useGameStore((state) => state.playTechniqueCard)
  const discardFromHand = useGameStore((state) => state.discardFromHand)
  const clearBrewMessage = useGameStore((state) => state.clearBrewMessage)

  const canvasRef = useRef<HTMLDivElement>(null)
  const zCounter = useRef(1)
  const mergedDesk = useRef(false)
  const [cardTransforms, setCardTransforms] = useState<Record<string, CardTransform>>({})
  const [zOrder, setZOrder] = useState<Record<string, number>>({})
  const [brewAnim, setBrewAnim] = useState<BrewAnimPhase>('idle')
  const [isBrewing, setIsBrewing] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [mergingPair, setMergingPair] = useState<[string, string] | null>(null)
  const [mergeTransforms, setMergeTransforms] = useState<Record<string, CardTransform>>({})
  const [brewSlots, setBrewSlots] = useState<[string | null, string | null]>([null, null])
  const brewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fusedInstances = useRef<[string, string] | null>(null)
  const fusedCatalyst = useRef<string | null>(null)

  const prevDiscoveredCount = useRef(save.discoveredRecipeIds.length)
  const pendingOutcome = useRef<'success' | 'fail'>('success')

  const bringToFront = useCallback((cardId: string) => {
    zCounter.current += 1
    setZOrder((prev) => ({ ...prev, [cardId]: zCounter.current }))
  }, [])

  useLayoutEffect(() => {
    if (!mergedDesk.current) {
      prepareLabSession()
      mergeDeskIntoHand()
      mergedDesk.current = true
    }
  }, [mergeDeskIntoHand, prepareLabSession])

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

  const canvasCardIds = lab ? getCanvasCardIds(lab) : []
  const rackPotions = lab ? getRackPotionEntries(lab) : []

  const syncCardLayout = useCallback(() => {
    if (!lab) return
    const canvas = canvasRef.current
    const canvasW = canvas?.clientWidth ?? 600
    const canvasH = canvas?.clientHeight ?? 500
    const ids = getCanvasCardIds(lab)
    const zUpdates: Record<string, number> = {}

    setCardTransforms((prev) => {
      const next = { ...prev }
      let scatterIndex = 0

      for (const id of ids) {
        if (!next[id]) {
          next[id] = scatterTransform(scatterIndex, canvasW, canvasH)
          zCounter.current += 1
          zUpdates[id] = zCounter.current
          scatterIndex += 1
        }
      }

      for (const id of Object.keys(next)) {
        if (!ids.includes(id)) {
          delete next[id]
        }
      }

      return next
    })

    if (Object.keys(zUpdates).length > 0) {
      setZOrder((prev) => ({ ...prev, ...zUpdates }))
    }

    setZOrder((prev) => {
      const next = { ...prev }
      let changed = false
      for (const id of Object.keys(next)) {
        if (!ids.includes(id)) {
          delete next[id]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [lab])

  useEffect(() => {
    syncCardLayout()
  }, [syncCardLayout, canvasCardIds.join('|'), lab?.handInstanceIds?.join('|')])

  useEffect(() => {
    const onResize = () => syncCardLayout()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [syncCardLayout])

  const handleBrew = useCallback(() => {
    if (!lab || isBrewing) return
    const currentLab = useGameStore.getState().lab
    if (!currentLab) return
    const [slotA, slotB] = currentLab.tableSlots
    if (!slotA || !slotB) return

    if (brewTimer.current) {
      clearTimeout(brewTimer.current)
      brewTimer.current = null
    }

    if (save.reagents < GAME_CONFIG.brewReagentCost) {
      brew()
      fusedInstances.current = null
      setIsMerging(false)
      setMergingPair(null)
      setMergeTransforms({})
      syncCardLayout()
      return
    }

    setBrewSlots([slotA, slotB])
    setIsBrewing(true)
    setBrewAnim('swirling')
    audioService.play('click')

    brewTimer.current = setTimeout(() => {
      const fused = fusedInstances.current
      brew()
      const afterBrew = useGameStore.getState().lab
      const outcome = afterBrew?.brewOutcome
      pendingOutcome.current = outcome === 'fail' ? 'fail' : 'success'

      if (outcome === 'success' && fused) {
        setCardTransforms((prev) => {
          const next = { ...prev }
          delete next[fused[0]]
          delete next[fused[1]]
          if (fusedCatalyst.current) {
            delete next[fusedCatalyst.current]
          }
          return next
        })
      }

      fusedInstances.current = null
      fusedCatalyst.current = null

      if (outcome === 'success') {
        audioService.play('brew-success')
      } else if (outcome === 'fail') {
        audioService.play('brew-fail')
      }
      setBrewAnim('flash')

      brewTimer.current = setTimeout(() => {
        setBrewAnim('idle')
        setIsBrewing(false)
        setMergingPair(null)
        setMergeTransforms({})
        syncCardLayout()
      }, FLASH_MS)
    }, SWIRL_MS)
  }, [lab, isBrewing, brew, save.reagents, syncCardLayout])

  const startFusion = useCallback(
    (
      instanceA: string,
      instanceB: string,
      catalystInstance?: string,
    ) => {
      if (isBrewing || isMerging || !lab) return

      const deckA = resolveCanvasDeckId(lab, instanceA)
      const deckB = resolveCanvasDeckId(lab, instanceB)
      if (!deckA || !deckB) return

      const isIngredientPair =
        isIngredientDeckId(deckA)
        && isIngredientDeckId(deckB)
        && !isResidueCard(deckA)
        && !isResidueCard(deckB)

      if (!isIngredientPair) return

      const transforms: Record<string, CardTransform> = {
        [instanceA]: cardTransforms[instanceA],
        [instanceB]: cardTransforms[instanceB],
      }
      if (!transforms[instanceA] || !transforms[instanceB]) return

      if (brewTimer.current) {
        clearTimeout(brewTimer.current)
        brewTimer.current = null
      }

      if (catalystInstance) {
        fuseHandCardsWithCatalyst(instanceA, instanceB, catalystInstance)
        fusedCatalyst.current = catalystInstance
      } else {
        fuseHandCards(instanceA, instanceB)
        fusedCatalyst.current = null
      }

      const fused = useGameStore.getState().lab
      if (
        !fused
        || fused.tableSlots[0] !== deckA
        || fused.tableSlots[1] !== deckB
      ) {
        setIsMerging(false)
        setMergingPair(null)
        setMergeTransforms({})
        fusedCatalyst.current = null
        return
      }

      setMergingPair([instanceA, instanceB])
      setMergeTransforms(transforms)
      setIsMerging(true)
      fusedInstances.current = [instanceA, instanceB]
      audioService.play('click')

      brewTimer.current = setTimeout(() => {
        setIsMerging(false)
        handleBrew()
      }, MERGE_MS)
    },
    [
      isBrewing,
      isMerging,
      lab,
      cardTransforms,
      fuseHandCards,
      fuseHandCardsWithCatalyst,
      handleBrew,
    ],
  )

  const handleFuse = useCallback(
    (instanceA: string, instanceB: string) => {
      if (!lab) return

      const catalystInstance = findCatalystPotionForIngredientPair(
        instanceA,
        instanceB,
        cardTransforms,
        getCanvasCardIds(lab),
        (id) => resolveCanvasDeckId(lab, id),
      )

      startFusion(instanceA, instanceB, catalystInstance ?? undefined)
    },
    [lab, cardTransforms, startFusion],
  )

  const handleCatalystFuse = useCallback(
    (catalystInstance: string, instanceA: string, instanceB: string) => {
      startFusion(instanceA, instanceB, catalystInstance)
    },
    [startFusion],
  )

  const handleUsePotion = useCallback(
    (instanceId: string) => {
      if (isBrewing || isMerging) return
      audioService.play('click')
      playPotionCard(instanceId)
      setCardTransforms((prev) => {
        const next = { ...prev }
        delete next[instanceId]
        return next
      })
    },
    [isBrewing, isMerging, playPotionCard],
  )

  const handleReturnPotionToRack = useCallback(
    (instanceId: string) => {
      if (isBrewing || isMerging) return
      returnPotionToRack(instanceId)
      setCardTransforms((prev) => {
        const next = { ...prev }
        delete next[instanceId]
        return next
      })
    },
    [isBrewing, isMerging, returnPotionToRack],
  )

  const handlePlacePotionFromRack = useCallback(
    (instanceId: string, point: { x: number; y: number }) => {
      if (isBrewing || isMerging || !canvasRef.current) return
      audioService.play('draw')
      placePotionOnDesk(instanceId)

      const transform = pointToCanvasPosition(point, canvasRef.current)
      setCardTransforms((prev) => ({ ...prev, [instanceId]: transform }))
      zCounter.current += 1
      setZOrder((prev) => ({ ...prev, [instanceId]: zCounter.current }))
    },
    [isBrewing, isMerging, placePotionOnDesk],
  )

  const handleMoveCard = useCallback((cardId: string, transform: CardTransform) => {
    if (!canvasRef.current) return
    const clamped = clampToCanvas(transform, canvasRef.current)
    setCardTransforms((prev) => ({ ...prev, [cardId]: clamped }))
  }, [])

  const handleCheckCatalystOverlap = useCallback(
    (center: { x: number; y: number }, potionInstanceId: string) => {
      if (!lab) return null

      const potionDeckId = resolveCanvasDeckId(lab, potionInstanceId)
      if (!potionDeckId || !isPotionDeckId(potionDeckId)) {
        return null
      }

      return findCatalystIngredientPairForPotion(
        potionInstanceId,
        center,
        getCanvasCardIds(lab),
        cardTransforms,
        (id) => resolveCanvasDeckId(lab, id),
      )
    },
    [lab, cardTransforms],
  )

  const handleCheckOverlap = useCallback(
    (center: { x: number; y: number }, excludeId: string) => {
      if (!lab) return null

      const draggedDeckId = resolveCanvasDeckId(lab, excludeId)
      if (
        !draggedDeckId
        || isPotionDeckId(draggedDeckId)
        || !isIngredientDeckId(draggedDeckId)
        || isResidueCard(draggedDeckId)
      ) {
        return null
      }

      const overlap = findOverlappingCard(
        center,
        cardTransforms,
        getCanvasCardIds(lab),
        excludeId,
      )
      if (!overlap) return null

      const targetDeckId = resolveCanvasDeckId(lab, overlap)
      if (
        !targetDeckId
        || isPotionDeckId(targetDeckId)
        || !isIngredientDeckId(targetDeckId)
        || isResidueCard(targetDeckId)
      ) {
        return null
      }

      return overlap
    },
    [lab, cardTransforms],
  )

  const resolveCanvasDeck = useCallback(
    (instanceId: string) => (lab ? resolveCanvasDeckId(lab, instanceId) : undefined),
    [lab],
  )

  if (!lab) {
    return null
  }

  const handEntries = lab.hand
    .map((id) => ({ id, card: resolveCard(id) }))
    .filter(
      (entry): entry is { id: string; card: NonNullable<ReturnType<typeof resolveCard>> } =>
        entry.card !== undefined,
    )

  const rank = getPlayerRank(save)
  const flashOutcome =
    brewAnim === 'flash'
      ? pendingOutcome.current
      : lab.brewOutcome === 'success' || lab.brewOutcome === 'fail'
        ? lab.brewOutcome
        : 'idle'

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-ink">
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

      <div className="lab-desk flex min-h-0 flex-1">
        <LabDeckPanel
          deckCount={lab.drawPile.length}
          discardCount={lab.discardPile.length}
          canDraw={canDrawFromLab(lab)}
          deskFull={countIngredientsInHand(lab.hand) >= GAME_CONFIG.maxHandSize}
          availability={getLabIngredientAvailability(lab)}
          onDraw={() => {
            audioService.play('draw')
            drawCard()
          }}
        />

        <main className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(196,122,44,0.09),transparent_62%)]" />

          <p className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.32em] text-parchment/28">
            Drag potions from rack · Stack ingredients to brew · Stack potion + pair to catalyze
          </p>

          <div className="absolute inset-0 pt-8">
            <LabDesk
              canvasRef={canvasRef}
              tableCardIds={canvasCardIds}
              cardTransforms={cardTransforms}
              zOrder={zOrder}
              mergingPair={mergingPair}
              mergeTransforms={mergeTransforms}
              isBrewing={isBrewing}
              isMerging={isMerging}
              resultPotionId={lab.resultPotionId}
              brewMessage={lab.brewMessage}
              brewOutcome={lab.brewOutcome}
              pendingBrew={lab.pendingBrew}
              resolveCard={resolveCard}
              resolveCanvasDeckId={resolveCanvasDeck}
              onFocusCard={bringToFront}
              onMoveCard={handleMoveCard}
              onFuse={handleFuse}
              onCheckOverlap={handleCheckOverlap}
              onCheckCatalystOverlap={handleCheckCatalystOverlap}
              onCatalystFuse={handleCatalystFuse}
              onUsePotion={handleUsePotion}
              onReturnPotionToRack={handleReturnPotionToRack}
              onCraft={craftPotionCard}
              onBottle={bottlePotion}
              onDismissMessage={clearBrewMessage}
            />
          </div>

          <BrewVfx
            phase={brewAnim}
            outcome={flashOutcome}
            slotA={brewSlots[0]}
            slotB={brewSlots[1]}
          />
        </main>

        <LabSupportSidebar
          entries={handEntries}
          rackPotions={rackPotions}
          resolveCard={resolveCard}
          onPlacePotionOnDesk={handlePlacePotionFromRack}
          onUseTechnique={(cardId) => {
            audioService.play('click')
            playTechniqueCard(cardId)
          }}
          onDiscard={(cardId) => discardFromHand(cardId)}
        />
      </div>
    </div>
  )
}
