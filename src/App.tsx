import { useState } from 'react'
import CompleteScreen from './components/CompleteScreen'
import ExperimentScreen from './components/ExperimentScreen'
import SetupScreen from './components/SetupScreen'
import { DEFAULT_CONDITION_ID, getCondition } from './config/conditions'
import {
  ConditionConfig,
  InvalidEventRecord,
  PrototypeConditionId,
  ScheduledTrial,
  TrialRecord,
} from './types/experiment'
import { createBalancedSchedule } from './utils/schedule'
import { createSessionId } from './utils/session'
import { saveInvalidEvent, saveTrialRecord } from './utils/storage'

type Screen = 'setup' | 'experiment' | 'complete'

function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('setup')
  const [sessionId, setSessionId] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [condition, setCondition] = useState<ConditionConfig>(
    getCondition(DEFAULT_CONDITION_ID),
  )
  const [schedule, setSchedule] = useState<ScheduledTrial[]>([])
  const [records, setRecords] = useState<TrialRecord[]>([])
  const [invalidEvents, setInvalidEvents] = useState<InvalidEventRecord[]>([])

  const startExperiment = (
    nextParticipantId: string,
    conditionId: PrototypeConditionId,
  ): void => {
    const selectedCondition = getCondition(conditionId)
    setSessionId(createSessionId(conditionId))
    setParticipantId(nextParticipantId)
    setCondition(selectedCondition)
    setSchedule(createBalancedSchedule(selectedCondition))
    setRecords([])
    setInvalidEvents([])
    setScreen('experiment')
  }

  const handleTrialRecorded = (record: TrialRecord): void => {
    saveTrialRecord(record)
    setRecords((current) => [...current, record])
  }

  const handleInvalidEvent = (record: InvalidEventRecord): void => {
    saveInvalidEvent(record)
    setInvalidEvents((current) => [...current, record])
  }

  const completeExperiment = (completedRecords: readonly TrialRecord[]): void => {
    setRecords([...completedRecords])
    setScreen('complete')
  }

  const restart = (): void => {
    setSessionId('')
    setParticipantId('')
    setSchedule([])
    setRecords([])
    setInvalidEvents([])
    setScreen('setup')
  }

  return (
    <>
      {screen === 'setup' && <SetupScreen onStart={startExperiment} />}
      {screen === 'experiment' && schedule.length > 0 && (
        <ExperimentScreen
          sessionId={sessionId}
          participantId={participantId}
          condition={condition}
          schedule={schedule}
          onTrialRecorded={handleTrialRecorded}
          onInvalidEvent={handleInvalidEvent}
          onComplete={completeExperiment}
        />
      )}
      {screen === 'complete' && (
        <CompleteScreen
          sessionId={sessionId}
          participantId={participantId}
          condition={condition}
          records={records}
          invalidEvents={invalidEvents}
          onRestart={restart}
        />
      )}
      <aside className="orientation-warning" role="alert">
        <strong>Portrait orientation required</strong>
        <span>Please rotate your device to continue.</span>
      </aside>
    </>
  )
}

export default App
