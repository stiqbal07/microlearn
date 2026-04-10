---
name: MicroLearn PWA Project
description: Core context for the MicroLearn PWA — a study flashcard app built for the user's freshman son
type: project
---

The user is building a PWA study app called MicroLearn for their freshman son who takes:
- Algebra 2 Honors
- Biology Honors
- English 9 Honors
- AP Computer Science Principles (AP CSP)
- Spanish 2

**Why:** Fun, gamified daily practice app (XP, streaks, leaderboard, timed sessions). Hosted on GitHub Pages.

**How to apply:** When working on this project, frame suggestions around a high-school freshman's curriculum. Questions should be curriculum-aligned, not generic.

## Project Location
`C:\Users\shamsi\Coding Projects\MicroLearnPWA\`

## File Structure
- `index.html` — entry point; script load order: data.js → auth.js → units.js → progress.js → app.js
- `style.css` — all styles
- `sw.js` — service worker (currently cache: 'microlearn-v3')
- `manifest.json` — PWA manifest
- `js/data.js` — QUESTION_BANK + SUBJECTS + RESOURCES constants
- `js/auth.js` — multi-user auth (USERS object, Auth object, login screen)
- `js/units.js` — SUBJECT_UNITS mapping + getUnitQuestions() helpers
- `js/progress.js` — getDaySeed(), mulberry32 RNG, seededShuffle(), weekly graph/report
- `js/app.js` — all app logic, state (S), rendering, session management

## Login Credentials
- **Username:** `falcon` | **Password:** `FlyEagle1`
- 7 fake leaderboard friends are also hardcoded in auth.js with fakeXP
- No self-signup — accounts are hardcoded in auth.js USERS object

## Question Bank Summary (as of last session)
- Algebra 2: a1–a130 (130 questions, SAT-style, 10 topics)
- Biology: b1–b108 (includes Unit 3 Homeostasis b31–b65, Unit 4 b70–b108)
- English: e1–e63 (includes Script Writing, Literary Signposts, Shakespeare & Poetry)
- AP CSP: c1–c54 (includes Abstraction, Data & Analysis, Binary & Data expansions)
- Spanish 2: s1–s73 (includes Daily Routines, Preterite, Imperfect & Subjunctive expansions)

## Key Architecture Decisions
- `opts[0]` is ALWAYS the correct answer; app shuffles before display
- Units are topic-based — questions auto-assign to units by matching topic string
- Per-user data in localStorage keyed as `mldata_${username}` via Auth.dataKey()
- Daily seeded question shuffle using mulberry32 RNG + getDaySeed() (YYYYMMDD int)
- Session recycling: when queue exhausted, reshuffles and continues (shows "🔄 Round N" toast)
- Auto-pad: if unit has <12 questions, fills queue up to 20 with other questions from same subject

## Pending Tasks
- **bio_unit4_questions.js**: A separate file exists at `C:\Users\shamsi\Coding Projects\MicroLearnPWA\js\bio_unit4_questions.js` containing Biology Unit 4 (Cell Division & Cancer) questions numbered b70–b108. These have NOT yet been merged into data.js. They need to be pasted into the biology array in data.js.
- Biology Cell Structure (bio_u1) only has ~5 questions — could use more (slots b66–b69 available before Unit 4 starts at b70)
