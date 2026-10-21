import { seedMathRandom } from '../test/seededRandom';
import { DIFFICULTY_LEVELS } from '../utils/labels';
import {
  generateNextQuestion,
  generateQuestionFromOperations,
  isSameQuestion,
  MAX_GENERATION_ATTEMPTS,
} from './questionGenerator';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isSameQuestion', () => {
  it('matches the same operation and operands', () => {
    const fact = { operation: 'subtraction' as const, firstOperand: 9, secondOperand: 4 };
    expect(isSameQuestion(fact, { ...fact })).toBe(true);
    expect(isSameQuestion(fact, { ...fact, secondOperand: 3 })).toBe(false);
    expect(isSameQuestion(fact, { ...fact, operation: 'addition' })).toBe(false);
  });

  it('treats swapped operands as the same for addition and multiplication only', () => {
    for (const operation of ['addition', 'multiplication'] as const) {
      expect(
        isSameQuestion(
          { operation, firstOperand: 7, secondOperand: 8 },
          { operation, firstOperand: 8, secondOperand: 7 },
        ),
      ).toBe(true);
    }
    for (const operation of ['subtraction', 'division'] as const) {
      expect(
        isSameQuestion(
          { operation, firstOperand: 8, secondOperand: 4 },
          { operation, firstOperand: 4, secondOperand: 8 },
        ),
      ).toBe(false);
    }
  });
});

describe('generateNextQuestion', () => {
  it('never repeats the previous question across long seeded runs', () => {
    seedMathRandom(31);
    for (const difficulty of DIFFICULTY_LEVELS) {
      let previous = generateNextQuestion(['addition', 'multiplication'], difficulty, null);
      for (let i = 0; i < 500; i++) {
        const next = generateNextQuestion(['addition', 'multiplication'], difficulty, previous);
        expect(isSameQuestion(next, previous)).toBe(false);
        previous = next;
      }
    }
  });

  it('regenerates when the first try repeats the previous question', () => {
    // Re-using the seed makes the first try reproduce the previous question exactly.
    seedMathRandom(5);
    const previous = generateQuestionFromOperations(['addition'], 1);
    seedMathRandom(5);
    expect(isSameQuestion(generateQuestionFromOperations(['addition'], 1), previous)).toBe(true);
    seedMathRandom(5);
    expect(isSameQuestion(generateNextQuestion(['addition'], 1, previous), previous)).toBe(false);
  });

  it('gives up after the retry limit instead of looping forever', () => {
    // Math.random stuck at 0 always gives 0 + 0 at Level 1.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const previous = { operation: 'addition' as const, firstOperand: 0, secondOperand: 0 };
    const next = generateNextQuestion(['addition'], 1, previous);
    expect(MAX_GENERATION_ATTEMPTS).toBeGreaterThan(1);
    expect(isSameQuestion(next, previous)).toBe(true);
  });
});
