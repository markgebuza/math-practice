import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import * as mistakeService from '../services/mistakeService';
import { addMistake } from '../services/mistakeService';
import { generateQuestion } from '../services/questionGenerator';
import {
  ATTEMPT_HISTORY_LIMIT,
  buildStatistics,
  loadStatistics,
  recordAttempt,
} from '../services/statisticsService';
import {
  readData,
  saveSession,
  SESSION_HISTORY_LIMIT,
  STORAGE_KEYS,
  writeData,
} from '../services/storageService';
import { seedMathRandom } from '../test/seededRandom';
import type { DifficultyLevel, MistakePattern, PracticeAttempt, PracticeSession } from '../types';
import { OPERATIONS } from '../utils/labels';
import { AppProvider } from './AppProvider';
import { routes } from './AppRoutes';

vi.mock('../services/mistakeService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/mistakeService')>();
  return { ...actual, sortByIncorrectCount: vi.fn(actual.sortByIncorrectCount) };
});

const ATTEMPT_COUNT = 5000;
const SESSION_SIZE = 10;
const START = Date.UTC(2026, 0, 1);

// Same length as a real crypto.randomUUID() id, so sizes match real data.
const uuid = (prefix: number, n: number) =>
  `${String(prefix).padStart(8, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`;

function seedHistory() {
  const random = seedMathRandom(21);
  const attempts: PracticeAttempt[] = [];
  const sessions: PracticeSession[] = [];
  let patterns: MistakePattern[] = [];
  let patternNumber = 0;
  for (let s = 0; s < ATTEMPT_COUNT / SESSION_SIZE; s++) {
    const operation = OPERATIONS[s % 4];
    const difficulty = ((s % 4) + 1) as DifficultyLevel;
    const startedAt = START + s * 3_600_000;
    const sessionAttempts = Array.from({ length: SESSION_SIZE }, (_, q): PracticeAttempt => {
      const question = generateQuestion(operation, difficulty);
      const selectedAnswer = question.choices[Math.floor(Math.random() * 4)];
      const index = s * SESSION_SIZE + q;
      return {
        id: uuid(1, index),
        questionId: uuid(2, index),
        operation,
        firstOperand: question.firstOperand,
        secondOperand: question.secondOperand,
        correctAnswer: question.correctAnswer,
        selectedAnswer,
        selfReportedCorrect: selectedAnswer === question.correctAnswer || Math.random() < 0.6,
        difficulty,
        source: s % 10 === 9 ? 'mistake-review' : 'regular',
        attemptedAt: new Date(startedAt + q * 20_000).toISOString(),
        sessionId: uuid(3, s),
      };
    });
    for (const attempt of sessionAttempts.filter((a) => !a.selfReportedCorrect)) {
      patterns = addMistake(patterns, attempt, () => uuid(4, patternNumber++));
    }
    const correct = sessionAttempts.filter((a) => a.selfReportedCorrect).length;
    attempts.push(...sessionAttempts);
    sessions.push({
      id: uuid(3, s),
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date(startedAt + SESSION_SIZE * 20_000).toISOString(),
      operations: [operation],
      difficulty,
      sessionLength: SESSION_SIZE,
      attempted: SESSION_SIZE,
      correct,
      incorrect: SESSION_SIZE - correct,
    });
  }
  random.mockRestore();
  return { attempts, sessions, patterns };
}

const KEYS = Object.values(STORAGE_KEYS);

function storageSizes() {
  return Object.fromEntries(
    KEYS.map((key) => [key, new TextEncoder().encode(localStorage.getItem(key) ?? '').length]),
  );
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

function time<T>(run: () => T): [T, number] {
  const start = performance.now();
  const result = run();
  return [result, performance.now() - start];
}

// The page module is loaded first, so the timing measures rendering, not the lazy import.
async function renderStatistics() {
  await import('../pages/StatisticsPage');
  const start = performance.now();
  render(
    <AppProvider>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/statistics'] })} />
    </AppProvider>,
  );
  await screen.findByRole('heading', { level: 1, name: 'Your Statistics' });
  return performance.now() - start;
}

describe('with 5,000 stored attempts', () => {
  it('keeps exact totals after summarizing old history and reports sizes and timings', async () => {
    const { attempts, sessions, patterns } = seedHistory();
    const totals = buildStatistics(attempts);
    writeData('attempts', attempts);
    writeData('sessions', sessions);
    writeData('mistakePatterns', patterns);
    writeData('statistics', totals);
    const patternsRaw = localStorage.getItem(STORAGE_KEYS.mistakePatterns);
    const before = storageSizes();

    const [, loadMs] = time(loadStatistics);
    localStorage.removeItem(STORAGE_KEYS.statistics);
    const [rebuilt, rebuildMs] = time(loadStatistics);
    expect(rebuilt).toEqual(totals);
    const renderBeforeMs = await renderStatistics();

    // The next answer and session save shorten the detailed history.
    const nextAttempt: PracticeAttempt = {
      ...attempts.at(-1)!,
      id: uuid(1, ATTEMPT_COUNT),
      questionId: uuid(2, ATTEMPT_COUNT),
      sessionId: uuid(3, 9999),
    };
    const [, recordMs] = time(() => recordAttempt(nextAttempt));
    saveSession({ ...sessions.at(-1)!, id: uuid(3, 9999), attempted: 1, correct: 1, incorrect: 0 });
    const after = storageSizes();
    const allAttempts = [...attempts, nextAttempt];

    expect(readData('attempts').value).toEqual(allAttempts.slice(-ATTEMPT_HISTORY_LIMIT));
    expect(readData('sessions').value).toHaveLength(SESSION_HISTORY_LIMIT);
    expect(loadStatistics()).toEqual(buildStatistics(allAttempts));
    expect(localStorage.getItem(STORAGE_KEYS.mistakePatterns)).toBe(patternsRaw);
    localStorage.removeItem(STORAGE_KEYS.statistics);
    expect(loadStatistics()).toEqual(buildStatistics(allAttempts));

    const total = (sizes: Record<string, number>) => Object.values(sizes).reduce((a, b) => a + b);
    console.log(
      [
        `Large history: ${ATTEMPT_COUNT} attempts, ${sessions.length} sessions, ${patterns.length} mistake patterns`,
        ...KEYS.map((key) => `  ${key}: ${kb(before[key])} -> ${kb(after[key])}`),
        `  total: ${kb(total(before))} -> ${kb(total(after))}`,
        `  loadStatistics (stored totals): ${loadMs.toFixed(2)} ms`,
        `  loadStatistics (rebuilt from ${ATTEMPT_COUNT} attempts): ${rebuildMs.toFixed(2)} ms`,
        `  Statistics page first render (jsdom): ${renderBeforeMs.toFixed(0)} ms`,
        `  recordAttempt that summarizes ${ATTEMPT_COUNT + 1 - ATTEMPT_HISTORY_LIMIT} attempts: ${recordMs.toFixed(2)} ms`,
      ].join('\n'),
    );
  }, 30_000);

  it('does not re-sort mistake patterns when the reset dialog opens and closes', async () => {
    const { attempts, patterns } = seedHistory();
    writeData('attempts', attempts);
    writeData('mistakePatterns', patterns);
    writeData('statistics', buildStatistics(attempts));
    const sort = vi.mocked(mistakeService.sortByIncorrectCount);
    sort.mockClear();

    await renderStatistics();
    const sortsAfterRender = sort.mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Reset Statistics' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep My Statistics' }));

    expect(sortsAfterRender).toBeGreaterThan(0);
    expect(sort).toHaveBeenCalledTimes(sortsAfterRender);
  }, 30_000);
});
