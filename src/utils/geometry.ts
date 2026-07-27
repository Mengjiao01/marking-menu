import { MenuItem, TargetId } from '../types/experiment'

export interface Point {
  x: number
  y: number
}

export interface PositionedMenuItem extends MenuItem {
  position: Point
}

export function distance(first: Point, second: Point): number {
  return Math.hypot(second.x - first.x, second.y - first.y)
}

export function getMenuItemPositions(
  items: readonly MenuItem[],
  centre: Point,
  radius: number,
): PositionedMenuItem[] {
  return items.map((item) => {
    const radians = (item.angle * Math.PI) / 180

    return {
      ...item,
      position: {
        x: centre.x + Math.cos(radians) * radius,
        y: centre.y + Math.sin(radians) * radius,
      },
    }
  })
}

export function getSelectedItem(
  point: Point,
  items: readonly PositionedMenuItem[],
  selectionRadius: number,
): TargetId | null {
  const selected = items.find((item) => distance(point, item.position) <= selectionRadius)
  return selected ? selected.id : null
}
