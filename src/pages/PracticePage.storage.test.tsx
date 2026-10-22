import { cleanup, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import type { PracticeConfig } from '../app/practiceConfig';
import { useStorage } from '../app/storageContext';
import { loadRecentSessions, readData, STORAGE_KEYS } from '../services/storageService';
import { seedMathRandom } from '../test/seededRandom';
import { DEFAULT_SETTINGS } from '../types';

const FIVE_ADDITION: PracticeConfig = {
  operations: ['addition'],
  difficulty: 1,
  sessionLength: 5,
};

const WARNING = /Your progress can't be saved on this device right now/;

async function startSession(config: PracticeConfig) {
  const router = createMemoryRouter(routes, { initialEntries: ['/practice/setup'] });
  render(
    <AppProvider initialPracticeConfig={config}>
      <RouterProvider router={router} />
    </AppProvider>,
  );
  await userEvent.click(await screen.findByRole('button', { name: 'Start Session' }));
  await screen.findByRole('region', { name: 'Question card' });
  return router;
}

async function answer(result: 'I Got It Right' | 'I Got It Wrong') {
  const group = screen.getByRole('group', { name: 'Choose an answer' });
  const choice = within(group).getAllByRole('button')[0];
  const selected = Number(choice.textContent);
  await userEvent.click(choice);
  await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
  await userEvent.click(screen.getByRole('button', { name: result }));
  return selected;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('saving practice data', () => {
  it('saves each attempt as soon as it is reported', async () => {
    seedMathRandom(21);
    await startSession(FIVE_ADDITION);
    const selected = await answer('I Got It Wrong');

    const attempts = readData('attempts').value;
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      operation: 'addition',
      difficulty: 1,
      selectedAnswer: selected,
      selfReportedCorrect: false,
      source: 'regular',
    });
    expect(Date.parse(attempts[0].attemptedAt)).not.toBeNaN();

    const sessions = readData('sessions').value;
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ attempted: 1, correct: 0, incorrect: 1 });
    expect(sessions[0].completedAt).toBeUndefined();
    expect(attempts[0].sessionId).toBe(sessions[0].id);

    expect(readData('mistakePatterns').value).toEqual([
      expect.objectContaining({
        operation: 'addition',
        firstOperand: attempts[0].firstOperand,
        secondOperand: attempts[0].secondOperand,
        correctAnswer: attempts[0].correctAnswer,
        difficulty: 1,
        incorrectCount: 1,
        lastIncorrectAt: attempts[0].attemptedAt,
      }),
    ]);
  });

  it('saves the completed session with its totals after the last answer', async () => {
    seedMathRandom(22);
    await startSession(FIVE_ADDITION);
    for (const result of ['Right', 'Right', 'Wrong', 'Right', 'Right'] as const) {
      await answer(`I Got It ${result}`);
    }
    await screen.findByRole('heading', { level: 1, name: 'Session Summary' });

    expect(readData('attempts').value).toHaveLength(5);
    const [session] = loadRecentSessions();
    expect(session).toMatchObject({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      attempted: 5,
      correct: 4,
      incorrect: 1,
    });
    expect(session.completedAt).toBe(readData('attempts').value[4].attemptedAt);
  });

  it('saves an ended continuous session with its completion time', async () => {
    await startSession({ ...FIVE_ADDITION, sessionLength: 'continuous' });
    await answer('I Got It Right');
    await answer('I Got It Right');
    await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, End Session' }));

    const [session] = loadRecentSessions();
    expect(session).toMatchObject({ sessionLength: 'continuous', attempted: 2, correct: 2 });
    expect(session.completedAt).toEqual(expect.any(String));
  });

  it('does not save a session that ended with no answers', async () => {
    await startSession({ ...FIVE_ADDITION, sessionLength: 'continuous' });
    await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, End Session' }));
    await screen.findByText(/No questions answered this time/);
    expect(localStorage.getItem(STORAGE_KEYS.sessions)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.attempts)).toBeNull();
  });

  it('keeps data after a simulated reload', async () => {
    seedMathRandom(23);
    await startSession(FIVE_ADDITION);
    for (let n = 1; n <= 5; n++) {
      await answer('I Got It Right');
    }
    await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
    const savedAttempts = readData('attempts').value;
    cleanup();

    await startSession(FIVE_ADDITION);
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
    expect(readData('attempts').value).toEqual(savedAttempts);
    await answer('I Got It Wrong');
    expect(readData('attempts').value).toHaveLength(6);
    expect(readData('sessions').value).toHaveLength(2);
    expect(loadRecentSessions()).toHaveLength(1);
  });

  it('loads stored settings at startup and uses defaults when there are none', () => {
    const first = renderHook(() => useStorage(), { wrapper: AppProvider });
    expect(first.result.current.settings).toEqual(DEFAULT_SETTINGS);
    first.unmount();

    const stored = { ...DEFAULT_SETTINGS, showExplanations: false, masteryThreshold: 5 };
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(stored));
    const second = renderHook(() => useStorage(), { wrapper: AppProvider });
    expect(second.result.current.settings).toEqual(stored);
  });

  it('starts normally when one stored category is corrupted, keeping the others', async () => {
    const attempt = {
      id: 'old-attempt',
      questionId: 'old-question',
      operation: 'division',
      firstOperand: 56,
      secondOperand: 8,
      correctAnswer: 7,
      selectedAnswer: 7,
      selfReportedCorrect: true,
      difficulty: 2,
      source: 'regular',
      attemptedAt: '2026-10-20T10:00:00.000Z',
      sessionId: 'old-session',
    };
    localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify([attempt]));
    localStorage.setItem(STORAGE_KEYS.sessions, '[{"id": "broken"');
    localStorage.setItem(STORAGE_KEYS.settings, '{oops');

    await startSession(FIVE_ADDITION);
    await answer('I Got It Right');

    expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
    expect(readData('attempts').value.map((a) => a.id)).toEqual([
      'old-attempt',
      expect.any(String),
    ]);
    expect(readData('sessions').value).toHaveLength(1);
    expect(readData('settings')).toEqual({ value: DEFAULT_SETTINGS, status: 'missing' });
  });

  describe('when storage throws', () => {
    it('keeps the session running and shows a friendly warning', async () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });
      seedMathRandom(24);
      await startSession(FIVE_ADDITION);
      await answer('I Got It Right');
      await answer('I Got It Wrong');

      expect(screen.getByRole('alert')).toHaveTextContent(WARNING);
      expect(screen.getByText('Question 3 of 5')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');

      await answer('I Got It Right');
      await answer('I Got It Right');
      await answer('I Got It Right');
      await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
      expect(screen.getByRole('alert')).toHaveTextContent(WARNING);
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('shows the warning only after a save fails', async () => {
      await startSession(FIVE_ADDITION);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });
      await answer('I Got It Right');
      expect(screen.getByRole('alert')).toHaveTextContent(WARNING);
      expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
    });

    it('works when localStorage cannot be accessed at all', async () => {
      vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError');
      });
      await startSession(FIVE_ADDITION);
      expect(screen.getByRole('alert')).toHaveTextContent(WARNING);
      await answer('I Got It Right');
      expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
    });
  });
});
