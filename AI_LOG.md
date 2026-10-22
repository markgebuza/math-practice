# AI Conversation Log

### [2026-10-21 14:18] Setup + Step 0: Understand and decide
**My prompt:** make a project folder with the first claude md in it, then read and execute the prompts
**What you did:**
- Created `C:\Users\mgebu\Downloads\math-practice\` and copied `CLAUDE.md` (the one at the top level of Downloads, not `chess_engine/CLAUDE.md`), `math-practice-specification.md` and `math-practice-todo-list.md` into it, per the PROMPTS.md Setup section.
- Checked Node: `node -v` → v24.14.1 (meets the "Node 20 or newer" requirement).
- Read the spec and the TODO list (22 phases, tasks 1–89).
- Ran only Step 0 of PROMPTS.md. Stopped there because CLAUDE.md says "Do ONE phase per request", and PROMPTS.md says you should review DECISIONS.md before any code is written.
- Created `DECISIONS.md` covering every ambiguity Step 0 lists, plus defaults, self-report vs. selected answer, review-session setup, and continuous sessions with 0 answers. All entries are marked PROPOSED.
- Created this `AI_LOG.md`.
**Verification:** No code yet, so no lint/test/build. Manual: read `DECISIONS.md` and edit anything you disagree with (especially 1.3–1.6 ranges, 2.2 reset-on-wrong, 3.1 what Reset Statistics keeps, 4.2 sound default).
**Problems / open issues:**
- No git repository yet. Per PROMPTS.md it's initialized after Phase 1.
- `math_practice_assignment.md` (in Downloads) was not copied, since PROMPTS.md doesn't list it. Copy it in if you want it as a reference.

### [2026-10-21 14:24] Phase 1: Project Setup
**My prompt:** Accept the decisions and implement Phase 1
**What you did:**
- Marked all 21 entries in `DECISIONS.md` as ACCEPTED.
- Scaffolded Vite 8 + React 19 + TypeScript 6 in a scratch folder (`npm create vite@latest -- --template react-ts`) and copied only the config files into the repo root (no `math-practice-app` subfolder, no demo assets). None of your reference files (spec, TODO, CLAUDE.md, DECISIONS.md, AI_LOG.md) were deleted or replaced.
- The current Vite template ships oxlint instead of ESLint, so I removed oxlint and set up ESLint 10 (typescript-eslint, react-hooks, react-refresh, eslint-config-prettier), Prettier 3, Vitest 5 (jsdom) and React Testing Library. All versions are pinned exactly in `package.json`. Scripts: `dev`, `build`, `lint`, `format`, `format:check`, `test`, `preview`.
- Defined the shared types from spec 8–11 in `src/types/`: `question.ts`, `session.ts`, `mistake.ts`, `statistics.ts`, `settings.ts` (AppSettings + DEFAULT_SETTINGS from DECISIONS 4.2), `state.ts` (AppState), `index.ts`.
- Created the spec section 18 folder structure under `src/` (empty folders hold a `.gitkeep`). Added a minimal `src/app/App.tsx`, `src/test/setup.ts` and one component test, `src/app/App.test.tsx`.
- Checked off the 20 Phase 1 TODO items (tasks 1–3).
**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings (also confirmed the react-hooks rules are active for .tsx files).
- `npm test -- --run`: 1 file, 1/1 tests passed.
- `npm run build`: pass (`tsc -b` with no type errors; JS bundle 219.64 kB, 68.64 kB gzip).
- `npm run format:check`: all files formatted.
- Dev server: started Vite and fetched `/`, which returned `<title>Math Practice</title>`. Server stopped afterwards.
- Manual: run `npm run dev`, open http://localhost:5173 and check that you see "Math Practice" and the welcome line.
**Problems / open issues:**
- `package.json` sets `"engines": { "node": ">=20.19" }` because Vite 8 needs Node 20.19+. Your Node v24.14.1 is fine.
- Prettier is set to ignore `*.md` so it never rewrites the spec, TODO, DECISIONS or this log.
- Git is not initialized yet (that's the next prompt in PROMPTS.md).

### [2026-10-21 14:37] Phase 1: Git setup
**My prompt:** run the prompt to set up the repository
**What you did:**
- Ran the PROMPTS.md Git prompt: "Initialize a Git repository with a .gitignore for node_modules, dist, .env*, coverage, and OS/editor files. Don't commit yet. Show me `git status`..."
- Rewrote `.gitignore` to cover node_modules, dist/dist-ssr, coverage, `.env` / `.env.*` / `*.local`, logs, OS files (.DS_Store, Thumbs.db, desktop.ini), and editor files (.vscode except extensions.json, .idea, swap files).
- `git init -b main` in `math-practice/`. Nothing staged or committed.
**Verification:**
- `git status`: branch main, no commits, 18 top-level untracked entries (config files, `public/`, `src/`, and the .md documents). 37 files total would be tracked.
- `git check-ignore -v` confirmed node_modules, dist, .env, .env.local, coverage and Thumbs.db are ignored.
- Manual: look over the `git status` list before committing. No secrets or `.env` files are in it.
**Problems / open issues:**
- Your home folder (`C:\Users\mgebu`) is also a git repository. This new repo is nested inside it. Git treats them separately, but the home repo will show `Downloads/` as untracked.

### [2026-10-21 14:41] Phase 1 commit + Phase 2: Basic Interface
**My prompt:** commit phase 1 and move to phase 2
**What you did:**
- Committed Phase 1 as `378160c` "Set up Vite React + TypeScript project (Phase 1)" (everything, including the TODO and AI_LOG.md).
- Git warned about LF→CRLF conversion (your global `core.autocrlf=true`), which would break Prettier's line-ending check on checkout. Added `.gitattributes` with `* text=auto eol=lf`.
- Installed `react-router` 8.5.0 and `@fontsource-variable/nunito` 5.3.0 (OFL-1.1 license; the font is bundled with the app, so there are no requests to Google Fonts). React Router 8 needs Node ≥22.22, so I raised `engines` in `package.json` to match.
- Visual design (`src/index.css`): cream background, navy text, blue/yellow/green/purple accents, Nunito font, rounded shapes, fluid text size, visible 4px focus outlines, reduced-motion support. Built reusable `Button`/`ButtonLink` (min 48px tall, 64px for large; hover lifts, pressed pushes down, disabled is dimmed), `PageContainer` (main landmark, h1, browser tab title), `Header` with a skip link, `Navigation` (active page is underlined and has `aria-current`, not shown by color alone), `AppLayout` and `EmptyState`.
- Routes in `src/app/AppRoutes.tsx` using a data router (`createBrowserRouter`) from the start, so Phase 18's navigation blocking won't need a router switch. Home page with welcome text and three large buttons; friendly placeholder pages for the other five routes; friendly not-found page with Go Home.
- Tests: `src/app/AppRoutes.test.tsx` (each route renders, not-found, home buttons navigate, active nav link, tab title), `src/components/common/Button.test.tsx` (click, Enter/Space, disabled, classes, link). Updated `src/app/App.test.tsx`.
**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 3 files, 18/18 tests passed.
- `npm run build`: pass (JS 317.47 kB, 99.87 kB gzip; CSS 6.67 kB; Nunito font files bundled locally).
- WCAG contrast computed with a script: body text 14.0:1, muted text 7.3:1, white on blue 6.4:1, navy on yellow 9.7:1, white on green 5.3:1 (all ≥ 4.5 AA). Focus outline 6.7:1 on the page and 4.2:1 on the blue header (non-text needs ≥ 3:1).
- Dev server returned HTTP 200 for all six routes and an unknown URL when typed directly.
- 13 of 14 Phase 2 TODO items checked off.
- Manual checklist for you (`npm run dev`, http://localhost:5173):
  1. Type each URL into the address bar and press Enter: `/`, `/practice/setup`, `/practice/session`, `/practice/summary`, `/statistics`, `/settings`. Each shows its own heading with the blue header on top.
  2. Type `/abc` and check you get "Oops! Page Not Found", then that Go Home works.
  3. On Home, click Start Practice, View Statistics and Settings. Each goes to the right page; the browser Back button returns home.
  4. Press Tab from the top of the page. The first Tab shows "Skip to main content". Every link and button gets a clearly visible outline (yellow in the header, purple on the page). Enter activates them.
  5. Hover a big button (it lifts) and hold the mouse down (it presses down).
  6. Check the current page is underlined in the header nav.
  7. In DevTools device mode, try 375px, 768px and 1280px widths: no sideways scrolling, nav wraps neatly, buttons stay big.
**Problems / open issues:**
- "Add responsive spacing and child-friendly typography" (task 4) is left unchecked. The CSS exists, but I can't see the layout, so you need to check it at the three widths (step 7).
- The font package includes Cyrillic/Vietnamese/Latin-ext files in `dist`. Browsers only download the Latin file the page uses, so it's harmless; could be trimmed in Phase 21.
- React Router 8 requires Node ≥22.22. Netlify must use Node 22.22+ when we deploy (Phase 22).

### [2026-10-21 14:49] Phase 2 tests + commit, Phase 3: Practice Configuration
**My prompt:** run appropriate tests, then commit, then start phase 3
**What you did:**
- Re-ran lint, tests, build and format check for Phase 2 (all passed). Ran the production build with `vite preview` and took headless Chrome screenshots at 375/768/1280px. Plain headless screenshots at 375px looked cut off, but that was Chrome's ~500px minimum window width, not the app. Rendering the page inside 375px and 320px iframes showed no horizontal overflow. Checked off the last Phase 2 item (responsive spacing/typography).
- Committed Phase 2 as `693d154` "Add child-friendly layout, home page, and routing (Phase 2)".
- Phase 3: setup choices live in React Context. `src/app/practiceConfig.ts` holds the reducer, `isConfigReady`, `usePracticeConfig` and defaults from DECISIONS 4.2. `src/app/AppProvider.tsx` wraps the router in `App.tsx`. The state is plain serializable data, so Phase 18 can persist and restore it.
- Built `src/components/setup/ChoiceTile.tsx` (a real checkbox/radio inside a big tile; selected tiles show a ✓ mark and thick border, not color alone; keyboard focus outline) plus `OperationSelector`, `DifficultySelector` and `SessionLengthSelector`. "Mixed operations" is the select-all toggle (DECISIONS 4.1). Level descriptions follow DECISIONS section 1. Labels live in `src/utils/labels.ts`.
- `src/pages/PracticeSetupPage.tsx`: form with the three selectors. Start Session is disabled until at least one operation and a level are chosen; a `role="status"` message explains what's missing and is linked to the button with `aria-describedby`. Start goes to `/practice/session`, which for now lists the chosen configuration to prove it was passed.
- Tests: `src/app/practiceConfig.test.ts` (7 reducer/readiness tests) and `src/pages/PracticeSetupPage.test.tsx` (10 component tests: defaults, multi-select, select-all on/off, Mixed un-checks when one is removed, disabled state + message, disabled until both choices, single difficulty, Space key, config reaches session page, choices kept after navigating away).
**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings. `npm run format:check`: clean.
- `npm test -- --run`: 5 files, 35/35 passed. The first run had 6 failures, all caused by my test queries: I looked for "+ Addition", but the symbols are hidden from screen readers (`aria-hidden`), so the accessible name is "Addition". I fixed the tests, not the component.
- `npm run build`: pass (JS 322.77 kB, 101.39 kB gzip).
- Screenshots of the setup page at 375, 768 and 1024px: no overflow. I changed the tile grid from ~3 columns to 2 on wide screens so levels and lengths form even 2×2 grids.
- All 19 Phase 3 TODO items checked off.
- Manual checklist (`npm run dev`, go to Start Practice):
  1. Addition, Level 1 and 10 questions are preselected (defaults from DECISIONS 4.2).
  2. Click Subtraction and Division: several can be selected; each shows a ✓.
  3. Click Mixed operations: all four turn on. Click it again: all turn off, Start Session greys out and the message "Pick at least one kind of math, then you can start!" appears.
  4. Pick one operation again: the button turns green and the message disappears.
  5. Only one level and one length can be selected at a time.
  6. Keyboard only: Tab to a tile (purple outline around the whole tile), Space toggles it, arrow keys move between levels.
  7. Choose something, click Start Session: the Practice page lists exactly what you picked. Go Home, then back to Practice: your choices are still there.
**Problems / open issues:**
- Prefilling the defaults means Start Session is enabled on first load, and difficulty (a radio group) can't be unselected once chosen. The "disabled until a level is chosen" path is tested with an empty starting configuration. Phase 11 will switch the prefill from the constant defaults to saved settings.
- The choices survive navigation but not a page refresh yet. That's Phase 18, as planned.
- The regular / mistake-review mode choice from spec 6.2 is TODO task 58, so it's left for Phase 14.
- Phase 3 is not committed yet (waiting for your manual test).

### [2026-10-21 14:55] Phase 4: Basic Math Question Generation
**My prompt:**
Implement Phase 4 (tasks 11–16) using the ranges in spec section 7 and DECISIONS.md.
Put all difficulty ranges in ONE config file so they're easy to review.

Add a validateQuestion function implementing the "before displaying a question" rules
in spec section 17. Then write property-style tests that generate 1,000 questions for every
operation at every difficulty level and assert:
- operands and results stay within that level's ranges,
- subtraction never goes negative (unless DECISIONS.md enables it),
- division never divides by zero and always gives a whole-number answer,
- every question passes validateQuestion.
Report the test results and any rule that was hard to satisfy.

**What you did:**
- Run by a Claude Code subagent using the Phase 4 prompt from PROMPTS.md (not manually tested by me before commit).
- Tasks 11–16 all started from scratch (only empty `.gitkeep` folders existed). Utilities: `src/utils/math.ts` (`randomInt`, `randomItem`), `src/utils/shuffle.ts` (Fisher–Yates, returns a copy), `src/utils/ids.ts` (`crypto.randomUUID()` with a timestamp+random fallback, DECISIONS 7).
- All ranges live in ONE file, `src/services/difficultyRanges.ts` (`DIFFICULTY_RANGES`), copied from DECISIONS 1.1–1.7: addition/subtraction operand ranges and result caps, multiplication "shapes" (e.g. Level 3 = 2–9 × 2–9 or 2–9 × 10–20, random order) plus a 10% zero-factor chance at Levels 1–2, division divisor/quotient ranges and max dividend.
- `src/services/questionGenerator.ts`: one operand generator per operation; `generateQuestion(operation, difficulty)` builds the question (id, display text like `7 × 8` with the U+2212 minus, answer, choices, `source: 'regular'`), validates it, retries up to 20 times, then throws `QuestionGenerationError`. `generateQuestionFromOperations(operations, difficulty)` picks one selected operation at random. Division is built as `dividend = divisor × quotient`; subtraction picks the second operand from 0 to the first.
- `src/utils/validation.ts`: `validateQuestion(question)` returns the list of broken spec-17 rules (empty = valid): supported operation/level, whole operands, no division by zero, whole division answer, correct answer is a non-negative whole number equal to the real result, exactly four unique choices, exactly one correct choice, fits the level's ranges.
- Tests: `math.test.ts`, `shuffle.test.ts`, `ids.test.ts`, `validation.test.ts` (11 cases, one per rule), `questionGenerator.test.ts` (1,000 questions per operation per level checked against ranges written out separately from DECISIONS so a typo in the config file would fail; 1,000 more per operation/level through `validateQuestion`; zero-factor share; Level 3 one-digit/two-digit mix; unique ids; operation picking), `questionGenerator.retry.test.ts` (mocks the validator to prove the retry limit and the error).
- Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npx prettier --check .`. Removed the now-unneeded `.gitkeep` in `src/services` and `src/utils`.

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings. `npx prettier --check .`: clean.
- `npm test -- --run`: 11 files, 97/97 passed (35 before, 62 new) on the first run. That includes 32,000 generated questions (16 range checks + 16 validation checks × 1,000).
- `npm run build`: pass (JS 322.77 kB, 101.39 kB gzip, unchanged because no page uses the generator yet).
- All 30 Phase 4 TODO items checked off (each is covered by a unit test).
- Manual checklist for you: there is nothing new on screen in this phase. You can review the numbers in `src/services/difficultyRanges.ts` against DECISIONS.md section 1, and run `npm test -- --run src/services` to see the generator tests on their own.

