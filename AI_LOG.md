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

### [2026-10-21 22:11] Phase 10: Statistics
**My prompt:**
Implement Phase 10 (tasks 40–47). Follow DECISIONS.md about what Reset Statistics clears.

Unit-test accuracy with zero attempts (no NaN or Infinity), all-correct, and all-wrong.
Check the layout at 375px, 768px, and 1280px widths: labels like "Attempted" and
"Accuracy" must fit inside their cards, and nested cards must not spill outside their
parent. Reset Statistics must require explicit confirmation in a dialog.

**What you did:**
- Run by a Claude Code subagent using the Phase 10 prompt from PROMPTS.md (not manually tested by me before commit).
- Tasks 40–47: storage, `loadRecentSessions(20)`, `clearData`, `calculateAccuracy` and `ConfirmDialog` already existed from Phases 7–9; nothing wrote `mathPractice.statistics` and the Statistics page was a placeholder. Added `src/services/statisticsService.ts`: `getAccuracy`, `addAttemptToStatistics` (pure; overall + per-operation + per-level, using the self-reported result, DECISIONS 3.2), `buildStatistics(attempts)`, `loadStatistics()` (the stored aggregate is the source of truth; only when it is missing or corrupted is it rebuilt from saved attempts and stored), `recordAttempt()` (saves the attempt and adds it to the aggregate exactly once; a repeated question changes nothing; if only the aggregate write fails, the stale aggregate is removed so it gets rebuilt from attempts), and `resetStatistics()` (clears attempts, sessions, statistics; keeps mistake patterns, settings and version, DECISIONS 3.1).
- `usePracticeSession` now calls `recordAttempt` instead of `saveAttempt`, so totals are updated incrementally on every I Got It Right/Wrong, including answers in sessions that are later abandoned. New `src/hooks/useStatistics.ts` loads statistics + recent sessions and provides `reset()` (reloads the data from storage afterwards and reports a failed reset to the storage warning).
- New components in `src/components/statistics/`: `StatisticsOverview` (four big tiles, or an empty state with Start Practice for new users), `OperationStatistics` and `DifficultyStatistics` (a card per operation / level; unpracticed ones say "Not practiced yet" instead of showing 0%), `RecentSessions` (20 most recent completed sessions, newest first, with date/time, operations, level and the four numbers; unfinished sessions are left out but their answers still count in the totals; empty state), plus shared `StatCard`, `StatCounts` and `Statistics.css`. Numbers use thousands separators.
- `src/pages/StatisticsPage.tsx`: composes the sections; **Reset Statistics** (shown only when there is something to reset) opens `ConfirmDialog` "Reset your statistics?" saying exactly what is cleared and what is kept ("Keep My Statistics" is focused; "Yes, Reset Statistics" confirms). After a reset a status message is shown and focused, and the page shows the empty states.
- Tests: `src/services/statisticsService.test.ts` (19) and `src/pages/StatisticsPage.test.tsx` (9, full router + `AppProvider`). Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npx vite preview --port 4179` + headless Chrome screenshots and a DOM overflow check (server stopped afterwards).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 27 files, 278/278 passed (250 before, 28 new). All new tests passed on their first run. Covers: accuracy with zero attempts is 0 and finite (overall, per operation, per level; page has no "NaN"), all correct = 100%, all wrong = 0%, 4/5 = 80%, 1/3 = 33%; per-operation and per-level counts; self-reported result used; stored totals kept as source of truth; missing or corrupted totals rebuilt from attempts; an attempt counted once; storage full changes nothing; only-totals-write-failing gets rebuilt correctly; reset keeps mistake patterns, settings and version; page empty state with no Reset button; overview/operation/level/session numbers from seeded storage; sessions newest first, unfinished excluded; cancelling the dialog (button and Escape) keeps everything and returns focus; confirming clears the three keys, keeps patterns/settings, shows and focuses the message and the empty states; a failed reset shows a message and the storage warning; an integration test playing a 5-question session (4 right, 1 wrong) then opening Statistics shows 5 / 4 / 1 / 80% and one recent session.
- `npm run build`: pass (JS 352.58 kB, 109.58 kB gzip; CSS 18.04 kB).
- Layout (375, 768, 1280px iframes, from a throwaway page in the git-ignored `dist/` that seeded 1,234 attempts and 6 sessions into localStorage, deleted afterwards; no debug code in `src`): screenshots of the full page, the bottom (Reset button), the reset dialog, and the empty state. Overview tiles are 2×2 at 375px and one row of 4 at 768/1280; operation and level cards are 1 column at 375px and 2 columns at 768/1280, each with 2×2 inner tiles; session cards have 2×2 tiles at 375px and 4 in a row at wider widths. A script checked all 52 stat tiles, their labels and values, and every card against their parent box at all three widths: 0 overflowing, no horizontal page scroll.
- TODO: all 28 Phase 10 items checked, plus Phase 20's "Test statistics calculations", "Test statistics display" and "Test resetting statistics" (now covered by tests).
- Manual checklist for you: (1) `npm run dev` in a fresh browser profile (or after Clear All Data in DevTools), open Statistics: friendly empty states, no Reset button, no 0% anywhere. (2) Do a 5-question session with 4 right and 1 wrong, then View Statistics: 5 / 4 / 1 / 80%, the right operation and level cards filled, the others say "Not practiced yet", and the session is listed with today's date. (3) Do a second session with another operation: it appears at the top of Recent sessions. (4) Start "Keep going", answer 2 questions, go to Statistics via the menu: the totals include the 2 answers, but the session is not listed until you end it. (5) Press Reset Statistics: the dialog explains what's cleared and kept; Keep My Statistics and Escape leave everything; Tab stays in the dialog. (6) Confirm: the page shows the empty states and the bold reset message; in DevTools, `mathPractice.attempts`, `.sessions`, `.statistics` are gone and `.settings`, `.version` are still there. (7) Check the page on your phone or with DevTools device mode (375px): nothing spills out of its card.

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): sessions saved without `completedAt` (abandoned) are not listed but their attempts count in the totals. Operation/level cards with no attempts show "Not practiced yet" instead of 0%, and those two sections are hidden entirely until the first answer. Reset Statistics is only shown when there is data to reset. Users who saved attempts in Phase 9 (before the aggregate existed) get the aggregate built from those attempts on first load.
- If an aggregate is corrupted after Phase 21 starts summarizing old attempts, a rebuild from attempts can only count the attempts still stored; Phase 21 should keep that in mind.
- Resetting while a session is still in progress in memory: later answers in that session are saved again with the session's full in-memory totals (which include answers from before the reset), while the aggregate only counts answers after the reset. Rare; Phase 18 (session recovery) may want to end or restart an active session on reset.
- Accuracy is rounded to a whole percent (same as the Session Summary), so e.g. 249 of 250 shows 100% next to "Incorrect 1". Left as is for consistency; you may prefer rounding down.
- Mistake statistics (`MistakeStatistics.tsx`) are Phase 15. Phase 17's task 72 layout items were not checked off even though the overflow check passed, since Phase 15 will add more to this page.
- The `role="status"` message is created empty and hidden with `display: none` until a reset; it is focused when it appears so it is read out, but please confirm with Narrator (Phase 16).

### [2026-10-21 22:19] Phase 11: Settings
**My prompt:**
Implement Phase 11 (tasks 48–50).

Every setting must actually change the app's behavior, not just be saved:
- Sound effects: short, gentle tones using the Web Audio API (no audio files or external
  services); they must be audible and off when the setting is off.
- Card animation: turns the flip animation on or off.
- Show explanations: shows or hides the explanation on the card back.
- Defaults (operations, difficulty, length): prefill the setup page, still overridable.
- Mastery threshold: saved now, used in Phase 14.

When done, give me a table: setting | where it's used in code | how I can see it work.
Clear All Application Data needs a clear warning, then returns home with defaults restored.

**What you did:**
- Run by a Claude Code subagent using the Phase 11 prompt from PROMPTS.md (not manually tested by me before commit).
- Already there from Phase 9: `AppSettings`/`DEFAULT_SETTINGS`, validated `mathPractice.settings` with field-by-field repair, `useStorage().saveSettings`, `clearAllData()` in the storage service. Missing: the Settings page (it was a placeholder) and any use of the settings. QuestionCard already accepted `animationEnabled`/`showExplanations`.
- New `src/services/soundService.ts` (`playSound('right' | 'wrong' | 'complete', delay?)`) per DECISIONS 6: sine notes C5→E5 (120 ms each), one soft G4 (200 ms), a C5–E5–G5 arpeggio; gain 0.15 with 20 ms fade in/out; one `AudioContext` created lazily on the first sound (always inside a click), resumed if suspended; skipped silently if Web Audio is missing or throws. `usePracticeSession` plays right/wrong after I Got It Right/Wrong when sound is on, plus the arpeggio 0.35 s later when a fixed session finishes; ending a continuous session with ≥1 answer plays the arpeggio (0 answers: nothing, DECISIONS 3.3). Turning Sound effects on in Settings plays a sample so you can hear it.
- `src/pages/SettingsPage.tsx` (+ `.css`): real checkboxes/radios via `ChoiceTile` (setup look), a labelled `<select>` 1–10 for the mastery threshold (DECISIONS 2.3), changes saved immediately. The only remaining default operation is disabled ("At least one kind stays picked.") because a stored empty list is invalid. Clear All Application Data uses `ConfirmDialog` ("Clear all app data?", lists everything deleted, "Keep My Data" focused), then `navigate('/')` and Home shows a status notice. `ChoiceTile` got a `disabled` prop; the `.setup-section*` styles moved to `src/components/setup/SetupSection.css` so Settings can share them; `sessionLengthLabel` moved to `src/utils/labels.ts`.
- Wiring: `PracticePage` passes `settings.cardAnimation`/`showExplanations` to `QuestionCard`. `practiceConfigFromSettings()` replaces the hard-coded setup defaults (`AppProvider` initialises the setup config from saved settings; `DEFAULT_PRACTICE_CONFIG` is now derived from `DEFAULT_SETTINGS`); `AppProvider.saveSettings` copies changed defaults into the setup choices right away. `AppProvider.clearAllData` (in `useStorage`) clears all five app keys (not the version key or other sites' keys), re-reads settings (defaults), resets the setup config and drops any active session (new `reset` actions in both reducers; `useLocalStorage` got a `reload`).
- Tests: `src/services/soundService.test.ts` (8, mocked `AudioContext`), `src/pages/SettingsPage.test.tsx` (15, full router + `AppProvider`, `playSound` mocked), 2 new in `practiceConfig.test.ts`. Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npx vite preview --port 4179` + headless Chrome screenshots (server stopped afterwards; the helper page lived in git-ignored `dist/` and was deleted).

