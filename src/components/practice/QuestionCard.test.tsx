import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Question } from '../../types';
import { QuestionCard } from './QuestionCard';

const question: Question = {
  id: 'q1',
  operation: 'multiplication',
  firstOperand: 7,
  secondOperand: 8,
  displayText: '7 × 8',
  correctAnswer: 56,
  choices: [48, 54, 56, 64],
  difficulty: 2,
  source: 'regular',
};

const nextQuestion: Question = {
  ...question,
  id: 'q2',
  firstOperand: 6,
  displayText: '6 × 8',
  correctAnswer: 48,
  choices: [42, 48, 54, 56],
};

function renderCard(props: Partial<Parameters<typeof QuestionCard>[0]> = {}) {
  const onResult = vi.fn();
  const view = render(
    <QuestionCard
      question={question}
      questionNumber={3}
      totalQuestions={10}
      onResult={onResult}
      {...props}
    />,
  );
  return { onResult, ...view };
}

const choice = (value: number) => screen.getByRole('button', { name: `Answer ${value}` });
const flipButton = () => screen.getByRole('button', { name: 'Flip Card' });
const face = (container: HTMLElement, name: 'front' | 'back') =>
  container.querySelector<HTMLElement>(`[data-face="${name}"]`);

function mockReducedMotion(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

beforeAll(() => {
  // jsdom has no matchMedia; give it one so the spy above has something to replace.
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function selectAndFlip(value: number) {
  await userEvent.click(choice(value));
  await userEvent.click(flipButton());
}

describe('QuestionCard front', () => {
  it('shows the question, four choices and the question number', () => {
    renderCard();
    expect(screen.getByText('Question 3 of 10')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What is 7 times 8?' })).toHaveTextContent(
      '7 × 8 = ?',
    );
    const group = screen.getByRole('group', { name: 'Choose an answer' });
    expect(within(group).getAllByRole('button')).toHaveLength(4);
    for (const value of question.choices) {
      expect(choice(value)).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('leaves out the total for continuous practice', () => {
    renderCard({ totalQuestions: undefined, questionNumber: 4 });
    expect(screen.getByText('Question 4')).toBeInTheDocument();
  });

  it('keeps Flip Card disabled until an answer is selected', async () => {
    renderCard();
    expect(flipButton()).toBeDisabled();
    expect(flipButton()).toHaveAccessibleDescription('Pick an answer, then flip the card.');
    await userEvent.click(flipButton());
    expect(screen.queryByText('Correct answer')).not.toBeVisible();

    await userEvent.click(choice(54));
    expect(flipButton()).toBeEnabled();
    expect(screen.queryByText('Pick an answer, then flip the card.')).not.toBeInTheDocument();
  });

  it('highlights the selected answer with a check mark, not color alone', async () => {
    renderCard();
    await userEvent.click(choice(54));
    expect(choice(54)).toHaveAttribute('aria-pressed', 'true');
    expect(choice(54)).toHaveTextContent('54✓');
    expect(choice(56)).toHaveTextContent(/^56$/);
  });

  it('allows changing the answer before flipping', async () => {
    renderCard();
    await userEvent.click(choice(54));
    await userEvent.click(choice(64));
    expect(choice(64)).toHaveAttribute('aria-pressed', 'true');
    expect(choice(54)).toHaveAttribute('aria-pressed', 'false');
  });

  it('works with the keyboard', async () => {
    renderCard();
    await userEvent.tab();
    expect(choice(48)).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(choice(54)).toHaveAttribute('aria-pressed', 'true');
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(flipButton()).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: '7 times 8 equals 56' })).toHaveFocus();
  });
});

describe('QuestionCard back', () => {
  it('shows the question, correct answer, selected answer and explanation', async () => {
    renderCard();
    await selectAndFlip(54);
    const heading = screen.getByRole('heading', { name: '7 times 8 equals 56' });
    expect(heading).toHaveTextContent('7 × 8 = 56');
    expect(heading).toHaveFocus();
    expect(screen.getByText('Correct answer').nextElementSibling).toHaveTextContent('56');
    expect(screen.getByText('Your answer').nextElementSibling).toHaveTextContent('54');
    expect(screen.getByText('7 × 8 means 7 groups of 8, which is 56.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'I Got It Right' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'I Got It Wrong' })).toBeEnabled();
  });

  it('hides the explanation when explanations are off', async () => {
    renderCard({ showExplanations: false });
    await selectAndFlip(56);
    expect(screen.queryByText(/groups of/)).not.toBeInTheDocument();
  });

  it('does not let the answer change after flipping', async () => {
    const { container } = renderCard();
    await selectAndFlip(54);
    expect(screen.queryByRole('button', { name: 'Answer 64' })).not.toBeInTheDocument();
    const hiddenChoice = face(container, 'front')!.querySelector('[aria-label="Answer 64"]')!;
    expect(hiddenChoice).toBeDisabled();
    fireEvent.click(hiddenChoice);
    expect(screen.getByText('Your answer').nextElementSibling).toHaveTextContent('54');
  });

  it.each([
    ['I Got It Right', true],
    ['I Got It Wrong', false],
  ])('reports "%s" once with the selected answer', async (name, selfReportedCorrect) => {
    const { onResult } = renderCard();
    await selectAndFlip(54);
    await userEvent.click(screen.getByRole('button', { name }));
    expect(onResult).toHaveBeenCalledExactlyOnceWith({ selectedAnswer: 54, selfReportedCorrect });
    expect(screen.getByRole('button', { name: 'I Got It Right' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'I Got It Wrong' })).toBeDisabled();
  });

  it('ignores a fast double-click on a result button', async () => {
    const { onResult } = renderCard();
    await selectAndFlip(56);
    await userEvent.dblClick(screen.getByRole('button', { name: 'I Got It Right' }));
    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks that arrive before React re-renders', async () => {
    const { onResult } = renderCard();
    await selectAndFlip(56);
    const right = screen.getByRole('button', { name: 'I Got It Right' });
    const wrong = screen.getByRole('button', { name: 'I Got It Wrong' });
    right.click();
    right.click();
    wrong.click();
    expect(onResult).toHaveBeenCalledExactlyOnceWith({
      selectedAnswer: 56,
      selfReportedCorrect: true,
    });
  });
});

describe('QuestionCard flipping', () => {
  it('turns the card and hides the front from everyone once flipped', async () => {
    const { container } = renderCard();
    const card = screen.getByRole('region', { name: 'Question card' });
    expect(card).toHaveClass('question-card--animated');
    expect(face(container, 'back')).toHaveAttribute('aria-hidden', 'true');
    expect(face(container, 'back')).not.toBeVisible();

    await selectAndFlip(54);
    expect(card).toHaveClass('question-card--flipped');
    expect(face(container, 'front')).toHaveAttribute('aria-hidden', 'true');
    expect(face(container, 'front')).toHaveAttribute('inert');
    expect(face(container, 'front')).not.toBeVisible();
    expect(face(container, 'back')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Flip Card' })).not.toBeInTheDocument();
  });

  it('keeps the back text readable: the back is pre-turned and both faces hide their reverse side', async () => {
    const { container } = renderCard();
    await selectAndFlip(54);
    const inner = container.querySelector<HTMLElement>('.question-card__inner')!;
    const front = face(container, 'front')!;
    const back = face(container, 'back')!;
    // Card turned 180° + back face turned 180° = 360°, so the back reads normally.
    expect(getComputedStyle(inner).transform).toBe('rotateY(180deg)');
    expect(getComputedStyle(back).transform).toBe('rotateY(180deg)');
    expect(getComputedStyle(front).transform).toBe('none');
    for (const element of [front, back]) {
      expect(getComputedStyle(element).backfaceVisibility).toBe('hidden');
      // Both faces share one grid cell, so they line up instead of stacking down the page.
      expect(getComputedStyle(element).gridArea).toBe('1 / 1');
    }
  });

  it.each([
    ['animation is turned off', false, () => {}],
    ['the system asks for reduced motion', true, () => mockReducedMotion(true)],
  ])('still works when %s', async (_, animationEnabled, setup) => {
    setup();
    const { container, onResult } = renderCard({ animationEnabled });
    const card = screen.getByRole('region', { name: 'Question card' });
    expect(card).not.toHaveClass('question-card--animated');
    expect(face(container, 'back')).toBeNull();

    await selectAndFlip(54);
    expect(face(container, 'front')).toBeNull();
    expect(getComputedStyle(face(container, 'back')!).transform).toBe('none');
    expect(screen.getByRole('heading', { name: '7 times 8 equals 56' })).toHaveFocus();
    expect(screen.getByText('Correct answer').nextElementSibling).toHaveTextContent('56');
    expect(screen.getByText('Your answer').nextElementSibling).toHaveTextContent('54');
    await userEvent.click(screen.getByRole('button', { name: 'I Got It Wrong' }));
    expect(onResult).toHaveBeenCalledExactlyOnceWith({
      selectedAnswer: 54,
      selfReportedCorrect: false,
    });
  });

  it('resets selection, flip and submission for a new question', async () => {
    const { onResult, rerender } = renderCard();
    await selectAndFlip(54);
    await userEvent.click(screen.getByRole('button', { name: 'I Got It Right' }));

    rerender(
      <QuestionCard
        question={nextQuestion}
        questionNumber={4}
        totalQuestions={10}
        onResult={onResult}
      />,
    );
    expect(screen.getByRole('heading', { name: 'What is 6 times 8?' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Question card' })).not.toHaveClass(
      'question-card--flipped',
    );
    for (const value of nextQuestion.choices) {
      expect(choice(value)).toHaveAttribute('aria-pressed', 'false');
    }
    expect(flipButton()).toBeDisabled();

    await selectAndFlip(48);
    await userEvent.click(screen.getByRole('button', { name: 'I Got It Right' }));
    expect(onResult).toHaveBeenCalledTimes(2);
    expect(onResult).toHaveBeenLastCalledWith({ selectedAnswer: 48, selfReportedCorrect: true });
  });
});

describe('QuestionCard number keys', () => {
  it('selects the matching answer with keys 1 to 4 and focuses it', async () => {
    renderCard();
    await userEvent.keyboard('3');
    expect(choice(56)).toHaveAttribute('aria-pressed', 'true');
    expect(choice(56)).toHaveFocus();
    await userEvent.keyboard('1');
    expect(choice(48)).toHaveAttribute('aria-pressed', 'true');
    expect(choice(56)).toHaveAttribute('aria-pressed', 'false');
    expect(choice(48)).toHaveAttribute('aria-keyshortcuts', '1');
    expect(choice(64)).toHaveAttribute('aria-keyshortcuts', '4');
  });

  it('ignores other keys and keys pressed with a modifier', async () => {
    renderCard();
    await userEvent.keyboard('5');
    await userEvent.keyboard('0');
    await userEvent.keyboard('{Control>}2{/Control}');
    await userEvent.keyboard('{Alt>}2{/Alt}');
    await userEvent.keyboard('{Meta>}2{/Meta}');
    await userEvent.keyboard('{Shift>}2{/Shift}');
    for (const value of question.choices) {
      expect(choice(value)).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('does not change the answer after the card is flipped', async () => {
    const { onResult } = renderCard();
    await selectAndFlip(54);
    await userEvent.keyboard('4');
    await userEvent.click(screen.getByRole('button', { name: 'I Got It Right' }));
    expect(onResult).toHaveBeenCalledExactlyOnceWith({
      selectedAnswer: 54,
      selfReportedCorrect: true,
    });
  });

  it('does not interfere with typing in a text field', async () => {
    render(
      <>
        <label>
          Name
          <input />
        </label>
        <QuestionCard question={question} questionNumber={1} onResult={vi.fn()} />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    await userEvent.type(input, '12');
    expect(input).toHaveValue('12');
    for (const value of question.choices) {
      expect(choice(value)).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('tells the page which answer was revealed', async () => {
    const onReveal = vi.fn();
    renderCard({ onReveal });
    await selectAndFlip(64);
    expect(onReveal).toHaveBeenCalledExactlyOnceWith(64);
  });
});
