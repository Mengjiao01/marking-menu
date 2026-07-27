import { INVALID_EVENT_COLUMNS, TRIAL_RECORD_COLUMNS } from '../utils/csvColumns'
import { downloadCsv, recordsToCsv } from '../utils/exportCsv'
import {
  ConditionConfig,
  InvalidEventRecord,
  TrialRecord,
} from '../types/experiment'
import { getTrialCount } from '../config/conditions'

interface CompleteScreenProps {
  sessionId: string
  participantId: string
  condition: ConditionConfig
  records: readonly TrialRecord[]
  invalidEvents: readonly InvalidEventRecord[]
  onRestart: () => void
}

const safeFilenamePart = (value: string): string =>
  value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64)

function CompleteScreen({
  sessionId,
  participantId,
  condition,
  records,
  invalidEvents,
  onRestart,
}: CompleteScreenProps): JSX.Element {
  const sessionRecords = records.filter(
    (record) =>
      record.sessionId === sessionId &&
      record.conditionId === condition.conditionId,
  )
  const sessionInvalidEvents = invalidEvents.filter(
    (record) =>
      record.sessionId === sessionId &&
      record.conditionId === condition.conditionId,
  )
  const correctCount = sessionRecords.filter((record) => record.correct).length
  const averageSelectionTime =
    sessionRecords.length > 0
      ? sessionRecords.reduce((total, record) => total + record.selectionTime, 0) /
        sessionRecords.length
      : 0
  const filenameId = safeFilenamePart(participantId)
  const filenameSessionId = safeFilenamePart(sessionId)
  const trialCount = getTrialCount(condition)

  const downloadTrials = (): void => {
    if (sessionRecords.length !== trialCount) {
      return
    }
    downloadCsv(
      `${filenameId}-${filenameSessionId}-${condition.conditionId}-trials.csv`,
      recordsToCsv(sessionRecords, TRIAL_RECORD_COLUMNS),
    )
  }

  const downloadInvalidEvents = (): void => {
    downloadCsv(
      `${filenameId}-${filenameSessionId}-${condition.conditionId}-invalid-events.csv`,
      recordsToCsv(sessionInvalidEvents, INVALID_EVENT_COLUMNS),
    )
  }

  return (
    <main className="complete-screen screen">
      <section className="complete-card">
        <p className="completion-mark" aria-hidden="true">
          ✓
        </p>
        <p className="eyebrow">{condition.label}</p>
        <h1>{trialCount} trials complete</h1>
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
            disabled={sessionRecords.length !== trialCount}
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
