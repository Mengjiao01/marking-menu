import { useRef, useState } from 'react'
import {
  ConditionConfig,
  ConditionRatingRecord,
  LikertRating,
  StudySessionState,
} from '../types/experiment'
import { getActivationCenter, getMenuItemPositions } from '../utils/geometry'

interface ConditionRatingScreenProps {
  session: StudySessionState
  condition: ConditionConfig
  conditionOrderPosition: number
  onSubmit: (record: ConditionRatingRecord) => boolean
}

type RatingField =
  | 'easeOfUse'
  | 'comfort'
  | 'targetVisibility'
  | 'practicality'
  | 'intentionToUse'

const QUESTIONS: readonly { field: RatingField; text: string }[] = [
  { field: 'easeOfUse', text: 'This menu was easy to use.' },
  { field: 'comfort', text: 'This menu was comfortable to operate with my right thumb.' },
  { field: 'targetVisibility', text: 'The target menu item was easy to see and locate.' },
  { field: 'practicality', text: 'This menu layout would be practical in a real mobile application.' },
  { field: 'intentionToUse', text: 'I would be willing to use this type of menu in a real mobile application.' },
]
const RATINGS: readonly LikertRating[] = [1, 2, 3, 4, 5, 6, 7]
const SCALE_LABELS = [
  'Strongly Disagree',
  'Disagree',
  'Mostly Disagree',
  'Neutral',
  'Mostly Agree',
  'Agree',
  'Strongly Agree',
] as const
const PREVIEW_SIZE = { width: 300, height: 260 }

function ConditionRatingScreen({
  session,
  condition,
  conditionOrderPosition,
  onSubmit,
}: ConditionRatingScreenProps): JSX.Element {
  const [responses, setResponses] = useState<Partial<Record<RatingField, LikertRating>>>({})
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const complete = QUESTIONS.every(({ field }) => RATINGS.includes(responses[field] as LikertRating))
  const centre = getActivationCenter(condition.touchLocation, PREVIEW_SIZE)
  const items = getMenuItemPositions(condition.targets, centre, condition.menuRadius)

  const submit = (): void => {
    if (!complete || submitting.current) return
    const values = responses as Record<RatingField, LikertRating>
    if (Object.values(values).some((value) => !Number.isInteger(value) || value < 1 || value > 7)) return
    submitting.current = true
    const saved = onSubmit({
      participantId: session.participantId,
      studySessionId: session.studySessionId,
      conditionId: condition.conditionId,
      conditionOrderPosition,
      sequenceCode: session.sequenceCode,
      easeOfUse: values.easeOfUse,
      comfort: values.comfort,
      targetVisibility: values.targetVisibility,
      practicality: values.practicality,
      intentionToUse: values.intentionToUse,
      configVersion: session.configVersion,
      isPrototype: session.isPrototype,
    })
    if (!saved) {
      submitting.current = false
      setError('The rating could not be saved. Please try again.')
    }
  }

  return (
    <main className="rating-screen screen">
      <section className="rating-card">
        <p className="eyebrow">
          {session.isPrototype ? 'Prototype mode' : `Block ${conditionOrderPosition} of ${session.conditionOrder.length}`}
        </p>
        <h1>Rate the menu you just used</h1>
        <p className="intro">Please select one response for each statement.</p>
        {session.isPrototype && <p className="prototype-banner" role="status">Prototype mode is active.</p>}

        <svg className="rating-preview" viewBox="0 0 300 260" role="img" aria-label="Static preview of the menu just used">
          <circle className="preview-activation" cx={centre.x} cy={centre.y} r={condition.startTolerance} />
          {items.map((item) => (
            <g key={item.id} className="preview-target">
              <circle cx={item.position.x} cy={item.position.y} r={condition.targetRadius} />
              <text x={item.position.x} y={item.position.y} textAnchor="middle" dominantBaseline="central">{item.symbol}</text>
            </g>
          ))}
        </svg>

        <div className="scale-key" aria-label="Rating scale">
          {SCALE_LABELS.map((label, index) => (
            <span key={label}><strong>{index + 1}</strong> {label}</span>
          ))}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); submit() }}>
          {QUESTIONS.map(({ field, text }, index) => (
            <fieldset className="rating-item" key={field}>
              <legend className="rating-question">{index + 1}. {text}</legend>
              <div className="rating-options-panel">
                {RATINGS.map((rating) => (
                  <label key={rating} className={responses[field] === rating ? 'selected' : ''}>
                    <input
                      type="radio"
                      name={field}
                      value={rating}
                      checked={responses[field] === rating}
                      onChange={() => setResponses((current) => ({ ...current, [field]: rating }))}
                    />
                    <span>{rating}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={!complete}>Submit Rating</button>
        </form>
      </section>
    </main>
  )
}

export default ConditionRatingScreen
