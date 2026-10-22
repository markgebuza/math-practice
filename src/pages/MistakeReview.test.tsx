import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import { createQuestion, generateNextQuestion } from '../services/questionGenerator';
import { readData } from '../services/storageService';
import { seedMathRandom } from '../test/seededRandom';
import type { MathOperation } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { calculateAnswer } from '../utils/validation';

vi.mock('../services/questionGenerator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/questionGenerator')>();
  return { ...actual, generateNextQuestion: vi.fn(actual.generateNextQuestion) };
});

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

async function answer(result: 'I Got It Right' | 'I Got It Wrong') {
  const group = screen.getByRole('group', { name: 'Choose an answer' });
  await userEvent.click(within(group).getAllByRole('button')[0]);
  await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
  await userEvent.click(screen.getByRole('button', { name: result }));
}

const summaryHeading = () => screen.findByRole('heading', { level: 1, name: 'Session Summary' });
const practiceMistakes = () => screen.getByRole('button', { name: 'Practice Mistakes' });
const stat = (label: string) =>
  screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent;
const patterns = () => readData('mistakePatterns').value;

beforeEach(() => {
  seedMathRandom(2026);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('mistake review, end to end', () => {
  it('reviews a missed fact until mastered, then reactivates it after a new mistake', async () => {
    const threshold = DEFAULT_SETTINGS.masteryThreshold;
    const router = createMemoryRouter(routes, { initialEntries: ['/practice/setup'] });
    render(
      <AppProvider
        initialPracticeConfig={{ operations: ['multiplication'], difficulty: 2, sessionLength: 5 }}
      >
        <RouterProvider router={router} />
      </AppProvider>,
    );

    // 1. A regular session where 8 × 7 is marked I Got It Wrong.
    expect(await screen.findByRole('radio', { name: /Practice my mistakes/ })).toBeDisabled();
    vi.mocked(generateNextQuestion).mockReturnValueOnce(createQuestion('multiplication', 8, 7, 2));
    await userEvent.click(screen.getByRole('button', { name: 'Start Session' }));
    expect(shownQuestion()).toEqual({
      operation: 'multiplication',
      firstOperand: 8,
      secondOperand: 7,
    });
    await answer('I Got It Wrong');
    expect(patterns()).toEqual([
      expect.objectContaining({ firstOperand: 8, secondOperand: 7, incorrectCount: 1 }),
    ]);
    for (let i = 0; i < 4; i++) {
      await answer('I Got It Right');
    }
    await summaryHeading();

    // 2. Practice Mistakes is enabled and starts a review session.
    expect(practiceMistakes()).toBeEnabled();
    await userEvent.click(practiceMistakes());
    expect(await screen.findByText('Practicing: My mistakes')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/practice/session');

    // 3. Each review question is similar to 8 × 7 but never 8 × 7 itself.
    const patternId = patterns()[0].id;
    for (let i = 0; i < threshold; i++) {
      const question = shownQuestion();
      expect(question).not.toEqual({
        operation: 'multiplication',
        firstOperand: 8,
        secondOperand: 7,
      });
      const numbers = [
        question.firstOperand,
        question.secondOperand,
        calculateAnswer(question.operation, question.firstOperand, question.secondOperand),
      ];
      expect(numbers.some((n) => [8, 7, 56].includes(n))).toBe(true);
      expect(patterns()[0]).toMatchObject({ similarCorrectCount: i, mastered: false });
      await answer('I Got It Right');
    }

    // 4. After [threshold] correct similar answers the pattern is mastered and excluded:
    // nothing is left to review, so the session ends and Practice Mistakes is disabled.
    await summaryHeading();
    expect(patterns()).toEqual([
      expect.objectContaining({
        id: patternId,
        similarCorrectCount: threshold,
        mastered: true,
        incorrectCount: 1,
      }),
    ]);
    expect(stat('Mistake-review questions')).toBe(String(threshold));
    expect(stat('Practice')).toBe('My mistakes');
    expect(practiceMistakes()).toBeDisabled();
    expect(practiceMistakes()).toHaveAccessibleDescription(
      'No mistakes to practice right now. Nice work!',
    );
    expect(readData('attempts').value.filter((a) => a.source === 'mistake-review')).toHaveLength(
      threshold,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Change Settings' }));
    expect(await screen.findByRole('radio', { name: /Practice my mistakes/ })).toBeDisabled();

    // 5. Missing the same fact again (as 7 × 8) reactivates the pattern.
    vi.mocked(generateNextQuestion).mockReturnValueOnce(createQuestion('multiplication', 7, 8, 2));
    await userEvent.click(screen.getByRole('button', { name: 'Start Session' }));
    await answer('I Got It Wrong');
    expect(patterns()).toEqual([
      expect.objectContaining({
        id: patternId,
        incorrectCount: 2,
        similarCorrectCount: 0,
        mastered: false,
      }),
    ]);
    for (let i = 0; i < 4; i++) {
      await answer('I Got It Right');
    }
    await summaryHeading();
    expect(practiceMistakes()).toBeEnabled();
  }, 20000);
});
