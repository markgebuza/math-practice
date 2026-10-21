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
