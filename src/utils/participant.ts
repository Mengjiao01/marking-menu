const PARTICIPANT_ID_PATTERN = /^P(\d{3,})$/i

export interface ParsedParticipantId {
  participantId: string
  participantNumber: number
}

export function parseParticipantId(value: string): ParsedParticipantId | null {
  const normalized = value.trim().toUpperCase()
  const match = PARTICIPANT_ID_PATTERN.exec(normalized)
  if (!match) {
    return null
  }

  const participantNumber = Number(match[1])
  if (!Number.isSafeInteger(participantNumber) || participantNumber < 1) {
    return null
  }

  return { participantId: normalized, participantNumber }
}
