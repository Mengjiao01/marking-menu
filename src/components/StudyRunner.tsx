import { getCondition } from '../config/conditions'
import {
  InvalidEventRecord,
  PracticeRecord,
  StudySessionState,
  TrialRecord,
} from '../types/experiment'
import {
  getBlockFormalRecords,
  getBlockPracticeRecords,
  getCurrentConditionId,
  getRequiredSchedule,
  withSessionPhase,
} from '../utils/studySession'
import BreakScreen from './BreakScreen'
import CompleteScreen from './CompleteScreen'
import ConditionIntroScreen from './ConditionIntroScreen'
import ExperimentScreen from './ExperimentScreen'
import InstructionsScreen from './InstructionsScreen'
import PracticeCompleteScreen from './PracticeCompleteScreen'

interface StudyRunnerProps {
  session: StudySessionState
  records: readonly TrialRecord[]
  practiceRecords: readonly PracticeRecord[]
  invalidEvents: readonly InvalidEventRecord[]
  onSessionChange: (session: StudySessionState) => void
  onFormalRecord: (record: TrialRecord) => void
  onPracticeRecord: (record: PracticeRecord) => void
  onInvalidEvent: (record: InvalidEventRecord) => void
  onReturnToSetup: () => void
}

function StudyRunner({
  session,
  records,
  practiceRecords,
  invalidEvents,
  onSessionChange,
  onFormalRecord,
  onPracticeRecord,
  onInvalidEvent,
  onReturnToSetup,
}: StudyRunnerProps): JSX.Element {
  const conditionId = getCurrentConditionId(session)
  const condition = getCondition(conditionId)
  const conditionOrderPosition = session.conditionOrderIndex + 1
  const blockSessionId = session.blockSessionIds[conditionId]
  if (!blockSessionId) {
    throw new Error(`Missing block session ID for ${conditionId}.`)
  }

  const practiceSchedule = getRequiredSchedule(
    session.practiceSchedules,
    conditionId,
  )
  const formalSchedule = getRequiredSchedule(
    session.formalSchedules,
    conditionId,
  )
  const blockPracticeRecords = getBlockPracticeRecords(session, practiceRecords)
  const blockFormalRecords = getBlockFormalRecords(session, records)
  const completedPracticeTargets = blockPracticeRecords.filter(
    (record) => record.correct,
  ).length
  const nextPracticeAttempt =
    blockPracticeRecords.filter(
      (record) =>
        record.practiceTargetNumber === completedPracticeTargets + 1,
    ).length + 1

  const setPhase = (phase: StudySessionState['phase']): void => {
    onSessionChange(withSessionPhase(session, phase))
  }

  const completeFormalBlock = (): void => {
    const isLast =
      session.conditionOrderIndex >= session.conditionOrder.length - 1
    setPhase(isLast ? 'complete' : 'break')
  }

  switch (session.phase) {
    case 'instructions':
      return (
        <InstructionsScreen
          isPrototype={session.isPrototype}
          onStart={() => setPhase('condition-intro')}
        />
      )
    case 'condition-intro':
      return (
        <ConditionIntroScreen
          condition={condition}
          conditionOrderPosition={conditionOrderPosition}
          totalConditions={session.conditionOrder.length}
          isPrototype={session.isPrototype}
          onStartPractice={() => setPhase('practice')}
        />
      )
    case 'practice':
      return (
        <ExperimentScreen
          studySessionId={session.studySessionId}
          blockSessionId={blockSessionId}
          participantId={session.participantId}
          sequenceCode={session.sequenceCode}
          condition={condition}
          conditionOrderPosition={conditionOrderPosition}
          totalConditions={session.conditionOrder.length}
          phase="Practice"
          isPrototype={session.isPrototype}
          schedule={practiceSchedule}
          initialTrialIndex={completedPracticeTargets}
          initialAttemptNumber={nextPracticeAttempt}
          globalTrialOffset={0}
          onFormalTrialRecorded={onFormalRecord}
          onPracticeAttemptRecorded={onPracticeRecord}
          onInvalidEvent={onInvalidEvent}
          onPhaseComplete={() => setPhase('practice-complete')}
        />
      )
    case 'practice-complete':
      return (
        <PracticeCompleteScreen
          condition={condition}
          conditionOrderPosition={conditionOrderPosition}
          totalConditions={session.conditionOrder.length}
          isPrototype={session.isPrototype}
          onStartFormal={() => setPhase('formal')}
        />
      )
    case 'formal':
      return (
        <ExperimentScreen
          studySessionId={session.studySessionId}
          blockSessionId={blockSessionId}
          participantId={session.participantId}
          sequenceCode={session.sequenceCode}
          condition={condition}
          conditionOrderPosition={conditionOrderPosition}
          totalConditions={session.conditionOrder.length}
          phase="Formal"
          isPrototype={session.isPrototype}
          schedule={formalSchedule}
          initialTrialIndex={blockFormalRecords.length}
          initialAttemptNumber={1}
          globalTrialOffset={session.conditionOrderIndex * 25}
          onFormalTrialRecorded={onFormalRecord}
          onPracticeAttemptRecorded={onPracticeRecord}
          onInvalidEvent={onInvalidEvent}
          onPhaseComplete={completeFormalBlock}
        />
      )
    case 'break':
      return (
        <BreakScreen
          completedConditions={conditionOrderPosition}
          totalConditions={session.conditionOrder.length}
          onContinue={() =>
            onSessionChange(
              withSessionPhase(
                session,
                'condition-intro',
                session.conditionOrderIndex + 1,
              ),
            )
          }
        />
      )
    case 'complete':
      return (
        <CompleteScreen
          session={session}
          records={records}
          invalidEvents={invalidEvents}
          practiceRecords={practiceRecords}
          onReturnToSetup={onReturnToSetup}
        />
      )
    default:
      throw new Error(`Unsupported study phase: ${session.phase}`)
  }
}

export default StudyRunner
