# Marking Menu Experiment

Mobile web experiment for a master's research project. The application implements
all six conditions in a within-participant 3 × 2 design:

- C1 Centre–Traditional
- C2 Left–Traditional
- C3 Right–Traditional
- C4 Left–Adaptive
- C5 Right–Adaptive
- C6 Centre–Adaptive

## Formal flow

The normal URL runs the complete study:

```text
Setup
→ Study instructions
→ Condition introduction and static layout preview
→ Five practice targets
→ Practice complete
→ 25 formal trials
→ Condition rating
→ Break
→ Next condition
→ Experiment complete
```

Each participant completes six conditions, 30 practice targets, and 150 formal
trials. Practice errors repeat the same target until it is selected correctly.
Formal correct selections, wrong items, and misses all advance exactly once.
After each block's 25 formal trials have been saved, participants answer five
required questions on a 7-point Likert scale: 1 Strongly Disagree, 2 Disagree,
3 Mostly Disagree, 4 Neutral, 5 Mostly Agree, 6 Agree, and 7 Strongly Agree.
The dimensions are ease of use, right-thumb comfort, target visibility,
practicality, and intention to use.

Participant IDs must match `P` followed by at least three digits, such as `P001`.
Input is case-insensitive and stored in uppercase. The numeric part assigns one of
six balanced condition sequences:

```text
A: C1 C2 C6 C3 C5 C4
B: C2 C3 C1 C4 C6 C5
C: C3 C4 C2 C5 C1 C6
D: C4 C5 C3 C6 C2 C1
E: C5 C6 C4 C1 C3 C2
F: C6 C1 C5 C2 C4 C3
```

The assignment is `(participantNumber - 1) % 6`, so P001–P006 receive A–F
respectively and P007 returns to A.

## Prototype mode

Development-only single-condition testing is enabled exclusively through:

```text
?mode=prototype
```

Prototype mode displays the condition selector, accepts a non-empty test ID, then
shows Study Instructions once before the selected condition introduction. It runs
one condition followed by its Condition Rating and stores `isPrototype=true`. The instructions screen retains a
clear Prototype label. The normal page has no control that can enable prototype
mode.

## Resume behavior

Study session state is saved after every phase transition and record. When the
same participant ID has an unfinished session, setup offers:

- Resume session
- Start new session

`instructions` is a persisted study-session phase. Every newly created formal or
prototype session starts there. Selecting **Start Experiment** saves the phase as
`condition-intro` before showing the first condition. Resuming a session still in
`instructions` returns to that page; sessions already at condition introduction,
Practice, Formal, Break, or another later phase resume there without showing the
instructions again. Starting new creates a new session and shows the instructions
again.

Schedules and block IDs are fixed when a study starts. Resume derives the next
practice target or formal trial from records already persisted for the current
`studySessionId` and `blockSessionId`; it does not restore an in-progress pointer
gesture. A crash after a record write therefore cannot cause that completed trial
to be submitted again. After a block, Resume reconciles the saved phase against
the actual formal records and ratings: fewer than 25 formal rows returns to Formal;
25 rows without a rating opens Condition Rating; and 25 rows with a rating advances
to Break or Complete. Rating writes use `studySessionId + conditionId` as a unique
key, so double clicks, rerenders, and refreshes cannot append another response.
Starting new preserves the old history. Unfinished sessions from another
`configVersion` remain stored but are not offered for Resume into the current
protocol.

## Local storage

The browser stores append-only histories and resumable session snapshots under:

```text
marking-menu:trial-records
marking-menu:practice-records
marking-menu:invalid-events
marking-menu:study-sessions
marking-menu:condition-ratings
```

Legacy or malformed entries are excluded from current exports. Formal export is
filtered by the active study session and `isPrototype`, then validated before the
download button is enabled.

## Data integrity

A normal formal export must contain:

- Exactly 150 rows
- Exactly 25 rows for every condition
- Exactly 5 rows for every target in every condition
- `globalTrialNumber` equal to 1–150 without gaps
- Correct `conditionOrderPosition`
- No prototype or other study-session rows

