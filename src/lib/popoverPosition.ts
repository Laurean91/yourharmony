export interface PopoverPosition {
  top: number
  left: number
  showAbove: boolean
  arrowLeft: number
}

const GAP = 10

export function calcPopoverPosition(
  anchorRect: DOMRect,
  popoverWidth: number,
  popoverHeight: number,
  viewport: { width: number; height: number; scrollY: number }
): PopoverPosition {
  const spaceAbove = anchorRect.top
  const spaceBelow = viewport.height - anchorRect.bottom
  const showAbove = spaceAbove >= popoverHeight + GAP || spaceAbove > spaceBelow

  const top = showAbove
    ? anchorRect.top + viewport.scrollY - popoverHeight - GAP
    : anchorRect.bottom + viewport.scrollY + GAP

  const rawLeft = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2
  const left = Math.max(8, Math.min(rawLeft, viewport.width - popoverWidth - 8))

  const arrowLeft = Math.max(
    10,
    Math.min(anchorRect.left + anchorRect.width / 2 - left - 7, popoverWidth - 24)
  )

  return { top, left, showAbove, arrowLeft }
}