| Setting | Where it's used in code | How you can see it work |
|---|---|---|
| Sound effects | `src/hooks/usePracticeSession.ts` (`recordResult`, `endSession`) → `src/services/soundService.ts`; sample in `SettingsPage.tsx` `toggle` | Turn it on in Settings: you hear a two-note chime. Practice: rising chime for I Got It Right, one soft low note for I Got It Wrong, a three-note tune after the last answer (or End Session with answers). Turn it off: silence. |
| Card animation | `src/pages/PracticePage.tsx` → `QuestionCard` `animationEnabled` | On: the card flips over on Flip Card. Off: the back simply replaces the front. (Always off when your OS asks for reduced motion; the Settings text says so then.) |
| Show explanations | `src/pages/PracticePage.tsx` → `QuestionCard` → `CardBack` `showExplanation` | On: a sentence like "Start at 7 and count on 8 more to get 15." under the answers. Off: only the correct answer and your answer. |
| Default operations / difficulty / number of questions | `src/app/practiceConfig.ts` `practiceConfigFromSettings`, used in `src/app/AppProvider.tsx` (start-up and `saveSettings`) | Pick Division + Level 3 + 5 questions in Settings, open Practice: those are preselected; change them on the setup page and start: Settings still show your defaults. Reload the page: setup starts from the defaults again. |
| Mastery threshold | Saved in `mathPractice.settings` by `SettingsPage.tsx`; read in Phase 14 | Pick 5, reload: still 5 (DevTools → Local Storage → `mathPractice.settings` → `"masteryThreshold":5`). No visible effect until Phase 14. |
| Clear All Application Data | `SettingsPage.tsx` `confirmClear` → `AppProvider.tsx` `clearAllData` → `storageService.clearAllData` | Press it: a warning dialog; Keep My Data/Escape changes nothing. Yes, Clear Everything: you land on Home with "All app data was cleared…", Statistics are empty, Settings and setup show the defaults. |

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 29 files, 303/303 passed (278 before, 25 new). All new tests passed on their first run. One full run (the second one, after formatting) failed: the existing PracticePage test "never shows the same question twice in a row" timed out at 5,000 ms. Alone it takes ~3.4 s both with and without this phase's changes (checked with `git stash`), so it was load-dependent, not a regression; it now has a 15 s timeout. The full run after that passed 303/303. Covers: each sound's notes/frequencies/timing, gain 0.15 with fade in and out, lazy single `AudioContext`, resume when suspended, silent skip when Web Audio is missing or throws; settings page shows defaults and stored values, saves every change, sample sound only when turning sound on, last operation can't be removed; setup prefilled from stored settings at start-up and right after a change, per-session override doesn't touch the saved defaults; explanation shown/hidden and the animated class on/off on the real practice page; no sounds when off; right/wrong/complete sequence for a 5-question session; complete sound for a continuous session with 1 answer and none with 0; Clear All: warning text, cancel keeps data, confirm removes all five keys (keeps another site's key), Home notice, defaults back in Settings and setup, active session gone.
- `npm run build`: pass (JS 359.30 kB, 111.27 kB gzip; CSS 19.33 kB).
- Screenshots (375, 768, 1280px iframes): Settings page one column at 375px, two-column tiles at 768/1280, no horizontal scroll at any width (checked with `scrollWidth`); the clear-all dialog fits at all three widths with Keep My Data focused.
- TODO: all 16 Phase 11 items checked, plus task 25 "Add an animation setting" and task 68 "Respect the app animation setting" (both covered by tests).
- Manual checklist for you: (1) `npm run dev`, Settings: turn Sound effects on and listen for the chime (check the volume is gentle), do a 5-question session with right and wrong answers and listen for the three sounds; turn it off and confirm silence. (2) Card animation off: the card switches without flipping. (3) Show explanations off: no explanation sentence on the back. (4) Set default math/level/length, go to Practice: preselected; override for one session; reload: defaults again. (5) Mastery threshold: pick 5, reload, still 5. (6) Clear All Application Data: read the warning, try Escape and Keep My Data, then confirm: Home notice, empty Statistics, defaults everywhere; in DevTools only `mathPractice.version` is left. (7) Try sounds on a phone/tablet too (iOS silent switch can mute Web Audio).

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): changing a default in Settings resets the whole setup selection to the new defaults (a per-session choice made earlier on the setup page is replaced); after a page reload the setup page also starts from the defaults (overrides are not stored). The last default operation can't be unticked. The session-complete tune plays after the right/wrong sound of the last answer (0.35 s delay) instead of replacing it. Clear All keeps `mathPractice.version` (it is schema info, not user data). If clearing fails, Home says "Some app data couldn't be cleared…" and the storage warning shows.
- Sounds were tested only against a mocked `AudioContext` (jsdom has no Web Audio); whether they are audible and pleasant needs your ears in a real browser.
- A settings value saved outside the offered options (e.g. a session length of 15 edited by hand) is still valid per the Phase 9 validator but no radio button shows it as selected.
- Phase 14 must read `settings.masteryThreshold` (and apply DECISIONS 2.3 lowering rule). Phase 21/22 will add the privacy note to Settings. Phase 16 should check the switches and the dialog with a screen reader.

### [2026-10-21 22:23] Fix: accuracy rounds down
**My prompt:** yes, round down to 99%
**What you did:**
- Context: after Phase 10, accuracy used `Math.round`, so 249 correct out of 250 showed "100%" next to "Incorrect 1". I chose to round down instead.
- Changed `calculateAccuracy` in `src/utils/math.ts` to `Math.floor((correct * 100) / attempted)`. Multiplying before dividing avoids floating-point drift (e.g. `29 / 100 * 100` is 28.999…, which would floor to 28). This one function is used by the session summary and the statistics page, so both change together.
- Updated `src/utils/math.test.ts`: 2 of 3 is now 66%, plus regression tests (249/250 → 99%, 999/1000 → 99%, 1/201 → 0%) and a check that every n/100 gives exactly n%.
**Verification:**
- The new tests were run against the old code first: 2 failed (as expected), 8 passed. With the fix: all pass.
- `npm run lint`: pass, 0 errors. `npm test -- --run`: 29 files, 305/305 passed. `npm run build`: pass.
- Manual: answer 3 questions with 2 marked right; the summary and Statistics show 66%, not 67%.
**Problems / open issues:** None.

### [2026-10-21 22:26] Phase 12: Mistake Tracking
**My prompt:**
Implement Phase 12 (tasks 51–53) following DECISIONS.md for when two mistakes count as
the same pattern.

Create or update the pattern at the moment I click I Got It Wrong, and save it to
localStorage right away. Don't wait for the session to end. Test: a wrong answer creates
a pattern, the same mistake again increments incorrectCount without duplicating, a
correct answer creates nothing, and invalid stored patterns are dropped without crashing.

**What you did:**
- Run by a Claude Code subagent using the Phase 12 prompt from PROMPTS.md (not manually tested by me before commit).
- Already there from Phase 9: the `MistakePattern` type, the `mathPractice.mistakePatterns` key with a validator that drops invalid records (keeps the valid ones; unreadable JSON resets only that key), Reset Statistics keeping patterns (DECISIONS 3.1) and Clear All removing them (both already tested; verified, not changed). Missing: creating/updating patterns.
- New `src/services/mistakeService.ts`: pure `addMistake(patterns, mistake)` and `recordMistake(attempt)` / `loadMistakePatterns()`. Matching reuses `isSameQuestion` (same operation + operands; + and × also match swapped operands, − and ÷ don't; DECISIONS 2.1). A new pattern stores the operation, operands, correct answer, difficulty and `lastIncorrectAt` = the attempt time, with `incorrectCount` 1, `similarCorrectCount` 0, `mastered` false. A repeat mistake keeps the stored id/operands/answer (as first missed), sets `difficulty` to the latest level, `incorrectCount` + 1, updates `lastIncorrectAt`, resets `similarCorrectCount` to 0 and sets `mastered` to false (DECISIONS 2.2/2.3). Correct answers change nothing.
- `src/hooks/usePracticeSession.ts`: `recordResult` calls `recordMistake(attempt)` right next to `recordAttempt`, so the pattern is saved the moment I Got It Wrong is clicked. The three saves (attempt, pattern, session) now each run even if an earlier one fails (before, a failed attempt save skipped the session save); the storage warning shows if any failed.
- Patterns are read from localStorage on every wrong answer, so patterns saved in an earlier visit are picked up after a reload.
- Tests: `src/services/mistakeService.test.ts` (18), 4 new in `src/hooks/usePracticeSession.test.tsx`, 1 new in `src/services/storageService.test.ts` (every kind of invalid pattern field dropped), plus pattern assertions in the existing real-UI test in `src/pages/PracticePage.storage.test.tsx`. Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`. No UI changed, so no screenshots.

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 30 files, 328/328 passed (305 before, 23 new). All new tests passed on their first run. Covers: a wrong answer creates one pattern with all fields; the same mistake (also 8 × 7 after 7 × 8, and 8 + 7 after 7 + 8) increments `incorrectCount` with no duplicate and keeps the first-missed operand order; 10 − 3 vs 3 − 10 and 56 ÷ 8 vs 56 ÷ 7 stay separate; same operands under another operation stay separate; level changes to the latest mistake's; a mastered pattern is un-mastered with progress back to 0; a correct answer creates nothing and changes no pattern; invalid stored patterns are dropped (valid ones kept) and unreadable JSON is replaced, without crashing; a failed save returns false; the pattern is in localStorage right after clicking I Got It Wrong on the real practice page (before the session ends); a pattern saved before the app started is updated, not duplicated.
- `npm run build`: pass (JS 359.90 kB, 111.41 kB gzip).
- TODO: all 13 Phase 12 items checked, plus task 62 "Allow a later mistake to reactivate a pattern", task 76 "Detect invalid settings, attempts, sessions, and patterns" and task 81 "Test an incorrect answer creating a pattern" (all covered by tests).
- Manual checklist for you: (1) `npm run dev`, start a multiplication session, answer one question with I Got It Wrong, then in DevTools → Application → Local Storage check `mathPractice.mistakePatterns` has one entry with `incorrectCount: 1` (before finishing the session). (2) Answer I Got It Right on another question: no new entry. (3) Miss the same fact again (or its swapped form for × / +), e.g. in a later Level 1 session: still one entry, `incorrectCount: 2`, newer `lastIncorrectAt`. (4) Reload the page and miss it again: `incorrectCount: 3`. (5) Edit one entry by hand to something invalid (e.g. `"incorrectCount": -1`), reload, miss a question: the app works, the broken entry is gone, the others stay. (6) Reset Statistics keeps the entries; Clear All Application Data removes them.

**Problems / open issues:**
- No visible UI yet: patterns are only in localStorage until Phase 14 (review mode) and Phase 15 (mistake statistics).
- Not covered by DECISIONS (chose the conservative option): a pattern updated by a repeat mistake keeps its first `correctAnswer` along with its first operands (the same fact, so the answer is the same). The pattern follows the child's self-reported result (DECISIONS 3.2), so choosing the right answer but pressing I Got It Wrong still creates a pattern.
- Phase 14 must count correct review answers toward mastery (`similarCorrectCount`, threshold from Settings) and send wrong review answers through `addMistake`/`recordMistake`, which already applies DECISIONS 2.2.

### [2026-10-21 22:30] Phase 13: Similar Question Generation
**My prompt:**
Implement Phase 13 (tasks 54–57) with generateSimilarQuestion(pattern) as in spec section 19.

Use the spec's example as a test: from a missed 8 × 7, the generator should be able to
produce questions like 7 × 8, 8 × 6, 9 × 7, 56 ÷ 7, and 56 ÷ 8. Test every operation
and level: results stay within the pattern's difficulty, subtraction and division stay
valid, reversed subtraction/division are never treated as equivalent, every question
passes validateQuestion with source "mistake-review" and the pattern ID attached.

**What you did:**
- Run by a Claude Code subagent using the Phase 13 prompt from PROMPTS.md (not manually tested by me before commit).
- Already there: difficulty ranges (`difficultyRanges.ts`), `buildChoices`, `validateQuestion`, `isSameQuestion`, the `MistakePattern` type. Missing: everything in tasks 54–57.
- New `src/services/similarQuestionGenerator.ts` with `generateSimilarQuestion(pattern, previous?)`. Three strategies: **nearby** (one operand ±1 or ±2; for division the quotient or divisor changes by ±1/±2 so the answer stays whole), **reversed** (addition and multiplication only), **fact family** (× → ÷ with both factors as divisor, ÷ → ×, + → −, − → +). Every candidate is built at the pattern's level and kept only if `validateQuestion` passes, so all results stay inside that level's ranges (e.g. 144 ÷ 12 at Level 3 never becomes 12 × 12, which is not a Level 3 multiplication). A random strategy with at least one valid candidate is chosen, then a random candidate.
- The exact missed question (same operation and operands in the same order) is never returned. The optional `previous` question is excluded using `isSameQuestion` (DECISIONS 7/2.4) so Phase 14 can avoid showing the same review question twice in a row. If no candidate is valid, it falls back to `generateQuestion(pattern.operation, pattern.difficulty)`, regenerated to avoid the pattern and `previous`. Results get `source: 'mistake-review'` and `mistakePatternId: pattern.id`.
- `src/services/questionGenerator.ts`: extracted an exported `createQuestion(operation, first, second, difficulty)` from the private `buildQuestion` (no behaviour change) so the similar generator reuses the same display text and `buildChoices`.
- New `src/services/similarQuestionGenerator.test.ts` (8 tests, seeded randomness). Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`. No UI changed, so no screenshots.

**Verification:**
- First run of the new tests: 1 failed because of a mistake in the test (it assumed a question made from 5 × 5 was always a multiplication, but 25 ÷ 5 from the fact family is correct). Fixed the test to check each operation's limits; the generator was not changed.
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 31 files, 336/336 passed (328 before, 8 new). Covers: from 8 × 7 (Levels 2 and 3) it produces 7 × 8, 8 × 6, 9 × 7, 56 ÷ 7 and 56 ÷ 8, never 8 × 7; addition gives nearby, reversed and subtraction questions; subtraction gives addition and never 4 − 9 from 9 − 4; division gives multiplication and never 8 ÷ 56 from 56 ÷ 8; Level 1 limits hold for 10 + 10, 5 × 5 and 25 ÷ 5; for all 4 operations × 4 levels × 30 patterns × 10 questions, every question passes `validateQuestion`, keeps the level, has source `mistake-review` and the pattern ID, and is never the exact missed question; 200 questions in a row never repeat `previous`; a pattern with no valid similar question (20 × 20 at Level 1) falls back to a valid Level 1 multiplication.
- `npm run build`: pass (JS 359.95 kB, 111.42 kB gzip; the new service is not imported by the app yet).
- TODO: all 19 Phase 13 items checked, plus task 79 "Test similar-question generation".
- Manual checklist for you: nothing visible yet. Review mode arrives in Phase 14; then check that review questions look related to the facts you missed (e.g. after missing 8 × 7: 7 × 8, 8 × 6, 56 ÷ 8) and that the same question never appears twice in a row.

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): "nearby" means one operand changes by 1 or 2 (no larger jumps at Levels 3–4); all three strategies are equally likely when each has a valid candidate; avoiding `previous` uses the commutative `isSameQuestion` rule, so after 7 × 8 the next review question will not be 8 × 7.
- The fallback retries up to `MAX_GENERATION_ATTEMPTS` (20) to avoid the pattern and `previous`; in practice a valid similar candidate always exists for patterns that fit their level, so the fallback only runs for patterns whose stored level no longer fits their numbers.
- Phase 14 must pick patterns by priority, pass the last review question as `previous`, and update mastery progress (the spec lists that under this service, but it belongs with review answers in Phase 14).

