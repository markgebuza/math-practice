import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import type { PracticeConfig } from '../app/practiceConfig';
import { loadStatistics } from '../services/statisticsService';
import { readData, STORAGE_KEYS, writeData } from '../services/storageService';
import { seedMathRandom } from '../test/seededRandom';

const FIVE_ADDITIONS: PracticeConfig = {
  operations: ['addition'],
  difficulty: 1,
  sessionLength: 5,
};

function renderAt(path: string, initialPracticeConfig?: PracticeConfig) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProvider initialPracticeConfig={initialPracticeConfig}>
      <RouterProvider router={router} />
    </AppProvider>,
  );
  return router;
}

async function startSession(config: PracticeConfig) {
  const router = renderAt('/practice/setup', config);
  await userEvent.click(await screen.findByRole('button', { name: 'Start Session' }));
  await screen.findByRole('region', { name: 'Question card' });
  return router;
}

// A refresh: the page and all in-memory state are gone; only localStorage is left.
async function refresh(path = '/practice/session') {
  cleanup();
  const router = renderAt(path);
  if (path === '/practice/session') {
    await screen.findByRole('region', { name: 'Question card' });
  }
  return router;
}

const choiceButtons = () =>
  within(screen.getByRole('group', { name: 'Choose an answer' })).getAllByRole('button');
const questionText = () => screen.getByRole('heading', { name: /^What is / }).textContent;
const progress = () => screen.getByRole('progressbar', { name: 'Session progress' });
const storedActive = () => localStorage.getItem(STORAGE_KEYS.activeSession);
const leaveDialog = () => screen.queryByRole('dialog', { name: 'Leave your practice session?' });

async function answer(result: 'I Got It Right' | 'I Got It Wrong') {
  await userEvent.click(choiceButtons()[0]);
  await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
  await userEvent.click(screen.getByRole('button', { name: result }));
}

