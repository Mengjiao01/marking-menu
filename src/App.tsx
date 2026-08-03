import { useState } from 'react'
import SetupScreen from './components/SetupScreen'
import StudyRunner from './components/StudyRunner'
import {
  ConditionRatingRecord,
  InvalidEventRecord,
  PracticeRecord,
  PrototypeConditionId,
  StudySessionState,
  TrialRecord,
} from './types/experiment'
import {
  findIncompleteStudySession,
  loadConditionRatings,
  loadInvalidEvents,
  loadPracticeRecords,
  loadTrialRecords,
  saveInvalidEvent,
  saveConditionRating,
  savePracticeRecord,
  saveStudySession,
  saveTrialRecord,
} from './utils/storage'
import {
  createStudySession,
  reconcileStudySession,
  validateStudyConfiguration,
} from './utils/studySession'

interface PendingStart {
  participantId: string
  participantNumber: number | null
  conditionId: PrototypeConditionId
}

const isPrototypeMode =
  new URLSearchParams(window.location.search).get('mode') === 'prototype'

if (import.meta.env.DEV && !validateStudyConfiguration()) {
  throw new Error('Study sequence configuration validation failed.')
}

function App(): JSX.Element {
  const [session, setSession] = useState<StudySessionState | null>(null)
  const [resumeSession, setResumeSession] = useState<StudySessionState | null>(null)
  const [pendingStart, setPendingStart] = useState<PendingStart | null>(null)
  const [records, setRecords] = useState<TrialRecord[]>(() => loadTrialRecords())
  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>(
    () => loadPracticeRecords(),
  )
  const [invalidEvents, setInvalidEvents] = useState<InvalidEventRecord[]>(
    () => loadInvalidEvents(),
  )
  const [ratings, setRatings] = useState<ConditionRatingRecord[]>(
    () => loadConditionRatings(),
  )

  const activateSession = (nextSession: StudySessionState): void => {
    saveStudySession(nextSession)
    setSession(nextSession)
    setResumeSession(null)
    setPendingStart(null)
  }

  const startNewSession = (start: PendingStart): void => {
    activateSession(
      createStudySession(
        start.participantId,
        start.participantNumber,
        isPrototypeMode,
        start.conditionId,
      ),
    )
  }

  const handleSetupSubmit = (
    participantId: string,
    participantNumber: number | null,
    conditionId: PrototypeConditionId,
  ): void => {
    const start = { participantId, participantNumber, conditionId }
    const incomplete = findIncompleteStudySession(
      participantId,
      isPrototypeMode,
    )
    if (incomplete) {
      setPendingStart(start)
      setResumeSession(incomplete)
      return
    }
    startNewSession(start)
  }

  const handleResume = (): void => {
    if (!resumeSession) {
      return
    }
    const reconciled = reconcileStudySession(
      resumeSession,
      records,
      practiceRecords,
      ratings,
    )
    activateSession(reconciled)
  }

  const handleStartNew = (): void => {
    if (pendingStart) {
      startNewSession(pendingStart)
    }
  }

  const updateSession = (nextSession: StudySessionState): void => {
    saveStudySession(nextSession)
    setSession(nextSession)
  }

  const touchSession = (): void => {
    setSession((current) => {
      if (!current) {
        return current
      }
      const updated = { ...current, updatedAt: Date.now() }
      saveStudySession(updated)
      return updated
    })
  }

  const handleFormalRecord = (record: TrialRecord): void => {
    saveTrialRecord(record)
    setRecords((current) => [...current, record])
    touchSession()
  }

  const handlePracticeRecord = (record: PracticeRecord): void => {
    savePracticeRecord(record)
    setPracticeRecords((current) => [...current, record])
    touchSession()
  }

  const handleInvalidEvent = (record: InvalidEventRecord): void => {
    saveInvalidEvent(record)
    setInvalidEvents((current) => [...current, record])
    touchSession()
  }

  const handleRating = (record: ConditionRatingRecord): boolean => {
    try {
      if (!saveConditionRating(record)) return false
      setRatings(loadConditionRatings())
      return true
    } catch {
      return false
    }
  }

  if (!session) {
    return (
      <>
        <SetupScreen
          isPrototype={isPrototypeMode}
          resumeSession={resumeSession}
          onSubmit={handleSetupSubmit}
          onResume={handleResume}
          onStartNew={handleStartNew}
          onCancelResume={() => {
            setResumeSession(null)
            setPendingStart(null)
          }}
        />
        <OrientationWarning />
      </>
    )
  }

  return (
    <>
      <StudyRunner
        session={session}
        records={records}
        practiceRecords={practiceRecords}
        invalidEvents={invalidEvents}
        ratings={ratings}
        onSessionChange={updateSession}
        onFormalRecord={handleFormalRecord}
        onPracticeRecord={handlePracticeRecord}
        onInvalidEvent={handleInvalidEvent}
        onRating={handleRating}
        onReturnToSetup={() => setSession(null)}
      />
      <OrientationWarning />
    </>
  )
}

function OrientationWarning(): JSX.Element {
  return (
    <aside className="orientation-warning" role="alert">
      <strong>Portrait orientation required</strong>
      <span>Please rotate your device to continue.</span>
    </aside>
  )
}

export default App