### [2026-10-21 22:42] Phase 14: Mistake Review Mode
**My prompt:**
Implement Phase 14 (tasks 58–62). Use the mastery threshold from Settings and DECISIONS.md
for what happens on a wrong review answer.

This exact scenario must work, as an integration test AND in the browser:
1. Start a regular session, answer one question wrong, mark I Got It Wrong, finish.
2. On the summary page, Practice Mistakes is ENABLED and starts a review session.
3. The review question is similar to (not identical to) the missed one.
4. After [threshold] correct similar answers the pattern is mastered and excluded from review.
5. A later mistake on the same fact reactivates it.
Also test prioritization (frequent, recent, and less-reviewed patterns first).
Explain the data flow from the wrong-answer click to the enabled button.

**What you did:**
- Run by a Claude Code subagent using the Phase 14 prompt from PROMPTS.md (not manually tested by me before commit).
- Already there: pattern creation/matching (`addMistake`, `recordMistake`), `generateSimilarQuestion(pattern, previous)`, the `masteryThreshold` setting, the mistake-review count on the summary, and reactivation of a mastered pattern by a regular mistake. Missing: everything else in tasks 58–62.
- `src/services/mistakeService.ts`: `applyMasteryThreshold` / `loadMistakePatterns(threshold)` (DECISIONS 2.3: patterns at or above a lowered threshold become mastered when patterns load; raising it never un-masters), `activePatterns`, pure `rankPatterns(patterns, now, random)` (score = incorrectCount − similarCorrectCount + recency bonus: +2 if missed in the last day, +1 in the last week; equal scores ordered by injected randomness), `nextReviewPattern(queue, patterns, afterId)` (repeats the queue in priority order, skips mastered patterns), and `applyReviewAnswer` (DECISIONS 2.2/2.3: updates the SOURCE pattern by `mistakePatternId`. Correct: similarCorrectCount + 1, mastered at the Settings threshold. Wrong: incorrectCount + 1, lastIncorrectAt updated, similarCorrectCount 0, mastered false. Never matched by fact, so a wrong 56 ÷ 8 from pattern 8 × 7 updates 8 × 7 and creates no division pattern).
- `src/hooks/usePracticeSession.ts` + `src/app/practiceSession.ts`: new `startReviewSession(sessionLength)` ranks the active patterns into a `reviewQueue` kept in session state (null for regular sessions). Each review answer updates the source pattern and saves it right away; the next question comes from the next still-active pattern in the queue via `generateSimilarQuestion(pattern, previousQuestion)`, so the same question never appears twice in a row. If every pattern becomes mastered mid-session, the session ends early. Regular answers keep the Phase 12 fact-matching path; correct regular answers never count toward mastery. Review attempts are saved with source `mistake-review`, so they count in overall/per-operation/per-level statistics and in the summary's "Mistake-review questions".
- Setup (new `src/components/setup/ModeSelector.tsx`, `PracticeSetupPage.tsx`, `OperationSelector.tsx`, `DifficultySelector.tsx`, `ChoiceTile.css`, `utils/labels.ts`): new "How do you want to practice?" choice: Regular practice / Practice my mistakes with the active pattern count ("3 facts to practice"). Review is disabled with an explanation when there are no active patterns. In review mode the math and level choices are disabled (dashed, faded) with "Mistake practice picks the math and level for you, from the cards you marked wrong."; Start Session is enabled only with at least 1 active pattern; the session length still applies. The practice page shows "Practicing: My mistakes" in review sessions.
- Summary (`SessionSummaryPage.tsx`, `SessionSummary.tsx`): Practice Mistakes is enabled when active patterns exist and starts a review session with the finished session's length (continuous stays continuous); otherwise it is disabled with "No mistakes to practice right now. Nice work!". A review session's summary shows "Practice: My mistakes" and "Up to Level N". Practice Again after a review session starts another review (or goes to setup if nothing is left).
- Data flow, wrong-answer click → enabled button: I Got It Wrong → `QuestionCard` `onResult` → `usePracticeSession.recordResult` builds the attempt → (regular question) `recordMistake(attempt)` → `addMistake` creates or updates the pattern → `writeData('mistakePatterns', …)` saves it to localStorage at once (a review question instead goes `applyReviewAnswer` on its source pattern → `saveMistakePatterns`) → the last answer finishes the session in the reducer → `PracticePage` redirects to `/practice/summary` → `SessionSummaryPage` renders and reads `loadMistakePatterns(settings.masteryThreshold)` → `activePatterns(...).length > 0` → Practice Mistakes enabled → click → `startReviewSession` → `/practice/session`.
- Tests: new `src/pages/MistakeReview.test.tsx` (the exact 5-step scenario through the real UI), new `src/hooks/usePracticeSession.review.test.tsx` (8), 19 new in `mistakeService.test.ts` (threshold, prioritization incl. ties, queue, review answers), 4 new setup tests, 3 summary page tests (replacing the old "disabled, coming soon" test), 1 new `SessionSummary` test. Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`; screenshots via `vite preview` with a temporary seeding/driving page in `dist/` (deleted afterwards).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 33 files, 370/370 passed (336 before, 34 new). First full run: 1 failure, the new end-to-end scenario timed out at the default 5 s during the parallel run (it passed alone in about 4 s). Gave it a 20 s timeout (as `PracticePage.test.tsx` does for its long test) and the long "Practice Again after a review" test 15 s; two full runs then passed. No app code changed for that. Also expected: the old "Practice Mistakes disabled, coming soon" test failed and was replaced.
- The scenario test covers: (1) regular session with 8 × 7 marked wrong, pattern saved at click time; (2) Practice Mistakes enabled on the summary and starts a review session; (3) each review question is not 8 × 7 and shares a number with 8, 7 or 56; (4) after 3 (the default threshold from Settings) correct review answers the pattern is mastered, the review session ends, Practice Mistakes is disabled and the setup review option is disabled; (5) missing 7 × 8 later reactivates the same pattern (incorrectCount 2, progress 0) and Practice Mistakes is enabled again. Hook tests also cover a threshold of 2 read from Settings, the wrong 56 ÷ 8 review case, mixing two patterns A, B, A, B…, no back-to-back repeats over 20 questions, and statistics counting review attempts.
- `npm run build`: pass (JS 365.03 kB, 112.83 kB gzip).
- Screenshots (375 px and 1280 px): setup in review mode shows the mode choice with "3 facts to practice" and the math/level tiles dashed and faded with the explanation; the summary shows Practice Mistakes enabled. No overflow at 375 px. (The first attempt with a file:// page of iframes rendered blank frames; opening the helper page on the preview origin directly worked.)
- TODO: all Phase 14 items checked (task 62's reactivation item was already checked), plus task 79 "Test mastery rules" and task 81 "Test mistake-review generation" and "Test mastery completion".
- Manual checklist for you: (1) `npm run dev`, Start Practice: "Practice my mistakes" is disabled with the explanation. (2) Play a regular session, mark one card I Got It Wrong, finish: Practice Mistakes is enabled; click it: "Practicing: My mistakes" and a related question (after 8 × 7: e.g. 7 × 8, 8 × 6, 56 ÷ 8), never the same question twice in a row. (3) Answer 3 review cards I Got It Right (or your threshold): the review ends and Practice Mistakes is disabled. (4) Miss the same fact again later: review is available again. (5) In setup, choose Practice my mistakes: the math and level choices are greyed with the explanation and the count matches. (6) In Settings lower the threshold to 1 when a pattern has 1 correct review: it no longer counts as active. (7) Try it at phone width and with only the keyboard.

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): Practice Mistakes uses the finished session's length; a review session that runs out of active patterns (all mastered) ends early; the setup mode choice is local to the setup page and resets to Regular when you come back; Practice Again after a review session starts another review (or goes to setup if nothing is left); a review answer whose source pattern was deleted (e.g. Clear All mid-session) changes nothing.
- The prioritization weights (recency +2 within a day, +1 within a week; each review success cancels one miss) are my choice; the spec only says frequent, recent and less-reviewed first.
- A review session's stored `PracticeSession` has no mode field (the spec's data model has none): `operations` are the reviewed patterns' operations and `difficulty` is the highest pattern level, so Recent Sessions shows it like a regular session. Fact-family questions (e.g. 56 ÷ 8 from 8 × 7) are not listed in the session's operations, but each attempt is counted under its real operation in statistics.
- The setup page reads the active pattern count once when it opens. Not tested by hand in a real browser (only headless screenshots).
- Phase 15 should show active/mastered patterns and "similar questions practiced" (attempts with source `mistake-review`).

### [2026-10-21 22:51] Phase 15: Advanced Statistics
**My prompt:**
Implement Phase 15 (tasks 63–65) on the statistics page. Handle ties in "most frequently
missed" sensibly and add empty states. Recheck the statistics layout at 375px, 768px,
and 1280px so nothing overflows.

**What you did:**
- Run by a Claude Code subagent using the Phase 15 prompt from PROMPTS.md (not manually tested by me before commit).
- Already there: pattern loading with the Settings mastery threshold (`loadMistakePatterns`), `activePatterns`, review attempts saved with source `mistake-review`, the statistics page with overview/operation/level/recent-session sections. Missing: everything in tasks 63–65.
- New `src/components/statistics/MistakeStatistics.tsx` ("Mistake practice" section on the statistics page, between "By level" and "Recent sessions"; always shown because patterns survive Reset): counts for Facts to practice, Facts mastered, Similar questions practiced, Review questions answered correctly; "Most missed type of math"; "Most missed facts" (top 5); "Facts to practice" cards with times missed, progress as text ("1 of 3 similar questions right in a row", plus a decorative progress bar hidden from screen readers) and last missed date; a collapsible "Mastered facts (N)" `<details>` section. Facts read as "8 times 7 equals 56" for screen readers. Empty states: no patterns at all, every fact mastered, nothing mastered yet.
- `src/services/mistakeService.ts`: `sortByIncorrectCount` (incorrect count desc, then most recently missed), `mostMissedFacts(patterns, 5)`, `mostMissedOperations` (sums `incorrectCount` per operation over all patterns, active and mastered; returns every operation tied for the most, shown as e.g. "Multiplication and Division (missed 3 times each)").
- Review counts: new optional `mistakeReview?: OperationStatistics` on `AppStatistics` (`src/types/statistics.ts`), updated by `addAttemptToStatistics` for `mistake-review` attempts; `createEmptyStatistics` includes it; `storageService` validates it when present; `loadStatistics` fills it from saved review attempts for totals stored before it existed. `src/hooks/useStatistics.ts` also loads patterns with `settings.masteryThreshold`.
- Tests: 5 in `mistakeService.test.ts`, 2 in `statisticsService.test.ts`, 1 in `storageService.test.ts`, 9 new + 1 extended in `StatisticsPage.test.tsx`. Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run` (several runs), `npm run build`; screenshots via `vite preview` with a temporary seeding page in `dist/` (deleted afterwards).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 33 files, 387/387 passed (370 before, 17 new). First service run: 1 failure from a mistake in my test data (division and multiplication accidentally tied at 6); fixed the test data, not the code. One of five full runs (the second, after the final CSS change) had 1 failed test (I did not capture which one; most likely a timing-sensitive long UI test under load, as in Phase 14); the next three full runs all passed 387/387.
- `npm run build`: pass (JS 369.70 kB, 113.74 kB gzip).
- Layout: seeded 30 attempts, a session and 7 patterns (including 984 ÷ 24 and 1000 − 999), opened the mastered section, and measured each iframe: at 375, 768 and 1280 px the document scroll width equals the viewport width and no element extends past the right edge. Screenshots: 1 column of cards at 375 px, 2 at 768 and 1280; labels and values don't overlap; recent sessions readable.
- TODO: all Phase 15 items checked; also task 72 "Optimize Statistics Layout" (all 4 items) based on these width checks and screenshots (the page uses cards, not tables, at every width).
- Manual checklist for you: (1) `npm run dev`, open Statistics with no data: "Mistake practice" shows zeros and "No mistakes to practice right now…". (2) Play a session and mark 2–3 cards I Got It Wrong: they appear under Facts to practice with "Missed 1 time", "0 of 3 …" and today's date. (3) Practice Mistakes and answer review cards right: Similar questions practiced / Review questions answered correctly go up; after 3 in a row the fact moves to "Mastered facts". (4) Open/close "Mastered facts" with the keyboard (Tab, Enter). (5) Miss one multiplication and one division fact the same number of times: "Multiplication and Division" appears. (6) Reset Statistics: the review counts go to 0, the facts stay. (7) Check the page on a phone and with a screen reader.

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): "Similar questions practiced" and "Review questions answered correctly" come from the new optional aggregate field `mistakeReview` rather than from attempts, so they survive Phase 21's attempt trimming; Reset Statistics clears them with the other statistics (DECISIONS 3.1), while patterns stay. The spec's `AppStatistics` fields are unchanged.
- "Most missed type of math" uses mistake-pattern `incorrectCount` sums (all patterns, including mastered), not per-operation statistics, so it survives Reset. A wrong fact-family review answer (e.g. 56 ÷ 8 from 8 × 7) counts toward the source pattern's operation (multiplication), as in Phase 14.
- Most missed facts include mastered facts (marked "Mastered!"); ties are ordered by most recently missed, and facts tied at the 5th place beyond the limit are not shown.
- The statistics page reads patterns once when it opens. The flaky test noted above was not identified.

