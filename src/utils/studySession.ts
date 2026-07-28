import { CONDITIONS, getCondition } from '../config/conditions'
import {
  getSequenceAssignment,
  validateSequences,
} from '../config/sequences'
import {
  PracticeRecord,
  PrototypeConditionId,
  ScheduledTrial,
  StudySessionState,
  TrialRecord,
} from '../types/experiment'
import {
  createBalancedSchedule,
  createPracticeSchedule,
  isValidFormalSchedule,
  isValidPracticeSchedule,
} from './schedule'
import { createBlockSessionId, createStudySessionId } from './session'

const FORMAL_TRIALS_PER_CONDITION = 25

export function createStudySession(
  participantId: string,
  participantNumber: number | null,
  isPrototype: boolean,
  prototypeConditionId: PrototypeConditionId,
): StudySessionState {
  const assignment =
    participantNumber === null
      ? {
          sequenceCode: 'Prototype' as const,
          conditionOrder: [prototypeConditionId] as readonly PrototypeConditionId[],
        }
      : getSequenceAssignment(participantNumber)
  const conditionOrder = [...assignment.conditionOrder]
  const practiceSchedules: StudySessionState['practiceSchedules'] = {}
  const formalSchedules: StudySessionState['formalSchedules'] = {}
  const blockSessionIds: StudySessionState['blockSessionIds'] = {}

  conditionOrder.forEach((conditionId, index) => {
    const condition = getCondition(conditionId)
    const practiceSchedule = createPracticeSchedule(condition)
    const formalSchedule = createBalancedSchedule(condition)
    if (
      !isValidPracticeSchedule(condition, practiceSchedule) ||
      !isValidFormalSchedule(condition, formalSchedule)
    ) {
      throw new Error(`Invalid generated schedule for ${conditionId}.`)
    }
    practiceSchedules[conditionId] = practiceSchedule
    formalSchedules[conditionId] = formalSchedule
    blockSessionIds[conditionId] = createBlockSessionId(conditionId, index + 1)
  })

  const now = Date.now()
  return {
    version: 1,
    studySessionId: createStudySessionId(),
    participantId,
    sequenceCode: assignment.sequenceCode,
    conditionOrder,
    conditionOrderIndex: 0,
    phase: 'condition-intro',
    isPrototype,
    createdAt: now,
    updatedAt: now,
    practiceSchedules,
    formalSchedules,
    blockSessionIds,
  }
}

export function withSessionPhase(
  session: StudySessionState,
  phase: StudySessionState['phase'],
  conditionOrderIndex = session.conditionOrderIndex,
): StudySessionState {
  return {
    ...session,
    phase,
    conditionOrderIndex,
    updatedAt: Date.now(),
  }
}

export function getCurrentConditionId(
  session: StudySessionState,
): PrototypeConditionId {
  return session.conditionOrder[session.conditionOrderIndex]
}

export function getBlockFormalRecords(
  session: StudySessionState,
  records: readonly TrialRecord[],
): TrialRecord[] {
  const conditionId = getCurrentConditionId(session)
  const blockSessionId = session.blockSessionIds[conditionId]
  return records.filter(
    (record) =>
      record.studySessionId === session.studySessionId &&
      record.blockSessionId === blockSessionId,
  )
}

export function getBlockPracticeRecords(
  session: StudySessionState,
  records: readonly PracticeRecord[],
): PracticeRecord[] {
  const conditionId = getCurrentConditionId(session)
  const blockSessionId = session.blockSessionIds[conditionId]
  return records.filter(
    (record) =>
      record.studySessionId === session.studySessionId &&
      record.blockSessionId === blockSessionId,
  )
}

export function reconcileStudySession(
  session: StudySessionState,
  formalRecords: readonly TrialRecord[],
  practiceRecords: readonly PracticeRecord[],
): StudySessionState {
  const blockFormal = getBlockFormalRecords(session, formalRecords)
  const blockPractice = getBlockPracticeRecords(session, practiceRecords)
  const completedPracticeTargets = blockPractice.filter((record) => record.correct).length

  if (session.phase === 'practice' && completedPracticeTargets >= 5) {
    return withSessionPhase(session, 'practice-complete')
  }

  if (session.phase === 'formal' && blockFormal.length >= FORMAL_TRIALS_PER_CONDITION) {
    const isLast =
      session.conditionOrderIndex >= session.conditionOrder.length - 1
    return withSessionPhase(session, isLast ? 'complete' : 'break')
  }

  return session
}

export interface FormalIntegrityResult {
  valid: boolean
  errors: string[]
  records: TrialRecord[]
}

export function validateFormalRecords(
  session: StudySessionState,
  allRecords: readonly TrialRecord[],
): FormalIntegrityResult {
  const records = allRecords
    .filter(
      (record) =>
        record.studySessionId === session.studySessionId &&
        record.isPrototype === session.isPrototype,
    )
    .sort((first, second) => first.globalTrialNumber - second.globalTrialNumber)
  const errors: string[] = []
  const expectedTotal = session.isPrototype
    ? FORMAL_TRIALS_PER_CONDITION
    : FORMAL_TRIALS_PER_CONDITION * 6

  if (records.length !== expectedTotal) {
    errors.push(`Expected ${expectedTotal} formal records, found ${records.length}.`)
  }

  records.forEach((record, index) => {
    if (record.globalTrialNumber !== index + 1) {
      errors.push(`Global trial numbering is not contiguous at row ${index + 1}.`)
    }
  })

  session.conditionOrder.forEach((conditionId, conditionIndex) => {
    const conditionRecords = records.filter(
      (record) => record.conditionId === conditionId,
    )
    if (conditionRecords.length !== FORMAL_TRIALS_PER_CONDITION) {
      errors.push(`${conditionId} does not contain 25 formal trials.`)
    }
    if (
      conditionRecords.some(
        (record) => record.conditionOrderPosition !== conditionIndex + 1,
      )
    ) {
      errors.push(`${conditionId} has an invalid condition order position.`)
    }
    getCondition(conditionId).targets.forEach((target) => {
      const count = conditionRecords.filter(
        (record) => record.targetId === target.id,
      ).length
      if (count !== 5) {
        errors.push(`${conditionId}/${target.id} appears ${count} times instead of 5.`)
      }
    })
  })

  return { valid: errors.length === 0, errors, records }
}

export function validateStudyConfiguration(): boolean {
  if (!validateSequences()) {
    return false
  }
  const assignmentsValid = [1, 2, 3, 4, 5, 6].every((participantNumber, index) => {
    const assignment = getSequenceAssignment(participantNumber)
    return assignment.sequenceCode === ['A', 'B', 'C', 'D', 'E', 'F'][index]
  })
  const schedulesValid = CONDITIONS.every((condition) =>
    isValidFormalSchedule(
      condition,
      createBalancedSchedule(condition, () => 0.5),
    ) &&
    isValidPracticeSchedule(
      condition,
      createPracticeSchedule(condition, () => 0.5),
    ),
  )
  return assignmentsValid && schedulesValid
}

export function getRequiredSchedule(
  schedules: Partial<Record<PrototypeConditionId, ScheduledTrial[]>>,
  conditionId: PrototypeConditionId,
): ScheduledTrial[] {
  const schedule = schedules[conditionId]
  if (!schedule) {
    throw new Error(`Missing schedule for ${conditionId}.`)
  }
  return schedule
}
