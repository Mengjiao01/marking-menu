import { ConditionConfig } from '../types/experiment'

export const C1_CONDITION: ConditionConfig = {
  id: 'C1',
  name: 'C1 Centre–Traditional',
  touchLocation: 'Centre',
  menuLayout: 'Traditional',
  repetitions: 5,
  targetDiameter: 48,
  menuRadius: 72,
  activationRadius: 20,
  centreXRatio: 0.5,
  centreYRatio: 0.6,
  items: [
    { id: 'T1', label: 'Star', symbol: '★', angle: 36 },
    { id: 'T2', label: 'Circle', symbol: '●', angle: 108 },
    { id: 'T3', label: 'Square', symbol: '■', angle: 180 },
    { id: 'T4', label: 'Triangle', symbol: '▲', angle: 252 },
    { id: 'T5', label: 'Diamond', symbol: '◆', angle: 324 },
  ],
}

export const TRIAL_COUNT = C1_CONDITION.items.length * C1_CONDITION.repetitions
