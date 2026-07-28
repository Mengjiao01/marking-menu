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
→ Condition introduction and static layout preview
→ Five practice targets
→ Practice complete
→ 25 formal trials
→ Break
→ Next condition
→ Experiment complete
```

Each participant completes six conditions, 30 practice targets, and 150 formal
trials. Practice errors repeat the same target until it is selected correctly.
Formal correct selections, wrong items, and misses all advance exactly once.

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

Prototype mode displays the condition selector, accepts a non-empty test ID, runs
one condition, and stores `isPrototype=true`. The normal page has no control that
can enable prototype mode.

## Resume behavior

Study session state is saved after every phase transition and record. When the
same participant ID has an unfinished session, setup offers:

- Resume session
- Start new session

Schedules and block IDs are fixed when a study starts. Resume derives the next
practice target or formal trial from records already persisted for the current
`studySessionId` and `blockSessionId`; it does not restore an in-progress pointer
gesture. A crash after a record write therefore cannot cause that completed trial
to be submitted again. Starting new creates another study session and preserves
the old history.

## Local storage

The browser stores append-only histories and resumable session snapshots under:

```text
marking-menu:trial-records
marking-menu:practice-records
marking-menu:invalid-events
marking-menu:study-sessions
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
activation geometry, and device context. Practice attempts use a separate schema
with `practiceTargetNumber` and `attemptNumber`. Invalid events include their
Practice/Formal phase.

## Geometry

All conditions share:

- Menu radius: 72 CSS px
- Target radius: 24 CSS px
- Start tolerance: 20 CSS px
- Safety margin: 4 CSS px
- Safe edge inset: `72 + 24 + 4 = 100` CSS px

Activation centres depend only on touch location:

- Centre: `(stageWidth × 0.5, stageHeight × 0.6)`
- Left: `(100, stageHeight × 0.6)`
- Right: `(stageWidth - 100, stageHeight × 0.6)`

Every resize checks all targets in all six conditions. An unsuitable stage blocks
interaction rather than changing a target, radius, or angle.

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

The application does not include a server, questionnaire, user login, statistical
analysis, condition randomization beyond the defined sequences, or device-model
detection.
