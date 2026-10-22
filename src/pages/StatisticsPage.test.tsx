import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import type { PracticeConfig } from '../app/practiceConfig';
import { buildStatistics } from '../services/statisticsService';
import { readData, STORAGE_KEYS, writeData } from '../services/storageService';
import { seedMathRandom } from '../test/seededRandom';
import type { MistakePattern, PracticeAttempt, PracticeSession } from '../types';
import { DEFAULT_SETTINGS } from '../types';

function renderAt(path: string, config?: PracticeConfig) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProvider initialPracticeConfig={config}>
      <RouterProvider router={router} />
    </AppProvider>,
  );
  return router;
}

function makeAttempt(index: number, overrides: Partial<PracticeAttempt>): PracticeAttempt {
  return {
    id: `attempt-${index}`,
    questionId: `question-${index}`,
    operation: 'addition',
    firstOperand: 3,
    secondOperand: 4,
    correctAnswer: 7,
    selectedAnswer: 7,
    selfReportedCorrect: true,
    difficulty: 1,
    source: 'regular',
    attemptedAt: '2026-10-21T10:00:00.000Z',
    sessionId: 'session-1',
    ...overrides,
  };
}

function makeSession(id: string, overrides: Partial<PracticeSession>): PracticeSession {
  return {
    id,
    startedAt: '2026-10-20T09:00:00.000Z',
    completedAt: '2026-10-20T09:10:00.000Z',
    operations: ['addition'],
    difficulty: 1,
    sessionLength: 10,
    attempted: 10,
    correct: 10,
    incorrect: 0,
    ...overrides,
  };
}

const ATTEMPTS = [
  ...Array.from({ length: 3 }, (_, i) =>
    makeAttempt(i, { operation: 'addition', difficulty: 1, selfReportedCorrect: true }),
  ),
  makeAttempt(3, { operation: 'addition', difficulty: 2, selfReportedCorrect: false }),
  makeAttempt(4, { operation: 'multiplication', difficulty: 2, selfReportedCorrect: false }),
];

const PATTERN: MistakePattern = {
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
};

const SETTINGS = { ...DEFAULT_SETTINGS, soundEffects: true };

function seedStoredData() {
  writeData('attempts', ATTEMPTS);
  writeData('statistics', buildStatistics(ATTEMPTS));
  writeData('sessions', [
    makeSession('older', {
      completedAt: '2026-10-19T09:10:00.000Z',
      operations: ['addition', 'subtraction'],
      difficulty: 1,
      attempted: 4,
      correct: 3,
      incorrect: 1,
    }),
    makeSession('unfinished', { completedAt: undefined, attempted: 2, correct: 2 }),
    makeSession('newest', {
      completedAt: '2026-10-21T10:05:00.000Z',
      operations: ['multiplication'],
      difficulty: 2,
      attempted: 2,
      correct: 0,
      incorrect: 2,
    }),
  ]);
  writeData('mistakePatterns', [PATTERN]);
  writeData('settings', SETTINGS);
}

function statValue(container: HTMLElement, label: string) {
  const term = within(container).getByText(label, { selector: 'dt' });
  return term.nextElementSibling?.textContent;
}

function section(name: string) {
  return screen.getByRole('region', { name });
}

