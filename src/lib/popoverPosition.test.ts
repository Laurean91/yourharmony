import { calcPopoverPosition } from '@/lib/popoverPosition'

const vp = { width: 1280, height: 800, scrollY: 0 }
const W = 260
const H = 280

function rect(top: number, bottom: number, left: number, width = 100): DOMRect {
  return { top, bottom, left, right: left + width, width, height: bottom - top, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

describe('calcPopoverPosition', () => {
  it('positions above when there is enough space above', () => {
    const pos = calcPopoverPosition(rect(400, 430, 600), W, H, vp)
    expect(pos.showAbove).toBe(true)
    expect(pos.top).toBe(400 - H - 10)
  })

  it('positions below when space above is insufficient', () => {
    const pos = calcPopoverPosition(rect(100, 130, 600), W, H, vp)
    expect(pos.showAbove).toBe(false)
    expect(pos.top).toBe(130 + 10)
  })

  it('clamps left so popover does not overflow right edge', () => {
    const pos = calcPopoverPosition(rect(400, 430, 1200, 60), W, H, vp)
    expect(pos.left).toBeLessThanOrEqual(vp.width - W - 8)
  })

  it('clamps left so popover does not overflow left edge', () => {
    const pos = calcPopoverPosition(rect(400, 430, 5, 60), W, H, vp)
    expect(pos.left).toBeGreaterThanOrEqual(8)
  })

  it('arrowLeft stays within popover bounds', () => {
    const pos = calcPopoverPosition(rect(400, 430, 600), W, H, vp)
    expect(pos.arrowLeft).toBeGreaterThanOrEqual(10)
    expect(pos.arrowLeft).toBeLessThanOrEqual(W - 24)
  })

  it('uses scrollY when anchor is below the fold', () => {
    const pos = calcPopoverPosition(rect(400, 430, 600), W, H, { ...vp, scrollY: 300 })
    expect(pos.top).toBe(400 + 300 - H - 10)
  })
})
