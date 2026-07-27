import {
  ACTIVATION_Y_RATIO,
  CENTRE_X_RATIO,
  SAFE_EDGE_INSET,
} from '../config/conditions'
import { MenuItem, TargetId, TouchLocation } from '../types/experiment'

export interface Point {
  x: number
  y: number
}

export interface PositionedMenuItem extends MenuItem {
  position: Point
}

export interface Size {
  width: number
  height: number
}

export function distance(first: Point, second: Point): number {
  return Math.hypot(second.x - first.x, second.y - first.y)
}

export function getActivationCenter(
  touchLocation: TouchLocation,
  stageSize: Size,
): Point {
  const x =
    touchLocation === 'Centre'
      ? stageSize.width * CENTRE_X_RATIO
      : touchLocation === 'Left'
      ? SAFE_EDGE_INSET
      : stageSize.width - SAFE_EDGE_INSET

  return {
    x,
    y: stageSize.height * ACTIVATION_Y_RATIO,
  }
}

export function getNearestEdgeDistance(point: Point, stageSize: Size): number {
  return Math.min(
    point.x,
    stageSize.width - point.x,
    point.y,
    stageSize.height - point.y,
  )
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

export function getOutOfBoundsItemIds(
  items: readonly PositionedMenuItem[],
  stageSize: Size,
  targetRadius: number,
  edgeMargin = 0,
): TargetId[] {
  return items
    .filter(
      (item) =>
        item.position.x - targetRadius < edgeMargin ||
        item.position.x + targetRadius > stageSize.width - edgeMargin ||
        item.position.y - targetRadius < edgeMargin ||
        item.position.y + targetRadius > stageSize.height - edgeMargin,
    )
    .map((item) => item.id)
}