**Problems / open issues:**
- Rules that were hard to satisfy: (1) "Exactly four unique choices" can't pass without distractors, which are Phase 5. I added a temporary `buildChoices` (correct answer plus 3 shuffled nearby numbers within ±3, never negative) so every question is complete and valid; Phase 5 must replace it. No Phase 5 TODO items were checked off. (2) "Question fits the selected difficulty" for multiplication needed a special case: a 0 factor is outside the normal 1–5 / 1–10 shapes but allowed at Levels 1–2 (DECISIONS 1.5), so the validator accepts 0 only where the config has a zero-factor chance.
- Not covered by DECISIONS (chose the conservative option): addition picks the first operand evenly, then the second from 0 up to whatever keeps the sum under the cap. At Level 4 this makes big second operands rarer when the first is big. Display text has no "= ?" (the card can add it in Phase 6).
- The "regenerate if over 1,000" rule for Level 4 division is in place but never triggers, because 25 × 40 = 1,000 exactly.
- Immediate-repetition avoidance (DECISIONS 7) belongs to TODO line 272 (session phase), so it is not done here.
- Statistical tests (zero-factor share 3–20%, Level 3 two-digit share 35–65%, every operation used) use wide bounds; a false failure is extremely unlikely but not impossible since `Math.random` is not seeded.

