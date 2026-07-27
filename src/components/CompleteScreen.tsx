import { INVALID_EVENT_COLUMNS, TRIAL_RECORD_COLUMNS } from '../utils/csvColumns'
import { downloadCsv, recordsToCsv } from '../utils/exportCsv'
import { InvalidEventRecord, TrialRecord } from '../types/experiment'
import { C1_CONDITION, TRIAL_COUNT } from '../config/conditions'

interface CompleteScreenProps {
  sessionId: string
  participantId: string
  records: readonly TrialRecord[]
  invalidEvents: readonly InvalidEventRecord[]
  onRestart: () => void
}

const safeFilenamePart = (value: string): string =>
  value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64)

function CompleteScreen({
  sessionId,
  participantId,
  records,
  invalidEvents,
  onRestart,
}: CompleteScreenProps): JSX.Element {
  const sessionRecords = records.filter((record) => record.sessionId === sessionId)
  const sessionInvalidEvents = invalidEvents.filter(
    (record) => record.sessionId === sessionId,
  )
  const correctCount = sessionRecords.filter((record) => record.correct).length
  const averageSelectionTime =
    sessionRecords.length > 0
      ? sessionRecords.reduce((total, record) => total + record.selectionTime, 0) /
        sessionRecords.length
      : 0
  const filenameId = safeFilenamePart(participantId)
  const filenameSessionId = safeFilenamePart(sessionId)

  const downloadTrials = (): void => {
    if (sessionRecords.length !== TRIAL_COUNT) {
      return
    }
    downloadCsv(
      `${filenameId}-${filenameSessionId}-${C1_CONDITION.id}-trials.csv`,
      recordsToCsv(sessionRecords, TRIAL_RECORD_COLUMNS),
    )
  }

  const downloadInvalidEvents = (): void => {
    downloadCsv(
      `${filenameId}-${filenameSessionId}-${C1_CONDITION.id}-invalid-events.csv`,
      recordsToCsv(sessionInvalidEvents, INVALID_EVENT_COLUMNS),
    )
  }

  return (
    <main className="complete-screen screen">
      <section className="complete-card">
        <p className="completion-mark" aria-hidden="true">
          ✓
        </p>
        <h1>25 trials complete</h1>
        <dl className="results">
          <div>
            <dt>Correct</dt>
            <dd>
              {correctCount}/{sessionRecords.length}
            </dd>
          </div>
          <div>
            <dt>Average selection time</dt>
            <dd>{averageSelectionTime.toFixed(1)} ms</dd>
          </div>
        </dl>

        <div className="button-stack">
          <button
            className="primary-button"
            type="button"
            onClick={downloadTrials}
            disabled={sessionRecords.length !== TRIAL_COUNT}
          >
            Download trial CSV
          </button>
          {sessionInvalidEvents.length > 0 && (
            <button className="secondary-button" type="button" onClick={downloadInvalidEvents}>
              Download invalid-event CSV ({sessionInvalidEvents.length})
            </button>
          )}
          <button className="text-button" type="button" onClick={onRestart}>
            Return to start
          </button>
        </div>
      </section>
    </main>
  )
}

export default CompleteScreen
