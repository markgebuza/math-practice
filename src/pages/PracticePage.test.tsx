import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import type { PracticeConfig } from '../app/practiceConfig';
import { isSameQuestion } from '../services/questionGenerator';
import { seedMathRandom } from '../test/seededRandom';
import type { MathOperation } from '../types';

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
    expect(screen.getByRole('status')).toHaveTextContent('Great job! Here is question 2.');

    await answer('I Got It Wrong');
    expect(screen.getByText('Question 3 of 5')).toBeInTheDocument();
    expect(progress()).toHaveAttribute('aria-valuenow', '2');
    expect(screen.getByRole('status')).toHaveTextContent('Thanks for being honest!');
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
  });

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
