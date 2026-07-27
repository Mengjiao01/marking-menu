import { ConditionConfig, ScheduledTrial } from '../types/experiment'

export function createBalancedSchedule(
  condition: ConditionConfig,
  random: () => number = Math.random,
): ScheduledTrial[] {
  const trials: ScheduledTrial[] = []

  condition.items.forEach((item) => {
    for (let repetition = 0; repetition < condition.repetitions; repetition += 1) {
      trials.push({ targetId: item.id })
    }
  })

  for (let index = trials.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = trials[index]
    trials[index] = trials[swapIndex]
    trials[swapIndex] = current
  }

  return trials
}
