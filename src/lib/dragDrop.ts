export function detectSlotAtPoint(point: { x: number; y: number }): 0 | 1 | null {
  const elements = document.elementsFromPoint(point.x, point.y)

  for (const element of elements) {
    const slot = element.closest('[data-slot-index]')
    if (!slot) {
      continue
    }

    const index = slot.getAttribute('data-slot-index')
    if (index === '0') return 0
    if (index === '1') return 1
  }

  return null
}
