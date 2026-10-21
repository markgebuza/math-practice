import type { DifficultyLevel, MathOperation, Question } from '../types';
import { DIFFICULTY_LEVELS, OPERATIONS } from '../utils/labels';
import { validateQuestion } from '../utils/validation';
import {
  generateQuestion,
  generateQuestionFromOperations,
  QuestionGenerationError,
} from './questionGenerator';

const RUNS = 1000;

// Expected ranges written out from DECISIONS.md section 1, independent of difficultyRanges.ts,
// so a wrong value in the config file makes these tests fail.
const ADDITION: Record<DifficultyLevel, { max: number; maxResult: number }> = {
  1: { max: 10, maxResult: 20 },
  2: { max: 50, maxResult: 100 },
  3: { max: 100, maxResult: 200 },
  4: { max: 1000, maxResult: 1000 },
};
const SUBTRACTION_MAX: Record<DifficultyLevel, number> = { 1: 10, 2: 50, 3: 100, 4: 1000 };
const DIVISION: Record<DifficultyLevel, { divisor: number[]; quotient: number[]; max: number }> = {
  1: { divisor: [1, 5], quotient: [1, 5], max: 25 },
  2: { divisor: [1, 10], quotient: [1, 10], max: 100 },
  3: { divisor: [1, 12], quotient: [1, 12], max: 144 },
  4: { divisor: [2, 25], quotient: [2, 40], max: 1000 },
};

const between = (value: number, min: number, max: number) =>
  Number.isInteger(value) && value >= min && value <= max;

function multiplicationFits(
  { firstOperand: a, secondOperand: b }: Question,
  level: DifficultyLevel,
) {
  const [small, big] = a <= b ? [a, b] : [b, a];
  switch (level) {
    case 1:
      return between(a, 0, 5) && between(b, 0, 5);
    case 2:
      return between(a, 0, 10) && between(b, 0, 10);
    case 3:
      return between(small, 2, 9) && (between(big, 2, 9) || between(big, 10, 20));
    case 4:
      return (
        (between(small, 2, 9) && between(big, 10, 99)) ||
        (between(small, 10, 25) && between(big, 10, 25))
      );
  }
}

function generateMany(operation: MathOperation, level: DifficultyLevel) {
  return Array.from({ length: RUNS }, () => generateQuestion(operation, level));
}

describe.each(DIFFICULTY_LEVELS)('level %i', (level) => {
  it(`addition: ${RUNS} questions stay within operand and result ranges`, () => {
    const { max, maxResult } = ADDITION[level];
    for (const q of generateMany('addition', level)) {
      expect(between(q.firstOperand, 0, max), q.displayText).toBe(true);
      expect(between(q.secondOperand, 0, max), q.displayText).toBe(true);
      expect(q.correctAnswer).toBe(q.firstOperand + q.secondOperand);
      expect(q.correctAnswer).toBeLessThanOrEqual(maxResult);
      expect(q.displayText).toBe(`${q.firstOperand} + ${q.secondOperand}`);
    }
  });

  it(`subtraction: ${RUNS} questions never go negative`, () => {
    const max = SUBTRACTION_MAX[level];
    for (const q of generateMany('subtraction', level)) {
      expect(between(q.firstOperand, 0, max), q.displayText).toBe(true);
      expect(between(q.secondOperand, 0, max), q.displayText).toBe(true);
      expect(q.firstOperand).toBeGreaterThanOrEqual(q.secondOperand);
      expect(q.correctAnswer).toBe(q.firstOperand - q.secondOperand);
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.displayText).toBe(`${q.firstOperand} − ${q.secondOperand}`);
    }
  });

  it(`multiplication: ${RUNS} questions keep factors in range`, () => {
    const questions = generateMany('multiplication', level);
    for (const q of questions) {
      expect(multiplicationFits(q, level), q.displayText).toBe(true);
      expect(q.correctAnswer).toBe(q.firstOperand * q.secondOperand);
      expect(q.displayText).toBe(`${q.firstOperand} × ${q.secondOperand}`);
    }
    const zeroShare =
      questions.filter((q) => q.firstOperand === 0 || q.secondOperand === 0).length / RUNS;
    // DECISIONS 1.5: about 1 in 10 at levels 1–2 (generous bounds keep the test stable)
    if (level <= 2) {
      expect(zeroShare).toBeGreaterThan(0.03);
      expect(zeroShare).toBeLessThan(0.2);
    } else {
      expect(zeroShare).toBe(0);
    }
  });

  it(`division: ${RUNS} questions never divide by zero and have whole answers`, () => {
    const { divisor, quotient, max } = DIVISION[level];
    for (const q of generateMany('division', level)) {
      expect(q.secondOperand).not.toBe(0);
      expect(between(q.secondOperand, divisor[0], divisor[1]), q.displayText).toBe(true);
      expect(between(q.correctAnswer, quotient[0], quotient[1]), q.displayText).toBe(true);
      expect(q.firstOperand).toBe(q.secondOperand * q.correctAnswer);
      expect(Number.isInteger(q.firstOperand / q.secondOperand)).toBe(true);
      expect(q.firstOperand).toBeLessThanOrEqual(max);
      expect(q.displayText).toBe(`${q.firstOperand} ÷ ${q.secondOperand}`);
    }
  });

  it.each(OPERATIONS)(`%s: ${RUNS} questions all pass validateQuestion`, (operation) => {
    for (const q of generateMany(operation, level)) {
      expect(validateQuestion(q), q.displayText).toEqual([]);
      expect(q.operation).toBe(operation);
      expect(q.difficulty).toBe(level);
      expect(q.source).toBe('regular');
      expect(q.choices).toHaveLength(4);
      expect(q.choices).toContain(q.correctAnswer);
      expect(q.choices.every((c) => Number.isInteger(c) && c >= 0)).toBe(true);
    }
  });
});

describe('level 3 multiplication mix', () => {
  it('produces both one-digit × one-digit and one-digit × two-digit questions', () => {
    const questions = generateMany('multiplication', 3);
    const twoDigit = questions.filter((q) => q.firstOperand >= 10 || q.secondOperand >= 10).length;
    expect(twoDigit / RUNS).toBeGreaterThan(0.35);
    expect(twoDigit / RUNS).toBeLessThan(0.65);
  });
});

describe('generateQuestion', () => {
  it('gives every question a unique id', () => {
    const ids = new Set(generateMany('addition', 1).map((q) => q.id));
    expect(ids.size).toBe(RUNS);
  });

  it('throws a QuestionGenerationError for an unsupported operation or level', () => {
    expect(() => generateQuestion('modulo' as MathOperation, 1)).toThrow(QuestionGenerationError);
    expect(() => generateQuestion('addition', 7 as DifficultyLevel)).toThrow(
      QuestionGenerationError,
    );
  });
});

describe('generateQuestionFromOperations', () => {
  it('only uses the selected operations and eventually uses each of them', () => {
    const selected: MathOperation[] = ['subtraction', 'division'];
    const used = new Set(
      Array.from({ length: 200 }, () => generateQuestionFromOperations(selected, 2).operation),
    );
    expect([...used].sort()).toEqual(['division', 'subtraction']);
  });

  it('works with all four operations at every level', () => {
    for (const level of DIFFICULTY_LEVELS) {
      const q = generateQuestionFromOperations(OPERATIONS, level);
      expect(validateQuestion(q)).toEqual([]);
    }
  });

  it('throws when no operations are selected', () => {
    expect(() => generateQuestionFromOperations([], 1)).toThrow(QuestionGenerationError);
  });
});
