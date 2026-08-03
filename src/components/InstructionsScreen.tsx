interface InstructionsScreenProps {
  isPrototype: boolean
  onStart: () => void
}

function InstructionsScreen({
  isPrototype,
  onStart,
}: InstructionsScreenProps): JSX.Element {
  return (
    <main className="flow-screen instructions-screen screen">
      <section className="flow-card instructions-card">
        <p className="eyebrow">{isPrototype ? 'Prototype mode' : 'Before you begin'}</p>
        <h1>Study Instructions</h1>

        {isPrototype && (
          <p className="prototype-banner" role="status">
            Prototype mode is active.
          </p>
        )}

        <ul className="instruction-summary">
          <li>Use your phone in portrait orientation.</li>
          <li>Hold it in your right hand and use only your right thumb.</li>
          <li>Select each target as quickly and accurately as possible.</li>
        </ul>

        <section className="selection-instructions" aria-labelledby="how-to-select">
          <h2 id="how-to-select">How to select</h2>
          <ol>
            <li>Check the target symbol at the top.</li>
            <li>Press the highlighted starting point.</li>
            <li>
              Keep your thumb on the screen, slide to the matching item, and lift
              to select it.
            </li>
          </ol>
        </section>

        <p className="instruction-emphasis">
          Do not lift your thumb during the movement.
        </p>
        <p className="instruction-note">
          You will complete a short practice before each formal block. After each
          formal block, you will answer five short rating questions. You may take a
          break between blocks.
        </p>
        <p className="resume-note">
          If the page is closed or refreshed, enter the same Participant ID to
          resume.
        </p>

        <button className="primary-button" type="button" onClick={onStart}>
          Start Experiment
        </button>
      </section>
    </main>
  )
}

export default InstructionsScreen
