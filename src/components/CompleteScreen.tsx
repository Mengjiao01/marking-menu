import {
  CONDITION_RATING_COLUMNS,
  INVALID_EVENT_COLUMNS,
  PRACTICE_RECORD_COLUMNS,
  TRIAL_RECORD_COLUMNS,
} from '../utils/csvColumns'
import { downloadCsv, recordsToCsv } from '../utils/exportCsv'
import {
  ConditionRatingRecord,
  InvalidEventRecord,
  PracticeRecord,
  StudySessionState,
  TrialRecord,
} from '../types/experiment'
import { getCondition } from '../config/conditions'
import { QUESTIONNAIRE_URL } from '../config/questionnaire'
import { validateConditionRatings, validateFormalRecords } from '../utils/studySession'

interface CompleteScreenProps {
  session: StudySessionState
  records: readonly TrialRecord[]
  invalidEvents: readonly InvalidEventRecord[]
  practiceRecords: readonly PracticeRecord[]
  ratings: readonly ConditionRatingRecord[]
  onReturnToSetup: () => void
}

const safeFilenamePart = (value: string): string =>
  value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64)

function CompleteScreen({
  session,
  records,
  invalidEvents,
  practiceRecords,
  ratings,
  onReturnToSetup,
}: CompleteScreenProps): JSX.Element {
  const integrity = validateFormalRecords(session, records)
  const ratingIntegrity = validateConditionRatings(session, ratings)
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
  const questionnaireAvailable = QUESTIONNAIRE_URL.trim().length > 0

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

  const downloadRatings = (): void => {
    if (!ratingIntegrity.valid) return
    downloadCsv(
      `${filenameId}-${filenameSessionId}-subjective-ratings.csv`,
      recordsToCsv(ratingIntegrity.records, CONDITION_RATING_COLUMNS),
    )
  }

  const openQuestionnaire = (): void => {
    if (!questionnaireAvailable || session.isPrototype) return
    window.open(QUESTIONNAIRE_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="complete-screen screen">
      <section className="complete-card">
        <p className="completion-mark" aria-hidden="true">
          ✓
        </p>
        <p className="eyebrow">
          {session.isPrototype
            ? `Prototype mode · ${prototypeCondition?.label ?? ''}`
            : 'Experiment complete'}
        </p>
        <h1>
          {session.isPrototype
            ? integrity.valid
              ? `${expectedTrials} formal trials recorded`
              : 'Data check required'
            : 'Experiment Complete'}
        </h1>
        {session.isPrototype ? (
          <p className="intro">The selected prototype condition is complete.</p>
        ) : (
          <div className="completion-intro">
            <p>Thank you for completing the experiment.</p>
            <p>
              Please download all four data files below. Do not rename, edit or open and
              re-save the files. The filenames already contain your Participant ID.
            </p>
          </div>
        )}
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

        {!ratingIntegrity.valid && (
          <div className="integrity-error" role="alert">
            <strong>Subjective rating data is incomplete and cannot be exported.</strong>
            <ul>{ratingIntegrity.errors.map((error) => <li key={error}>{error}</li>)}</ul>
          </div>
        )}

        <div className="button-stack download-buttons" aria-label="Data file downloads">
          <button
            className="secondary-button"
            type="button"
            onClick={downloadTrials}
            disabled={!integrity.valid}
          >
            Download Formal Trials
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={downloadRatings}
            disabled={!ratingIntegrity.valid}
          >
            Download Subjective Ratings
          </button>
          <button className="secondary-button" type="button" onClick={downloadPractice}>
            Download Practice Attempts
          </button>
          <button className="secondary-button" type="button" onClick={downloadInvalidEvents}>
            Download Invalid Events
          </button>
        </div>

        <div className="questionnaire-panel">
          {session.isPrototype ? (
            <p>Questionnaire submission is not required in Prototype mode.</p>
          ) : (
            <>
              <p>
                After confirming that all four files are in your Downloads folder,
                continue to the questionnaire.
              </p>
              <button
                className="primary-button questionnaire-button"
                type="button"
                onClick={openQuestionnaire}
                disabled={!questionnaireAvailable}
              >
                I Have Downloaded All Files — Continue to Questionnaire
              </button>
              {!questionnaireAvailable && (
                <p className="questionnaire-unavailable">
                  The questionnaire link will be provided by the researcher.
                </p>
              )}
            </>
          )}
        </div>

        <div className="button-stack completion-actions">
          <button className="text-button" type="button" onClick={onReturnToSetup}>
            Return to setup
          </button>
        </div>
      </section>
    </main>
  )
}

export default CompleteScreen
