import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import type { PracticeConfig } from '../app/practiceConfig';
import { isSameQuestion } from '../services/questionGenerator';
import { seedMathRandom } from '../test/seededRandom';
import { writeData } from '../services/storageService';
import { DEFAULT_SETTINGS, type MathOperation } from '../types';
import { POSITIVE_FEEDBACK, SUPPORTIVE_FEEDBACK } from '../utils/feedback';

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

const OPERATION_BY_WORD: Record<string, MathOperation> = {
  plus: 'addition',
  minus: 'subtraction',
  times: 'multiplication',
  'divided by': 'division',
};

function shownQuestion() {
  const heading = screen.getByRole('heading', { name: /^What is / });
  const match = /^What is (\d+) (plus|minus|times|divided by) (\d+)\?$/.exec(
    heading.textContent!.replace(/^.*?What is/, 'What is'),
  )!;
  return {
    operation: OPERATION_BY_WORD[match[2]],
    firstOperand: Number(match[1]),
    secondOperand: Number(match[3]),
  };
}

async function flipWithFirstChoice() {
  const group = screen.getByRole('group', { name: 'Choose an answer' });
  await userEvent.click(within(group).getAllByRole('button')[0]);
  await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
}

async function answer(result: 'I Got It Right' | 'I Got It Wrong' = 'I Got It Right') {
  await flipWithFirstChoice();
  await userEvent.click(screen.getByRole('button', { name: result }));
}

async function tabTo(element: HTMLElement) {
  for (let presses = 0; presses < 40 && document.activeElement !== element; presses++) {
    await userEvent.tab();
  }
  expect(element).toHaveFocus();
}

const escape = (text: string) => text.replace(/[.!?]/g, '\\$&');
const POSITIVE = `(?:${POSITIVE_FEEDBACK.map(escape).join('|')})`;
const SUPPORTIVE = `(?:${SUPPORTIVE_FEEDBACK.map(escape).join('|')})`;
const feedbackLine = () => document.querySelector('.practice-page__feedback');

