import { ConditionConfig } from '../types/experiment'

interface PracticeCompleteScreenProps {
  condition: ConditionConfig
  conditionOrderPosition: number
  totalConditions: number
  isPrototype: boolean
  onStartFormal: () => void
}

function PracticeCompleteScreen({
  condition,
  conditionOrderPosition,
  totalConditions,
  isPrototype,
  onStartFormal,
}: PracticeCompleteScreenProps): JSX.Element {
  return (
    <main className="flow-screen screen">
      <section className="flow-card">
        <p className="completion-mark" aria-hidden="true">
          ✓
        </p>
        <p className="eyebrow">
          {isPrototype
            ? condition.label
            : `Block ${conditionOrderPosition} of ${totalConditions}`}
        </p>
        <h1>Practice complete</h1>
        <p className="intro">
          The next 25 selections are formal trials. Timing begins only after you
          start each valid gesture.
        </p>
        <button className="primary-button" type="button" onClick={onStartFormal}>
          Start formal trials
        </button>
      </section>
    </main>
  )
}

export default PracticeCompleteScreen
