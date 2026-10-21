import type { DifficultyLevel, MathOperation, Question } from '../types';
import { explainQuestion } from './explanations';
import { calculateAnswer } from './validation';

function question(
  operation: MathOperation,
  firstOperand: number,
  secondOperand: number,
  difficulty: DifficultyLevel = 1,
): Question {
  const correctAnswer = calculateAnswer(operation, firstOperand, secondOperand);
  return {
    id: 'q',
    operation,
    firstOperand,
    secondOperand,
    displayText: '',
    correctAnswer,
    choices: [correctAnswer, correctAnswer + 1, correctAnswer + 2, correctAnswer + 3],
    difficulty,
    source: 'regular',
  };
}

describe('explainQuestion', () => {
  it.each([
    [question('addition', 7, 8), 'Start at 7 and count on 8 more to get 15.'],
    [question('subtraction', 15, 8), '15 − 8 = 7. Check it: 7 + 8 = 15.'],
    [question('multiplication', 3, 4), '3 × 4 means 3 groups of 4, which is 12.'],
    [question('division', 56, 8, 2), '56 ÷ 8 = 7 because 8 × 7 = 56.'],
  ])('uses the DECISIONS.md template with the real numbers (%#)', (q, expected) => {
    expect(explainQuestion(q)).toBe(expected);
  });

  it('explains times 0 and times 1 as special cases', () => {
    expect(explainQuestion(question('multiplication', 0, 5))).toBe(
      'Any number times 0 is 0, so 0 × 5 = 0.',
    );
    expect(explainQuestion(question('multiplication', 6, 0))).toBe(
      'Any number times 0 is 0, so 6 × 0 = 0.',
    );
    expect(explainQuestion(question('multiplication', 1, 9))).toBe(
      'Any number times 1 stays the same, so 1 × 9 = 9.',
    );
  });

  it('uses "add the tens, then the ones" for a large second operand at Level 3+', () => {
    expect(explainQuestion(question('addition', 42, 35, 3))).toBe(
      'Add the tens, then the ones: 42 + 35 = 77.',
    );
    expect(explainQuestion(question('addition', 47, 38, 3))).toBe(
      'Add the tens, then the ones, and carry the extra ten: 47 + 38 = 85.',
    );
    expect(explainQuestion(question('addition', 42, 35, 2))).toBe(
      'Start at 42 and count on 35 more to get 77.',
    );
  });

  it('mentions carrying or borrowing only at Level 3+ when a ten is crossed', () => {
    expect(explainQuestion(question('addition', 47, 8, 3))).toBe(
      'Start at 47 and count on 8 more to get 55, carrying into the next ten.',
    );
    expect(explainQuestion(question('subtraction', 52, 17, 3))).toBe(
      '52 − 17 = 35, borrowing a ten for the ones. Check it: 35 + 17 = 52.',
    );
    expect(explainQuestion(question('subtraction', 58, 17, 3))).toBe(
      '58 − 17 = 41. Check it: 41 + 17 = 58.',
    );
    expect(explainQuestion(question('subtraction', 12, 5, 1))).toBe(
      '12 − 5 = 7. Check it: 7 + 5 = 12.',
    );
  });

  it('never comments on right or wrong', () => {
    const text = [
      explainQuestion(question('addition', 7, 8)),
      explainQuestion(question('subtraction', 52, 17, 3)),
      explainQuestion(question('multiplication', 0, 5)),
      explainQuestion(question('division', 56, 8, 2)),
    ].join(' ');
    expect(text).not.toMatch(/right|wrong|correct|great|oops/i);
  });
});
