import { PrototypeConditionId } from '../types/experiment'

function createUniqueId(prefix: string): string {
  const timestamp = Date.now().toString(36)
  const randomValues = new Uint32Array(2)

  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomValues)
  } else {
    randomValues[0] = Math.floor(Math.random() * 0xffffffff)
    randomValues[1] = Math.floor(Math.random() * 0xffffffff)
  }

  const randomPart = Array.from(randomValues)
    .map((value) => value.toString(36))
    .join('')

  return `${prefix}-${timestamp}-${randomPart}`
}

export function createStudySessionId(): string {
  return createUniqueId('study')
}

export function createBlockSessionId(
  conditionId: PrototypeConditionId,
  conditionOrderPosition: number,
): string {
  return createUniqueId(
    `${conditionId.toLowerCase()}-block-${conditionOrderPosition}`,
  )
}