### [2026-10-21 23:02] Phase 16: Accessibility
**My prompt:**
Implement Phase 16 (tasks 66–69). Add number keys 1–4 for answers (not while typing in
an input), visible focus indicators, and a live region that announces the revealed
answer and progress. Make sure selected and right/wrong states use text or icons, not
color alone.

Add an automated accessibility check (e.g. axe) to the component tests and fix what it
finds. Then give me a manual checklist for things only I can test: a full session using
only the keyboard, a screen reader (VoiceOver or NVDA), 200% zoom, and reduced motion.
Leave those TODO items unchecked until I confirm.

**What you did:**
- Run by a Claude Code subagent using the Phase 16 prompt from PROMPTS.md (not manually tested by me before commit).
- Already there: `:focus-visible` outlines (purple on the page, yellow in the header), skip link, real inputs with a ✓ in setup/settings tiles, ✓ and `aria-pressed` on the selected answer, labelled answer buttons, ProgressBar ARIA values, ConfirmDialog focus trap, `usePrefersReducedMotion` + the card animation setting, focus moved to the card back heading on flip. Missing: number keys, a question/answer live region, an automated checker, and a focus ring on the new card.
- Number keys (`src/components/practice/CardFront.tsx`, `AnswerChoice.tsx`): 1–4 select the matching answer and focus it while the card front is showing and not flipped. Ignored with Ctrl/Alt/Meta/Shift, when focus is in an input/textarea/select/contenteditable, and while a modal dialog (`aria-modal="true"`) is open. Answer buttons have `aria-keyshortcuts`.
- One live region (`src/pages/PracticePage.tsx`, visually hidden `role="status"`): announces "Great job! Question 3 of 10: What is 7 times 8?" for each new question (including the first, added 100 ms after the page appears because a live region only announces changes) and "Correct answer: 56. Your answer: 54." when the card is flipped (new `onReveal` callback on `QuestionCard`). The visible "Great job! Here is question N." line is now plain text, so two regions never say the same thing. The focused card wrapper is now a group named "Question N" and shows the focus ring when reached by keyboard (`PracticePage.css`).
- Contrast: recomputed every color added since Phase 2. The header nav hover (white on 18% white over blue, 4.42:1) and pressed (3.43:1) backgrounds were under 4.5:1; changed to `--color-primary-hover` (9.04:1) and `#142f80` (12.01:1) in `Navigation.css`. All others pass: text on the selected tint `#eaf0ff` 13.02, muted text on the tint 6.78, text on the notice `#fff1c7` 13.20, white on purple 7.11, focus ring on page/white/tint 6.71/7.11/6.23, header focus ring on blue 4.16 (UI, needs 3), selected border on white 6.40.
- Automated check: `axe-core` 4.14.0 (MPL-2.0, compatible; released 2026-10-05) added with `npm install --save-exact -D`. Helper `src/test/axe.ts` disables the `color-contrast` rule because jsdom cannot compute colors (contrast was computed instead). New `src/app/Accessibility.test.tsx` runs axe on every route (home, setup, session redirect, summary, statistics, settings, 404) and these states: setup in review mode, card front with a key-picked answer, flipped card animated and with animation off, end-session dialog, summary after a session, statistics with data + mastered list open + reset dialog, settings with the clear-data dialog; plus a test that the helper really reports a missing button name. axe found no violations in the app, so nothing needed fixing there.
- Tests: 15 axe tests, 5 number-key tests in `QuestionCard.test.tsx`, 3 in `PracticePage.test.tsx` (live region content, keys ignored while the dialog is open, a full 5-question session using only Tab/Space/Enter); 2 existing status assertions updated to the new wording. Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run` (twice), `npm run build`, `vite preview` + a headless Chrome screenshot with a temporary page in `dist/` (deleted).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 34 files, 410/410 passed (387 before, 23 new), on two full runs. The first version of the helper self-test failed because it expected exactly one violation and axe also reported a missing document title in that bare render; changed it to "contains button-name". axe makes jsdom print "HTMLCanvasElement getContext() not implemented"; harmless.
- `npm run build`: pass (JS 370.83 kB, 114.15 kB gzip).
- Screenshot: setup → Start Session → key "2" selected the second answer (✓ shown); Settings shows the purple focus ring around the focused Sound effects tile. Only one iframe can hold focus, so the answer button's own ring was not captured.
- TODO: checked 66 (focus indicators, Enter/Space, number keys, text inputs), all of 67, 68 detect/disable, 69 contrast/color alone/selected states, plus task 20 "Add hover and focus states", task 30 "Make progress accessible to screen readers" and task 82 "Run an automated accessibility checker". Left unchecked: 66 "every control reachable with Tab" (only the practice flow is automated), 68 "Keep state changes visually clear", 69 200% zoom and larger fonts, and task 82's manual items.
- Manual checklist for you:
  1. Keyboard only (`npm run dev`, no mouse): Tab to Start Practice → on setup choose with Tab/arrows/Space → Start Session; on each card press 1–4 (the answer gets a ✓ and a purple ring), Tab to Flip Card, Enter; on the back Tab to I Got It Right/Wrong, Enter; finish and use the summary buttons. Check you can always see where focus is and that nothing on Statistics and Settings is unreachable (including "Mastered facts" and both dialogs; Escape closes them).
  2. In a continuous session open End Session and press 1–4: nothing changes behind the dialog.
  3. Screen reader (NVDA + Chrome/Firefox, or VoiceOver + Safari): starting a session reads "Question 1 of N: What is …?"; flipping reads the back heading and "Correct answer: X. Your answer: Y."; after I Got It Right it reads "Great job! Question 2 of N: …". Check each thing is read once, not twice, and that answer buttons say e.g. "Answer 9, toggle button, pressed".
  4. 200% browser zoom (Ctrl/Cmd +) and a larger system/browser font size: every page still fits without sideways scrolling and text doesn't overlap.
  5. Reduced motion (Windows: Settings → Accessibility → Visual effects → Animation effects off; macOS: Reduce motion): the card switches to the back instantly, it's still obvious which side you're on, and the selected answer is still clear.

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): the card back still shows only "Correct answer" and "Your answer" as text with no right/wrong verdict or color (DECISIONS 3.2: the child self-reports); number keys also move focus to the chosen answer so screen readers hear what was picked; no visible "press 1–4" hint was added (the existing hint is unchanged; `aria-keyshortcuts` exposes the keys to assistive tech).
- The focused card wrapper ("Question N" group) and the live region both mention "Question N"; whether a screen reader says that once or twice needs your check (item 3). The 100 ms delay before the first announcement is a heuristic.
- jsdom can't compute color contrast, so axe's `color-contrast` rule is off; contrast was computed by script. Card and tile borders (`#e6dcc3` on white) are decorative (each control is identified by its text), so they were not held to 3:1.
- Not tested by hand in a real browser (only headless screenshots).

### [2026-10-21 23:14] Phase 17: Responsive Design and Polish
**My prompt:**
Implement Phase 17 (tasks 70–73). Check every page at 375px, 768px (portrait and
landscape), and 1280px. No horizontal scrolling; answer choices stack on small screens;
statistics tables become cards.

Feedback messages ("Great job!", "Keep practicing!") must stay visible long enough for
a 7-year-old to read (at least ~2.5 seconds or until the next card), never shame, and be
switchable off. List the files you changed.

