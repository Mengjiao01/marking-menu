import { FormEvent, useState } from 'react'

interface SetupScreenProps {
  onStart: (participantId: string) => void
}

function SetupScreen({ onStart }: SetupScreenProps): JSX.Element {
  const [participantId, setParticipantId] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmedId = participantId.trim()

    if (!trimmedId) {
      setError('Participant ID is required.')
      return
    }

    setError('')
    onStart(trimmedId)
  }

  return (
    <main className="setup-screen screen">
      <section className="setup-card">
        <p className="eyebrow">C1 · Centre–Traditional</p>
        <h1>Marking Menu Experiment</h1>
        <p className="intro">
          Enter the assigned participant code to begin 25 trials. Do not enter a name,
          email address, or contact information.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="participant-id">Participant ID</label>
          <input
            id="participant-id"
            name="participantId"
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            aria-describedby={error ? 'participant-error' : undefined}
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p id="participant-error" className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="requirements" aria-label="Experiment requirements">
            <h2>Before you begin</h2>
            <ul>
              <li>iPhone</li>
              <li>Safari</li>
              <li>Portrait</li>
              <li>Right thumb only</li>
            </ul>
          </div>

          <button className="primary-button" type="submit">
            Start experiment
          </button>
        </form>
      </section>
    </main>
  )
}

export default SetupScreen
