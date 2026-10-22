# Math Practice

A friendly math flash-card web app for children ages 7–12. Children practice addition,
subtraction, multiplication and division with flip cards, see how they are
doing, and get extra practice on the facts they find tricky. Everything runs in the browser:
there are no accounts, no server, no ads and no tracking.

## Features

- Practice any mix of addition, subtraction, multiplication and division.
- Four levels: Beginner, Easy, Intermediate and Advanced.
- Sessions of 5, 10 or 20 questions, or continuous practice that stops whenever the child likes.
- Flash cards with multiple-choice answers: the card flips over to show the correct answer next
  to the child's answer (optionally with an explanation), and the child marks "I Got It Right"
  or "I Got It Wrong".
- Supportive feedback messages and optional gentle sound effects.
- Session summary with score and accuracy.
- Mistake tracking: missed facts come back in "Practice my mistakes" mode, with similar
  questions, until they are marked right several times in a row (the number is a setting).
- Statistics: totals, accuracy by operation and level, tricky facts and recent sessions.
- Settings for sounds, card animation, explanations, cheering messages, default practice choices
  and the mastery threshold; one button clears all saved data.
- An unfinished session is restored after a page refresh.
- Accessible: keyboard use, screen-reader labels, visible focus, reduced-motion support, and
  large tap targets that work on phones, tablets and desktops.

## Tech stack

| Tool | Version |
| --- | --- |
| React / React DOM | 19.3.1 |
| React Router (data router) | 8.5.0 |
| TypeScript | 6.0.3 |
| Vite | 8.3.5 (`@vitejs/plugin-react` 6.1.2) |
| Vitest (+ `@vitest/coverage-v8`) | 5.0.5 |
| Testing Library (React / DOM / user-event / jest-dom) | 16.3.3 / 10.4.2 / 14.6.8 / 7.0.1 |
| jsdom | 29.1.1 |
| axe-core (accessibility checks in tests) | 4.14.0 |
| ESLint / typescript-eslint | 10.13.0 / 8.72.0 |
| Prettier | 3.9.10 |
| Nunito font (`@fontsource-variable/nunito`, bundled locally) | 5.3.0 |

Plain CSS with design tokens in `src/index.css`; no CSS framework.

## Requirements

- **Node.js 22.22 or newer** (React Router 8 requires it; see `engines` in `package.json`).
  Node 24 LTS is recommended and is what the Netlify build uses.
- npm (comes with Node).

## Getting started

```bash
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server with hot reload. |
| `npm test` | Run the tests in watch mode. |
| `npm test -- --run` | Run all tests once. |
| `npm run test:coverage` | Run all tests once with a coverage report (`coverage/index.html`). |
| `npm run lint` | Check the code with ESLint. |
| `npm run format` / `npm run format:check` | Format the code with Prettier / check formatting. |
| `npm run build` | Type-check (`tsc -b`) and build the production files into `dist/`. |
| `npm run preview` | Serve the built `dist/` folder locally to test the production build. |

## Deploying to Netlify

The repository includes `netlify.toml`, so Netlify picks up these settings automatically:

- **Base directory:** leave blank (the app is at the repository root).
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 24 (set by `NODE_VERSION` in `netlify.toml`).
- **SPA fallback:** every path is served `index.html` with status 200, so links such as
  `/statistics` or `/settings` work when opened directly or refreshed.

Steps:

1. Push the repository to GitHub.
2. In Netlify, choose **Add new site → Import an existing project → GitHub** and pick the
   repository.
3. Check that the settings above are shown, then click **Deploy**.
4. Open the site and visit each page directly (`/`, `/practice/setup`, `/statistics`,
   `/settings`) and refresh it.

## Project structure

```text
├── index.html                 App HTML shell
├── netlify.toml               Netlify build settings and SPA fallback
├── public/                    Static files copied as-is (favicon)
├── src/
│   ├── main.tsx               Entry point
│   ├── index.css              Global styles, design tokens, bundled font
│   ├── app/                   App shell, routes, storage context, practice session state
│   ├── components/
│   │   ├── common/            Button, ConfirmDialog, EmptyState, ErrorBoundary, warnings, loading
│   │   ├── layout/            AppLayout, Header, Navigation, PageContainer
│   │   ├── practice/          QuestionCard, CardFront/Back, AnswerChoice, ProgressBar, SessionSummary
│   │   ├── setup/             Operation, difficulty, length and mode selectors
│   │   └── statistics/        Overview, per-operation/level stats, mistakes, recent sessions
│   ├── hooks/                 usePracticeSession, useStatistics, useLocalStorage, usePrefersReducedMotion
│   ├── pages/                 Home, Setup, Practice, Summary, Statistics, Settings, Error, Not Found
│   ├── services/              Question generation, distractors, mistakes, statistics, storage, sound
│   ├── types/                 Shared TypeScript types
│   ├── utils/                 Math, labels, explanations, feedback, validation and other helpers
│   └── test/                  Test setup and helpers (seeded random, axe)
├── vite.config.ts             Vite and Vitest configuration
└── eslint.config.js           ESLint configuration
```

Tests sit next to the code they test (`*.test.ts` / `*.test.tsx`).

## Data and privacy

- No personal information is asked for or collected: there are no names, accounts or text fields.
- The app makes no network requests after it loads: no analytics, no ads, no external links, and
  the font is bundled with the app.
- All progress is stored only in the browser's `localStorage` on the device, under these keys:
  `mathPractice.settings`, `mathPractice.sessions`, `mathPractice.attempts`,
  `mathPractice.mistakePatterns`, `mathPractice.statistics`, `mathPractice.archivedStatistics`
  (totals of old answers removed from the detailed history), `mathPractice.activeSession`
  (an unfinished session) and `mathPractice.version` (the data format version).
- **Clearing the browser's history or site data erases all progress.** Progress is also not shared
  between browsers or devices. **Settings → Clear All Application Data** removes every
  `mathPractice.*` key and nothing else.

## Project documents

- [`math-practice-specification.md`](math-practice-specification.md): the requirements.
- [`math-practice-todo-list.md`](math-practice-todo-list.md): the implementation phases and tasks.
- [`DECISIONS.md`](DECISIONS.md): choices made where the specification is open.
- [`AI_LOG.md`](AI_LOG.md): log of the AI-assisted development, phase by phase.