**What you did:**
- Run by a Claude Code subagent using the Phase 17 prompt from PROMPTS.md (not manually tested by me before commit).
- Already there: answer choices stack into one column below 480 px (Phase 5 CSS), centered card with a 640 px max width, 48 px+ targets (nav links 48, buttons 48/64, tiles 64, answers 72), statistics as cards at every width (task 72, checked in Phase 15), one fixed feedback line per result. Missing: compact phone navigation, varied feedback, an off switch.
- Navigation (`Navigation.css`): below 640 px the four links sit in one evenly spaced row under the title (4 equal columns, 1rem text, still 48 px tall) instead of wrapping into a ragged second row. No menu button, so nothing extra to open and every link stays one Tab away; axe checks still pass.
- Feedback: new `src/utils/feedback.ts` with 5 positive messages ("Great job!", "Nice work!", "You got it!", "Super thinking!", "Way to go!") and 5 supportive ones ("Thanks for being honest! You are improving.", "Keep practicing! You are getting better.", "Good try! Every mistake helps you learn.", "Nice effort! You will get it next time.", "You are improving! Keep going."); `pickFeedback` picks one at random but never the same as the previous message. `PracticePage.tsx` picks the message when I Got It Right/Wrong is pressed; it is shown as plain text ("… Here is question N.") at the top of the new card's focused wrapper and is included in the existing single live region (no second live region). Timing: the message has no timer — it stays on screen for the whole time the child is on the next card (at least as long as they need to read it) and is only replaced when they report their next answer; the "Question N" wrapper got `scroll-margin-top` so the message stays visible when focus scrolls the new card into view on phones. If the child answers the next card in under 2.5 s, the newer message replaces the older one (both are about the latest answers).
- New setting `feedbackMessages: boolean` (default `true`) in `src/types/settings.ts` + `DEFAULT_SETTINGS`; `storageService.ts` validates it field by field, so settings saved before it existed load with messages on. Settings page: new "Cheering messages" toggle under "Sounds and cards". Off = no message line and no message in the announcement.
- Optional item done: focus on route change. `PageContainer.tsx` focuses `<main>` (with `preventScroll`) after in-app navigation, but not on the first page load; `AppLayout.tsx` adds React Router's `<ScrollRestoration />` so a new page starts at the top (before, finishing a session at the bottom of a long phone page opened the summary scrolled down past its heading). `src/test/setup.ts` stubs `window.scrollTo` because jsdom has none.
- Files changed: `src/utils/feedback.ts` (new), `src/utils/feedback.test.ts` (new), `src/types/settings.ts`, `src/services/storageService.ts`, `src/services/storageService.test.ts`, `src/pages/PracticePage.tsx`, `src/pages/PracticePage.css`, `src/pages/PracticePage.test.tsx`, `src/pages/SettingsPage.tsx`, `src/pages/SettingsPage.test.tsx`, `src/components/layout/Navigation.css`, `src/components/layout/PageContainer.tsx`, `src/components/layout/AppLayout.tsx`, `src/app/AppRoutes.test.tsx`, `src/test/setup.ts`, `math-practice-todo-list.md`, `AI_LOG.md`. Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run` (3 full runs), `npm run build`, `vite preview` + headless Chrome with a temporary seeding/driver page in `dist/` (deleted).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 35 files, 418/418 passed (410 before, 8 new: 4 in `feedback.test.ts` — right/wrong lists, every message reachable, never repeats, no shaming words and at most 8 words; 1 storage test for old settings without the field / invalid value / saved `false`; 2 practice tests — with fake timers the message is still there after 2.5 s and after 60 s and after flipping the next card, then changes on the next answer; turned off shows no message line and a plain announcement; 1 route test for focus on navigation). Existing tests now match any message from the lists instead of the fixed "Great job!". First targeted run: 2 failures, both mine (a template-literal regex lost its backslashes; one message had 8 words against a 7-word test limit — raised the limit to 8). All 3 full runs passed.
- `npm run build`: pass (JS 374.83 kB, 115.41 kB gzip; +3.3 kB, mostly ScrollRestoration).
- Horizontal scrolling, measured in each iframe (`documentElement.scrollWidth` vs `clientWidth`, plus any element whose right edge passes the viewport) for home, setup, practice front (answer picked), practice back, practice with a feedback message, summary (5-question session played), statistics (60 seeded attempts, 6 sessions, 5 patterns incl. 984 ÷ 24, mastered list open) and settings: 375×667 → 375/375 on all 8; 768×1024 → 768/768; 1024×768 → 1024/1024; 1280×900 → 1280/1280; no overflowing elements anywhere. (Run with visible scrollbars, the tall pages gave e.g. 1009/1009 at 1024 — equal, the difference is just the vertical scrollbar.)
- Screenshots: at 375 the nav is one row of four links, answers stack in one column, the card fills the width, statistics/summary are stacked cards, and the feedback line sits right above the new card; at 768 portrait answers are 2×2 and the card is centered; at 1024×768 landscape the whole card front fits on screen and the back's I Got It buttons are just above the fold; 1280 unchanged.
- TODO: checked all of 70, 71 and 73 (72 was already checked). "Use large touch targets" is from the CSS min-heights above plus the screenshots, not a measurement on a device.
- Manual checklist for you: (1) On a real phone (or DevTools device mode at 375 px): every page scrolls only up and down; the header shows Home/Practice/Statistics/Settings in one row and each is easy to tap. (2) On a tablet in portrait and landscape: the card is centered and the answers and Flip/I Got It buttons are easy to reach. (3) Play a session: after I Got It Right you see a happy message above the next card, after I Got It Wrong a kind one; wait 5+ seconds — it stays; messages vary and the same one never shows twice in a row. (4) Settings → turn off "Cheering messages" → no message line during practice. (5) With the keyboard, click a header link and press Tab: focus goes into the new page's content, not back to the header. (6) With a screen reader: the message is read once with the next question.

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): the new `feedbackMessages` setting is not in the spec's `AppSettings` (needed for "Allow feedback effects to be disabled"); it is optional-in-storage only in the sense that old saved settings get the default. Labelled "Cheering messages" for children. It controls only the text messages; sounds keep their own setting and the session summary's own message is unchanged.
- Timing choice: no auto-hide timer at all (persistent until the next answer) rather than a 2.5 s fade, because a disappearing message would be a distraction; a newer message replaces an older one even if it was shown for less than 2.5 s.
- Focus on navigation goes to `<main>` (the existing skip-link target), not the `<h1>`; screen readers may read the whole main region's name rather than just the heading — please check with yours. Inside a session, focus still moves to the new card (Phase 16).
- On a 375×667 phone the first card's answers start below the fold (the choices summary, progress bar and reserved feedback line take the top); scrolling is vertical only. Not changed to keep the scope small.
- Real phones/tablets, rotation and touch were not tested (headless iframes only).

### [2026-10-21 23:25] Phase 18: Session Recovery and Navigation Safety
**My prompt:**
Implement Phase 18 (tasks 74–75).

Test: refreshing mid-session restores the same question, selection, and totals;
leaving via the header nav or browser close shows a confirmation; and there's no warning
after the session is complete. Note: React Router's navigation blocking needs a data
router (createBrowserRouter). Switch to it if needed and confirm all routes still work.

**What you did:**
- Run by a Claude Code subagent using the Phase 18 prompt from PROMPTS.md (not manually tested by me before commit).
- Router: no switch needed. `src/app/App.tsx` already uses `createBrowserRouter` + `RouterProvider` and tests use `createMemoryRouter` (both data routers), so `useBlocker` works as is; all existing route tests still pass.
- Persisting the session: the selected answer and flip state are now part of session state (`selectedAnswer`, `isCardFlipped` in `src/app/practiceSession.ts`, as in the spec's `AppState`), with new `selectAnswer`/`flipCard` actions that refuse a change after flipping and a flip without an answer. `QuestionCard` keeps its own state (so its double-submit guard and number keys are unchanged) but takes `initialSelectedAnswer`/`initialFlipped` and reports picks with `onSelect`. `AppProvider` restores the session on startup and saves it under the new key `mathPractice.activeSession` (new `ActiveSession` type in `src/types/state.ts`; `loadActiveSession`/`saveActiveSession` in `storageService.ts`) in the same click that records an answer, so a refresh can never bring back a question that was already counted. The key is removed when the session finishes or is ended, on Clear All Data (`clearAllData` now includes it), and if saving fails (so a stale copy is never restored). Loading checks every field (valid session with no `completedAt`, a valid question via `validateQuestion`, the answer is one of the choices, flipped only with an answer, totals = saved answers = question index, review queue present exactly for review questions) and also drops it if that question's answer is already saved; invalid data removes only this key, and the practice page then shows the existing "Let's get your cards ready!" redirect.
- Navigation safety (`src/pages/PracticePage.tsx`): `useBlocker` blocks any in-app move away from `/practice/session` (header links, links, browser Back) while the session is active, except to `/practice/summary` (where finishing and End Session go). It shows the existing `ConfirmDialog`: "Leave your practice session?" / "If you leave now, this session will end. Your answers so far are saved." with **Keep Practicing** (focused; Escape too) and **End Session and Leave** (ends and saves the session like End Session, then goes where the child clicked). A `beforeunload` listener is registered only while the session is active, so closing or refreshing the tab shows the browser's own generic warning; if the child refreshes anyway, the session is restored.
- Reset Statistics: if a restored session is still unfinished, the reset dialog adds "Your unfinished practice session will end too." and the reset discards that session without saving it (`useStatistics.ts`, `StatisticsPage.tsx`, new `discardSession` in `usePracticeSession.ts`).
- Tests: new `src/pages/PracticePage.recovery.test.tsx` (11: refresh restores question/selection/progress, then flip state and the live-region reveal, with no double counting of statistics, mistakes, attempts or the session record; a review session survives refresh; key cleared on finish; broken JSON and non-session data → friendly redirect, other keys untouched; header nav → dialog → Keep Practicing keeps card and selection; End Session and Leave → Statistics, session saved, no more warnings; browser Back blocked, Escape cancels; `beforeunload` prevented only while active; End Session goes to the summary without a warning; Reset Statistics ends a restored session). Added 5 reducer tests, 14 storage tests (round trip, null removes, 9 invalid shapes each dropping only this key, already-answered question, failed save removes the old copy), 1 axe test for the leave dialog. `SettingsPage.test.tsx` Clear All Data test adapted: it used `router.navigate` away from a running session, which is now blocked as intended; it now reopens the app on Settings with the session restored from storage and also checks that the new key is removed. Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `vite preview` + headless Chrome with a temporary page in `dist/` (deleted).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 36 files, 448/448 passed (418 before, 30 new). Retries: the first full run had 1 failure (the Clear All Data test, explained above); the first run of the new file had 1 failure in my own test (the live region fills in 100 ms after the page appears; switched to `waitFor`). Final full run all passed.
- `npm run build`: the first attempt failed type-checking in my new storage test (`it.each` table with `as const` gave TS7024); typed the table instead. Then pass (JS 378.76 kB, 116.46 kB gzip).
- Screenshot (375 and 1280 px iframes, with a saved active session in localStorage, then a click on the header's Statistics link): the restored card showed answer 12 still selected, and the leave dialog appeared centered with both buttons readable; at 375 px the dialog fits the width and the buttons stack.
- TODO: checked all of 74 and 75, plus task 81 "Test persistence after refresh".
- Manual checklist for you: (1) `npm run dev`, start a 10-question session, answer 2 cards, pick an answer on the 3rd, press F5 (the browser asks "Reload site?" — choose Reload): you're on question 3 with the same answer picked and 2 answered; flip, refresh again: the back of the card is shown. Check Statistics afterwards: exactly the answers you gave, nothing twice. (2) During a session click Home/Practice/Statistics/Settings in the header: "Leave your practice session?" appears; Keep Practicing keeps your card; End Session and Leave goes to that page and the session shows in Recent sessions. (3) Press the browser Back button during a session: same dialog. (4) Close the tab during a session: the browser asks; after the last card, or after End Session, closing/refreshing/navigating gives no warning. (5) Try it in Safari and Firefox too (each shows its own wording for the close warning).

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): leaving through the dialog **ends** the session (saved if it has at least one answer, otherwise not, per DECISIONS 3.3) instead of pausing it, so there is never a forgotten half-finished session that could continue after statistics change. Refresh and tab close are different: the session is kept and restored.
- Reset Statistics while an unfinished session is saved (only possible if the app was closed mid-session and reopened on another page) ends that session without saving it, and the dialog says so.
- The setup page's choices are not saved; the running session stores its own operations, level and length, which is all it needs. The cheering message above the card is not restored after a refresh (it is only about the previous answer).
- If the app is reopened on another page with an unfinished session saved, nothing on Home points to it; going to `/practice/session` (or the summary page's Keep Practicing) continues it, and starting a new session replaces it. A "Continue your session" button could be added later.
- Browsers don't let pages customize the close/refresh warning text, and jsdom can't show it, so only `preventDefault` on the event was tested. Real-browser behavior needs your check (item 4).

### [2026-10-21 23:32] Phase 19: Error Handling
**My prompt:** Implement Phase 19 (tasks 76–78). Add an error boundary with a friendly message and a
Return Home button (no stack traces shown to children). Test each case in spec
section 16, including corrupted data in one storage category resetting only that
category, and a forced generation failure falling back to a valid question.

**What you did:**
- Run by a Claude Code subagent using the Phase 19 prompt from PROMPTS.md (not manually tested by me before commit).
- Audited spec 16 first. Already handled before this phase: per-key validation and reset (`storageService.ts`), the storage warning banner, the missing-session redirect, summary empty states, statistics rebuilt from attempts, duplicate-choice protection. Missing: generation had a retry limit but then **threw** (and a division operand failure was not retried), so a bad run would crash the page; there was no fallback question, no development logging and no error boundary.
- Question generation (`src/services/questionGenerator.ts`): `generateQuestion` still retries up to `MAX_GENERATION_ATTEMPTS` (20), now also counting a failing operand generator as a failed try; after the limit it logs the reason (development only) and returns `createFallbackQuestion`, a fixed fact that fits every level (3 + 4, 9 − 4, 3 × 4 or 12 × 3 at level 4, 6 ÷ 3) with normal distractors. Unsupported operations/levels still throw (programming errors). Review questions use the same fallback through `generateQuestion`. New `src/utils/logError.ts` (`logDevelopmentError`, logs only when `import.meta.env.DEV`).
- Error UI: new general `ErrorMessage` (`src/components/common/ErrorMessage.tsx`: heading, simple child-friendly message, **Return Home** button, never the error text), `ErrorPage` (`src/pages/ErrorPage.tsx`) set as `errorElement` on the root route in `AppRoutes.tsx` (Return Home navigates to `/`, which clears the route error), and a class `ErrorBoundary` (`src/components/common/ErrorBoundary.tsx`) around `AppProvider` in `App.tsx` for errors outside the router (Return Home there reloads `/`, so state is re-read from validated storage). `main.tsx` passes `onCaughtError`/`onUncaughtError` to `createRoot` and `App.tsx` passes `onError` to `RouterProvider`, so details go to `console.error` once and only in development (React and React Router would otherwise log in production too).
- Tests: rewrote `questionGenerator.retry.test.ts` (forced `validateQuestion` failure for all 4 operations × 4 levels falls back to a question that passes the real validator; dev log checked; fallback always valid; unsupported input still rejected; review question fallback); new `src/app/StorageRecovery.test.tsx` (each of the 5 categories corrupted in turn: the app opens Statistics, that category is reset (statistics are rebuilt from attempts), the other 4 keys are byte-for-byte unchanged — stored with indentation so any rewrite would show); new `src/pages/ErrorPage.test.tsx` (mocked Statistics page throws: friendly page, no error text/stack, title set, Return Home shows Home with the header, page works again later); new `src/components/common/ErrorBoundary.test.tsx`. Expected `console.error` noise is silenced with spies.
- Spec 16 coverage:

| Spec 16 case | Where handled | Test |
|---|---|---|
| Invalid locally stored data | `storageService.ts` `readData`/parsers (settings field by field, lists drop bad records) | `storageService.test.ts` "corrupted %s / resets only that key", "recovers invalid settings field by field", "keeps the valid records of a list"; new `StorageRecovery.test.tsx` |
| Missing session data | `PracticePage.tsx` redirect; `SessionSummaryPage.tsx` empty state; `loadActiveSession` drops invalid saved sessions | `PracticePage.test.tsx` "redirects to setup with a friendly message…"; `SessionSummaryPage.test.tsx` "shows a friendly message when opened with no session"; `PracticePage.recovery.test.tsx` broken JSON / non-session data |
| Question-generation failures | `questionGenerator.ts` retry limit + `createFallbackQuestion` + dev log; `similarQuestionGenerator.ts` falls back to `generateQuestion` | `questionGenerator.retry.test.ts` (all) |
| Duplicate answer choices | `distractors.ts` (Set + safe fallback); `validateQuestion` rejects duplicates | `distractors.test.ts` "four unique non-negative whole choices…"; `validation.test.ts` "requires exactly four unique choices…" |
| Unsupported or full storage | `storageService.ts` (never throws) + `StorageWarning.tsx` | `storageService.test.ts` "when storage fails"; `PracticePage.storage.test.tsx` "when storage throws" (3 tests) |
| Corrupted statistics | `statisticsService.ts` `loadStatistics` rebuilds from attempts | `statisticsService.test.ts` "rebuilds corrupted totals…"; `StatisticsPage.test.tsx` "rebuilds the totals…"; `StorageRecovery.test.tsx` "statistics" case |
| Unexpected navigation to the practice page | `PracticePage.tsx` redirect to setup with notice | `PracticePage.test.tsx` "redirects to setup…" |
| (Any other render error) | `ErrorPage` errorElement + `ErrorBoundary` | `ErrorPage.test.tsx`, `ErrorBoundary.test.tsx` |

- Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`; screenshots with a temporary `/crash` route added to `AppRoutes.tsx`, built, served with `vite preview`, then reverted and rebuilt (the rebuilt bundle hash matched the pre-change build).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 39 files, 493/493 passed (448 before; 45 new: 34 more in the retry file, 5 storage recovery, 3 error page, 3 error boundary). All passed on the first full run.
- `npm run build`: pass (JS 379.95 kB, 116.81 kB gzip).
- Screenshot (375 and 1280 px iframes, temporary crash route): "Oops! Something Went Wrong", the message and a large blue Return Home button inside the dashed card; no error text; at 375 px the heading wraps to two lines and nothing overflows.
- TODO: checked all items of tasks 76, 77 and 78.
- Manual checklist for you: (1) To see the error page, temporarily add a route that throws (e.g. in `AppRoutes.tsx`: `{ path: 'crash', Component: () => { throw new Error('x'); } }`), run `npm run dev`, open `/crash`: friendly page, no stack trace on screen; the details appear in the browser console (dev only). Click Return Home: Home with the header. Remove the route afterwards. (2) With `npm run build && npm run preview` the same page shows nothing in the console. (3) In DevTools > Application > Local Storage, change `mathPractice.sessions` to `oops` and reload Statistics: the page works, Recent sessions is empty, your totals and mistakes are still there. (4) Open `/practice/session` directly: you're sent to setup with "Let's get your cards ready!".

