import { FormEvent, useState } from 'react'
import { CONDITIONS, DEFAULT_CONDITION_ID } from '../config/conditions'
import {
  PrototypeConditionId,
  StudySessionState,
} from '../types/experiment'
import { parseParticipantId } from '../utils/participant'

interface SetupScreenProps {
  isPrototype: boolean
  resumeSession: StudySessionState | null
  onSubmit: (
    participantId: string,
    participantNumber: number | null,
    conditionId: PrototypeConditionId,
  ) => void
  onResume: () => void
  onStartNew: () => void
  onCancelResume: () => void
}

function SetupScreen({
  isPrototype,
  resumeSession,
  onSubmit,
  onResume,
  onStartNew,
  onCancelResume,
}: SetupScreenProps): JSX.Element {
  const [participantId, setParticipantId] = useState('')
  const [conditionId, setConditionId] =
    useState<PrototypeConditionId>(DEFAULT_CONDITION_ID)
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmedId = participantId.trim()

    if (isPrototype) {
      if (!trimmedId) {
        setError('Participant ID is required.')
        return
      }
      setError('')
      onSubmit(trimmedId, null, conditionId)
      return
    }

    const parsed = parseParticipantId(trimmedId)
    if (!parsed) {
      setError('Use the researcher-provided format P followed by at least 3 digits.')
      return
    }
    setError('')
    setParticipantId(parsed.participantId)
    onSubmit(parsed.participantId, parsed.participantNumber, conditionId)
  }

  if (resumeSession) {
    return (
      <main className="setup-screen screen">
        <section className="setup-card">
          <p className="eyebrow">Unfinished session found</p>
          <h1>Resume session</h1>
          <p className="intro">
            An incomplete session for {resumeSession.participantId} was found. Resume
            from the next uncompleted trial, or start a separate new session.
          </p>
          <div className="button-stack">
            <button className="primary-button" type="button" onClick={onResume}>
              Resume session
            </button>
            <button className="secondary-button" type="button" onClick={onStartNew}>
              Start new session
            </button>
            <button className="text-button" type="button" onClick={onCancelResume}>
              Back
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="setup-screen screen">
      <section className="setup-card">
        <p className="eyebrow">
          {isPrototype ? 'Prototype mode' : 'Formal study'}
        </p>
        <h1>Marking Menu Experiment</h1>
        <p className="intro">
          {isPrototype
            ? 'Run one selected condition for development and testing.'
            : 'Enter the participant number provided by the researcher. You will complete all six blocks.'}
        </p>

        {isPrototype && (
          <p className="prototype-banner" role="status">
            Prototype mode is active. Exported records will contain isPrototype=true.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="participant-id">Participant ID</label>
          <input
            id="participant-id"
            name="participantId"
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            placeholder={isPrototype ? 'Test name' : 'P001'}
            aria-describedby={error ? 'participant-error' : undefined}
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p id="participant-error" className="form-error" role="alert">
              {error}
            </p>
          )}

          {isPrototype && (
            <>
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
            </>
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
            {isPrototype ? 'Start prototype' : 'Continue'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default SetupScreen
