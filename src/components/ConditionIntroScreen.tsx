import { ConditionConfig } from '../types/experiment'
import {
  getActivationCenter,
  getMenuItemPositions,
} from '../utils/geometry'

interface ConditionIntroScreenProps {
  condition: ConditionConfig
  conditionOrderPosition: number
  totalConditions: number
  isPrototype: boolean
  onStartPractice: () => void
}

const PREVIEW_SIZE = { width: 300, height: 300 }

function ConditionIntroScreen({
  condition,
  conditionOrderPosition,
  totalConditions,
  isPrototype,
  onStartPractice,
}: ConditionIntroScreenProps): JSX.Element {
  const centre = getActivationCenter(condition.touchLocation, PREVIEW_SIZE)
  const items = getMenuItemPositions(
    condition.targets,
    centre,
    condition.menuRadius,
  )

  return (
    <main className="flow-screen screen">
      <section className="flow-card">
        <p className="eyebrow">
          {isPrototype
            ? `Prototype · ${condition.label}`
            : `Block ${conditionOrderPosition} of ${totalConditions}`}
        </p>
        <h1>
          {isPrototype ? condition.label : `Block ${conditionOrderPosition}`}
        </h1>
        <p className="intro">
          {isPrototype
            ? `The activation point is at the ${condition.touchLocation.toLowerCase()} position. `
            : ''}
          Use your right thumb. Review the layout below, then complete five practice
          targets before the formal trials.
        </p>

        <svg
          className="layout-preview"
          viewBox={`0 0 ${PREVIEW_SIZE.width} ${PREVIEW_SIZE.height}`}
          role="img"
          aria-label={
            isPrototype
              ? `${condition.label} layout preview`
              : `Block ${conditionOrderPosition} layout preview`
          }
        >
          <circle
            className="preview-activation"
            cx={centre.x}
            cy={centre.y}
            r={condition.startTolerance}
          />
          {items.map((item) => (
            <g
              key={item.id}
              className="preview-target"
            >
              <circle
                cx={item.position.x}
                cy={item.position.y}
                r={condition.targetRadius}
              />
              <text
                x={item.position.x}
                y={item.position.y}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {item.symbol}
              </text>
            </g>
          ))}
        </svg>

        <p className="preview-note">Static preview — no timing or gestures are recorded.</p>
        <button className="primary-button" type="button" onClick={onStartPractice}>
          Start practice
        </button>
      </section>
    </main>
  )
}

export default ConditionIntroScreen
