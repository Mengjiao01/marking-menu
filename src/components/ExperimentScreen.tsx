import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  CONDITIONS,
  getTrialCount,
  MINIMUM_SAFE_STAGE_WIDTH,
  SAFETY_MARGIN,
} from '../config/conditions'
import {
  ConditionConfig,
  InvalidEventRecord,
  InvalidEventType,
  ScheduledTrial,
  TrialRecord,
} from '../types/experiment'
import {
  distance,
  getActivationCenter,
  getMenuItemPositions,
  getNearestEdgeDistance,
  getOutOfBoundsItemIds,
  getSelectedItem,
  Point,
} from '../utils/geometry'

interface ExperimentScreenProps {
  sessionId: string
  participantId: string
  condition: ConditionConfig
  schedule: readonly ScheduledTrial[]
  onTrialRecorded: (record: TrialRecord) => void
  onInvalidEvent: (record: InvalidEventRecord) => void
  onComplete: (records: readonly TrialRecord[]) => void
}

interface GestureState {
  pointerId: number
  touchDownTime: number
  touchDown: Point
  lastPoint: Point
  pathLength: number
  stageSize: {
    width: number
    height: number
  }
  activationCenter: Point
}

type Feedback = 'correct' | 'wrong' | 'invalid-start' | 'pointer-cancel' | null