describe('StatisticsPage', () => {
  it('shows friendly empty states for a new user and no Reset button', async () => {
    renderAt('/statistics');
    expect(await screen.findByRole('heading', { name: 'Your Statistics' })).toBeInTheDocument();
    const overview = section('All your practice');
    expect(within(overview).getByText(/You haven't answered any questions yet/)).toBeVisible();
    expect(within(overview).getByRole('link', { name: 'Start Practice' })).toHaveAttribute(
      'href',
      '/practice/setup',
    );
    expect(screen.queryByText('NaN', { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'By type of math' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'By level' })).not.toBeInTheDocument();
    expect(
      within(section('Recent sessions')).getByText(
        'When you finish a practice session, it will show up here.',
      ),
    ).toBeVisible();
    const mistakes = section('Mistake practice');
    expect(statValue(mistakes, 'Facts to practice')).toBe('0');
    expect(statValue(mistakes, 'Similar questions practiced')).toBe('0');
    expect(within(mistakes).getByText(/No mistakes to practice right now/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Reset Statistics' })).not.toBeInTheDocument();
  });

  it('shows overall totals and accuracy', async () => {
    seedStoredData();
    renderAt('/statistics');
    const overview = await screen.findByRole('region', { name: 'All your practice' });
    expect(statValue(overview, 'Attempted')).toBe('5');
    expect(statValue(overview, 'Correct')).toBe('3');
    expect(statValue(overview, 'Incorrect')).toBe('2');
    expect(statValue(overview, 'Accuracy')).toBe('60%');
  });

  it('shows a card for each operation and each level', async () => {
    seedStoredData();
    renderAt('/statistics');
    const operations = await screen.findByRole('region', { name: 'By type of math' });
    const operationCards = within(operations).getAllByRole('listitem');
    expect(operationCards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      '+Addition',
      '−Subtraction',
      '×Multiplication',
      '÷Division',
    ]);
    expect(statValue(operationCards[0], 'Attempted')).toBe('4');
    expect(statValue(operationCards[0], 'Correct')).toBe('3');
    expect(statValue(operationCards[0], 'Incorrect')).toBe('1');
    expect(statValue(operationCards[0], 'Accuracy')).toBe('75%');
    expect(statValue(operationCards[2], 'Accuracy')).toBe('0%');
    expect(within(operationCards[1]).getByText('Not practiced yet')).toBeVisible();
    expect(within(operationCards[3]).getByText('Not practiced yet')).toBeVisible();

    const levels = within(section('By level')).getAllByRole('listitem');
    expect(levels.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Level 1: Beginner',
      'Level 2: Easy',
      'Level 3: Intermediate',
      'Level 4: Advanced',
    ]);
    expect(statValue(levels[0], 'Accuracy')).toBe('100%');
    expect(statValue(levels[1], 'Attempted')).toBe('2');
    expect(statValue(levels[1], 'Correct')).toBe('0');
    expect(statValue(levels[1], 'Incorrect')).toBe('2');
    expect(statValue(levels[1], 'Accuracy')).toBe('0%');
    expect(within(levels[2]).getByText('Not practiced yet')).toBeVisible();
  });

  describe('mistake practice', () => {
    const patterns: MistakePattern[] = [
      { ...PATTERN, id: 'm1', incorrectCount: 3, similarCorrectCount: 1 },
      {
        ...PATTERN,
        id: 'd1',
        operation: 'division',
        firstOperand: 56,
        secondOperand: 8,
        correctAnswer: 7,
        incorrectCount: 2,
        lastIncorrectAt: '2026-10-20T10:00:00.000Z',
      },
      {
        ...PATTERN,
        id: 'd2',
        operation: 'division',
        firstOperand: 12,
        secondOperand: 3,
        correctAnswer: 4,
        incorrectCount: 1,
        similarCorrectCount: 3,
        mastered: true,
      },
      {
        ...PATTERN,
        id: 'a1',
        operation: 'addition',
        firstOperand: 9,
        secondOperand: 5,
        correctAnswer: 14,
        incorrectCount: 1,
        lastIncorrectAt: '2026-10-18T10:00:00.000Z',
      },
    ];
    const reviewAttempts = [
      makeAttempt(10, { source: 'mistake-review', selfReportedCorrect: true }),
      makeAttempt(11, { source: 'mistake-review', selfReportedCorrect: false }),
      makeAttempt(12, { source: 'mistake-review', selfReportedCorrect: true }),
    ];

    function seedMistakes(settings = DEFAULT_SETTINGS) {
      writeData('attempts', reviewAttempts);
      writeData('statistics', buildStatistics(reviewAttempts));
      writeData('mistakePatterns', patterns);
      writeData('settings', settings);
    }

    function listAfter(container: HTMLElement, heading: string) {
      return within(container).getByRole('heading', { name: heading })
        .nextElementSibling as HTMLElement;
    }

    function factNames(list: HTMLElement) {
      return within(list)
        .getAllByRole('listitem')
        .map((item) => item.querySelector('.fact')?.getAttribute('aria-label'));
    }

    it('shows pattern counts and review answers', async () => {
      seedMistakes();
      renderAt('/statistics');
      const mistakes = await screen.findByRole('region', { name: 'Mistake practice' });
      expect(statValue(mistakes, 'Facts to practice')).toBe('3');
      expect(statValue(mistakes, 'Facts mastered')).toBe('1');
      expect(statValue(mistakes, 'Similar questions practiced')).toBe('3');
      expect(statValue(mistakes, 'Review questions answered correctly')).toBe('2');
    });

    it('names every operation tied for the most misses', async () => {
      seedMistakes();
      renderAt('/statistics');
      const mistakes = await screen.findByRole('region', { name: 'Mistake practice' });
      expect(listAfter(mistakes, 'Most missed type of math')).toHaveTextContent(
        'Multiplication and Division (missed 3 times each)',
      );
    });

    it('lists the most missed facts by incorrect count, then most recent', async () => {
      seedMistakes();
      renderAt('/statistics');
      const mistakes = await screen.findByRole('region', { name: 'Mistake practice' });
      const list = listAfter(mistakes, 'Most missed facts');
      expect(factNames(list)).toEqual([
        '8 times 7 equals 56',
        '56 divided by 8 equals 7',
        '12 divided by 3 equals 4',
        '9 plus 5 equals 14',
      ]);
      const items = within(list).getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('Missed 3 times');
      expect(items[2]).toHaveTextContent('Missed 1 time · Mastered!');
    });

    it('shows each fact to practice with its count, progress and last missed date', async () => {
      seedMistakes();
      renderAt('/statistics');
      const mistakes = await screen.findByRole('region', { name: 'Mistake practice' });
      const list = listAfter(mistakes, 'Facts to practice');
      expect(factNames(list)).toEqual([
        '8 times 7 equals 56',
        '56 divided by 8 equals 7',
        '9 plus 5 equals 14',
      ]);
      const first = within(list).getAllByRole('listitem')[0];
      expect(statValue(first, 'Missed')).toBe('3 times');
      expect(statValue(first, 'Progress')).toBe('1 of 3 similar questions right in a row');
      expect(first.querySelector('time')).toHaveAttribute('dateTime', '2026-10-21T10:00:00.000Z');
    });

    it('keeps mastered facts in a separate section that opens on request', async () => {
      seedMistakes();
      renderAt('/statistics');
      const mistakes = await screen.findByRole('region', { name: 'Mistake practice' });
      const summary = within(mistakes).getByText('Mastered facts (1)');
      const details = summary.closest('details')!;
      expect(details.open).toBe(false);
      await userEvent.click(summary);
      expect(details.open).toBe(true);
      const mastered = within(details).getAllByRole('listitem');
      expect(mastered).toHaveLength(1);
      expect(statValue(mastered[0], 'Progress')).toBe('Mastered!');
      expect(details.querySelector('progress')).toBeNull();
    });

    it('uses the mastery threshold from Settings', async () => {
      seedMistakes({ ...DEFAULT_SETTINGS, masteryThreshold: 1 });
      renderAt('/statistics');
      const mistakes = await screen.findByRole('region', { name: 'Mistake practice' });
      expect(statValue(mistakes, 'Facts to practice')).toBe('2');
      expect(statValue(mistakes, 'Facts mastered')).toBe('2');
      const first = within(listAfter(mistakes, 'Facts to practice')).getAllByRole('listitem')[0];
      expect(statValue(first, 'Progress')).toBe('0 of 1 similar questions right in a row');
    });

    it('shows an empty state when every fact is mastered', async () => {
      writeData(
        'mistakePatterns',
        patterns.map((pattern) => ({ ...pattern, mastered: true })),
      );
      renderAt('/statistics');
      const mistakes = await screen.findByRole('region', { name: 'Mistake practice' });
      expect(
        within(mistakes).getByText("You've mastered every fact you missed. Great job!"),
      ).toBeVisible();
      expect(within(mistakes).getByText('Mastered facts (4)')).toBeVisible();
    });

    it('shows an empty mastered section when nothing is mastered yet', async () => {
      writeData('mistakePatterns', [PATTERN]);
      renderAt('/statistics');
      const mistakes = await screen.findByRole('region', { name: 'Mistake practice' });
      await userEvent.click(within(mistakes).getByText('Mastered facts (0)'));
      expect(within(mistakes).getByText(/No mastered facts yet/)).toBeVisible();
    });

    it('clears review answers on reset but keeps the facts to practice', async () => {
      seedMistakes();
      renderAt('/statistics');
      await userEvent.click(await screen.findByRole('button', { name: 'Reset Statistics' }));
      await userEvent.click(screen.getByRole('button', { name: 'Yes, Reset Statistics' }));
      const mistakes = section('Mistake practice');
      expect(statValue(mistakes, 'Similar questions practiced')).toBe('0');
      expect(statValue(mistakes, 'Review questions answered correctly')).toBe('0');
      expect(statValue(mistakes, 'Facts to practice')).toBe('3');
      expect(statValue(mistakes, 'Facts mastered')).toBe('1');
    });
  });

  it('lists completed sessions newest first and leaves out unfinished ones', async () => {
    seedStoredData();
    renderAt('/statistics');
    const sessions = within(
      await screen.findByRole('region', { name: 'Recent sessions' }),
    ).getAllByRole('listitem');
    expect(sessions).toHaveLength(2);
    expect(sessions[0].querySelector('time')).toHaveAttribute(
      'dateTime',
      '2026-10-21T10:05:00.000Z',
    );
    expect(sessions[0]).toHaveTextContent('Multiplication · Level 2: Easy');
    expect(statValue(sessions[0], 'Attempted')).toBe('2');
    expect(statValue(sessions[0], 'Accuracy')).toBe('0%');
    expect(sessions[1]).toHaveTextContent('Addition, Subtraction · Level 1: Beginner');
    expect(statValue(sessions[1], 'Correct')).toBe('3');
    expect(statValue(sessions[1], 'Incorrect')).toBe('1');
    expect(statValue(sessions[1], 'Accuracy')).toBe('75%');
  });

  it('rebuilds the totals from saved attempts when the stored totals are corrupted', async () => {
    seedStoredData();
    localStorage.setItem(STORAGE_KEYS.statistics, '{oops');
    renderAt('/statistics');
    const overview = await screen.findByRole('region', { name: 'All your practice' });
    expect(statValue(overview, 'Attempted')).toBe('5');
    expect(statValue(overview, 'Accuracy')).toBe('60%');
  });

  it('keeps everything when the reset is cancelled', async () => {
    seedStoredData();
    renderAt('/statistics');
    const resetButton = await screen.findByRole('button', { name: 'Reset Statistics' });
    await userEvent.click(resetButton);
    const dialog = screen.getByRole('dialog', { name: 'Reset your statistics?' });
    expect(dialog).toHaveAccessibleDescription(
      "This clears all your answers, practice sessions, and statistics. Your mistakes to practice and your settings will be kept. This can't be undone.",
    );
    expect(within(dialog).getByRole('button', { name: 'Keep My Statistics' })).toHaveFocus();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Keep My Statistics' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(resetButton).toHaveFocus();
    expect(readData('attempts').value).toHaveLength(5);
    expect(readData('sessions').value).toHaveLength(3);
    expect(statValue(section('All your practice'), 'Attempted')).toBe('5');

    await userEvent.click(resetButton);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(readData('statistics').value.attempted).toBe(5);
  });

  it('clears attempts, sessions and totals after confirmation, keeping mistakes and settings', async () => {
    seedStoredData();
    renderAt('/statistics');
    await userEvent.click(await screen.findByRole('button', { name: 'Reset Statistics' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, Reset Statistics' }));

    expect(localStorage.getItem(STORAGE_KEYS.attempts)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.sessions)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.statistics)).toBeNull();
    expect(readData('mistakePatterns').value).toEqual([PATTERN]);
    expect(readData('settings').value).toEqual(SETTINGS);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(
      'Your statistics have been reset. Your mistakes to practice and your settings are still saved.',
    );
    expect(status).toHaveFocus();
    expect(
      within(section('All your practice')).getByText(/You haven't answered any questions yet/),
    ).toBeVisible();
    expect(screen.queryByRole('region', { name: 'By type of math' })).not.toBeInTheDocument();
    expect(within(section('Recent sessions')).queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset Statistics' })).not.toBeInTheDocument();
  });

  it('says so when the reset cannot be saved', async () => {
    seedStoredData();
    renderAt('/statistics');
    await userEvent.click(await screen.findByRole('button', { name: 'Reset Statistics' }));
    const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    await userEvent.click(screen.getByRole('button', { name: 'Yes, Reset Statistics' }));
    spy.mockRestore();
    expect(screen.getByRole('status')).toHaveTextContent(
      "Your statistics couldn't be reset right now.",
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Your progress can't be saved on this device right now.",
    );
    expect(readData('attempts').value).toHaveLength(5);
  });

  it('counts a finished practice session exactly once', async () => {
    seedMathRandom(10);
    const router = renderAt('/practice/setup', {
      operations: ['subtraction'],
      difficulty: 3,
      sessionLength: 5,
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Start Session' }));
    for (const result of ['Right', 'Right', 'Wrong', 'Right', 'Right']) {
      await screen.findByRole('region', { name: 'Question card' });
      const group = screen.getByRole('group', { name: 'Choose an answer' });
      await userEvent.click(within(group).getAllByRole('button')[0]);
      await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
      await userEvent.click(screen.getByRole('button', { name: `I Got It ${result}` }));
    }
    await screen.findByRole('heading', { name: 'Session Summary' });
    await act(() => router.navigate('/statistics'));

    const overview = await screen.findByRole('region', { name: 'All your practice' });
    expect(statValue(overview, 'Attempted')).toBe('5');
    expect(statValue(overview, 'Correct')).toBe('4');
    expect(statValue(overview, 'Incorrect')).toBe('1');
    expect(statValue(overview, 'Accuracy')).toBe('80%');
    const subtraction = within(section('By type of math')).getAllByRole('listitem')[1];
    expect(statValue(subtraction, 'Attempted')).toBe('5');
    const level3 = within(section('By level')).getAllByRole('listitem')[2];
    expect(statValue(level3, 'Accuracy')).toBe('80%');
    const sessions = within(section('Recent sessions')).getAllByRole('listitem');
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toHaveTextContent('Subtraction · Level 3: Intermediate');
    expect(readData('statistics').value).toMatchObject({ attempted: 5, correct: 4, incorrect: 1 });
  });
});
