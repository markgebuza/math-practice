import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { readData } from '../services/storageService';
import { seedMathRandom } from '../test/seededRandom';
import type { MathOperation } from '../types';
import { OPERATIONS } from '../utils/labels';
import { calculateAnswer } from '../utils/validation';
import { AppProvider } from './AppProvider';
import { routes } from './AppRoutes';

const OPERATION_BY_WORD: Record<string, MathOperation> = {
  plus: 'addition',
  minus: 'subtraction',
  times: 'multiplication',
  'divided by': 'division',
};

function shownQuestion() {
  const heading = screen.getByRole('heading', { name: /^What is / });
  const match = /What is (\d+) (plus|minus|times|divided by) (\d+)\?$/.exec(heading.textContent!)!;
  return {
    operation: OPERATION_BY_WORD[match[2]],
    firstOperand: Number(match[1]),
    secondOperand: Number(match[3]),
  };
}

const choiceButtons = () =>
  within(screen.getByRole('group', { name: 'Choose an answer' })).getAllByRole('button');

async function answer(result: 'I Got It Right' | 'I Got It Wrong') {
  await userEvent.click(choiceButtons()[0]);
  await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
  await userEvent.click(screen.getByRole('button', { name: result }));
}

function statValue(container: HTMLElement, label: string) {
  return within(container).getByText(label, { selector: 'dt' }).nextElementSibling?.textContent;
}

const nav = () => screen.getByRole('navigation', { name: 'Main' });
const summaryHeading = () => screen.findByRole('heading', { level: 1, name: 'Session Summary' });