function fireBeforeUnload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  seedMathRandom(1818);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('session recovery after a refresh', () => {
  it('restores the same question, selection, flip state and totals without counting twice', async () => {
    await startSession(FIVE_ADDITIONS);
    await answer('I Got It Wrong');
    const question = questionText();
    await userEvent.click(choiceButtons()[2]);
    const picked = choiceButtons()[2].textContent;

    await refresh();
    expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
    expect(questionText()).toBe(question);
    expect(choiceButtons()[2]).toHaveAttribute('aria-pressed', 'true');
    expect(choiceButtons()[2]).toHaveTextContent(picked!);
    expect(progress()).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByRole('button', { name: 'Flip Card' })).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
    await refresh();
    const back = screen.getByRole('heading', { name: / equals / });
    expect(back).toHaveFocus();
    expect(screen.getByText('Your answer').nextElementSibling).toHaveTextContent(
      picked!.replace('✓', ''),
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Your answer: \d+\./));

    // The answer recorded before the refreshes is still counted exactly once.
    expect(loadStatistics()).toMatchObject({ attempted: 1, incorrect: 1 });
    expect(readData('mistakePatterns').value).toHaveLength(1);
    expect(readData('mistakePatterns').value[0].incorrectCount).toBe(1);

    await userEvent.click(screen.getByRole('button', { name: 'I Got It Right' }));
    expect(screen.getByText('Question 3 of 5')).toBeInTheDocument();
    expect(progress()).toHaveAttribute('aria-valuenow', '2');
    expect(loadStatistics()).toMatchObject({ attempted: 2, correct: 1, incorrect: 1 });
    expect(readData('attempts').value).toHaveLength(2);
    expect(readData('sessions').value).toEqual([
      expect.objectContaining({ attempted: 2, correct: 1, incorrect: 1 }),
    ]);
  });

  it('keeps a mistake-review session reviewing mistakes after a refresh', async () => {
    writeData('mistakePatterns', [
      {
        id: 'pattern-1',
        operation: 'multiplication',
        firstOperand: 8,
        secondOperand: 7,
        correctAnswer: 56,
        difficulty: 2,
        incorrectCount: 2,
        similarCorrectCount: 0,
        lastIncorrectAt: '2026-10-21T10:00:00.000Z',
        mastered: false,
      },
    ]);
    renderAt('/practice/setup', FIVE_ADDITIONS);
    await userEvent.click(await screen.findByRole('radio', { name: /Practice my mistakes/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Start Session' }));
    await answer('I Got It Right');
    const question = questionText();

    await refresh();
    expect(screen.getByText('Practicing: My mistakes')).toBeInTheDocument();
    expect(questionText()).toBe(question);
    await answer('I Got It Right');
    expect(readData('mistakePatterns').value[0].similarCorrectCount).toBe(2);
  });

  it('forgets the session once it is finished', async () => {
    await startSession(FIVE_ADDITIONS);
    expect(storedActive()).not.toBeNull();
    for (let i = 0; i < 5; i++) {
      await answer('I Got It Right');
    }
    await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
    expect(storedActive()).toBeNull();
  });

  it.each([
    ['broken JSON', '{"session":'],
    ['data that is not a session', JSON.stringify({ session: 'nope', currentQuestion: null })],
  ])(
    'drops only the saved session when it is %s and shows the friendly message',
    async (_, raw) => {
      writeData('attempts', []);
      localStorage.setItem(STORAGE_KEYS.activeSession, raw);
      const router = renderAt('/practice/session');
      await screen.findByRole('heading', { level: 1, name: 'Get Ready to Practice' });
      expect(router.state.location.pathname).toBe('/practice/setup');
      expect(screen.getByText(/Let's get your cards ready!/)).toBeInTheDocument();
      expect(storedActive()).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.attempts)).toBe('[]');
    },
  );
});

describe('leaving an active session', () => {
  it('asks before the header navigation leaves, and Keep Practicing stays on the same card', async () => {
    const router = await startSession(FIVE_ADDITIONS);
    const question = questionText();
    await userEvent.click(choiceButtons()[1]);

    await userEvent.click(screen.getByRole('link', { name: 'Statistics' }));
    const dialog = leaveDialog()!;
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Keep Practicing' })).toHaveFocus();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Keep Practicing' }));
    expect(leaveDialog()).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/practice/session');
    expect(questionText()).toBe(question);
    expect(choiceButtons()[1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('ends the session and goes where the child chose with End Session and Leave', async () => {
    const router = await startSession(FIVE_ADDITIONS);
    await answer('I Got It Right');

    await userEvent.click(screen.getByRole('link', { name: 'Statistics' }));
    await userEvent.click(screen.getByRole('button', { name: 'End Session and Leave' }));
    await screen.findByRole('heading', { level: 1, name: 'Your Statistics' });
    expect(router.state.location.pathname).toBe('/statistics');
    expect(storedActive()).toBeNull();
    expect(readData('sessions').value).toEqual([
      expect.objectContaining({ attempted: 1, completedAt: expect.any(String) }),
    ]);

    // The ended session can't be continued, and nothing asks to leave any more.
    await act(() => router.navigate('/practice/session'));
    expect(router.state.location.pathname).toBe('/practice/summary');
    await userEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(leaveDialog()).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('also asks for the browser back button and other in-app navigation', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/', '/practice/setup'] });
    render(
      <AppProvider initialPracticeConfig={FIVE_ADDITIONS}>
        <RouterProvider router={router} />
      </AppProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Start Session' }));
    await screen.findByRole('region', { name: 'Question card' });

    await act(() => router.navigate(-1));
    expect(leaveDialog()).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(leaveDialog()).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/practice/session');
  });

  it('warns before closing or refreshing the tab only while the session is active', async () => {
    expect(fireBeforeUnload().defaultPrevented).toBe(false);
    await startSession(FIVE_ADDITIONS);
    expect(fireBeforeUnload().defaultPrevented).toBe(true);

    for (let i = 0; i < 5; i++) {
      await answer('I Got It Right');
    }
    await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
    expect(leaveDialog()).not.toBeInTheDocument();
    expect(fireBeforeUnload().defaultPrevented).toBe(false);
    await userEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(leaveDialog()).not.toBeInTheDocument();
  });

  it('goes straight to the summary after End Session, with no leave warning', async () => {
    const router = await startSession({ ...FIVE_ADDITIONS, sessionLength: 'continuous' });
    await answer('I Got It Right');
    await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, End Session' }));
    await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
    expect(router.state.location.pathname).toBe('/practice/summary');
    expect(leaveDialog()).not.toBeInTheDocument();
    expect(storedActive()).toBeNull();
    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });
});

describe('Reset Statistics with an unfinished session', () => {
  it('ends the unfinished session so its totals stay consistent', async () => {
    await startSession(FIVE_ADDITIONS);
    await answer('I Got It Wrong');
    // Reopened on Statistics: the unfinished session is restored but not on screen.
    const router = await refresh('/statistics');
    await userEvent.click(await screen.findByRole('button', { name: 'Reset Statistics' }));
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Your unfinished practice session will end too.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Yes, Reset Statistics' }));

    expect(storedActive()).toBeNull();
    expect(loadStatistics().attempted).toBe(0);
    await act(() => router.navigate('/practice/session'));
    expect(router.state.location.pathname).toBe('/practice/setup');
  });
});
