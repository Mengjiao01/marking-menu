import {
  ConditionConfig,
  MenuItem,
  PrototypeConditionId,
} from '../types/experiment'

const TRADITIONAL_TARGETS: readonly MenuItem[] = [
  { id: 'T1', label: 'Star', symbol: '★', angle: 36 },
  { id: 'T2', label: 'Circle', symbol: '●', angle: 108 },
  { id: 'T3', label: 'Square', symbol: '■', angle: 180 },
  { id: 'T4', label: 'Triangle', symbol: '▲', angle: 252 },
  { id: 'T5', label: 'Diamond', symbol: '◆', angle: 324 },
]

export const TRADITIONAL_MENU_RADIUS = 72
export const TRADITIONAL_TARGET_RADIUS = 24
export const START_TOLERANCE = 20
export const SAFETY_MARGIN = 4
export const SAFE_EDGE_INSET =
  TRADITIONAL_MENU_RADIUS + TRADITIONAL_TARGET_RADIUS + SAFETY_MARGIN
export const CENTRE_X_RATIO = 0.5
export const ACTIVATION_Y_RATIO = 0.6
export const MINIMUM_SAFE_STAGE_WIDTH = SAFE_EDGE_INSET * 2

const TRADITIONAL_GEOMETRY = {
  menuLayout: 'Traditional' as const,
  repetitions: 5,
  menuRadius: TRADITIONAL_MENU_RADIUS,
  targetRadius: TRADITIONAL_TARGET_RADIUS,
  startTolerance: START_TOLERANCE,
  targets: TRADITIONAL_TARGETS,
}

export const CONDITIONS: readonly ConditionConfig[] = [
  {
    ...TRADITIONAL_GEOMETRY,
    conditionId: 'C1',
    label: 'C1 Centre–Traditional',
    touchLocation: 'Centre',
  },
  {
    ...TRADITIONAL_GEOMETRY,
    conditionId: 'C2',
    label: 'C2 Left–Traditional',
    touchLocation: 'Left',
  },
  {
    ...TRADITIONAL_GEOMETRY,
    conditionId: 'C3',
    label: 'C3 Right–Traditional',
    touchLocation: 'Right',
  },
]

export const DEFAULT_CONDITION_ID: PrototypeConditionId = 'C1'

export function getCondition(conditionId: PrototypeConditionId): ConditionConfig {
  const condition = CONDITIONS.find((candidate) => candidate.conditionId === conditionId)
  if (!condition) {
    throw new Error(`Unknown prototype condition: ${conditionId}`)
  }
  return condition
}

export function getTrialCount(condition: ConditionConfig): number {
  return condition.targets.length * condition.repetitions
}
