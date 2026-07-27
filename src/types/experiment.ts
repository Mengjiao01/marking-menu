export type ConditionId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6'

export type TouchLocation = 'Centre' | 'Left' | 'Right'

export type MenuLayout = 'Traditional' | 'Adaptive'

export type TargetId = 'T1' | 'T2' | 'T3' | 'T4' | 'T5'

export type TrialErrorType = 'none' | 'wrong-item' | 'miss'

export type InvalidEventType = 'invalid-start' | 'pointer-cancel'

export interface MenuItem {
  id: TargetId
  label: string
  symbol: string
  angle: number
}

export interface ConditionConfig {
  id: ConditionId
  name: string
  touchLocation: TouchLocation
  menuLayout: MenuLayout
  repetitions: number
  targetDiameter: number
  menuRadius: number
  activationRadius: number
  centreXRatio: number
  centreYRatio: number
  items: readonly MenuItem[]
}

export interface ScheduledTrial {
  targetId: TargetId
}

export interface TrialRecord {
  sessionId: string
  participantId: string
  conditionId: ConditionId
  touchLocation: TouchLocation
  menuLayout: MenuLayout
  trialNumber: number
  targetId: TargetId
  selectedId: TargetId | null
  valid: boolean
  correct: boolean
  errorType: TrialErrorType
  cueTime: number
  touchDownTime: number
  touchUpTime: number
  selectionTime: number
  touchDownX: number
  touchDownY: number
  touchUpX: number
  touchUpY: number
  pathLength: number
  viewportWidth: number
  viewportHeight: number
  devicePixelRatio: number
  userAgent: string
}

export interface InvalidEventRecord {
  sessionId: string
  participantId: string
  conditionId: ConditionId
  trialNumber: number
  targetId: TargetId
  eventType: InvalidEventType
  eventTime: number
  pointerX: number
  pointerY: number
  viewportWidth: number
  viewportHeight: number
  devicePixelRatio: number
  userAgent: string
}
