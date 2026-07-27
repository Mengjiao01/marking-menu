# Marking Menu Experiment

Mobile web experiment for a master's research project. The current prototype
implements the complete 3 × 2 condition set:

- C1 Centre–Traditional
- C2 Left–Traditional
- C3 Right–Traditional
- C4 Left–Adaptive
- C5 Right–Adaptive
- C6 Centre–Adaptive

## Current experiment flow

1. Enter a non-empty participant ID and select a prototype condition. C1 is the
   default. This selector is a development/testing entry; formal condition order
   will be assigned automatically in a later phase.
2. Complete 25 randomly shuffled trials (five targets repeated five times).
3. Begin each gesture inside the configured activation point, drag to an item, and
   release. Incorrect selections and misses still advance the trial.
4. Review accuracy and average selection time, then download the formal-trial CSV.
   A separate invalid-event CSV is available when invalid starts or pointer
   cancellations occurred.

Every start creates a condition-prefixed unique session ID. Formal trials and
invalid events are appended to the unified browser `localStorage` keys
`marking-menu:trial-records` and `marking-menu:invalid-events`. Downloads are
filtered to the current session and condition only. Legacy C1-specific storage
keys are left untouched and are not mixed into new sessions.

The app does not collect names, email addresses, or contact details and does not
transmit data to a server.

## Geometry

Shared geometry has one configuration source:

- Menu radius: 72 CSS px
- Target radius: 24 CSS px
- Start tolerance: 20 CSS px
- Safety margin: 4 CSS px
- Safe edge inset: `72 + 24 + 4 = 100` CSS px

Activation centres depend only on touch location:

- Centre: `(stageWidth × 0.5, stageHeight × 0.6)`
- Left: `(100, stageHeight × 0.6)`
- Right: `(stageWidth - 100, stageHeight × 0.6)`

The minimum stage width for all five targets and the 4px margin is 200 CSS px.
After every stage resize, the app checks every target without moving it. If the
stage is too small, formal interaction is blocked and a device-size message is
shown.

Menu angles are configured separately from touch location:

- Traditional: T1 36°, T2 108°, T3 180°, T4 252°, T5 324°
- Left–Adaptive: T1 270°, T2 315°, T3 0°, T4 45°, T5 90°
- Right–Adaptive: T1 90°, T2 135°, T3 180°, T4 225°, T5 270°
- Centre–Adaptive intentionally uses the same angles as Traditional while
  remaining a distinct Adaptive condition.

## CSV data dictionary

Formal trial CSV fields:

- Session and condition: `sessionId`, `participantId`, `conditionId`,
  `touchLocation`, `menuLayout`
- Trial result: `trialNumber`, `targetId`, `selectedId`, `valid`, `correct`,
  `errorType`
- Timing: `cueTime`, `touchDownTime`, `touchUpTime`, `selectionTime`
- Gesture: `touchDownX`, `touchDownY`, `touchUpX`, `touchUpY`, `pathLength`
- Actual geometry: `stageWidth`, `stageHeight`, `activationCenterX`,
  `activationCenterY`, `nearestEdgeDistance`
- Device context: `viewportWidth`, `viewportHeight`, `devicePixelRatio`,
  `userAgent`

Invalid-event CSV fields include `sessionId`, participant and condition IDs,
trial/target/event details, pointer coordinates, `stageWidth`, `stageHeight`,
`activationCenterX`, `activationCenterY`, and the same device context fields.
Legacy records can remain in localStorage without the new geometry fields; they
are never mixed into a new session export.

## Requirements

- Windows 10
- PowerShell
- Node.js 14.16.0
- npm 6.14.11
- For data collection: iPhone Safari in portrait orientation

A desktop mouse can be used for development testing.

## Windows setup and commands

From this project directory in PowerShell:

```powershell
npm install --no-audit --no-fund
npm run dev
```

For testing from another device on the same network:

```powershell
npm run dev -- --host 0.0.0.0
```

Quality checks and production build:

```powershell
npm run lint
npm run build
npm run preview
```

## Current scope

- React 17, TypeScript, Vite 2, and native CSS
- All six condition parameters have one source in `src/config/conditions.ts`
- Shared experiment types live in `src/types/experiment.ts`
- CSV export is performed locally in the browser
- No automatic condition order, practice trials, questionnaire, server,
  database, authentication, analysis, or device-model detection

The development build logs a console warning if any configured target falls
outside the current experiment stage. It never moves targets or changes geometry.
