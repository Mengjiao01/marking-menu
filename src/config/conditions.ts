import {
  ConditionConfig,
  MenuItem,
  MenuLayout,
  PrototypeConditionId,
  TargetId,
  TouchLocation,
} from '../types/experiment'

interface TargetDefinition {
  id: TargetId
  label: string
  symbol: string
}

type AngleMap = Readonly<Record<TargetId, number>>

const TARGET_DEFINITIONS: readonly TargetDefinition[] = [
  { id: 'T1', label: 'Star', symbol: '★' },
  { id: 'T2', label: 'Circle', symbol: '●' },
  { id: 'T3', label: 'Square', symbol: '■' },
  { id: 'T4', label: 'Triangle', symbol: '▲' },
  { id: 'T5', label: 'Diamond', symbol: '◆' },
]

export const TRADITIONAL_ANGLES: AngleMap = {
  T1: 36,
  T2: 108,
  T3: 180,
  T4: 252,
  T5: 324,
}

export const ADAPTIVE_ANGLES: Readonly<Record<TouchLocation, AngleMap>> = {
  Left: {
    T1: 270,
    T2: 315,
    T3: 0,
    T4: 45,
    T5: 90,
  },
  Right: {
    T1: 90,
    T2: 135,
    T3: 180,
    T4: 225,
    T5: 270,
  },
  // C6 intentionally matches C1 visually while retaining an Adaptive condition ID.
  Centre: TRADITIONAL_ANGLES,
}

export const TRADITIONAL_MENU_RADIUS = 72
export const TRADITIONAL_TARGET_RADIUS = 24
export const START_TOLERANCE = 24
export const SAFETY_MARGIN = 4
export const EXPERIMENT_CONFIG_VERSION = 'formal-v1-likert7'
export const SAFE_EDGE_INSET =
  TRADITIONAL_MENU_RADIUS + TRADITIONAL_TARGET_RADIUS + SAFETY_MARGIN
export const CENTRE_X_RATIO = 0.5
export const ACTIVATION_Y_RATIO = 0.6
export const MINIMUM_SAFE_STAGE_WIDTH = SAFE_EDGE_INSET * 2

const COMMON_GEOMETRY = {
  repetitions: 5,
  menuRadius: TRADITIONAL_MENU_RADIUS,
  targetRadius: TRADITIONAL_TARGET_RADIUS,
  startTolerance: START_TOLERANCE,
  configVersion: EXPERIMENT_CONFIG_VERSION,
}

function createTargets(angles: AngleMap): readonly MenuItem[] {
  return TARGET_DEFINITIONS.map((target) => ({
    ...target,
    angle: angles[target.id],
  }))
}

const TRADITIONAL_TARGETS = createTargets(TRADITIONAL_ANGLES)
const ADAPTIVE_TARGETS: Readonly<Record<TouchLocation, readonly MenuItem[]>> = {
  Left: createTargets(ADAPTIVE_ANGLES.Left),
  Right: createTargets(ADAPTIVE_ANGLES.Right),
  Centre: createTargets(ADAPTIVE_ANGLES.Centre),
}

function createCondition(
  conditionId: PrototypeConditionId,
  touchLocation: TouchLocation,
  menuLayout: MenuLayout,
): ConditionConfig {
  const targets =
    menuLayout === 'Traditional'
      ? TRADITIONAL_TARGETS
      : ADAPTIVE_TARGETS[touchLocation]

  return {
    ...COMMON_GEOMETRY,
    conditionId,
    label: `${conditionId} ${touchLocation}–${menuLayout}`,
    touchLocation,
    menuLayout,
    targets,
  }
}

export const CONDITIONS: readonly ConditionConfig[] = [
  createCondition('C1', 'Centre', 'Traditional'),
  createCondition('C2', 'Left', 'Traditional'),
  createCondition('C3', 'Right', 'Traditional'),
  createCondition('C4', 'Left', 'Adaptive'),
  createCondition('C5', 'Right', 'Adaptive'),
  createCondition('C6', 'Centre', 'Adaptive'),
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