const FEEDBACK_DURATION_MS = 500
function ExperimentScreen({
  sessionId,
  participantId,
  condition,
  schedule,
  onTrialRecorded,
  onInvalidEvent,
  onComplete,
}: ExperimentScreenProps): JSX.Element {
  const arenaRef = useRef<HTMLDivElement>(null)
  const gestureRef = useRef<GestureState | null>(null)
  const submittedRef = useRef(false)
  const cueTimeRef = useRef(performance.now())
  const recordsRef = useRef<TrialRecord[]>([])
  const timeoutRef = useRef<number | null>(null)
  const mountedRef = useRef(true)
  const cancelGestureRef = useRef<((point: Point) => void) | null>(null)
  const arenaSizeRef = useRef({ width: 0, height: 0 })
  const [trialIndex, setTrialIndex] = useState(0)
  const [arenaSize, setArenaSize] = useState({ width: 0, height: 0 })
  const [menuVisible, setMenuVisible] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const currentTrial = schedule[trialIndex]
  const target = condition.targets.find((item) => item.id === currentTrial.targetId)
  const trialCount = getTrialCount(condition)

  if (!target) {
    throw new Error(`Unknown target: ${currentTrial.targetId}`)
  }

  const centre = useMemo<Point>(
    () => getActivationCenter(condition.touchLocation, arenaSize),
    [arenaSize, condition.touchLocation],
  )
  const menuItems = useMemo(
    () => getMenuItemPositions(condition.targets, centre, condition.menuRadius),
    [centre, condition.menuRadius, condition.targets],
  )
  const boundaryIssues = useMemo(
    () =>
      CONDITIONS.reduce<string[]>((issues, candidate) => {
        const candidateCentre = getActivationCenter(
          candidate.touchLocation,
          arenaSize,
        )
        const candidateItems = getMenuItemPositions(
          candidate.targets,
          candidateCentre,
          candidate.menuRadius,
        )
        const itemIds = getOutOfBoundsItemIds(
          candidateItems,
          arenaSize,
          candidate.targetRadius,
          SAFETY_MARGIN,
        )
        return [
          ...issues,
          ...itemIds.map((itemId) => `${candidate.conditionId}:${itemId}`),
        ]
      }, []),
    [arenaSize],
  )
  const geometryReady =
    arenaSize.width > 0 &&
    arenaSize.height > 0 &&
    boundaryIssues.length === 0

  useEffect(() => {
    mountedRef.current = true
    const arena = arenaRef.current
    if (!arena) {
      return undefined
    }

    const updateSize = (): void => {
      if (!mountedRef.current) {
        return
      }
      const bounds = arena.getBoundingClientRect()
      const nextSize = { width: bounds.width, height: bounds.height }
      const previousSize = arenaSizeRef.current
      const sizeChanged =
        previousSize.width > 0 &&
        (previousSize.width !== nextSize.width || previousSize.height !== nextSize.height)

      if (sizeChanged && gestureRef.current) {
        cancelGestureRef.current?.(gestureRef.current.lastPoint)
      }

      arenaSizeRef.current = nextSize
      setArenaSize(nextSize)
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(arena)

    return () => {
      mountedRef.current = false
      observer.disconnect()
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    cueTimeRef.current = performance.now()
  }, [trialIndex])

  useEffect(() => {
    if (
      import.meta.env.DEV &&
      arenaSize.width > 0 &&
      boundaryIssues.length > 0
    ) {
      console.warn(
        `Traditional menu items outside the experiment stage: ${boundaryIssues.join(
          ', ',
        )}`,
      )
    }
  }, [arenaSize.width, boundaryIssues])

  const pointFromEvent = (event: ReactPointerEvent<HTMLDivElement>): Point => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    }
  }

  const scheduleFeedbackReset = (callback?: () => void): void => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      if (!mountedRef.current) {
        return
      }
      setFeedback(null)
      submittedRef.current = false
      timeoutRef.current = null
      callback?.()
    }, FEEDBACK_DURATION_MS)
  }

  const createInvalidEvent = (
    eventType: InvalidEventType,
    point: Point,
  ): InvalidEventRecord => ({
    sessionId,
    participantId,
    conditionId: condition.conditionId,
    trialNumber: trialIndex + 1,
    targetId: currentTrial.targetId,
    eventType,
    eventTime: performance.now(),
    pointerX: point.x,
    pointerY: point.y,
    stageWidth: arenaSize.width,
    stageHeight: arenaSize.height,
    activationCenterX: centre.x,
    activationCenterY: centre.y,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent,
  })

  const cancelActiveGesture = (point: Point): void => {
    const gesture = gestureRef.current
    if (!gesture || submittedRef.current) {
      return
    }

    submittedRef.current = true
    const arena = arenaRef.current
    if (arena && arena.hasPointerCapture(gesture.pointerId)) {
      try {
        arena.releasePointerCapture(gesture.pointerId)
      } catch {
        // Capture can already be lost during cancellation or orientation changes.
      }
    }
    gestureRef.current = null
    setMenuVisible(false)
    setFeedback('pointer-cancel')
    onInvalidEvent(createInvalidEvent('pointer-cancel', point))
    scheduleFeedbackReset()
  }

  cancelGestureRef.current = cancelActiveGesture

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (
      submittedRef.current ||
      gestureRef.current !== null ||
      !geometryReady ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return
    }

    event.preventDefault()
    const point = pointFromEvent(event)

    if (distance(point, centre) > condition.startTolerance) {
      submittedRef.current = true
      setFeedback('invalid-start')
      onInvalidEvent(createInvalidEvent('invalid-start', point))
      scheduleFeedbackReset()
      return
    }

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      submittedRef.current = true
      setFeedback('pointer-cancel')
      onInvalidEvent(createInvalidEvent('pointer-cancel', point))
      scheduleFeedbackReset()
      return
    }
    gestureRef.current = {
      pointerId: event.pointerId,
      touchDownTime: performance.now(),
      touchDown: point,
      lastPoint: point,
      pathLength: 0,
      stageSize: { ...arenaSize },
      activationCenter: { ...centre },
    }
    setMenuVisible(true)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || submittedRef.current) {
      return
    }

    event.preventDefault()
    const point = pointFromEvent(event)
    gesture.pathLength += distance(gesture.lastPoint, point)
    gesture.lastPoint = point
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || submittedRef.current) {
      return
    }

    submittedRef.current = true
    event.preventDefault()
    const touchUp = pointFromEvent(event)
    gesture.pathLength += distance(gesture.lastPoint, touchUp)
    const touchUpTime = performance.now()
    const selectedId = getSelectedItem(touchUp, menuItems, condition.targetRadius)
    const correct = selectedId === currentTrial.targetId
    const errorType = selectedId === null ? 'miss' : correct ? 'none' : 'wrong-item'
    const record: TrialRecord = {
      sessionId,
      participantId,
      conditionId: condition.conditionId,
      touchLocation: condition.touchLocation,
      menuLayout: condition.menuLayout,
      trialNumber: trialIndex + 1,
      targetId: currentTrial.targetId,
      selectedId,
      valid: true,
      correct,
      errorType,
      cueTime: cueTimeRef.current,
      touchDownTime: gesture.touchDownTime,
      touchUpTime,
      selectionTime: touchUpTime - gesture.touchDownTime,
      touchDownX: gesture.touchDown.x,
      touchDownY: gesture.touchDown.y,
      touchUpX: touchUp.x,
      touchUpY: touchUp.y,
      pathLength: gesture.pathLength,
      stageWidth: gesture.stageSize.width,
      stageHeight: gesture.stageSize.height,
      activationCenterX: gesture.activationCenter.x,
      activationCenterY: gesture.activationCenter.y,
      nearestEdgeDistance: getNearestEdgeDistance(
        gesture.activationCenter,
        gesture.stageSize,
      ),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      userAgent: navigator.userAgent,
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // The browser may release capture immediately before pointerup is dispatched.
      }
    }
    gestureRef.current = null
    setMenuVisible(false)
    setFeedback(correct ? 'correct' : 'wrong')
    recordsRef.current = [...recordsRef.current, record]
    onTrialRecorded(record)

    scheduleFeedbackReset(() => {
      if (
        recordsRef.current.length === trialCount &&
        schedule.length === trialCount
      ) {
        onComplete(recordsRef.current)
        return
      }
      setTrialIndex((current) => current + 1)
    })
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || submittedRef.current) {
      return
    }

    const point = pointFromEvent(event)
    cancelActiveGesture(point)
  }

  const feedbackText =
    feedback === 'correct'
      ? 'Correct'
      : feedback === 'wrong'
      ? 'Next trial'
      : feedback === 'invalid-start'
      ? 'Start inside the centre point'
      : feedback === 'pointer-cancel'
      ? 'Gesture interrupted — try again'
      : ''

  return (
    <main className="experiment-screen">
      <header className="experiment-header">
        <div>
          <span>Participant</span>
          <strong>{participantId}</strong>
        </div>
        <div className="condition-name">
          {condition.conditionId} · {condition.touchLocation} · {condition.menuLayout}
        </div>
        <div className="progress">
          <span>Progress</span>
          <strong>
            {trialIndex + 1}/{schedule.length}
          </strong>
        </div>
      </header>

      <section className="target-cue" aria-live="polite">
        <span>Select</span>
        <strong>
          <b aria-hidden="true">{target.symbol}</b> {target.id} {target.label}
        </strong>
      </section>

      <div
        ref={arenaRef}
        className="experiment-arena"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className={`activation-point ${menuVisible ? 'is-active' : ''}`}
          style={{
            left: centre.x,
            top: centre.y,
            width: condition.startTolerance * 2,
            height: condition.startTolerance * 2,
          }}
          aria-hidden="true"
        />

        {menuVisible &&
          menuItems.map((item) => (
            <div
              key={item.id}
              className="menu-item"
              style={{
                left: item.position.x,
                top: item.position.y,
                width: condition.targetRadius * 2,
                height: condition.targetRadius * 2,
              }}
              aria-hidden="true"
            >
              <span>{item.symbol}</span>
            </div>
          ))}

        {!menuVisible && !feedback && (
          <p className="start-instruction" style={{ left: centre.x, top: centre.y + 36 }}>
            Touch and drag from here
          </p>
        )}

        {feedback && (
          <div
            className={`feedback feedback-${feedback}`}
            role="status"
            aria-live="assertive"
          >
            {feedbackText}
          </div>
        )}

        {!geometryReady && arenaSize.width > 0 && (
          <div className="device-size-warning" role="alert">
            <strong>Device width is not suitable for this condition</strong>
            <span>
              The experiment stage must be at least {MINIMUM_SAFE_STAGE_WIDTH} CSS px
              wide and tall enough to show every target with a {SAFETY_MARGIN}px
              safety margin. Current stage: {arenaSize.width.toFixed(0)} ×{' '}
              {arenaSize.height.toFixed(0)} CSS px.
            </span>
          </div>
        )}
      </div>
    </main>
  )
}

export default ExperimentScreen