**Problems / open issues:**
- Not covered by DECISIONS (chose the conservative option): the fallback questions are fixed, easy facts (e.g. 3 + 4) so they are valid at every level; they only appear if generation fails 20 times in a row, which the tests show never happens with the real generator. If the fallback repeats, the "no immediate repeat" rule (DECISIONS 7) may be broken in that extreme case.
- The route error page replaces the whole layout (it is the root route's `errorElement`), so the header is not shown on it; Return Home is the way out. Route Return Home navigates inside the app instead of reloading; if the crash was caused by in-memory state, the outer boundary's reload is not used. The outer boundary's reload (`window.location.assign`) can't run in jsdom, so only its reset/handler call was tested.
- The storage banner and the missing-session notice were already simple and are inline (not blocking), so they keep their own components instead of `ErrorMessage`.
- The "Not implemented: HTMLCanvasElement's getContext()" lines in the test output come from axe in existing tests and are not failures.

### [2026-10-22 10:30] Phase 20: Testing
**My prompt:** Implement Phase 20 (tasks 79–82). First produce a gap analysis: every test listed in spec
section 20 and TODO tasks 79–81 → does a test exist (file name) or is it missing?
Then write the missing tests, including the 8-step integration test in spec section 20.
Run a coverage report and summarize it.

Finally, produce a table of the 16 acceptance criteria in spec section 25:
criterion | met? | how verified. Be honest about anything partial.
Task 82 items that need a human stay unchecked for me.

**What you did:**
- Run by a Claude Code subagent using the Phase 20 prompt from PROMPTS.md (not manually tested by me before commit).
- Gap analysis (grep over all 39 test files, then read the relevant tests). Only three real gaps existed: the 8-step flow as **one** UI test (`MistakeReview.test.tsx` covers steps 1–4 and 6–8 but never checks statistics), a mixed-operation session through the UI, and a full addition session through the UI. Everything else already had tests:

| Spec 20 / TODO 79–81 item | Test file → test |
|---|---|
| Arithmetic generation (all generators) | `questionGenerator.test.ts` → "level %i" × 4 operations, "generateQuestionFromOperations" |
| Difficulty boundaries | `questionGenerator.test.ts` → per-level range tests; `validation.test.ts` → "rejects a question outside its difficulty level", "allows a 0 factor only at levels that allow it" |
| Distractors and choice uniqueness / duplicate distractors | `distractors.test.ts` → "edge cases near zero", "three valid distractors…", "falls back safely…"; `validation.test.ts` → "requires exactly four unique choices…" |
| Similar-question generation | `similarQuestionGenerator.test.ts` (8 tests) |
| Statistics and accuracy | `statisticsService.test.ts`; `math.test.ts` → "calculateAccuracy" |
| Mastery rules | `mistakeService.test.ts` → "applyReviewAnswer", "mastery threshold"; `usePracticeSession.review.test.tsx` |
| Storage serialization and validation | `storageService.test.ts` → "reads back valid %s exactly as written", "corrupted %s", record-level validation tests |
| Operation and difficulty selection | `PracticeSetupPage.test.tsx` (14 tests) |
| Answer selection / flip / card front and back | `QuestionCard.test.tsx` → "QuestionCard front", "QuestionCard back", "QuestionCard flipping" |
| Correct/incorrect buttons | `QuestionCard.test.tsx` → back tests, "ignores a fast double-click on a result button" |
| Session progress and completion | `ProgressBar.test.tsx`; `PracticePage.test.tsx` → "goes to the summary after the last question…"; `SessionSummaryPage.test.tsx` |
| Statistics display | `StatisticsPage.test.tsx` |
| Reset confirmation / confirmation dialogs | `ConfirmDialog.test.tsx`; `StatisticsPage.test.tsx` → "keeps everything when the reset is cancelled", "clears attempts…after confirmation"; `SettingsPage.test.tsx` → "Clear All Application Data"; `PracticePage.test.tsx` → end-session dialog |
| 8-step integration test | **MISSING as one test** → added `PracticeFlow.integration.test.tsx` → "a wrong answer updates statistics, stores a pattern and comes back as a similar question" |
| Full addition session | **MISSING via UI** (UI sessions used subtraction/division) → covered by the new 8-step test (5 addition questions to the summary and Statistics) |
| Mixed-operation session | **MISSING via UI** → added "plays a full mixed-operation session at Level 2 and records every answer" |
| Continuous practice | `PracticePage.test.tsx` → "continuous practice" (3); `SessionSummaryPage.test.tsx` |
| Incorrect answer creates a pattern | `usePracticeSession.test.tsx` → "mistake patterns"; `mistakeService.test.ts` → "recordMistake" |
| Mistake-review generation / mastery completion | `MistakeReview.test.tsx`; `usePracticeSession.review.test.tsx` |
| Persistence after refresh / refresh during a session | `PracticePage.storage.test.tsx` → "keeps data after a simulated reload"; `PracticePage.recovery.test.tsx` → "session recovery after a refresh" |
| Resetting statistics | `StatisticsPage.test.tsx`; `statisticsService.test.ts` → "resetStatistics" |
| No stored data | `storageService.test.ts` → "with no stored data"; `StatisticsPage.test.tsx` → "shows friendly empty states…" |
| Corrupted storage | `storageService.test.ts` → "corrupted %s"; `StorageRecovery.test.tsx` |
| Zero attempts | `statisticsService.test.ts` / `math.test.ts` → "is 0 with zero attempts…"; `SessionSummaryPage.test.tsx` → "says no questions were answered…" |
| All-correct / all-incorrect sessions | `SessionSummary.test.tsx` → "cheers an all-correct session", "stays encouraging when every answer was wrong"; `math.test.ts` |
| Division-by-zero prevention | `questionGenerator.test.ts` → "division … never divide by zero"; `validation.test.ts` → "rejects division by zero" |
| Small screen widths | No automated test (jsdom does no layout). Verified by the Phase 17 headless-Chrome screenshots and overflow measurements at 375/768/1024/1280 px |

- New `src/app/PracticeFlow.integration.test.tsx` (2 tests, real routes + `AppProvider`, seeded randomness, nothing mocked): (1) Home → Start Practice → 5 questions → pick an answer (`aria-pressed`) → Flip Card (back heading and "Correct answer") → I Got It Wrong → stored statistics updated (total, addition, Level 1) → pattern stored → finish the session (summary 5/4/1) → Statistics page shows 5/4/1, 80%, addition Incorrect 1, Facts to practice 1 → Practice → Practice my mistakes → Start Session → a similar question (shares a number with the missed fact, never the exact missed question). (2) Mixed operations at Level 2, 10 questions: all four operations appear, summary totals 10/7/3, attempts saved in the order shown, 3 patterns.
- One new unit test in `validation.test.ts` ("rejects fractional operands"): the only uncovered line in the coverage report that is real behavior.
- Coverage: added `@vitest/coverage-v8` **5.0.5** (exact, same version as vitest; MIT license) as a devDependency, a `test:coverage` script (`vitest --run --coverage`) and a `coverage` block in `vite.config.ts` (v8, `src/**/*.{ts,tsx}`, excluding tests, `src/test/**`, `src/main.tsx`, `*.d.ts`; text + html reporters; `coverage/` was already git-ignored).
- The first coverage run failed 3 existing tests in `PracticePage.test.tsx`: "can be played start to finish with only Tab, Space and Enter" and "keeps going without a fixed total…" (both ~4 s normally) passed the 5 s default timeout under instrumentation, and "resets the selection… focuses the new card" failed as a knock-on. Gave the two long tests a 15 s timeout like the other long UI tests; the next coverage run passed fully (a Python edit attempt failed first on an exact-match assertion and was redone with the Edit tool).

**Verification:**
- `npm run lint`: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 40 files, 496/496 passed (493 before; 3 new).
- `npm run test:coverage`: 40 files, 496/496 passed. Statements 98.59% (979/993), branches 96.95% (796/821), functions 99.11% (335/338), lines 98.52% (938/952). By folder (statements / branches): app 95.8 / 96.1; components/common, layout, setup, statistics 100 / 100; components/practice 100 / 95.7; hooks 96.3 / 90.4; pages 100 / 95.0; services 98.3 / 97.7; utils 100 / 99.1. Least covered: `App.tsx` 66.7% (the outer boundary's `window.location.assign` reload, which jsdom can't run), `storageContext.ts` 80% and `usePracticeSession.ts` 94.2% (the "must be used inside AppProvider" guards and no-op guards), `questionGenerator.ts` 93.8% (the "No division question fits" throw and the rethrow of unexpected errors, unreachable with the real level tables), `storageService.ts` 98.6% (`getItem` throwing for the active session only; migration from an older schema version, none exists yet). No tests were added just to raise these.
- `npm run build`: pass (JS 379.95 kB, 116.81 kB gzip, unchanged: only tests and config changed).
- Acceptance criteria (spec 25):

| # | Criterion | Met? | How verified |
|---|---|---|---|
| 1 | Select operations and difficulty | Yes | `PracticeSetupPage.test.tsx`; `PracticeFlow.integration.test.tsx` (mixed, Level 2) |
| 2 | Fixed-length or continuous sessions | Yes | `PracticePage.test.tsx` (fixed → summary; "continuous practice"); `SessionSummaryPage.test.tsx` |
| 3 | Multiple-choice card with four unique choices | Yes | `QuestionCard.test.tsx` "shows the question, four choices…"; `distractors.test.ts`; `validation.test.ts`; generated questions all pass `validateQuestion` in `questionGenerator.test.ts` |
| 4 | Select an answer and flip the card | Yes | `QuestionCard.test.tsx`; `PracticeFlow.integration.test.tsx` steps 2–3 |
| 5 | Back reveals the correct answer | Yes | `QuestionCard.test.tsx` "QuestionCard back"; `PracticeFlow.integration.test.tsx` step 3 |
| 6 | Mark the attempt correct or incorrect | Yes | `QuestionCard.test.tsx`; `PracticePage.test.tsx`; `PracticeFlow.integration.test.tsx` step 4 |
| 7 | Each attempt counted exactly once | Yes | `practiceSession.test.ts` "counts each attempt exactly once"; `PracticePage.test.tsx` fast double-click; `statisticsService.test.ts` "counts the same question only once"; `StatisticsPage.test.tsx` "counts a finished practice session exactly once"; `PracticePage.recovery.test.tsx` "…without counting twice" |
| 8 | Incorrect questions create or update patterns | Yes | `mistakeService.test.ts`; `usePracticeSession.test.tsx`; `MistakeReview.test.tsx`; `PracticeFlow.integration.test.tsx` step 6 |
| 9 | Similar questions from mistakes | Yes | `similarQuestionGenerator.test.ts`; `MistakeReview.test.tsx`; `PracticeFlow.integration.test.tsx` steps 7–8 |
| 10 | Statistics persist after restarting the browser | Partial | Automated with jsdom `localStorage` and a simulated reload (`PracticePage.storage.test.tsx`, `storageService.test.ts`); a real browser close/reopen needs your check |
| 11 | Attempted, correct and incorrect totals | Yes | `StatisticsPage.test.tsx` "shows overall totals and accuracy"; `PracticeFlow.integration.test.tsx` |
| 12 | Statistics by operation and difficulty | Yes | `StatisticsPage.test.tsx` "shows a card for each operation and each level"; `statisticsService.test.ts` |
| 13 | Reset after confirmation | Yes | `StatisticsPage.test.tsx` (cancel keeps data, confirm clears); `ConfirmDialog.test.tsx` |
| 14 | No account or backend | Yes | Grep of `src/` finds no `fetch`, `XMLHttpRequest`, `WebSocket` or `sendBeacon`; `vite build` output is static files; all data in `localStorage` |
| 15 | Keyboard navigation | Partial | `PracticePage.test.tsx` "can be played start to finish with only Tab, Space and Enter"; number keys in `QuestionCard.test.tsx`; focus trap in `ConfirmDialog.test.tsx`; focus moves in `AppRoutes.test.tsx`. A real keyboard-only session in a browser (task 82) is still yours |
| 16 | Works on desktop, tablet and mobile | Partial | Phase 17 headless-Chrome screenshots and overflow checks at 375/768/1024/1280 px; real phones/tablets and other browsers not tested |

- TODO: checked the remaining items of tasks 79, 80 and 81 (re-verified the ones earlier phases had checked: each has the test listed above). Task 82: "Run an automated accessibility checker" stays checked (axe in `src/app/Accessibility.test.tsx`, passing); the other five stay unchecked for you.
- Manual checklist for you: (1) `npm run test:coverage`, then open `coverage/index.html`. (2) Task 82: play a full session with only Tab/Space/Enter/number keys; try a screen reader (NVDA or Narrator) on setup, card front/back and summary; turn off animation effects in Windows (Settings > Accessibility > Visual effects) and check the card changes without the turn; zoom the browser to 200% on each page; review the axe results. (3) Criterion 10: answer a few questions, close the browser completely, reopen the app and check Statistics. (4) Criterion 16: open the app on a real phone and tablet (e.g. `npm run dev -- --host`).

**Problems / open issues:**
- Small screen widths have no automated test (jsdom does no layout); they rest on the Phase 17 screenshots.
- Coverage instrumentation slows the UI tests, which is why two long tests needed a longer timeout; future long UI tests may need the same.
- The 8-step test accepts a reversed fact (e.g. 4 + 3 after missing 3 + 4) as the similar question, because spec 6.4 lists reversed operands as a similarity strategy; it only rejects the exact same question. (My first version used `isSameQuestion`, which treats reversed addition as the same, and failed for this reason.)
- High coverage mostly comes from UI tests running through the real pages; it shows which lines ran, not that every behavior is asserted.

### [2026-10-22 10:42] Phase 21: Performance and Data Management
**My prompt:** Implement Phase 21 (tasks 83–85). Write a dev-only script or test that seeds 5,000
attempts, then measure localStorage size and statistics page load time. Cap detailed
history as needed while preserving aggregate statistics exactly (test that totals don't
change after summarizing). Lazy-load the statistics and settings pages and report the
bundle size before and after.

**What you did:**
- Run by a Claude Code subagent using the Phase 21 prompt from PROMPTS.md (not manually tested by me before commit).
- Tasks before starting: 83 partly existed (question generation already happens only in event handlers in `usePracticeSession.ts`, checked by grep; the session reducer and `AppProvider` already skip unchanged state, covered by `practiceSession.test.ts`; statistics already loaded once per page via a `useState` initializer). 84: totals already came from the stored aggregate, but attempts and sessions grew without limit. 85: nothing done yet.
- History cap (`src/services/statisticsService.ts`, `src/services/storageService.ts`): only the newest **1,000** attempts (`ATTEMPT_HISTORY_LIMIT`) and **50** sessions (`SESSION_HISTORY_LIMIT`, DECISIONS 3.4 shows 20) are kept. Before old attempts are removed they are added to a new compact key `mathPractice.archivedStatistics` (same shape as the totals, review counts included), so when `mathPractice.statistics` is missing/corrupt the rebuild is archive + kept attempts and stays exact. `recordAttempt` trims as part of saving an answer (writes the archive first; if the shortened list can't be saved the archive is put back). New `summarizeOldAttempts()`. Reset Statistics and Clear All Data also remove the archive. Mistake patterns are untouched. `saveAttempt` (now unused) was removed. Checked every reader of attempts: the duplicate-answer guard and the active-session restore guard both look at the newest answer, which is always kept (tests added); recent sessions still show the 20 newest; review counts come from the totals.
- Large history test `src/app/LargeHistory.test.tsx`: seeds 5,000 realistic attempts (seeded random, real generator, UUID-length ids), 500 sessions and the resulting 802 mistake patterns. Measured (UTF-8 bytes): attempts 1,718.1 KB → 343.6 KB, sessions 112.0 KB → 11.2 KB, patterns 193.0 KB (unchanged, byte-for-byte), statistics 0.6 KB, archive 0 → 0.6 KB; **total 2,023.6 KB → 548.9 KB**. `loadStatistics` 0.18 ms with stored totals, 8.2 ms rebuilding from 5,000 attempts; Statistics page first render in jsdom ≈ 650 ms (jsdom, not a browser); the answer that summarizes 4,001 attempts took 5.6 ms. Totals before = after = rebuilt (asserted); timings are only logged.
- Rendering: `MistakeStatistics` is now `memo` + `useMemo` (sorting/grouping patterns). Before, opening/closing the Reset dialog re-sorted all patterns; a test counts `sortByIncorrectCount` calls (it fails on the old component, checked by swapping it back temporarily).
- Loading: Statistics and Settings are `React.lazy` (`src/app/lazyPages.ts`) inside `Suspense` with a new `PageLoading` fallback ("Getting your page ready..."). Fonts: only the Latin Nunito subset is loaded via an `@font-face` in `src/index.css` (replaces `import '@fontsource-variable/nunito'`; Latin includes ×, ÷ and − U+2212). `depcheck` found no unused packages (it flags the font package only because it is used from CSS). Test setup raises the Testing Library async timeout to 5 s (`src/test/setup.ts`) because the lazy pages load slower under parallel test runs (see problems).
- Commands: `npm run build` before changes, `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npx depcheck`, headless-Chrome screenshots of `vite preview`.

**Verification:**
- Bundle before → after (`npm run build`): main JS **379.95 kB (116.81 gzip) → 369.28 kB (115.22 gzip)**; new lazy chunks StatisticsPage 8.78 kB (2.64 gzip) + 0.91 kB gzip CSS, SettingsPage 5.28 kB (1.77 gzip) + 0.41 kB gzip CSS; main CSS 21.06 kB → 15.13 kB; font files emitted 5 (137.5 kB: Latin, Latin-ext, Cyrillic, Cyrillic-ext, Vietnamese) → 1 (Latin, 39.1 kB). Most of the main chunk is React/React Router, so lazy-loading saves only ~10 kB.
- `npm run lint`: pass, 0 errors, 0 warnings (the first lint gave 2 react-refresh warnings for lazy components in `AppRoutes.tsx`; fixed by moving them to `lazyPages.ts`).
- `npm test -- --run`: 41 files, 512/512 passed (496 before; 1 removed with `saveAttempt`, the rest new: 6 history-limit tests, 2 large-history tests, session cap, active-session guard after trimming, and the per-key tests now also run for the archive key). The first full run failed 1 test: `LargeHistory` waited for the lazy Statistics page longer than the 1 s default under parallel load; fixed with the 5 s timeout and by loading the module before timing.
- `npm run build`: pass (sizes above).
- Screenshots (375 and 1280 px iframes): Statistics (empty state) and Settings render fully after lazy loading, in Nunito; nothing overflows at 375 px. In iframes on a `file://` page the lazy chunk didn't load in headless Chrome (stuck on "Getting your page ready..."), so the shot page was served from the preview server instead (same origin) and removed afterwards; loading `/statistics` directly worked too.
- TODO: checked tasks 83, 84 and all of 85 except "Test on slower devices".
- Manual checklist for you: (1) `npm run build && npm run preview`, open DevTools > Network, load Home: no StatisticsPage/SettingsPage file yet; click Statistics: the chunk loads and the page shows (on a fast machine the "Getting your page ready..." card may only flash). (2) Throttle to "Slow 4G" in DevTools and repeat; also try a real older phone/tablet (task 85 "Test on slower devices"). (3) The text should still be Nunito (rounded); DevTools > Network > Font shows only `nunito-latin-...woff2`. (4) After practicing, Statistics totals still match; to see the history cap you'd need over 1,000 answers (the automated test covers it). (5) `npx vitest --run src/app/LargeHistory.test.tsx --silent=false` prints the size and timing table.

**Problems / open issues:**
- Not covered by DECISIONS (chose conservatively): keep 1,000 detailed attempts and 50 sessions; new storage key `mathPractice.archivedStatistics` (not in spec section 10). Older attempts are trimmed when the next answer is saved, not at startup, so existing big histories shrink on the next answer.
- If both `mathPractice.statistics` and `mathPractice.archivedStatistics` are corrupted at the same time, the rebuild can only count the kept 1,000 attempts.
- An unfinished continuous session keeps all its answers in `mathPractice.activeSession` until it ends (not capped); only a very long single session would grow it.
- The font trim mainly shrinks the build output: browsers already downloaded only the subsets a page uses (unicode-range), so the real download for English text was already just the Latin file.
- jsdom render time is not a browser measurement; slower-device testing needs you.
- The global 5 s async timeout makes a genuinely failing `findBy*` take longer to report.

### [2026-10-22 10:48] Phase 22: Release Preparation
**My prompt:**
Implement Phase 22 tasks 86 and 88.
- Privacy: confirm no tracking, external requests, or ads; add a short note in Settings
  that clearing browser data erases progress.
- Build: fix all lint and TypeScript errors, run all tests, build, and run `npm run preview`.
- Routing: add netlify.toml (build command `npm run build`, publish directory `dist`) and
  an SPA fallback so /statistics etc. work on refresh.
- Write README.md: description, features, tech stack, Node version, install, run, test,
  build, deploy steps, and project structure.
Confirm with `git status` and `git ls-files` that no secrets or .env files are tracked.

**What you did:**
- Run by a Claude Code subagent using the Phase 22 prompt from PROMPTS.md (not manually tested by me before commit).
- Tasks before starting: 86 mostly existed already (no tracking/ads/network code, data only in `localStorage`) but there was no note about clearing browser data, and Clear All Data left `mathPractice.version` behind; 88 needed `netlify.toml` and a README (none was tracked, checked with `git ls-files`); lint/types/tests/build already passed.
- Privacy audit: grepped `src/`, `index.html`, `public/` and `vite.config.ts` for `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource`, `http(s)://`, `<a`/`href`, analytics, cookies, `sessionStorage`/IndexedDB. Found only the skip link (`#main-content`), the local favicon, the two `import()` calls for lazy pages, and the Nunito font bundled from `@fontsource-variable/nunito`. Sounds are made with Web Audio (no files). The only inputs are checkboxes, radios and one select: no names or free text. In the built `dist/`, the `http` strings are XML namespaces (w3.org), `http://localhost` used internally by React Router to parse URLs, and two developer error links (react.dev, reactrouter.com) inside error messages; the one `fetch(` is Vite's modulepreload helper for the app's own same-origin files.
- Settings (`src/pages/SettingsPage.tsx`): new "For grown-ups" section above "Start over": "Progress is saved only in this browser on this device, and nothing is sent anywhere. Clearing this browser's history or site data will also erase it, so check before you clear." `clearAllData` (`src/services/storageService.ts`) now removes every key in `STORAGE_KEYS`, which adds `mathPractice.version` (it already removed `archivedStatistics` and `activeSession`); the unused `DATA_KEYS` list was deleted. Tests: privacy-note test in `SettingsPage.test.tsx`; the Clear All test now also seeds `archivedStatistics` and checks no `mathPractice.*` key is left; new storage test "leaves no mathPractice key behind".
- `netlify.toml`: build command `npm run build`, publish `dist`, `[build.environment] NODE_VERSION = "24"` (React Router 8 needs Node >= 22.22, `engines` in package.json), and the SPA fallback redirect `/*` → `/index.html` (200). No `public/_redirects` (it would duplicate the toml).
- `README.md`: description, features, tech stack with versions from package.json, Node version, install/run, scripts (test, coverage, lint, format, build, preview), Netlify deploy steps (base directory blank, build command, publish dir, Node 24), project structure matching the real `src/` tree, data/privacy note with all `mathPractice.*` keys, and links to the spec, TODO, DECISIONS.md and AI_LOG.md.
- Commands: `npx prettier --write .`, `npm run lint`, `npm test -- --run`, `npm run build`, `npm run preview -- --port 4179 --strictPort` + `curl` on every route, headless-Chrome screenshots, `git status --short --ignored`, `git ls-files`.

**Verification:**
- `npm run lint`: first run failed with 1 error (`DATA_KEYS` unused after the `clearAllData` change; `tsc -b` in the build reported the same); fixed by deleting the constant. Final: pass, 0 errors, 0 warnings.
- `npm test -- --run`: 41 files, 514/514 passed (512 before; +2 new tests, the Clear All test was extended).
- `npm run build` (`tsc -b && vite build`): pass, 0 TypeScript errors. Main JS 369.17 kB (115.18 kB gzip), StatisticsPage 8.78 kB, SettingsPage 5.71 kB, CSS 15.13 kB, font 39.12 kB.
- `npm run preview`: `/`, `/practice/setup`, `/practice/session`, `/practice/summary`, `/statistics`, `/settings` and `/no/such/page` all returned 200 `text/html` with the app's `<div id="root">`. Screenshots from the preview (iframes at 375, 768 and 1280 px): Settings shows the "For grown-ups" note above "Start over" at both widths without overflow; Statistics (empty state), the Not Found page for an unknown URL and Practice Setup render correctly. Server stopped afterwards.
- Secrets: `git ls-files` has no `.env`, key, token or `.pem` files; `git status --short --ignored` shows only the Phase 22 changes plus ignored `coverage/`, `dist/`, `node_modules/`. `.gitignore` covers `.env` and `.env.*`.
- TODO: checked all of task 86 and all of task 88. Tasks 87 and 89 left unchecked.
- Manual checklist for you: (1) open Settings and read the "For grown-ups" note; is the wording right for parents? (2) practice a few questions, then Settings → Clear All Application Data → DevTools > Application > Local Storage: no `mathPractice.*` keys left. (3) `npm run build && npm run preview`, open `/statistics` directly and refresh. (4) DevTools > Network while using the app: only files from your own site. (5) Task 87: Chrome, Safari, Firefox, Edge, a tablet and a phone (record with `> ME:` notes). (6) Push to GitHub and deploy on Netlify (task 89); check that the deploy log shows Node 24.

**Problems / open issues:**
- Left for you: task 87 (manual browser/device testing), the push to GitHub, and task 89 (Netlify deploy and post-deploy checks). No remote was added and nothing was pushed or deployed.
- Not covered by DECISIONS (chose conservatively): Clear All Data now also removes `mathPractice.version`; it is written again the next time the app starts, so nothing breaks.
- Node version for Netlify is set only in `netlify.toml` (no `.nvmrc`), so local Node is not pinned; `engines` in package.json still says `>=22.22`.
- `public/favicon.svg` is still the default Vite logo (not a privacy issue, just not app branding).
- "Test the production build locally" was checked from curl on every route plus screenshots of 4 pages, not a full click-through in a real browser.

### [2026-10-22 10:50] TODO bookkeeping after Phase 22
**My prompt:** keep going
**What you did:**
- Final check after all phases were committed by subagents: lint, tests, build and format check on the whole repo.
- Found two TODO items still unchecked although later phases built and tested them. Checked them off:
  - Task 34 "Add **Practice Mistakes**": enabled in Phase 14; covered by `src/pages/SessionSummaryPage.test.tsx` ("enables Practice Mistakes after a wrong answer and starts a review session").
  - Task 38 "Limit or summarize old records if needed": done in Phase 21; covered by `src/app/LargeHistory.test.tsx` ("keeps exact totals after summarizing old history...").
**Verification:**
- `npm run lint`: pass, 0 errors. `npm test -- --run`: 41 files, 514/514 passed. `npm run build`: pass. `npm run format:check`: clean.
- `git ls-files`: no .env, key or secret files tracked. No git remote configured.
**Problems / open issues:**
- Still unchecked and needing you: manual browser/device testing (task 87), keyboard-only session, screen reader, 200% zoom, larger fonts, reduced motion (tasks 66–69, 82), slower devices (85), browser-restart persistence (39), the optional card transition (29), and deployment (89).
- "Detect missing or older versions" (task 36) can't be exercised until a schema version 2 exists.
- The "Suggested First Implementation Sequence" checklist at the end of the TODO is a summary of earlier phases and was left as-is.
- `public/favicon.svg` is still the default Vite logo.
