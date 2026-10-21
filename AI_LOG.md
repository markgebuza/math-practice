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
