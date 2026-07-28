import {
  INVALID_EVENT_COLUMNS,
  PRACTICE_RECORD_COLUMNS,
  TRIAL_RECORD_COLUMNS,
} from '../utils/csvColumns'
import { downloadCsv, recordsToCsv } from '../utils/exportCsv'
import {
  InvalidEventRecord,
  PracticeRecord,
  StudySessionState,
  TrialRecord,
} from '../types/experiment'
import { getCondition } from '../config/conditions'
import { validateFormalRecords } from '../utils/studySession'

interface CompleteScreenProps {
  session: StudySessionState
  records: readonly TrialRecord[]
  invalidEvents: readonly InvalidEventRecord[]
  practiceRecords: readonly PracticeRecord[]
  onReturnToSetup: () => void
}

const safeFilenamePart = (value: string): string =>
  value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64)

function CompleteScreen({
  session,
  records,
  invalidEvents,
  practiceRecords,
  onReturnToSetup,
}: CompleteScreenProps): JSX.Element {
  const integrity = validateFormalRecords(session, records)
  const sessionInvalidEvents = invalidEvents.filter(
    (record) => record.studySessionId === session.studySessionId,
  )
  const sessionPracticeRecords = practiceRecords.filter(
    (record) => record.studySessionId === session.studySessionId,
  )
  const filenameId = safeFilenamePart(session.participantId)
  const filenameSessionId = safeFilenamePart(session.studySessionId)
  const expectedTrials = session.isPrototype ? 25 : 150
  const prototypeCondition = session.isPrototype
    ? getCondition(session.conditionOrder[0])
    : null

  const downloadTrials = (): void => {
    if (!integrity.valid) {
      return
    }
    downloadCsv(
      `${filenameId}-${filenameSessionId}-all-formal-trials.csv`,
      recordsToCsv(integrity.records, TRIAL_RECORD_COLUMNS),
    )
  }

  const downloadInvalidEvents = (): void => {
    downloadCsv(
      `${filenameId}-${filenameSessionId}-invalid-events.csv`,
      recordsToCsv(sessionInvalidEvents, INVALID_EVENT_COLUMNS),
    )
  }

  const downloadPractice = (): void => {
    downloadCsv(
      `${filenameId}-${filenameSessionId}-practice-attempts.csv`,
      recordsToCsv(sessionPracticeRecords, PRACTICE_RECORD_COLUMNS),
    )
  }

  return (
    <main className="complete-screen screen">
      <section className="complete-card">
        <p className="completion-mark" aria-hidden="true">
          ✓
        </p>
        <p className="eyebrow">
          {session.isPrototype
            ? `Prototype complete · ${prototypeCondition?.label ?? ''}`
            : 'Experiment complete'}
        </p>
        <h1>{integrity.valid ? `${expectedTrials} formal trials recorded` : 'Data check required'}</h1>
        <p className="intro">
          {session.isPrototype
            ? 'The selected prototype condition is complete.'
            : 'All six blocks are complete. Please follow the researcher’s instructions to complete the external questionnaire.'}
        </p>
        <dl className="results">
          <div>
            <dt>Study session ID</dt>
            <dd className="session-id">{session.studySessionId}</dd>
          </div>
          <div>
            <dt>Progress</dt>
            <dd>{session.conditionOrder.length} blocks completed</dd>
          </div>
        </dl>

        {!integrity.valid && (
          <div className="integrity-error" role="alert">
            <strong>Formal data is incomplete and cannot be exported.</strong>
            {session.isPrototype && (
              <ul>
                {integrity.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="button-stack">
          <button
            className="primary-button"
            type="button"
            onClick={downloadTrials}
            disabled={!integrity.valid}
          >
            Download all formal data
          </button>
          {sessionInvalidEvents.length > 0 && (
            <button className="secondary-button" type="button" onClick={downloadInvalidEvents}>
              Download invalid events ({sessionInvalidEvents.length})
            </button>
          )}
          {sessionPracticeRecords.length > 0 && (
            <button className="secondary-button" type="button" onClick={downloadPractice}>
              Download practice data
            </button>
          )}
          <button className="text-button" type="button" onClick={onReturnToSetup}>
            Return to setup
          </button>
        </div>
      </section>
    </main>
  )
}

export default CompleteScreen