### [2026-10-21 14:58] Phase 5: Multiple-Choice Answers
**My prompt:**
Implement Phase 5 (tasks 17–19). Use operation-specific distractors as the TODO
describes, with a retry limit and a safe fallback.

Write tests for edge cases near zero (0 + 0, 1 − 1, 0 × 5, 0 ÷ 3, 1 × 1) where there
are few plausible wrong answers: there must still be exactly four unique, nonnegative,
whole-number choices with the correct answer exactly once. Also test that across
1,000 questions the correct answer appears in each of the four positions roughly 25%
of the time.

**What you did:**
- Run by a Claude Code subagent using the Phase 5 prompt from PROMPTS.md (not manually tested by me before commit).
- Tasks 17–19: only the temporary Phase 4 placeholder existed (correct answer + 3 nearby numbers in `questionGenerator.ts`). Removed it and added `src/services/distractors.ts` with `generateDistractors(operation, a, b)` and `buildChoices(operation, a, b)`; `generateQuestion` now uses `buildChoices`.
- Distractor candidates per operation, shuffled, then filtered (whole, ≥ 0, not the answer, no duplicates), first 3 kept. Addition: answer ±1, ±10, "forgot to carry" (47 + 38 → 75), "subtracted instead" (9). Subtraction: answer ±1, ±10, "smaller digit from larger" borrow mistake (52 − 17 → 45), "added instead" (69). Multiplication: neighboring table facts a × (b ± 1), (a ± 1) × b, answer ±1, "added instead". Division (fact family): quotient ±1, ±2, the divisor, a ÷ (b ± 1) when whole, a − b.
- If fewer than 3 survive (near zero), up to `MAX_DISTRACTOR_ATTEMPTS` (20) random nearby numbers (±1 to ±5) are tried, then a guaranteed fallback counts up from answer + 1. It throws `RangeError` if the answer itself is not a non-negative whole number, so the fallback can never loop forever.
- `validateQuestion` now also rejects negative or fractional choices (new rule + test). Added `src/test/seededRandom.ts` (mulberry32 seeded `Math.random` spy) so the statistical tests are deterministic.
- Tests: `src/services/distractors.test.ts` (16 tests): the five near-zero cases × 200 runs each; 3 valid distractors for 200 questions per operation per level; one test per operation proving the specific mistakes appear and nothing else does; retry-limit/fallback test with `Math.random` stuck at 0; RangeError on bad input; answer-position test. Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npx prettier --check .`.

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings. `npx prettier --check .`: clean.
- `npm test -- --run`: 12 files, 114/114 passed (97 before, 17 new) on the first run. The answer-position test uses a seeded random generator (seed 2026) over 1,000 questions mixed across all operations and levels and requires each position to get between 200 and 300 hits (25% ± 5%), so it is deterministic and cannot fail randomly.
- `npm run build`: pass (JS 322.77 kB, 101.39 kB gzip; unchanged because no page shows questions yet). No screenshots: this phase has no UI.
- All 16 Phase 5 TODO items checked off (each is covered by a test).
- Manual checklist for you: nothing new on screen yet (answer buttons come in Phase 6). Run `npm test -- --run src/services/distractors` and read `src/services/distractors.ts` to judge whether the wrong answers feel plausible for a 7–12 year old (e.g. for 7 × 8 the options come from 48, 49, 55, 57, 63, 64, 15).

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): which mistakes count as "plausible" is my choice (listed above). All candidate mistakes are treated equally (random pick), not weighted. Distractors are not limited to the level's answer range, so e.g. "added instead" can be far from the answer on Level 4 subtraction.
- `0 ÷ 3` is tested at the distractor level only; the generator never makes it because DECISIONS 1.6 forbids quotient 0.
- Zero-factor multiplication at Levels 1–2 (DECISIONS 1.5) still passes: 0 × 5 gets choices like 0, 1, 5 and a nearby number.
- Phase 13 (similar questions) can reuse `buildChoices` from `src/services/distractors.ts`.

### [2026-10-21 15:10] Phase 6: Question Card
**My prompt:**
Implement Phase 6 (tasks 20–25). The card back must also show a brief explanation as
described in DECISIONS.md (we'll connect it to the "show explanations" setting in Phase 11).

Requirements to verify with component tests:
- Flip Card is disabled until an answer is selected; the answer can change before flipping
  but not after.
- I Got It Right / I Got It Wrong can't be submitted twice (test a fast double-click).
- With animation off or prefers-reduced-motion set, the card still works and the answer
  is still clearly shown.
- No mirrored or overlapping text on the back of the card.
Show the card on the practice page with a generated question so I can try it.

**What you did:**
- Run by a Claude Code subagent using the Phase 6 prompt from PROMPTS.md (not manually tested by me before commit).
- Tasks 20–25 all started from scratch (only an empty `src/components/practice/.gitkeep` existed). Added `src/components/practice/AnswerChoice.tsx` (button with `aria-pressed`, label "Answer 56", ✓ mark when selected so it is not color alone, 72px tall), `CardFront.tsx` ("Question X of Y", big `7 × 8 = ?` with screen-reader text "What is 7 times 8?", four choices, Flip Card disabled with the hint "Pick an answer, then flip the card."), `CardBack.tsx` (`7 × 8 = 56`, "Correct answer" and "Your answer" boxes, explanation, I Got It Right / I Got It Wrong), and `QuestionCard.tsx` + `.css`.
- `QuestionCard` holds `selectedAnswer`, `isCardFlipped` and `submitted`; it is keyed by the question id so everything resets for a new question. A ref blocks a second result click that arrives before React re-renders, so a result is reported only once. After flipping, focus moves to the back's heading so screen readers read the answer. Props `showExplanations` and `animationEnabled` (both default on) are ready for Phase 11.
- Flip animation: both faces share one CSS grid cell (aligned, card as tall as the taller face), the card turns 180° and the back face is pre-turned 180°, `backface-visibility: hidden`, and the face turning away gets `visibility: hidden` at the halfway point plus `inert`/`aria-hidden`, so mirrored text can't show even if backface hiding fails. With animation off or `prefers-reduced-motion` (new hook `src/hooks/usePrefersReducedMotion.ts`), only the current face is rendered, with no transform.
- Explanations (DECISIONS 5) in `src/utils/explanations.ts` (`explainQuestion`, plus `spokenQuestion` for screen-reader text using the new `OPERATION_WORDS` in `labels.ts`). `src/pages/PracticePage.tsx` (+ `PracticePage.css`) now shows a card with a question generated from the chosen setup (in the state initializer, not in render), a supportive message after self-reporting, and **Try Another Question** up to the chosen session length; the "Your choices" list and Change My Choices stay below. Incomplete setup shows a friendly message and a link to setup.
- Tests: `src/utils/explanations.test.ts` (8), `src/components/practice/QuestionCard.test.tsx` (18), `src/pages/PracticePage.test.tsx` (4, seeded random). Removed `src/hooks/.gitkeep` and `src/components/practice/.gitkeep`. Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npx vite preview --port 4179` + headless Chrome screenshots (server stopped afterwards).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 15 files, 144/144 passed (114 before, 30 new). The first run of the new card tests had 5 failures, all in my test expectations, not the component: jsdom reports `transform: none` (not an empty string) and does not implement the `inert` property (checked the attribute instead), and a hidden button's accessible name can't be queried by role (used a selector). Fixed and re-ran: all passed.
- Prompt requirements covered by component tests: Flip Card disabled until a choice is made, choice can change before flipping and not after (front is disabled, inert and hidden); fast double-click and three synchronous clicks report exactly once; with `animationEnabled={false}` and with a mocked `prefers-reduced-motion: reduce`, the card flips, focuses and shows correct/selected answers; mirrored/overlap check reads the computed CSS in jsdom (card turned 180° + back pre-turned 180°, `backface-visibility: hidden` on both faces, both faces in grid cell `1 / 1`, front hidden after flip).
- `npm run build`: pass (JS 335.02 kB, 105.03 kB gzip; CSS 12.71 kB).
- Screenshots (375px and 1280px iframes, served from a throwaway page copied into the git-ignored `dist/` and deleted afterwards; no debug code in `src`): front, selected (blue fill + ✓), flipped back, after reporting, and with `--force-prefers-reduced-motion`. Back text reads normally, nothing overlaps; one capture taken mid-flip showed the front turning in perspective, not mirrored. Changed the answer boxes to keep their numbers aligned when "Correct answer" wraps at 375px.
- 31 of 33 Phase 6 TODO items checked off. Left unchecked: "Add hover and focus states" (styles exist but hover/keyboard focus look needs a real browser check by you) and "Add an animation setting" (only a prop so far; the Settings toggle is Phase 11).
- Manual checklist for you: (1) `npm run dev`, Start Session from setup: a card with a question from your choices appears. (2) Flip Card is greyed out until you pick an answer; you can change the pick; the chosen one turns blue with a ✓. (3) Flip: the card turns smoothly and the back reads normally (no backwards text), showing the question with its answer, Correct answer, Your answer, and an explanation. (4) Double-click I Got It Right quickly: one message only, both buttons grey out. (5) Try Another Question gives a fresh card at Question 2; after the last one there is no Try Another button. (6) Keyboard only: Tab to choices, Space picks, Enter on Flip Card, focus lands on the answer heading. (7) Turn on "Reduce motion" in Windows (Settings > Accessibility > Visual effects > Animation effects off) and reload: the back appears instantly. (8) Hover over choices and buttons: they lift; focus outline is purple. (9) Try a screen reader (Narrator) if you can: it should say "What is 7 times 8?" and read the answer after flipping.

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): "large second operand" means 10 or more; "crosses a ten" means the ones digits carry (addition) or the first ones digit is smaller (subtraction); Level 4 addition with hundreds still says "Add the tens, then the ones" exactly as DECISIONS 5 words it. The × 0 / × 1 sentences add the real fact ("…, so 6 × 0 = 0.").
- The practice page is only a try-out: nothing is recorded or saved, and question numbering/Try Another is local page state. Phase 7 must replace it with the real session (recording, progress bar, repetition avoidance, redirect for missing setup). `ProgressBar.tsx` (spec 18) is TODO task 30 in Phase 7, so it is not added here. The "Your choices" list stays on the page because an existing setup test relies on it.
- `showExplanations` and `animationEnabled` are props with default `true`; Phase 11 must pass the saved settings. Number keys 1–4 and live-region announcements are later accessibility tasks (TODO lines 563–572); for now focus moves to the back's heading after flipping, and to the new card after Try Another.
- In the reported screenshot the focused back heading shows the purple focus outline because the test script clicked with JavaScript; with a real mouse click Chrome usually doesn't show it. Worth a look in your manual test.

