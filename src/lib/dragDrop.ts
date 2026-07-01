export const DESK_CARD_WIDTH = 176
export const DESK_CARD_HEIGHT = 288
export const DESK_OVERLAP_RADIUS = 100

export interface CardTransform {
  x: number
  y: number
  rotate: number
}

/** @deprecated use CardTransform */
export type DeskPoint = CardTransform

export function pointToCanvasPosition(
  point: { x: number; y: number },
  canvasElement: HTMLElement,
  rotate = randomScatterRotation(),
): CardTransform {
  const rect = canvasElement.getBoundingClientRect()
  const x = point.x - rect.left - DESK_CARD_WIDTH / 2
  const y = point.y - rect.top - DESK_CARD_HEIGHT / 2
  return clampToCanvas({ x, y, rotate }, canvasElement)
}

export function clampToCanvas(
  transform: CardTransform,
  canvasElement: HTMLElement,
): CardTransform {
  const rect = canvasElement.getBoundingClientRect()
  return {
    ...transform,
    x: Math.max(
      -DESK_CARD_WIDTH * 0.55,
      Math.min(transform.x, rect.width - DESK_CARD_WIDTH * 0.45),
    ),
    y: Math.max(
      -DESK_CARD_HEIGHT * 0.1,
      Math.min(transform.y, rect.height - DESK_CARD_HEIGHT * 0.2),
    ),
  }
}

export function randomScatterRotation(): number {
  return Math.round((Math.random() * 28 - 14) * 10) / 10
}

export function scatterTransform(
  index: number,
  canvasW: number,
  canvasH: number,
): CardTransform {
  const cx = canvasW * 0.5 - DESK_CARD_WIDTH / 2
  const cy = canvasH * 0.48 - DESK_CARD_HEIGHT / 2
  const angle = index * 2.399963
  const radius = 48 + index * 38
  let x = cx + Math.cos(angle) * radius + (index % 2 === 0 ? -24 : 24)
  let y = cy + Math.sin(angle) * radius * 0.5 + (index % 3) * 12
  x = Math.max(-DESK_CARD_WIDTH * 0.55, Math.min(x, canvasW - DESK_CARD_WIDTH * 0.45))
  y = Math.max(-DESK_CARD_HEIGHT * 0.1, Math.min(y, canvasH - DESK_CARD_HEIGHT * 0.2))
  return { x, y, rotate: randomScatterRotation() }
}

export function findOverlappingCard(
  center: { x: number; y: number },
  positions: Record<string, CardTransform>,
  cardIds: readonly string[],
  excludeId: string,
): string | null {
  for (const id of cardIds) {
    if (id === excludeId) continue
    const pos = positions[id]
    if (!pos) continue
    const otherCenter = {
      x: pos.x + DESK_CARD_WIDTH / 2,
      y: pos.y + DESK_CARD_HEIGHT / 2,
    }
    const distance = Math.hypot(center.x - otherCenter.x, center.y - otherCenter.y)
    if (distance < DESK_OVERLAP_RADIUS) {
      return id
    }
  }
  return null
}

/** @deprecated */
export function findOverlappingDeskCard(
  center: { x: number; y: number },
  positions: Record<string, CardTransform>,
  deskCards: readonly string[],
  excludeId: string,
): string | null {
  return findOverlappingCard(center, positions, deskCards, excludeId)
}

/** @deprecated */
export function detectHandZoneAtPoint(_point: { x: number; y: number }): boolean {
  return false
}

/** @deprecated */
export function shouldPlaceOnCanvas(_point: { x: number; y: number }): boolean {
  return true
}

export function detectLabCanvasAtPoint(point: { x: number; y: number }): boolean {
  const elements = document.elementsFromPoint(point.x, point.y)
  return elements.some((element) => element.closest('[data-lab-canvas]'))
}

export function detectLabRackAtPoint(point: { x: number; y: number }): boolean {
  const elements = document.elementsFromPoint(point.x, point.y)
  return elements.some((element) => element.closest('[data-lab-rack]'))
}

/** @deprecated */
export function detectLabDeskAtPoint(point: { x: number; y: number }): boolean {
  return detectLabCanvasAtPoint(point)
}

/** @deprecated */
export function detectSlotAtPoint(point: { x: number; y: number }): 0 | 1 | null {
  const elements = document.elementsFromPoint(point.x, point.y)
  for (const element of elements) {
    const slot = element.closest('[data-slot-index]')
    if (!slot) continue
    const index = slot.getAttribute('data-slot-index')
    if (index === '0') return 0
    if (index === '1') return 1
  }
  return null
}

/** @deprecated */
export function pointToDeskPosition(
  point: { x: number; y: number },
  deskElement: HTMLElement,
): CardTransform {
  return pointToCanvasPosition(point, deskElement)
}

/** @deprecated */
export function detectFusionZoneAtPoint(point: { x: number; y: number }): boolean {
  const elements = document.elementsFromPoint(point.x, point.y)
  return elements.some((element) => element.closest('[data-fusion-zone]'))
}
