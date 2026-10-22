import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { buildStatistics } from '../services/statisticsService';
import { writeData } from '../services/storageService';
import { axeViolations } from '../test/axe';
import { seedMathRandom } from '../test/seededRandom';
import type { MistakePattern, PracticeAttempt } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { AppProvider } from './AppProvider';
import { routes } from './AppRoutes';
import type { PracticeConfig } from './practiceConfig';

function renderAt(path: string, config?: PracticeConfig) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProvider initialPracticeConfig={config}>
      <RouterProvider router={router} />
    </AppProvider>,
  );
}

const ATTEMPTS: PracticeAttempt[] = [true, false].map((selfReportedCorrect, index) => ({
  id: `attempt-${index}`,
  questionId: `question-${index}`,
  operation: 'multiplication',
  firstOperand: 8,
  secondOperand: 7,
  correctAnswer: 56,
  selectedAnswer: selfReportedCorrect ? 56 : 54,
  selfReportedCorrect,
  difficulty: 2,
  source: 'regular',
  attemptedAt: '2026-10-21T10:00:00.000Z',
  sessionId: 'session-1',
}));

const PATTERNS: MistakePattern[] = [
  {
    id: 'pattern-1',
    operation: 'multiplication',
    firstOperand: 8,
    secondOperand: 7,
    correctAnswer: 56,
    difficulty: 2,
    incorrectCount: 2,
    similarCorrectCount: 1,
    lastIncorrectAt: '2026-10-21T10:00:00.000Z',
    mastered: false,
  },
  {
    id: 'pattern-2',
    operation: 'addition',
    firstOperand: 9,
    secondOperand: 6,
    correctAnswer: 15,
    difficulty: 1,
    incorrectCount: 1,
    similarCorrectCount: 3,
    lastIncorrectAt: '2026-10-20T10:00:00.000Z',
    mastered: true,
  },
];

function seedStoredData() {
  writeData('attempts', ATTEMPTS);
  writeData('statistics', buildStatistics(ATTEMPTS));
  writeData('sessions', [
    {
      id: 'session-1',
      startedAt: '2026-10-21T09:55:00.000Z',
      completedAt: '2026-10-21T10:00:00.000Z',
      operations: ['multiplication'],
      difficulty: 2,
      sessionLength: 10,
      attempted: 2,
      correct: 1,
      incorrect: 1,
    },
  ]);
  writeData('mistakePatterns', PATTERNS);
}

async function startSession(config: PracticeConfig) {
  renderAt('/practice/setup', config);
  await userEvent.click(await screen.findByRole('button', { name: 'Start Session' }));
  await screen.findByRole('region', { name: 'Question card' });
}

async function selectAndFlip() {
  await userEvent.keyboard('1');
  await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
}

const SHORT_SESSION: PracticeConfig = {
  operations: ['addition'],
  difficulty: 1,
  sessionLength: 5,
};

beforeEach(() => {
  seedMathRandom(16);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('automated accessibility check (axe)', () => {
  it('reports real problems (checks the helper itself)', async () => {
    render(
      <main>
        <h1>Test</h1>
        <button type="button" />
      </main>,
    );
    expect(await axeViolations()).toContainEqual(expect.stringMatching(/^button-name:/));
  });

  it.each([
    ['/', 'Math Practice'],
    ['/practice/setup', 'Get Ready to Practice'],
    ['/practice/session', 'Get Ready to Practice'],
    ['/practice/summary', 'Session Summary'],
    ['/statistics', 'Your Statistics'],
    ['/settings', 'Settings'],
    ['/no-such-page', /./],
  ])('%s has no violations', async (path, heading) => {
    renderAt(path);
    await screen.findByRole('heading', { level: 1, name: heading });
    expect(await axeViolations()).toEqual([]);
  });

  it('setup in mistake-review mode', async () => {
    seedStoredData();
    renderAt('/practice/setup');
    await userEvent.click(await screen.findByRole('radio', { name: /Practice my mistakes/ }));
    expect(await axeViolations()).toEqual([]);
  });

  it('card front with an answer picked, then the flipped card (animated)', async () => {
    await startSession(SHORT_SESSION);
    expect(await axeViolations()).toEqual([]);
    await selectAndFlip();
    expect(await axeViolations()).toEqual([]);
  });

  it('flipped card with animation off', async () => {
    writeData('settings', { ...DEFAULT_SETTINGS, cardAnimation: false });
    await startSession(SHORT_SESSION);
    await selectAndFlip();
    expect(await axeViolations()).toEqual([]);
  });

  it('end-session dialog in a continuous session', async () => {
    await startSession({ ...SHORT_SESSION, sessionLength: 'continuous' });
    await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
  });

  it('leave-session dialog from the header navigation', async () => {
    await startSession(SHORT_SESSION);
    await userEvent.click(screen.getByRole('link', { name: 'Settings' }));
    expect(
      screen.getByRole('dialog', { name: 'Leave your practice session?' }),
    ).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
  });

  it('summary after a finished session', async () => {
    await startSession({ ...SHORT_SESSION, sessionLength: 'continuous' });
    await selectAndFlip();
    await userEvent.click(screen.getByRole('button', { name: 'I Got It Wrong' }));
    await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, End Session' }));
    await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
    expect(await axeViolations()).toEqual([]);
  });

  it('statistics with data, the mastered list open, and the reset dialog', async () => {
    seedStoredData();
    renderAt('/statistics');
    const mastered = await screen.findByText(/Mastered facts/);
    await userEvent.click(mastered);
    expect(await axeViolations()).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'Reset Statistics' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(await axeViolations()).toEqual([]);
  });

  it('settings with the clear-data dialog open', async () => {
    seedStoredData();
    renderAt('/settings');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Clear All Application Data' }),
    );
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getAllByRole('button')).toHaveLength(2);
    expect(await axeViolations()).toEqual([]);
  });
});