### [2026-10-21 15:20] Phase 7: Practice Session
**My prompt:**
Implement Phase 7 (tasks 26–31) using useReducer and Context as the spec describes.
Keep question generation out of render logic.

Test: each attempt is counted exactly once, the next question resets selection and flip
state, the same question doesn't appear twice in a row, continuous mode has End Session
with a confirmation, and visiting /practice/session with no configuration redirects to
setup with a friendly message.

**What you did:**
- Run by a Claude Code subagent using the Phase 7 prompt from PROMPTS.md (not manually tested by me before commit).
- Tasks 26–31: only the Phase 6 try-out page existed (local question/number state, nothing recorded). Added session state with `useReducer` + Context: `src/app/practiceSession.ts` (reducer with `startSession` / `recordAttempt` / `endSession`, field names from spec section 11: `currentSession`, `currentQuestion`, `currentQuestionIndex`, `attempts`, plus `isActive`), provided by `AppProvider.tsx` next to the setup config. The reducer ignores an attempt if the session is not active, the session id or question id doesn't match the current question, or that question already has an attempt, so each attempt is counted once.
- `src/hooks/usePracticeSession.ts` builds the session (id, start time, operations, difficulty, length, totals) and each `PracticeAttempt`, and generates questions only in event handlers (`startSession`, `recordResult`), never in render or in the reducer. Setup's Start Session now calls `startSession(config)`, which refuses an incomplete config. `src/services/questionGenerator.ts` gained `isSameQuestion` (same operation + operands; swapped operands count as the same for + and ×, DECISIONS 7) and `generateNextQuestion`, which regenerates up to `MAX_GENERATION_ATTEMPTS` (20) times to avoid an immediate repeat.
- `src/pages/PracticePage.tsx` rewritten as the real session: "Your choices" line; new `src/components/practice/ProgressBar.tsx` (`role="progressbar"` with `aria-valuenow` and `aria-valuetext` "3 of 10 questions answered") for fixed sessions, or "N questions answered so far" for continuous ones; the card (keyed by question id so selection and flip reset, with a short fade-in); a supportive status message ("Great job! Here is question 3."); focus moves to the new card. No session in context → `<Navigate>` to `/practice/setup`, which shows "Let's get your cards ready! Choose what to practice, then press Start Session." A finished or ended session → `/practice/summary` (replace). Continuous mode has **End Session** using a new reusable `src/components/common/ConfirmDialog.tsx` (`role="dialog"`, `aria-modal`, labelled and described, focus starts on "Keep Practicing", Tab is trapped, Escape cancels, focus returns to the opener). `Button` now takes `ComponentProps<'button'>` so it accepts a `ref`.
- Tests: `src/app/practiceSession.test.ts` (9), `src/hooks/usePracticeSession.test.tsx` (4), `src/services/questionGenerator.next.test.ts` (5), `src/components/common/ConfirmDialog.test.tsx` (5), `src/components/practice/ProgressBar.test.tsx` (2), `src/pages/PracticePage.test.tsx` rewritten (4 → 11); removed the `/practice/session` row from `src/app/AppRoutes.test.tsx` (that URL now redirects; covered in the page tests). Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npx prettier --check .`, `npx vite preview --port 4179` + headless Chrome screenshots (server stopped afterwards).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings. `npx prettier --check .`: clean.
- `npm test -- --run`: 20 files, 175/175 passed (144 before: +36 new, −4 old try-out page tests, −1 route row). All new tests passed on their first run. Prompt requirements: attempt counted once (reducer test dispatching the same attempt twice, and a page test with two synchronous clicks on I Got It Right → progress 1, "Question 2 of 5"); next question resets selection and flip (all choices `aria-pressed="false"` and enabled, Flip Card disabled, no result buttons, focus on the new card); no immediate repeat (unit test that re-uses a seed so the first try is an exact repeat, 2,000 seeded consecutive questions, retry limit ends the loop, and a 20-question page session at Level 1 multiplication); End Session asks first (Keep Practicing keeps the same question and returns focus, Yes goes to the summary) and fixed sessions have no End Session; `/practice/session` with no started session redirects to setup with the friendly message (not shown on a normal visit).
- `npm run build`: pass (JS 340.09 kB, 106.46 kB gzip; CSS 13.92 kB).
- Screenshots (375px and 1280px iframes, from a throwaway page in the git-ignored `dist/`, deleted afterwards; no debug code in `src`): redirect notice on setup; fixed session at "Question 3 of 10" with the bar at 2 of 10 and the supportive message; a flipped card mid-session; continuous session with "2 questions answered so far" and the End Session dialog over a dimmed page. Nothing overlaps at 375px.
- 24 of 27 Phase 7 TODO items checked off. Left unchecked: "Add an optional short transition" (a 0.3 s fade-in exists, but an animation can't be judged from tests or a still screenshot), "Make progress accessible to screen readers" (ARIA attributes are tested, but it needs a real screen reader), "Show the summary when the session ends" (it navigates to `/practice/summary`, but that page is still the placeholder until Phase 8).
- Manual checklist for you: (1) `npm run dev`, open http://localhost:5173/practice/session directly: you land on setup with the yellow "Let's get your cards ready!" note. (2) Start a 5-question session: the bar fills one step per answer and "Question X of 5" goes up; each new card fades in with nothing selected and Flip Card greyed out. (3) Double-click I Got It Right fast: the bar moves only one step. (4) Watch for the same question twice in a row (including 7 × 8 then 8 × 7): it shouldn't happen. (5) After question 5 you reach the Session Summary placeholder; the browser Back button goes to setup, not back into the finished session. (6) Start "Keep going": no bar, "N questions answered so far", and an End Session button. Press it: a dialog appears with focus on Keep Practicing; Tab stays inside it; Escape or Keep Practicing closes it and you are on the same question; Yes, End Session goes to the summary. (7) Mid-session, click Statistics in the menu, then use Back: the session continues where you left it. (8) With Narrator, check that the progress bar reads "2 of 10 questions answered" and that "Great job! Here is question 3." is announced.

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): "no valid session" means no session was started from setup in this app run (the config always has defaults). A session that already finished or was ended sends `/practice/session` to the summary instead of setup. End Session always asks for confirmation, even with 0 answers (DECISIONS 3.3's "No questions answered" message is Phase 8). Only continuous sessions get End Session (spec 6.5). `selectedAnswer` and `isCardFlipped` (spec section 11) stay inside `QuestionCard` (keyed by question id) instead of app state, because the card already resets them reliably and nothing else reads them yet.
- Phase 8 overlap: the reducer sets `completedAt` and stops generating when a fixed session reaches its length or End Session is confirmed, and the page navigates to `/practice/summary`. No Phase 8 TODO items were checked off; Phase 8 should build the summary from `currentSession`/`attempts` and handle the 0-answers case.
- Attempts and sessions live only in memory (Context); a page refresh loses the session and redirects to setup. Saving is Phase 9. Spec 15's "confirm before leaving an active session" is TODO lines 634–635 (a later phase); leaving via the menu keeps the session in memory, so nothing is lost now.
- The navigation highlights "Practice" only on `/practice/setup`, not on `/practice/session` (existing Phase 2 behavior, not changed here).
- Screenshot quirk: in headless Chrome with a virtual time budget, the progress bar fill's width transition sometimes stays at its start (measured: animation `running`, currentTime 0), so one screenshot showed an empty bar next to "2 of 10 answered". The DOM had the right `width: 20%` and another screenshot showed the fill correctly, so I believe it is a headless timing artifact; please confirm the bar fills in a real browser (checklist item 2).
- The "no repeat across 20 questions" page test is a smoke test (without the guard a repeat would only show up some of the time); the forced-repeat unit test is the real proof.

### [2026-10-21 21:55] Phase 8: Session Summary
**My prompt:**
Implement Phase 8 (tasks 32–34).

Before finishing, walk through the code path from the LAST question to the summary page
and check for: a blank screen or `return null` after the final answer, the summary
loading before the final attempt is recorded, and wrong totals.

Add an integration test: a 5-question session with 4 marked right and 1 marked wrong must
show Attempted 5, Correct 4, Incorrect 1, Accuracy 80%. Also make /practice/summary
show a friendly message (not a blank page) when opened with no completed session.
"Practice Mistakes" can be disabled for now, with an explanation, until Phase 14.

**What you did:**
- Run by a Claude Code subagent using the Phase 8 prompt from PROMPTS.md (not manually tested by me before commit).
- Tasks 32–34: task 32 (completion detection) already existed from Phase 7 (reducer sets `completedAt`, the hook passes no next question on the last answer, the page redirects to `/practice/summary`); it had no direct test that generation stops, so I added one. Tasks 33–34 were new: `src/pages/SessionSummaryPage.tsx` was a placeholder.
- Added `src/components/practice/SessionSummary.tsx` (+ `.css`, spec section 18): a supportive heading ("Great job!" at 80% or more, otherwise "Nice work! Keep practicing, you are improving!"), four stat cards (Attempted, Correct, Incorrect, Accuracy) and a details list (Math practiced, Level, Mistake-review questions, counted from attempts with source `mistake-review`, so 0 until Phase 14). Added `calculateAccuracy(correct, attempted)` to `src/utils/math.ts` (whole percent, 0 with no attempts).
- `SessionSummaryPage.tsx` (+ new `SessionSummaryPage.css`) reads the in-memory session from context: no session → friendly "When you finish a practice session, you'll see how you did here." with Start Practice / Back to Home; a session still running → "You're still practicing!" with Keep Practicing; an ended session with 0 answers → "No questions answered this time. That's okay, you can try again whenever you're ready!" (DECISIONS 3.3); otherwise the summary. Actions: **Practice Again** (starts a new session with the same operations, level and length, then goes to the session), **Practice Mistakes** (disabled, `aria-describedby` → "Practicing your mistakes is coming soon!"), **Change Settings** (setup), **View Statistics**, **Return Home**.
- Code-path walkthrough (last question → summary): I Got It Right/Wrong → `QuestionCard` reports once → `recordResult` builds the attempt and, because `attempted + 1 >= sessionLength`, passes `nextQuestion: null` (no generation) → one `recordAttempt` dispatch updates totals, appends the attempt, sets `completedAt` and `isActive: false` in the same state update → `PracticePage` re-renders with `!isActive` and returns `<Navigate to="/practice/summary" replace />` (not `null`) → the summary reads that same state, so the final attempt is always already counted; there is no separate save step it could load before. End Session goes through `endSession` with the same result. No blank screen: every summary branch renders a heading and a message or the stats. Totals: `correct + incorrect = attempted` is maintained by the reducer and checked by the 4-right/1-wrong integration test.
- Tests: `src/pages/SessionSummaryPage.test.tsx` (10, full router + `AppProvider`, seeded random), `src/components/practice/SessionSummary.test.tsx` (3), `src/utils/math.test.ts` (+2 accuracy), `src/hooks/usePracticeSession.test.tsx` (+1: `generateNextQuestion` is called only once for a 2-question session and `completedAt` is set). Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npx prettier --check .`, `npx vite preview --port 4179` + headless Chrome screenshots (server stopped afterwards).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings. `npx prettier --check .`: clean.
- `npm test -- --run`: 22 files, 191/191 passed (175 before, 16 new). Includes the required integration test: 5-question session, 4 right and 1 wrong → Attempted 5, Correct 4, Incorrect 1, Accuracy 80%; also an ended continuous session (3 answered, 1 right → 33%), 0 answers, no session, a session still running, Practice Again starting a fresh "Question 1 of 5" with the same choices, Practice Mistakes disabled with its description, and the three navigation buttons.
- `npm run build`: first attempt failed: `tsc` reported `Property 'operations' does not exist on type 'PracticeSession | null'` inside the `practiceAgain` function (TypeScript doesn't keep the `if (!session)` narrowing inside a hoisted function declaration; tests and lint had passed because Vitest doesn't type-check). Fixed by destructuring the session's choices after the null check; build then passed (JS 342.80 kB, 107.02 kB gzip; CSS 15.53 kB).
- Screenshots (375px and 1280px iframes, driven by a throwaway page in the git-ignored `dist/`, deleted afterwards; no debug code in `src`): a finished 10-question session (8 right, 2 wrong → 80%, "Great job!", 2×2 stat cards at 375px and one row of 4 at 1280px), a continuous session ended with 0 answers, and `/practice/summary` with no session. Nothing overlapped or overflowed.
- TODO: all of tasks 32–34 checked except **Add Practice Mistakes** (the button is there but disabled until Phase 14). Also checked Phase 7's "Show the summary when the session ends" (now verified by the integration test).
- Manual checklist for you: (1) `npm run dev`, open http://localhost:5173/practice/summary directly: a friendly message with Start Practice, not a blank page. (2) Do a 5-question session with 4 I Got It Right and 1 I Got It Wrong: the summary shows 5 / 4 / 1 / 80%, your math type and level, and Mistake-review questions 0. (3) Practice Again: a new session at "Question 1 of 5" with the same choices. (4) Practice Mistakes is greyed out with "coming soon" under it; Tab skips it. (5) Change Settings, View Statistics and Return Home go to the right pages. (6) Start "Keep going", press End Session right away and confirm: "No questions answered this time". (7) The "You're still practicing!" message has no in-app link to reach it (typing the URL reloads the page and loses the in-memory session until Phase 9), so it is covered only by an automated test for now. (8) Check at phone width that the four stat cards and buttons fit.

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): the summary for a session still in progress shows "You're still practicing!" with Keep Practicing instead of partial totals or a redirect. The supportive heading switches at 80% accuracy and never mentions wrong answers. Practice Again reuses the finished session's choices (not whatever setup now holds). The 0-answers case still shows all actions (Practice Again etc.).
- Phase 9 must not save a session record when `attempted` is 0 (DECISIONS 3.3); nothing is saved yet, and the summary reads in-memory state, so a page refresh on the summary shows the "no session" message.
- Phase 14 must enable Practice Mistakes; the mistake-review count will only be non-zero once review questions exist. The "Session complete" sound (DECISIONS 6) is Phase 11.
- The disabled Practice Mistakes button uses the shared disabled style (55% opacity), so its white text has low contrast; WCAG exempts disabled controls and the explanation is in normal text below it, but please judge whether it reads well.

