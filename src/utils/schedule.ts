import {
  ConditionConfig,
  ScheduledTrial,
  TargetId,
} from '../types/experiment'

function shuffleTrials(
  trials: ScheduledTrial[],
  random: () => number,
): ScheduledTrial[] {
  // 从后往前交换，保证每种排列被抽到的机会一样。
  for (let index = trials.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = trials[index]
    trials[index] = trials[swapIndex]
    trials[swapIndex] = current
  }
  return trials
}

export function createBalancedSchedule(
  condition: ConditionConfig,
  random: () => number = Math.random,
): ScheduledTrial[] {
  const trials: ScheduledTrial[] = []

  condition.targets.forEach((item) => {
    for (let repetition = 0; repetition < condition.repetitions; repetition += 1) {
      trials.push({ targetId: item.id })
    }
  })

  return shuffleTrials(trials, random)
}

export function createPracticeSchedule(
  condition: ConditionConfig,
  random: () => number = Math.random,
): ScheduledTrial[] {
  return shuffleTrials(
    condition.targets.map((target) => ({ targetId: target.id })),
    random,
  )
}

function countTargets(schedule: readonly ScheduledTrial[]): Map<TargetId, number> {
  const counts = new Map<TargetId, number>()
  schedule.forEach((trial) => {
    counts.set(trial.targetId, (counts.get(trial.targetId) ?? 0) + 1)
  })
  return counts
}

export function isValidFormalSchedule(
  condition: ConditionConfig,
  schedule: readonly ScheduledTrial[],
): boolean {
  const counts = countTargets(schedule)
  return (
    schedule.length === condition.targets.length * condition.repetitions &&
    condition.targets.every(
      (target) => counts.get(target.id) === condition.repetitions,
    )
  )
}

export function isValidPracticeSchedule(
  condition: ConditionConfig,
  schedule: readonly ScheduledTrial[],
): boolean {
  const counts = countTargets(schedule)
  return (
    schedule.length === condition.targets.length &&
    condition.targets.every((target) => counts.get(target.id) === 1)
  )
}
