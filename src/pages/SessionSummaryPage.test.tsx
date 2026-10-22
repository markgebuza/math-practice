import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import type { PracticeConfig } from '../app/practiceConfig';
import { readData } from '../services/storageService';
import { seedMathRandom } from '../test/seededRandom';

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

async function answer(result: 'I Got It Right' | 'I Got It Wrong') {
  const group = screen.getByRole('group', { name: 'Choose an answer' });
  await userEvent.click(within(group).getAllByRole('button')[0]);
  await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
  await userEvent.click(screen.getByRole('button', { name: result }));
}

async function endContinuousSession() {
  await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
  await userEvent.click(screen.getByRole('button', { name: 'Yes, End Session' }));
  await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
}

function stat(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent;
}

const fiveSubtraction: PracticeConfig = {
  operations: ['subtraction'],
  difficulty: 1,
  sessionLength: 5,
};

const continuous: PracticeConfig = {
  operations: ['addition', 'multiplication'],
  difficulty: 2,
  sessionLength: 'continuous',
};

async function finishFiveQuestions() {
  const router = await startSession(fiveSubtraction);
  for (const result of [
    'I Got It Right',
    'I Got It Wrong',
    'I Got It Right',
    'I Got It Right',
    'I Got It Right',
  ] as const) {
    await answer(result);
  }
  await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
  return router;
}

beforeEach(() => {
  seedMathRandom(42);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SessionSummaryPage', () => {
  it('shows the totals of a finished 5-question session with 4 right and 1 wrong', async () => {
    const router = await finishFiveQuestions();
    expect(router.state.location.pathname).toBe('/practice/summary');
    expect(stat('Attempted')).toBe('5');
    expect(stat('Correct')).toBe('4');
    expect(stat('Incorrect')).toBe('1');
    expect(stat('Accuracy')).toBe('80%');
    expect(stat('Math practiced')).toBe('Subtraction');
    expect(stat('Level')).toBe('Level 1: Beginner');
    expect(stat('Mistake-review questions')).toBe('0');
    expect(screen.getByRole('heading', { level: 2, name: 'Great job!' })).toBeInTheDocument();
  });

  it('shows a friendly message when opened with no session', async () => {
    const router = renderAt('/practice/summary');
    expect(
      await screen.findByText("When you finish a practice session, you'll see how you did here."),
    ).toBeInTheDocument();
    expect(screen.queryByText('Attempted')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Start Practice' }));
    expect(router.state.location.pathname).toBe('/practice/setup');
  });

  it('asks the child to keep practicing when a session is still running', async () => {
    const router = await startSession(fiveSubtraction);
    await answer('I Got It Right');
    await act(() => router.navigate('/practice/summary'));
    expect(await screen.findByText(/You're still practicing!/)).toBeInTheDocument();
    expect(screen.queryByText('Attempted')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Keep Practicing' }));
    expect(await screen.findByText('Question 2 of 5')).toBeInTheDocument();
  });

  it('says no questions were answered when a continuous session ends right away', async () => {
    await startSession(continuous);
    await endContinuousSession();
    expect(screen.getByText(/No questions answered this time/)).toBeInTheDocument();
    expect(screen.queryByText('Attempted')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Practice Again' })).toBeEnabled();
  });

  it('shows the totals of an ended continuous session', async () => {
    await startSession(continuous);
    await answer('I Got It Wrong');
    await answer('I Got It Right');
    await answer('I Got It Wrong');
    await endContinuousSession();
    expect(stat('Attempted')).toBe('3');
    expect(stat('Correct')).toBe('1');
    expect(stat('Incorrect')).toBe('2');
    expect(stat('Accuracy')).toBe('33%');
    expect(stat('Math practiced')).toBe('Addition, Multiplication');
    expect(stat('Level')).toBe('Level 2: Easy');
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Nice work! Keep practicing, you are improving!',
      }),
    ).toBeInTheDocument();
  });

  it('Practice Again starts a new session with the same choices', async () => {
    const router = await finishFiveQuestions();
    await userEvent.click(screen.getByRole('button', { name: 'Practice Again' }));
    expect(await screen.findByText('Question 1 of 5')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/practice/session');
    expect(screen.getByRole('progressbar', { name: 'Session progress' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(screen.getByRole('list', { name: 'Your choices' })).toHaveTextContent(
      'Math: Subtraction',
    );
  });

  it('enables Practice Mistakes after a wrong answer and starts a review session', async () => {
    const router = await finishFiveQuestions();
    const button = screen.getByRole('button', { name: 'Practice Mistakes' });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAccessibleDescription();
    await userEvent.click(button);
    expect(await screen.findByText('Practicing: My mistakes')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/practice/session');
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
  });

  it('keeps Practice Mistakes disabled and explains why when nothing was missed', async () => {
    await startSession(fiveSubtraction);
    for (let i = 0; i < 5; i++) {
      await answer('I Got It Right');
    }
    await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
    const button = screen.getByRole('button', { name: 'Practice Mistakes' });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription('No mistakes to practice right now. Nice work!');
  });

  it('Practice Again after a review session starts another review session', async () => {
    await finishFiveQuestions();
    await userEvent.click(screen.getByRole('button', { name: 'Practice Mistakes' }));
    await screen.findByText('Practicing: My mistakes');
    for (let i = 0; i < 5; i++) {
      await answer('I Got It Wrong');
    }
    await screen.findByRole('heading', { level: 1, name: 'Session Summary' });
    expect(stat('Practice')).toBe('My mistakes');
    expect(stat('Mistake-review questions')).toBe('5');
    expect(readData('mistakePatterns').value).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Practice Again' }));
    expect(await screen.findByText('Practicing: My mistakes')).toBeInTheDocument();
  }, 15000);

  it.each([
    ['Change Settings', '/practice/setup', 'Get Ready to Practice'],
    ['View Statistics', '/statistics', 'Your Statistics'],
    ['Return Home', '/', 'Math Practice'],
  ])('%s goes to %s', async (name, path, heading) => {
    const router = await finishFiveQuestions();
    await userEvent.click(screen.getByRole('link', { name }));
    expect(router.state.location.pathname).toBe(path);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });
});