### [2026-10-21 22:03] Phase 9: Local Data Storage
**My prompt:**
Implement Phase 9 (tasks 35–39) with the storage keys from spec section 10 and a
schema version.

Important: save each attempt to localStorage immediately when I click I Got It Right or
Wrong, not only at the end of the session.

Write tests for: no stored data, corrupted JSON in each key (only that category resets),
storage throwing an error (the session keeps running and a friendly warning shows), and
data surviving a simulated reload. Give me manual steps to verify persistence after
closing and reopening the browser.

**What you did:**
- Run by a Claude Code subagent using the Phase 9 prompt from PROMPTS.md (not manually tested by me before commit).
- Tasks 35–39: nothing existed before (sessions and attempts lived only in memory). Added `src/services/storageService.ts`: keys `mathPractice.settings / .sessions / .attempts / .mistakePatterns / .statistics / .version`, `SCHEMA_VERSION = 1`, an empty `MIGRATIONS` map with `runMigrations`, and `initializeStorage` (writes the version; a version from a newer app is left untouched). `readData(key)` / `writeData(key, value)` never throw: each key has its own validator, so bad JSON or a wrong shape resets only that key; lists keep their valid records and drop broken ones; settings are repaired field by field (DECISIONS 2.3/4.2 limits). Also `clearData(keys)`, `clearAllData()` (only this app's keys), `saveAttempt`, `saveSession`, `loadRecentSessions(20)` (completed sessions, newest first, DECISIONS 3.4). Validators/defaults exist for every key so Phases 10–12 can reuse them; `createEmptyStatistics()` added to `src/types/statistics.ts`.
- `usePracticeSession` now saves the attempt and the updated session record immediately on I Got It Right/Wrong (it runs the pure reducer first to get the new totals, so a rejected double-click saves nothing; `saveAttempt` also skips a question that is already saved). The session record gets `completedAt` on the last answer or End Session. A session ended with 0 answers is never saved (DECISIONS 3.3).
- `AppProvider` runs `initializeStorage()` and loads settings at startup through the new `src/hooks/useLocalStorage.ts`; settings, `saveSettings`, and the save status are shared via `src/app/storageContext.ts` (`useStorage()`). Settings are loaded but not yet applied to setup (that is Phase 11, task 49).
- New `src/components/common/StorageWarning.tsx` (+ `.css`), shown under the header on every page (`role="alert"`) whenever a save fails or storage is blocked: "Your progress can't be saved on this device right now. Practice can keep going, but results may not be remembered after the browser is closed. This can happen in private browsing or when the browser's storage is full." The session keeps running from memory.
- Tests: `src/services/storageService.test.ts` (47), `src/hooks/useLocalStorage.test.ts` (2), `src/pages/PracticePage.storage.test.tsx` (10, full router + `AppProvider`). Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npx vite preview --port 4179` + headless Chrome screenshot (server stopped afterwards).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings (first run: 2 unused-variable errors in the new tests, fixed).
- `npm test -- --run`: 25 files, 250/250 passed (191 before, 59 new). Covers: no stored data (defaults for every key, no recent sessions); corrupted JSON and wrong types in each of the 5 keys (only that key resets and is removed; the other 4 keys and another app's key are untouched); broken records dropped from lists; settings repaired field by field; storage full (`setItem` throws), reads throwing, and `localStorage` blocked entirely (the session keeps going, the friendly warning shows, the summary still shows 80%); the warning appears only after a save fails; each attempt is in localStorage right after the click (selected answer, result, operation, difficulty, session id, timestamp); completed and ended sessions saved with totals and `completedAt`; 0-answer session not saved; data surviving a simulated reload (unmount, new `AppProvider`, old attempts still there and new ones appended); stored settings loaded at startup. One new test failed on its first run because it read the chosen answer's text after the card had flipped; fixed the test to read it before clicking.
- `npm run build`: first attempt failed with `tsc` errors in `isStatistics` (the counts type guard narrowed the value so TypeScript no longer saw `byOperation`; Vitest doesn't type-check). Fixed by checking `isRecord` first; build then passed (JS 347.39 kB, 108.41 kB gzip; CSS 15.81 kB).
- Screenshot (375px and 1000px iframes; a throwaway copy of `index.html` in the git-ignored `dist/` that made `setItem` throw, deleted afterwards; no debug code in `src`): the yellow warning sits under the header on Home and Setup, readable at phone width, nothing overlaps.
- TODO: 17 of 20 Phase 9 items checked. Left unchecked: "Detect missing or older versions" (missing and newer versions are tested, but with schema version 1 there is no older version yet, so that branch can't run), "Limit or summarize old records if needed" (Phase 21), "Confirm data survives a browser restart" (only a simulated reload was tested; needs your manual check).
- Manual checklist for you: (1) `npm run dev`, open http://localhost:5173, press F12 → Application → Local Storage → localhost:5173: you see `mathPractice.version` = 1. (2) Start a 5-question session and answer one question with I Got It Wrong: `mathPractice.attempts` has 1 entry and `mathPractice.sessions` has 1 session with `attempted: 1` and no `completedAt` (click DevTools' refresh icon if needed). (3) Finish the session: 5 attempts, and the session has `completedAt` and totals matching the summary. (4) Close the whole browser, reopen http://localhost:5173 and check DevTools again: the data is still there, and a new session adds to it. (5) Start "Keep going", press End Session right away and confirm: no new session appears in `mathPractice.sessions`. (6) Change `mathPractice.sessions` to `oops`, reload, and answer one question: sessions now holds only the new session, while attempts keep the old entries. (7) In DevTools Console run `Storage.prototype.setItem = () => { throw new Error('full'); }`, then answer a question: the yellow warning appears under the header and practice keeps going (reload to undo).

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): stored records are **not capped** (spec 22 asks for several thousand attempts; deleting history is riskier than keeping it). Only the read is limited to the 20 most recent sessions. Phase 21 should measure storage size and summarize old attempts. A missing or unreadable version is treated as the current version (no data was saved before this phase); data saved by a newer app version is left as is. Broken records inside a list are dropped instead of resetting the whole list, so one bad record doesn't erase the rest. The warning hides again when a later save succeeds.
- The session record is saved after every answer (not only at the end), so a session left unfinished by closing the browser stays saved without `completedAt`; its attempts still count. `loadRecentSessions` skips such sessions. Phase 18 (session recovery) may want to finish or resume them.
- `mathPractice.statistics` is validated and can be read, but nothing writes it yet; Phase 10 must decide whether to compute statistics from attempts or keep the aggregate in sync with each saved attempt. `mathPractice.mistakePatterns` likewise waits for Phase 12. Settings are loaded but not applied to setup and have no UI yet (Phase 11 can use `useStorage().saveSettings`). Reset Statistics / Clear All Data UI is Phases 10–11 (`clearData` / `clearAllData` exist).
- The warning is outside the `<main>` landmark (right under the header) so it shows on every page; Phase 16 may want to check this with a screen reader.
