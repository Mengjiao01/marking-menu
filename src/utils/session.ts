import { PrototypeConditionId } from '../types/experiment'

export function createSessionId(conditionId: PrototypeConditionId): string {
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

  return `${conditionId.toLowerCase()}-${timestamp}-${randomPart}`
}
