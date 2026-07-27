# Marking Menu Experiment

Mobile web experiment for a master's research project. This first implementation
contains only **C1 Centre–Traditional**; the remaining five conditions are not yet
available.

## Current experiment flow

1. Enter a non-empty participant ID and review the device requirements.
2. Complete 25 randomly shuffled trials (five targets repeated five times).
3. Begin each gesture inside the centre activation point, drag to an item, and
   release. Incorrect selections and misses still advance the trial.
4. Review accuracy and average selection time, then download the formal-trial CSV.
   A separate invalid-event CSV is available when invalid starts or pointer
   cancellations occurred.

Every start creates a unique session ID. Formal trials and invalid events are
appended to browser `localStorage`, while downloads are filtered to the current
session only. The app does not collect names, email addresses, or contact details
and does not transmit data to a server.

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

Open the local URL printed by Vite (normally `http://localhost:3000/`).

Quality checks and production build:

```powershell
npm run lint
npm run build
npm run preview
```

## Current scope

- React 17, TypeScript, Vite 2, and native CSS
- C1 parameters live in `src/config/conditions.ts`
- Shared experiment types live in `src/types/experiment.ts`
- CSV export is performed locally in the browser
- No questionnaire, server, database, authentication, or device-model detection

Future work can add C2–C6 through the condition configuration, scheduling, and
condition-selection flow without changing the C1 trial record schema.
