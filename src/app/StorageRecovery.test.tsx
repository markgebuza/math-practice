import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { readData, STORAGE_KEYS, type DataKey, type StoredData } from '../services/storageService';
import { buildStatistics } from '../services/statisticsService';
import { DEFAULT_SETTINGS, type PracticeAttempt } from '../types';
import { AppProvider } from './AppProvider';
import { routes } from './AppRoutes';

const ATTEMPT: PracticeAttempt = {
  id: 'attempt-1',
  questionId: 'question-1',
  sessionId: 'session-1',
  operation: 'multiplication',
  firstOperand: 8,
  secondOperand: 7,
  correctAnswer: 56,
  selectedAnswer: 54,
  selfReportedCorrect: false,
  difficulty: 2,
  source: 'regular',
  attemptedAt: '2026-10-21T10:00:00.000Z',
};

const DATA: StoredData = {
  settings: { ...DEFAULT_SETTINGS, soundEffects: true, masteryThreshold: 4 },
  sessions: [
    {
      id: 'session-1',
      startedAt: '2026-10-21T09:58:00.000Z',
      completedAt: '2026-10-21T10:05:00.000Z',
      operations: ['multiplication'],
      difficulty: 2,
      sessionLength: 1,
      attempted: 1,
      correct: 0,
      incorrect: 1,
    },
  ],
  attempts: [ATTEMPT],
  mistakePatterns: [
    {
      id: 'pattern-1',
      operation: 'multiplication',
      firstOperand: 8,
      secondOperand: 7,
      correctAnswer: 56,
      difficulty: 2,
      incorrectCount: 1,
      similarCorrectCount: 0,
      lastIncorrectAt: '2026-10-21T10:00:00.000Z',
      mastered: false,
    },
  ],
  statistics: buildStatistics([ATTEMPT]),
};

const KEYS = Object.keys(DATA) as DataKey[];

// Indented on purpose: any rewrite by the app would change the exact text.
const RAW = Object.fromEntries(
  KEYS.map((key) => [key, JSON.stringify(DATA[key], null, 1)]),
) as Record<DataKey, string>;

describe.each(KEYS)('when stored %s is corrupted', (corruptKey) => {
  it('the app still opens, only that category is reset and the others stay byte-for-byte', async () => {
    for (const key of KEYS) {
      localStorage.setItem(STORAGE_KEYS[key], key === corruptKey ? '{"broken": ' : RAW[key]);
    }

    render(
      <AppProvider>
        <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/statistics'] })} />
      </AppProvider>,
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your Statistics' }),
    ).toBeInTheDocument();

    // Attempts are only read when needed, so read every category once more to be sure.
    const corrupt = readData(corruptKey);
    if (corruptKey === 'statistics') {
      // Corrupted totals are rebuilt from the saved attempts instead of starting from zero.
      expect(corrupt.value).toEqual(DATA.statistics);
    } else {
      expect(['reset', 'missing']).toContain(corrupt.status);
      expect(localStorage.getItem(STORAGE_KEYS[corruptKey])).not.toBe('{"broken": ');
    }

    for (const key of KEYS.filter((k) => k !== corruptKey)) {
      expect(localStorage.getItem(STORAGE_KEYS[key])).toBe(RAW[key]);
    }
  });
});