Formal records include `studySessionId`, `blockSessionId`, `sequenceCode`,
condition and trial numbering, outcome/timing/trajectory fields, actual stage and
activation geometry, the active experiment parameters (`menuRadius`,
`targetRadius`, `startTolerance`, `configVersion`), and device context. Practice
attempts use a separate schema with `practiceTargetNumber` and `attemptNumber`.
Invalid events include their Practice/Formal phase and the same parameter
snapshot.

## Subjective rating export

The completion page exports the current session's ratings as
`participantId-studySessionId-subjective-ratings.csv`, using UTF-8 BOM, existing
CSV escaping, and filename sanitization. Columns are:

```text
participantId,studySessionId,conditionId,conditionOrderPosition,sequenceCode,easeOfUse,comfort,targetVisibility,practicality,intentionToUse,configVersion,isPrototype
```

Formal export requires exactly one valid rating for each assigned condition;
prototype export requires its one selected condition. Invalid or incomplete rating
data is reported and the subjective download is disabled.

## Completion downloads and questionnaire

The formal completion page provides four independent CSV downloads: Formal
Trials, Subjective Ratings, Practice Attempts, and Invalid Events. Participants
download each file themselves. The page does not track download clicks or verify
that the browser successfully saved a file.

After confirming that all four files are in their Downloads folder, participants
can open the external questionnaire in a new tab. The questionnaire URL has one
configuration location: `src/config/questionnaire.ts`. Files are submitted using
the private method agreed in advance between the researcher and participant; the
web page does not upload them.

Prototype mode retains all four downloads for testing but does not show or open
the formal questionnaire. There is currently no database, automatic upload, file
upload, or ZIP feature.

## Geometry

All conditions share:

- Menu radius: 72 CSS px
- Target radius: 24 CSS px
- Start tolerance radius: 24 CSS px
- Activation diameter: 48 CSS px
- Safety margin: 4 CSS px
- Safe edge inset: `72 + 24 + 4 = 100` CSS px

Activation centres depend only on touch location:

- Centre: `(stageWidth × 0.5, stageHeight × 0.6)`
- Left: `(100, stageHeight × 0.6)`
- Right: `(stageWidth - 100, stageHeight × 0.6)`

Every resize checks all targets in all six conditions. An unsuitable stage blocks
interaction rather than changing a target, radius, or angle.

The current parameter snapshot is identified by:

```text
configVersion = formal-v1-likert7
```

This version uses a required 7-point Likert scale condition rating after each formal
block. The start tolerance remains 24 CSS px; it was increased from 20 CSS px after iPhone pilot data
showed that most invalid starts were near the previous activation boundary. The
menu radius, target radius, safety margin, safe edge inset, target angles, and
touch locations were not changed. `SAFE_EDGE_INSET` remains
`72 + 24 + 4 = 100` CSS px and does not depend on start tolerance.

## Windows development

Requirements:

- Windows 10 and PowerShell
- Node.js 14.16.0
- npm 6.14.11

Commands:

```powershell
npm install --no-audit --no-fund
npm run lint
npm run build
npm run dev -- --host 0.0.0.0
```

Use iPhone Safari in portrait orientation for data collection. A desktop mouse can
be used for development testing.

## Deployment

The application is deployed with GitHub Pages at:

```text
https://Mengjiao01.github.io/marking-menu/
```

Every push to the default `main` branch triggers the GitHub Actions deployment
workflow. GitHub Actions uses Node.js 20 to install the locked dependencies, build
the application, and publish the generated `dist` directory. Local development
continues to use Node.js 14.16.0; the cloud build does not change the local Node.js
requirement.

Production study data remains only in each participant's browser `localStorage`.
Resume requires the same device, the same browser, and the same production URL.
Clearing the browser's site data deletes the locally stored recovery data. The
deployment does not upload CSV files or participant data to GitHub; participants
must still download and submit CSV files using the agreed private method.

The application does not include a server, database, network upload, user login,
statistical analysis, condition randomization
beyond the defined sequences, or device-model detection.
