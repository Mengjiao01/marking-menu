# Marking Menu Experiment

The application implements
all six conditions in a within-participant 3 × 2 design:

- C1 Centre–Traditional
- C2 Left–Traditional
- C3 Right–Traditional
- C4 Left–Adaptive
- C5 Right–Adaptive
- C6 Centre–Adaptive




- `src/config/conditions.ts`：conditions and size parameters
- `src/config/sequences.ts`：conditional processing sequence
- `src/config/questionnaire.ts`：questionnaire

## project version

- Node.js：`14.16.0`
- npm：`6.14.11`
- React：`17.0.2`
- TypeScript：`4.7.4`
- Vite：`2.9.18`


## formal flow

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

## prototype mode

Development-only single-condition testing is enabled exclusively through:

```text
?mode=prototype
```


## local storage

```text
marking-menu:trial-records
marking-menu:practice-records
marking-menu:invalid-events
marking-menu:study-sessions
marking-menu:condition-ratings
```



## data integrity

A normal formal export must contain:

- Exactly 150 rows
- Exactly 25 rows for every condition
- Exactly 5 rows for every target in every condition
- `globalTrialNumber` equal to 1–150 without gaps
- Correct `conditionOrderPosition`
- No prototype or other study-session rows



## windows development

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


## deployment

The application is deployed with GitHub Pages at:

```text
https://Mengjiao01.github.io/marking-menu/
```