function renderApp() {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );
  return router;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('practice flow through the real UI', () => {
  it('a wrong answer updates statistics, stores a pattern and comes back as a similar question', async () => {
    seedMathRandom(20);
    const router = renderApp();

    // 1. Start a practice session (5 addition questions at Level 1).
    await userEvent.click(await screen.findByRole('link', { name: 'Start Practice' }));
    await screen.findByRole('heading', { level: 1, name: 'Get Ready to Practice' });
    await userEvent.click(screen.getByRole('radio', { name: '5 questions' }));
    await userEvent.click(screen.getByRole('button', { name: 'Start Session' }));
    await screen.findByRole('region', { name: 'Question card' });
    expect(router.state.location.pathname).toBe('/practice/session');
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
    const missed = shownQuestion();
    expect(missed.operation).toBe('addition');
    const correctAnswer = missed.firstOperand + missed.secondOperand;

    // 2. Select an answer.
    const picked = choiceButtons()[0];
    await userEvent.click(picked);
    expect(picked).toHaveAttribute('aria-pressed', 'true');

    // 3. Flip the card: the back shows the correct answer.
    await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
    expect(
      screen.getByRole('heading', {
        name: `${missed.firstOperand} plus ${missed.secondOperand} equals ${correctAnswer}`,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Correct answer').nextElementSibling).toHaveTextContent(
      String(correctAnswer),
    );

    // 4. Mark the answer incorrect.
    await userEvent.click(screen.getByRole('button', { name: 'I Got It Wrong' }));
    expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();

    // 5. Statistics are updated right away (stored), and on the Statistics page after the session.
    expect(readData('statistics').value).toMatchObject({
      attempted: 1,
      correct: 0,
      incorrect: 1,
      byOperation: { addition: { attempted: 1, correct: 0, incorrect: 1 } },
      byDifficulty: { 1: { attempted: 1, correct: 0, incorrect: 1 } },
    });

    // 6. A mistake pattern is stored for the missed fact.
    expect(readData('mistakePatterns').value).toEqual([
      expect.objectContaining({
        operation: 'addition',
        firstOperand: missed.firstOperand,
        secondOperand: missed.secondOperand,
        correctAnswer,
        difficulty: 1,
        incorrectCount: 1,
        similarCorrectCount: 0,
        mastered: false,
      }),
    ]);

    for (let i = 0; i < 4; i++) {
      await answer('I Got It Right');
    }
    await summaryHeading();
    const summary = screen.getByRole('main');
    expect(statValue(summary, 'Attempted')).toBe('5');
    expect(statValue(summary, 'Correct')).toBe('4');
    expect(statValue(summary, 'Incorrect')).toBe('1');
    expect(statValue(summary, 'Math practiced')).toBe('Addition');

    await userEvent.click(within(nav()).getByRole('link', { name: 'Statistics' }));
    const overview = await screen.findByRole('region', { name: 'All your practice' });
    expect(statValue(overview, 'Attempted')).toBe('5');
    expect(statValue(overview, 'Correct')).toBe('4');
    expect(statValue(overview, 'Incorrect')).toBe('1');
    expect(statValue(overview, 'Accuracy')).toBe('80%');
    const addition = within(screen.getByRole('region', { name: 'By type of math' })).getAllByRole(
      'listitem',
    )[0];
    expect(statValue(addition, 'Incorrect')).toBe('1');
    expect(
      statValue(screen.getByRole('region', { name: 'Mistake practice' }), 'Facts to practice'),
    ).toBe('1');

    // 7. Start mistake-review mode.
    await userEvent.click(within(nav()).getByRole('link', { name: 'Practice' }));
    const review = await screen.findByRole('radio', { name: /Practice my mistakes/ });
    expect(review).toHaveAccessibleName(/1 fact to practice/);
    await userEvent.click(review);
    await userEvent.click(screen.getByRole('button', { name: 'Start Session' }));
    expect(await screen.findByRole('list', { name: 'Your choices' })).toHaveTextContent(
      'Practicing: My mistakes',
    );

    // 8. A similar question appears: related to the missed fact but not the exact same question
    // (a reversed fact such as 4 + 3 for 3 + 4 counts as similar, spec 6.4).
    const similar = shownQuestion();
    expect(similar).not.toEqual(missed);
    expect(['addition', 'subtraction']).toContain(similar.operation);
    const numbers = [
      similar.firstOperand,
      similar.secondOperand,
      calculateAnswer(similar.operation, similar.firstOperand, similar.secondOperand),
    ];
    expect(
      numbers.some((n) => [missed.firstOperand, missed.secondOperand, correctAnswer].includes(n)),
    ).toBe(true);
  }, 20000);

  it('plays a full mixed-operation session at Level 2 and records every answer', async () => {
    seedMathRandom(7);
    renderApp();
    await userEvent.click(await screen.findByRole('link', { name: 'Start Practice' }));
    await userEvent.click(await screen.findByRole('checkbox', { name: /Mixed operations/ }));
    await userEvent.click(screen.getByRole('radio', { name: /Level 2: Easy/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Start Session' }));
    await screen.findByRole('region', { name: 'Question card' });

    const seen: MathOperation[] = [];
    for (let n = 1; n <= 10; n++) {
      expect(screen.getByText(`Question ${n} of 10`)).toBeInTheDocument();
      seen.push(shownQuestion().operation);
      await answer(n % 3 === 0 ? 'I Got It Wrong' : 'I Got It Right');
    }
    await summaryHeading();

    expect(new Set(seen)).toEqual(new Set(OPERATIONS));
    const summary = screen.getByRole('main');
    expect(statValue(summary, 'Attempted')).toBe('10');
    expect(statValue(summary, 'Correct')).toBe('7');
    expect(statValue(summary, 'Incorrect')).toBe('3');
    expect(statValue(summary, 'Math practiced')).toBe(
      'Addition, Subtraction, Multiplication, Division',
    );
    expect(statValue(summary, 'Level')).toBe('Level 2: Easy');
    const attempts = readData('attempts').value;
    expect(attempts.map((a) => a.operation)).toEqual(seen);
    expect(attempts.every((a) => a.difficulty === 2)).toBe(true);
    expect(readData('mistakePatterns').value).toHaveLength(3);
  }, 20000);
});
