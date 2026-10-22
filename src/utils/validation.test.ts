import type { Question } from '../types';
import { validateQuestion } from './validation';

function question(overrides: Partial<Question>): Question {
  return {
    id: 'q1',
    operation: 'addition',
    firstOperand: 7,
    secondOperand: 8,
    displayText: '7 + 8',
    correctAnswer: 15,
    choices: [13, 14, 15, 16],
    difficulty: 1,
    source: 'regular',
    ...overrides,
  };
}

describe('validateQuestion', () => {
  it('accepts a valid question', () => {
    expect(validateQuestion(question({}))).toEqual([]);
  });

  it('rejects an unsupported operation', () => {
    expect(validateQuestion(question({ operation: 'modulo' as never }))).toEqual([
      'Unsupported operation: modulo',
    ]);
  });

  it('rejects fractional operands', () => {
    expect(
      validateQuestion(question({ firstOperand: 7.5, secondOperand: 7.5, correctAnswer: 15 })),
    ).toContain('Operands must be whole numbers');
  });

  it('rejects an unsupported difficulty', () => {
    expect(validateQuestion(question({ difficulty: 5 as never }))).toEqual([
      'Unsupported difficulty: 5',
    ]);
  });

  it('rejects a wrong or negative correct answer', () => {
    expect(validateQuestion(question({ correctAnswer: 16, choices: [14, 15, 16, 17] }))).toContain(
      'Correct answer is not valid',
    );
    expect(
      validateQuestion(
        question({
          operation: 'subtraction',
          firstOperand: 3,
          secondOperand: 5,
          correctAnswer: -2,
          choices: [-2, 0, 1, 2],
        }),
      ),
    ).toContain('Correct answer is not valid');
  });

  it('rejects division by zero', () => {
    const errors = validateQuestion(
      question({
        operation: 'division',
        firstOperand: 5,
        secondOperand: 0,
        correctAnswer: 0,
        choices: [0, 1, 2, 3],
      }),
    );
    expect(errors).toContain('Division by zero');
  });

  it('rejects a division with a fractional answer', () => {
    const errors = validateQuestion(
      question({
        operation: 'division',
        firstOperand: 7,
        secondOperand: 2,
        correctAnswer: 3,
        choices: [2, 3, 4, 5],
      }),
    );
    expect(errors).toContain('Division answer is not a whole number');
  });

  it('requires exactly four unique choices with one correct', () => {
    expect(validateQuestion(question({ choices: [14, 15, 16] }))).toContain(
      'There must be exactly four choices',
    );
    expect(validateQuestion(question({ choices: [14, 15, 15, 16] }))).toContain(
      'Choices must be unique',
    );
    expect(validateQuestion(question({ choices: [12, 13, 14, 16] }))).toContain(
      'Exactly one choice must equal the correct answer',
    );
  });

  it('rejects negative or fractional choices', () => {
    expect(validateQuestion(question({ choices: [-1, 14, 15, 16] }))).toEqual([
      'Choices must be non-negative whole numbers',
    ]);
    expect(validateQuestion(question({ choices: [14.5, 14, 15, 16] }))).toEqual([
      'Choices must be non-negative whole numbers',
    ]);
  });

  it('rejects a question outside its difficulty level', () => {
    const tooBig = question({
      firstOperand: 12,
      secondOperand: 3,
      correctAnswer: 15,
    });
    expect(validateQuestion(tooBig)).toEqual(['Question does not fit difficulty level 1']);
    expect(validateQuestion({ ...tooBig, difficulty: 2 })).toEqual([]);
  });

  it('checks multiplication shapes in either factor order', () => {
    const base = { operation: 'multiplication' as const, difficulty: 3 as const };
    expect(
      validateQuestion(
        question({
          ...base,
          firstOperand: 15,
          secondOperand: 7,
          correctAnswer: 105,
          choices: [105, 104, 106, 98],
        }),
      ),
    ).toEqual([]);
    expect(
      validateQuestion(
        question({
          ...base,
          firstOperand: 15,
          secondOperand: 12,
          correctAnswer: 180,
          choices: [180, 179, 181, 165],
        }),
      ),
    ).toEqual(['Question does not fit difficulty level 3']);
  });

  it('allows a 0 factor only at levels that allow it', () => {
    const zero = question({
      operation: 'multiplication',
      firstOperand: 0,
      secondOperand: 4,
      correctAnswer: 0,
      choices: [0, 1, 2, 3],
    });
    expect(validateQuestion(zero)).toEqual([]);
    expect(validateQuestion({ ...zero, difficulty: 3 })).toEqual([
      'Question does not fit difficulty level 3',
    ]);
  });

  it('accepts subtraction with equal operands (answer 0)', () => {
    const errors = validateQuestion(
      question({
        operation: 'subtraction',
        firstOperand: 4,
        secondOperand: 4,
        correctAnswer: 0,
        choices: [0, 1, 2, 3],
      }),
    );
    expect(errors).toEqual([]);
  });
});