const progress = () => screen.getByRole('progressbar', { name: 'Session progress' });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PracticePage', () => {
  it('redirects to setup with a friendly message when no session was started', async () => {
    const router = renderAt('/practice/session');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Get Ready to Practice' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/practice/setup');
    expect(screen.getByText(/Let's get your cards ready!/)).toBeInTheDocument();
  });

  it('shows no message on setup when it is opened normally', async () => {
    renderAt('/practice/setup');
    await screen.findByRole('heading', { level: 1, name: 'Get Ready to Practice' });
    expect(screen.queryByText(/Let's get your cards ready!/)).not.toBeInTheDocument();
  });

  it('starts from setup with the first question and empty progress', async () => {
    seedMathRandom(6);
    await startSession({ operations: ['division'], difficulty: 2, sessionLength: 5 });
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
    expect(shownQuestion().operation).toBe('division');
    expect(progress()).toHaveAttribute('aria-valuenow', '0');
    expect(progress()).toHaveAttribute('aria-valuemax', '5');
    expect(screen.getByRole('list', { name: 'Your choices' })).toHaveTextContent('Math: Division');
    expect(screen.queryByRole('button', { name: 'End Session' })).not.toBeInTheDocument();
  });

  it('counts each attempt exactly once, even with a fast double-click', async () => {
    seedMathRandom(7);
    await startSession({ operations: ['addition'], difficulty: 1, sessionLength: 5 });
    await flipWithFirstChoice();
    const right = screen.getByRole('button', { name: 'I Got It Right' });
    act(() => {
      right.click();
      right.click();
    });
    expect(await screen.findByText('Question 2 of 5')).toBeInTheDocument();
    expect(progress()).toHaveAttribute('aria-valuenow', '1');
    expect(feedbackLine()).toHaveTextContent(new RegExp(`^${POSITIVE} Here is question 2\\.$`));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        new RegExp(`^${POSITIVE} Question 2 of 5: What is \\d+ plus \\d+\\?$`),
      ),
    );

    await answer('I Got It Wrong');
    expect(screen.getByText('Question 3 of 5')).toBeInTheDocument();
    expect(progress()).toHaveAttribute('aria-valuenow', '2');
    expect(feedbackLine()).toHaveTextContent(new RegExp(`^${SUPPORTIVE} Here is question 3\\.$`));
    expect(screen.getByRole('status')).toHaveTextContent(
      new RegExp(`^${SUPPORTIVE} Question 3 of 5: What is`),
    );
  });

  it('announces each new question, the revealed answer and progress in one live region', async () => {
    seedMathRandom(11);
    await startSession({ operations: ['addition'], difficulty: 1, sessionLength: 5 });
    expect(screen.getAllByRole('status')).toHaveLength(1);
    const status = screen.getByRole('status');
    const { firstOperand, secondOperand } = shownQuestion();
    await waitFor(() =>
      expect(status).toHaveTextContent(
        `Question 1 of 5: What is ${firstOperand} plus ${secondOperand}?`,
      ),
    );

    await userEvent.keyboard('2');
    const group = screen.getByRole('group', { name: 'Choose an answer' });
    const second = within(group).getAllByRole('button')[1];
    expect(second).toHaveAttribute('aria-pressed', 'true');
    expect(second).toHaveFocus();
    const picked = Number(second.textContent!.replace('✓', ''));

    await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
    expect(status).toHaveTextContent(
      `Correct answer: ${firstOperand + secondOperand}. Your answer: ${picked}.`,
    );

    await userEvent.click(screen.getByRole('button', { name: 'I Got It Right' }));
    expect(status).toHaveTextContent(new RegExp(`^${POSITIVE} Question 2 of 5: What is`));
    expect(screen.getByRole('group', { name: 'Question 2' })).toHaveFocus();
  });

  it('ignores number keys while the end-session dialog is open', async () => {
    seedMathRandom(12);
    await startSession({ operations: ['addition'], difficulty: 1, sessionLength: 'continuous' });
    await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
    await userEvent.keyboard('1');
    await userEvent.click(screen.getByRole('button', { name: 'Keep Practicing' }));
    const group = screen.getByRole('group', { name: 'Choose an answer' });
    for (const button of within(group).getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('can be played start to finish with only Tab, Space and Enter', async () => {
    seedMathRandom(13);
    const router = renderAt('/practice/setup', {
      operations: ['subtraction'],
      difficulty: 1,
      sessionLength: 5,
    });
    const start = await screen.findByRole('button', { name: 'Start Session' });
    await tabTo(start);
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('region', { name: 'Question card' });

    for (let question = 1; question <= 5; question++) {
      const group = screen.getByRole('group', { name: 'Choose an answer' });
      await tabTo(within(group).getAllByRole('button')[0]);
      await userEvent.keyboard(' ');
      await tabTo(screen.getByRole('button', { name: 'Flip Card' }));
      await userEvent.keyboard(' ');
      expect(screen.getByRole('heading', { name: / equals / })).toHaveFocus();
      await userEvent.tab();
      expect(screen.getByRole('button', { name: 'I Got It Right' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
    }

    await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
    expect(router.state.location.pathname).toBe('/practice/summary');
  });

  describe('feedback messages', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('keeps the message on screen until the next answer, however long the child takes', async () => {
      seedMathRandom(14);
      await startSession({ operations: ['addition'], difficulty: 1, sessionLength: 5 });
      await answer();
      const first = feedbackLine()!.textContent;
      expect(first).toMatch(new RegExp(`^${POSITIVE} Here is question 2\\.$`));

      vi.useFakeTimers();
      act(() => vi.advanceTimersByTime(2500));
      expect(feedbackLine()).toHaveTextContent(first!);
      act(() => vi.advanceTimersByTime(60_000));
      expect(feedbackLine()).toHaveTextContent(first!);
      vi.useRealTimers();

      await flipWithFirstChoice();
      expect(feedbackLine()).toHaveTextContent(first!);

      await userEvent.click(screen.getByRole('button', { name: 'I Got It Right' }));
      const second = feedbackLine()!.textContent!;
      expect(second).toMatch(new RegExp(`^${POSITIVE} Here is question 3\\.$`));
      expect(second.replace(' Here is question 3.', '')).not.toBe(
        first!.replace(' Here is question 2.', ''),
      );
    });

    it('shows no messages when they are turned off in Settings', async () => {
      writeData('settings', { ...DEFAULT_SETTINGS, feedbackMessages: false });
      seedMathRandom(15);
      await startSession({ operations: ['addition'], difficulty: 1, sessionLength: 5 });
      await answer();
      await answer('I Got It Wrong');
      expect(screen.getByText('Question 3 of 5')).toBeInTheDocument();
      expect(feedbackLine()).not.toBeInTheDocument();
      const status = screen.getByRole('status');
      expect(status).toHaveTextContent(/^Question 3 of 5: What is/);
      for (const message of [...POSITIVE_FEEDBACK, ...SUPPORTIVE_FEEDBACK]) {
        expect(screen.queryByText(message, { exact: false })).not.toBeInTheDocument();
      }
    });
  });

  it('resets the selection and flip state for the next question and focuses the new card', async () => {
    seedMathRandom(8);
    await startSession({ operations: ['multiplication'], difficulty: 2, sessionLength: 10 });
    await answer();
    const group = screen.getByRole('group', { name: 'Choose an answer' });
    for (const choice of within(group).getAllByRole('button')) {
      expect(choice).toHaveAttribute('aria-pressed', 'false');
      expect(choice).toBeEnabled();
    }
    expect(screen.getByRole('button', { name: 'Flip Card' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'I Got It Right' })).not.toBeInTheDocument();
    expect(document.activeElement).toHaveClass('practice-page__card');
  });

  // 19 full answer flows take ~3.5 s alone and can pass 5 s when all test files run in parallel.
  it('never shows the same question twice in a row', async () => {
    seedMathRandom(9);
    await startSession({ operations: ['multiplication'], difficulty: 1, sessionLength: 20 });
    let previous = shownQuestion();
    for (let n = 2; n <= 20; n++) {
      await answer();
      const current = shownQuestion();
      expect(isSameQuestion(current, previous)).toBe(false);
      previous = current;
    }
  }, 15000);

  it('goes to the summary after the last question of a fixed-length session', async () => {
    const router = await startSession({
      operations: ['subtraction'],
      difficulty: 1,
      sessionLength: 5,
    });
    for (let n = 1; n <= 5; n++) {
      expect(screen.getByText(`Question ${n} of 5`)).toBeInTheDocument();
      await answer(n % 2 ? 'I Got It Right' : 'I Got It Wrong');
    }
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Session Summary' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/practice/summary');
  });

  it('keeps the session when the child leaves the page and comes back', async () => {
    const router = await startSession({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
    });
    await answer();
    await act(() => router.navigate('/statistics'));
    await act(() => router.navigate('/practice/session'));
    expect(await screen.findByText('Question 2 of 5')).toBeInTheDocument();
    expect(progress()).toHaveAttribute('aria-valuenow', '1');
  });

  describe('continuous practice', () => {
    const continuous: PracticeConfig = {
      operations: ['addition', 'subtraction'],
      difficulty: 1,
      sessionLength: 'continuous',
    };

    it('keeps going without a fixed total and counts answers', async () => {
      await startSession(continuous);
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('0 questions answered so far')).toBeInTheDocument();
      for (let n = 1; n <= 25; n++) {
        await answer();
      }
      expect(screen.getByText('Question 26')).toBeInTheDocument();
      expect(screen.getByText('25 questions answered so far')).toBeInTheDocument();
    });

    it('asks before ending, and Keep Practicing stays on the same question', async () => {
      const router = await startSession(continuous);
      await answer();
      const question = shownQuestion();
      const endButton = screen.getByRole('button', { name: 'End Session' });
      await userEvent.click(endButton);
      expect(screen.getByRole('dialog', { name: 'End this session?' })).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Keep Practicing' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(endButton).toHaveFocus();
      expect(shownQuestion()).toEqual(question);
      expect(screen.getByText('Question 2')).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/practice/session');
    });

    it('shows the summary page after confirming End Session', async () => {
      const router = await startSession(continuous);
      await answer();
      await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
      await userEvent.click(screen.getByRole('button', { name: 'Yes, End Session' }));
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Session Summary' }),
      ).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/practice/summary');
    });
  });
});
