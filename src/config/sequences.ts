import {
  PrototypeConditionId,
  SequenceCode,
} from '../types/experiment'

export const CONDITION_SEQUENCES: Readonly<
  Record<SequenceCode, readonly PrototypeConditionId[]>
> = {
  A: ['C1', 'C2', 'C6', 'C3', 'C5', 'C4'],
  B: ['C2', 'C3', 'C1', 'C4', 'C6', 'C5'],
  C: ['C3', 'C4', 'C2', 'C5', 'C1', 'C6'],
  D: ['C4', 'C5', 'C3', 'C6', 'C2', 'C1'],
  E: ['C5', 'C6', 'C4', 'C1', 'C3', 'C2'],
  F: ['C6', 'C1', 'C5', 'C2', 'C4', 'C3'],
}

export const SEQUENCE_CODES: readonly SequenceCode[] = ['A', 'B', 'C', 'D', 'E', 'F']

export function getSequenceAssignment(participantNumber: number): {
  sequenceCode: SequenceCode
  conditionOrder: readonly PrototypeConditionId[]
} {
  const sequenceCode = SEQUENCE_CODES[(participantNumber - 1) % SEQUENCE_CODES.length]
  return {
    sequenceCode,
    conditionOrder: CONDITION_SEQUENCES[sequenceCode],
  }
}

export function validateSequences(): boolean {
  const expected = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
  return SEQUENCE_CODES.every((code) => {
    const order = [...CONDITION_SEQUENCES[code]].sort()
    return order.length === expected.length && order.every((id, index) => id === expected[index])
  })
}
