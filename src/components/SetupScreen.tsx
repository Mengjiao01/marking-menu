import { FormEvent, useState } from 'react'
import { CONDITIONS, DEFAULT_CONDITION_ID } from '../config/conditions'
import { PrototypeConditionId } from '../types/experiment'

interface SetupScreenProps {
  onStart: (participantId: string, conditionId: PrototypeConditionId) => void
}

function SetupScreen({ onStart }: SetupScreenProps): JSX.Element {
  const [participantId, setParticipantId] = useState('')
  const [conditionId, setConditionId] =
    useState<PrototypeConditionId>(DEFAULT_CONDITION_ID)
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmedId = participantId.trim()

    if (!trimmedId) {
      setError('Participant ID is required.')
      return
    }

    setError('')
    onStart(trimmedId, conditionId)
  }

  return (
    <main className="setup-screen screen">
      <section className="setup-card">
        <p className="eyebrow">3 × 2 prototype</p>
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

          <label htmlFor="condition-id">Prototype condition</label>
          <select
            id="condition-id"
            name="conditionId"
            value={conditionId}
            onChange={(event) =>
              setConditionId(event.target.value as PrototypeConditionId)
            }
          >
            {CONDITIONS.map((condition) => (
              <option key={condition.conditionId} value={condition.conditionId}>
                {condition.label}
              </option>
            ))}
          </select>
          <p className="field-note">
            Development and testing only. The formal experiment will assign condition
            order automatically.
          </p>

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
