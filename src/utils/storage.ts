import { InvalidEventRecord, TrialRecord } from '../types/experiment'

export const STORAGE_KEYS = {
  trialRecords: 'marking-menu:c1:trial-records',
  invalidEvents: 'marking-menu:c1:invalid-events',
} as const

function loadArray<T>(key: string): T[] {
  const stored = localStorage.getItem(key)
  if (!stored) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function appendRecord<T>(key: string, record: T): void {
  const records = loadArray<T>(key)
  records.push(record)
  localStorage.setItem(key, JSON.stringify(records))
}

export function saveTrialRecord(record: TrialRecord): void {
  appendRecord(STORAGE_KEYS.trialRecords, record)
}

export function saveInvalidEvent(record: InvalidEventRecord): void {
  appendRecord(STORAGE_KEYS.invalidEvents, record)
}
