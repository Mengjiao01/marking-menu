import {
  InvalidEventRecord,
  PracticeRecord,
  StudySessionState,
  TrialRecord,
} from '../types/experiment'

export const STORAGE_KEYS = {
  trialRecords: 'marking-menu:trial-records',
  invalidEvents: 'marking-menu:invalid-events',
  practiceRecords: 'marking-menu:practice-records',
  studySessions: 'marking-menu:study-sessions',
} as const

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function loadObjects(key: string): Record<string, unknown>[] {
  const stored = localStorage.getItem(key)
  if (!stored) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter(isPlainObject) : []
  } catch {
    return []
  }
}

function loadRecords<T>(key: string): T[] {
  return loadObjects(key) as T[]
}

function saveArray(key: string, records: readonly unknown[]): void {
  localStorage.setItem(key, JSON.stringify(records))
}

function appendRecord<T>(key: string, record: T): void {
  const records = loadRecords<T>(key)
  records.push(record)
  saveArray(key, records)
}

export function loadTrialRecords(): TrialRecord[] {
  return loadRecords<TrialRecord>(STORAGE_KEYS.trialRecords)
}

export function loadInvalidEvents(): InvalidEventRecord[] {
  return loadRecords<InvalidEventRecord>(STORAGE_KEYS.invalidEvents)
}

export function loadPracticeRecords(): PracticeRecord[] {
  return loadRecords<PracticeRecord>(STORAGE_KEYS.practiceRecords)
}

export function saveTrialRecord(record: TrialRecord): void {
  appendRecord(STORAGE_KEYS.trialRecords, record)
}

export function saveInvalidEvent(record: InvalidEventRecord): void {
  appendRecord(STORAGE_KEYS.invalidEvents, record)
}

export function savePracticeRecord(record: PracticeRecord): void {
  appendRecord(STORAGE_KEYS.practiceRecords, record)
}

function isStudySessionState(value: Record<string, unknown>): value is Record<
  keyof StudySessionState,
  unknown
> {
  const conditionIds = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
  const phases = [
    'instructions',
    'condition-intro',
    'practice',
    'practice-complete',
    'formal',
    'break',
    'complete',
  ]
  const sequenceCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'Prototype']
  const conditionOrder = value.conditionOrder
  const conditionOrderIndex = value.conditionOrderIndex

  return (
    value.version === 1 &&
    typeof value.studySessionId === 'string' &&
    typeof value.participantId === 'string' &&
    typeof value.sequenceCode === 'string' &&
    sequenceCodes.includes(value.sequenceCode) &&
    typeof value.configVersion === 'string' &&
    Array.isArray(conditionOrder) &&
    conditionOrder.length > 0 &&
    conditionOrder.every(
      (conditionId) =>
        typeof conditionId === 'string' && conditionIds.includes(conditionId),
    ) &&
    typeof conditionOrderIndex === 'number' &&
    Number.isInteger(conditionOrderIndex) &&
    conditionOrderIndex >= 0 &&
    conditionOrderIndex < conditionOrder.length &&
    typeof value.phase === 'string' &&
    phases.includes(value.phase) &&
    typeof value.isPrototype === 'boolean' &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number' &&
    isPlainObject(value.practiceSchedules) &&
    isPlainObject(value.formalSchedules) &&
    isPlainObject(value.blockSessionIds)
  )
}

export function loadStudySessions(): StudySessionState[] {
  return loadObjects(STORAGE_KEYS.studySessions)
    .filter(isStudySessionState)
    .map((session) => session as unknown as StudySessionState)
}

export function saveStudySession(session: StudySessionState): void {
  const sessions = loadStudySessions()
  const existingIndex = sessions.findIndex(
    (candidate) => candidate.studySessionId === session.studySessionId,
  )
  if (existingIndex >= 0) {
    sessions[existingIndex] = session
  } else {
    sessions.push(session)
  }
  saveArray(STORAGE_KEYS.studySessions, sessions)
}

export function findIncompleteStudySession(
  participantId: string,
  isPrototype: boolean,
): StudySessionState | null {
  const sessions = loadStudySessions()
    .filter(
      (session) =>
        session.participantId === participantId &&
        session.isPrototype === isPrototype &&
        session.phase !== 'complete',
    )
    .sort((first, second) => second.updatedAt - first.updatedAt)
  return sessions[0] ?? null
}
