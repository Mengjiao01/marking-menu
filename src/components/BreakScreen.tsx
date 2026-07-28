interface BreakScreenProps {
  completedConditions: number
  totalConditions: number
  onContinue: () => void
}

function BreakScreen({
  completedConditions,
  totalConditions,
  onContinue,
}: BreakScreenProps): JSX.Element {
  return (
    <main className="flow-screen screen">
      <section className="flow-card">
        <p className="completion-mark" aria-hidden="true">
          ✓
        </p>
        <h1>Block complete</h1>
        <p className="intro">
          You have completed {completedConditions} of {totalConditions} blocks.
          You may relax your right hand. Continue when you are ready.
        </p>
        <button className="primary-button" type="button" onClick={onContinue}>
          Continue
        </button>
      </section>
    </main>
  )
}

export default BreakScreen
