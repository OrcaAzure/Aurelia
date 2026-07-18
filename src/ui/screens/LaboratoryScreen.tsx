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
import { getActiveFusionInstanceIds } from '@/engine/labInstances'
import { LabSupportSidebar } from '@/ui/components/LabSupportSidebar'
import { LaboratoryTopBar } from '@/ui/components/LaboratoryTopBar'
import { LabTutorialOverlay } from '@/ui/components/LabTutorialOverlay'

const MERGE_MS = 400
const SWIRL_MS = 650
const FLASH_MS = 500

function layoutsEqual(
  a: Record<string, CardTransform>,
  b: Record<string, CardTransform>,
): boolean {
  const aKeys = Object.keys(a)
  if (aKeys.length !== Object.keys(b).length) return false
  for (const key of aKeys) {
    const left = a[key]
    const right = b[key]
    if (
      !right
      || left.x !== right.x
      || left.y !== right.y
      || left.rotate !== right.rotate
    ) {
      return false
    }
  }
  return true
}

export function LaboratoryScreen() {
  const save = useGameStore((state) => state.save)
  const lab = useGameStore((state) => state.lab)
  const setPhase = useGameStore((state) => state.setPhase)
  const openJournal = useGameStore((state) => state.openJournal)
  const initializeLabCanvas = useGameStore((state) => state.initializeLabCanvas)
  const updateLabCardLayouts = useGameStore((state) => state.updateLabCardLayouts)
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
  const completeLabTutorial = useGameStore((state) => state.completeLabTutorial)
  const cancelLabFusion = useGameStore((state) => state.cancelLabFusion)

  const [labTutorialOpen, setLabTutorialOpen] = useState(
    () => !useGameStore.getState().save.labTutorialCompleted,
  )

  const handleCloseLabTutorial = useCallback(() => {
    completeLabTutorial()
    setLabTutorialOpen(false)
  }, [completeLabTutorial])

  const canvasRef = useRef<HTMLDivElement>(null)
  const zCounter = useRef(1)
  const layoutsHydrated = useRef(false)
  const [cardTransforms, setCardTransformsState] = useState<Record<string, CardTransform>>({})
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
  const fusionLayoutRef = useRef<Record<string, CardTransform>>({})
  const fusionLockRef = useRef(false)

  const prevDiscoveredCount = useRef(save.discoveredRecipeIds.length)
  const pendingOutcome = useRef<'success' | 'fail'>('success')

  const bringToFront = useCallback((cardId: string) => {
    zCounter.current += 1
    setZOrder((prev) => ({ ...prev, [cardId]: zCounter.current }))
  }, [])

  const setCardTransforms = useCallback(
    (
      updater:
        | Record<string, CardTransform>
        | ((prev: Record<string, CardTransform>) => Record<string, CardTransform>),
    ) => {
      setCardTransformsState((prev) =>
        typeof updater === 'function' ? updater(prev) : updater,
      )
    },
    [],
  )

  useEffect(() => {
    if (!lab || !layoutsHydrated.current) return
    const stored = lab.cardLayouts ?? {}
    if (layoutsEqual(cardTransforms, stored)) return
    if (Object.keys(cardTransforms).length === 0 && Object.keys(stored).length > 0) {
      return
    }
    updateLabCardLayouts(cardTransforms)
  }, [cardTransforms, lab, updateLabCardLayouts])

  useLayoutEffect(() => {
    initializeLabCanvas()
    if (!layoutsHydrated.current) {
      const layouts = useGameStore.getState().lab?.cardLayouts
      if (layouts && Object.keys(layouts).length > 0) {
        setCardTransformsState(layouts)
      }
      layoutsHydrated.current = true
    }
  }, [initializeLabCanvas])

  useEffect(() => {
    return () => {
      if (brewTimer.current) {
        clearTimeout(brewTimer.current)
        brewTimer.current = null
        const currentLab = useGameStore.getState().lab
        if (currentLab && getActiveFusionInstanceIds(currentLab).length > 0) {
          cancelLabFusion()
        }
      }
    }
  }, [cancelLabFusion])

  useEffect(() => {
    if (save.discoveredRecipeIds.length > prevDiscoveredCount.current) {
      audioService.play('discover')
    }
    prevDiscoveredCount.current = save.discoveredRecipeIds.length
  }, [save.discoveredRecipeIds.length])

  const canvasCardIds = lab ? getCanvasCardIds(lab) : []
  const rackPotions = lab ? getRackPotionEntries(lab) : []
  const canvasCardKey = canvasCardIds.join('|')
  const handInstanceKey = lab?.handInstanceIds?.join('|') ?? ''
  const fusionSlotKey = lab?.tableSlotInstances?.join('|') ?? ''
  const deskInstanceKey = lab?.deskInstanceIds?.join('|') ?? ''
  const catalystInstance = lab?.catalystInstance ?? null

  const restoreFusionLayout = useCallback((instanceIds: readonly string[]) => {
    const saved = fusionLayoutRef.current
    if (instanceIds.length === 0 || Object.keys(saved).length === 0) {
      return
    }

    setCardTransforms((prev) => {
      const next = { ...prev }
      for (const id of instanceIds) {
        if (!next[id] && saved[id]) {
          next[id] = saved[id]
        }
      }
      return next
    })
  }, [])

  const syncCardLayout = useCallback(() => {
    const currentLab = useGameStore.getState().lab
    if (!currentLab) return
    const canvas = canvasRef.current
    const canvasW = canvas?.clientWidth ?? 600
    const canvasH = canvas?.clientHeight ?? 500
    const ids = getCanvasCardIds(currentLab)
    const fusionIds = new Set(
      [
        ...(currentLab.tableSlotInstances ?? []),
        currentLab.catalystInstance,
      ].filter((id): id is string => id !== null),
    )
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
        if (!ids.includes(id) && !fusionIds.has(id)) {
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
        if (!ids.includes(id) && !fusionIds.has(id)) {
          delete next[id]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [setCardTransforms])

  useEffect(() => {
    syncCardLayout()
  }, [
    syncCardLayout,
    canvasCardKey,
    handInstanceKey,
    fusionSlotKey,
    catalystInstance,
    deskInstanceKey,
  ])

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

      if (afterBrew?.cardLayouts) {
        setCardTransformsState(afterBrew.cardLayouts)
      }

      if (outcome === 'fail' && fused) {
        restoreFusionLayout([
          ...fused,
          ...(fusedCatalyst.current ? [fusedCatalyst.current] : []),
        ])
        const restoredLayouts = useGameStore.getState().lab?.cardLayouts ?? {}
        setCardTransformsState((prev) => {
          const next = { ...restoredLayouts, ...prev }
          updateLabCardLayouts(next)
          return next
        })
      } else if (outcome === 'success') {
        fusionLayoutRef.current = {}
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
        fusionLayoutRef.current = {}
        fusionLockRef.current = false
        syncCardLayout()
      }, FLASH_MS)
    }, SWIRL_MS)
  }, [lab, isBrewing, brew, syncCardLayout, restoreFusionLayout, updateLabCardLayouts])

  const startFusion = useCallback(
    (
      instanceA: string,
      instanceB: string,
      catalystInstance?: string,
      dragPositions?: Record<string, CardTransform>,
    ) => {
      if (isBrewing || isMerging || fusionLockRef.current || !lab) return

      if (lab.pendingBrew) return

      if (getActiveFusionInstanceIds(lab).length > 0) return

      const deckA = resolveCanvasDeckId(lab, instanceA)
      const deckB = resolveCanvasDeckId(lab, instanceB)
      if (!deckA || !deckB) return

      const isIngredientPair =
        isIngredientDeckId(deckA)
        && isIngredientDeckId(deckB)
        && !isResidueCard(deckA)
        && !isResidueCard(deckB)

      if (!isIngredientPair) return

      if (
        !lab.handInstanceIds.includes(instanceA)
        || !lab.handInstanceIds.includes(instanceB)
      ) {
        return
      }

      const positions = { ...cardTransforms, ...dragPositions }
      const transforms: Record<string, CardTransform> = {
        [instanceA]: positions[instanceA],
        [instanceB]: positions[instanceB],
      }
      if (!transforms[instanceA] || !transforms[instanceB]) return

      fusionLockRef.current = true
      setIsMerging(true)

      if (dragPositions) {
        setCardTransforms((prev) => ({ ...prev, ...dragPositions }))
      }

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
        fusionLockRef.current = false
        setIsMerging(false)
        setMergingPair(null)
        setMergeTransforms({})
        fusedCatalyst.current = null
        fusionLayoutRef.current = {}
        return
      }

      fusionLayoutRef.current = { ...transforms }
      if (catalystInstance && positions[catalystInstance]) {
        fusionLayoutRef.current[catalystInstance] = positions[catalystInstance]
      }

      setMergingPair([instanceA, instanceB])
      setMergeTransforms(transforms)
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
    (
      draggedInstance: string,
      targetInstance: string,
      draggedTransform: CardTransform,
    ) => {
      if (!lab) return

      const catalystInstance = findCatalystPotionForIngredientPair(
        draggedInstance,
        targetInstance,
        { ...cardTransforms, [draggedInstance]: draggedTransform },
        getCanvasCardIds(lab),
        (id) => resolveCanvasDeckId(lab, id),
      )

      startFusion(draggedInstance, targetInstance, catalystInstance ?? undefined, {
        [draggedInstance]: draggedTransform,
      })
    },
    [lab, cardTransforms, startFusion],
  )

  const handleCatalystFuse = useCallback(
    (
      catalystInstance: string,
      instanceA: string,
      instanceB: string,
      draggedTransform: CardTransform,
    ) => {
      startFusion(instanceA, instanceB, catalystInstance, {
        [catalystInstance]: draggedTransform,
      })
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
    .map((deckId, index) => ({
      deckId,
      instanceId: lab.handInstanceIds[index],
      card: resolveCard(deckId),
    }))
    .filter(
      (
        entry,
      ): entry is {
        deckId: string
        instanceId: string
        card: NonNullable<ReturnType<typeof resolveCard>>
      } => entry.card !== undefined && Boolean(entry.instanceId),
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
      <LabTutorialOverlay
        open={labTutorialOpen}
        onComplete={handleCloseLabTutorial}
      />

      <LaboratoryTopBar
        playerName={save.playerName}
        rank={rank}
        gold={save.gold}
        reagents={save.reagents}
        brewCost={GAME_CONFIG.brewReagentCost}
        onOpenJournal={() => openJournal('laboratory')}
        onOpenSettings={() => setPhase('settings')}
        onOpenGuide={() => setLabTutorialOpen(true)}
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

        <main className="relative min-w-0 flex-1" data-lab-tutorial="desk">
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
              fusionInstanceIds={[
                ...(lab.tableSlotInstances ?? []),
                lab.catalystInstance,
              ].filter((id): id is string => id !== null)}
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
          techniquesDisabled={isBrewing || isMerging}
          onPlacePotionOnDesk={handlePlacePotionFromRack}
          onUseTechnique={(instanceId) => {
            if (isBrewing || isMerging) return
            audioService.play('click')
            playTechniqueCard(instanceId)
          }}
          onDiscard={(instanceId) => discardFromHand(instanceId)}
        />
      </div>
    </div>
  )
}
