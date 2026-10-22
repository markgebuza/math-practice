import { seedMathRandom } from '../test/seededRandom';
import type { DifficultyLevel, MathOperation, MistakePattern } from '../types';
import { DIFFICULTY_LEVELS, OPERATIONS } from '../utils/labels';
import { calculateAnswer, validateQuestion } from '../utils/validation';
import { generateQuestion, isSameQuestion } from './questionGenerator';
import { generateSimilarQuestion } from './similarQuestionGenerator';

afterEach(() => {
  vi.restoreAllMocks();
});

function pattern(
  operation: MathOperation,
  firstOperand: number,
  secondOperand: number,
  difficulty: DifficultyLevel,
): MistakePattern {
  return {
    id: `pattern-${operation}-${firstOperand}-${secondOperand}`,
    operation,
    firstOperand,
    secondOperand,
    correctAnswer: calculateAnswer(operation, firstOperand, secondOperand),
    difficulty,
    incorrectCount: 1,
    similarCorrectCount: 0,
    lastIncorrectAt: '2026-10-21T10:00:00.000Z',
    mastered: false,
  };
}

function produced(source: MistakePattern, runs = 400) {
  const texts = new Set<string>();
  for (let i = 0; i < runs; i++) {
    texts.add(generateSimilarQuestion(source).displayText);
  }
  return texts;
}

describe('generateSimilarQuestion', () => {
  it('can turn a missed 8 × 7 into 7 × 8, 8 × 6, 9 × 7, 56 ÷ 7 and 56 ÷ 8', () => {
    seedMathRandom(13);
    for (const difficulty of [2, 3] as const) {
      const texts = produced(pattern('multiplication', 8, 7, difficulty));
      for (const text of ['7 × 8', '8 × 6', '9 × 7', '56 ÷ 7', '56 ÷ 8']) {
        expect(texts).toContain(text);
      }
      expect(texts).not.toContain('8 × 7');
    }
  });

  it('uses nearby numbers, reversed operands and the fact family for addition', () => {
    seedMathRandom(14);
    const texts = produced(pattern('addition', 6, 3, 1));
    for (const text of ['5 + 3', '6 + 4', '3 + 6', '9 − 6', '9 − 3']) {
      expect(texts).toContain(text);
    }
    expect(texts).not.toContain('6 + 3');
  });

  it('makes addition from subtraction and never reverses subtraction', () => {
    seedMathRandom(15);
    const texts = produced(pattern('subtraction', 9, 4, 1));
    for (const text of ['8 − 4', '9 − 3', '4 + 5', '5 + 4']) {
      expect(texts).toContain(text);
    }
    expect(texts).not.toContain('4 − 9');
    expect(texts).not.toContain('9 − 4');
  });

  it('makes multiplication from division and never reverses division', () => {
    seedMathRandom(16);
    const texts = produced(pattern('division', 56, 8, 2));
    for (const text of ['48 ÷ 8', '63 ÷ 9', '8 × 7', '7 × 8']) {
      expect(texts).toContain(text);
    }
    expect(texts).not.toContain('8 ÷ 56');
    expect(texts).not.toContain('56 ÷ 8');
  });

  it('keeps nearby and fact-family questions inside the pattern level', () => {
    seedMathRandom(17);
    for (let i = 0; i < 200; i++) {
      const sum = generateSimilarQuestion(pattern('addition', 10, 10, 1));
      expect(sum.firstOperand).toBeLessThanOrEqual(10);
      expect(sum.secondOperand).toBeLessThanOrEqual(10);
      const fromProduct = generateSimilarQuestion(pattern('multiplication', 5, 5, 1));
      const fromQuotient = generateSimilarQuestion(pattern('division', 25, 5, 1));
      for (const question of [fromProduct, fromQuotient]) {
        if (question.operation === 'multiplication') {
          expect(Math.max(question.firstOperand, question.secondOperand)).toBeLessThanOrEqual(5);
        } else {
          expect(question.firstOperand).toBeLessThanOrEqual(25);
          expect(question.secondOperand).toBeLessThanOrEqual(5);
          expect(question.correctAnswer).toBeLessThanOrEqual(5);
        }
      }
    }
    // 12 × 12 = 144 is a Level 3 division fact but 144 ÷ 12 is not a Level 3 multiplication.
    const texts = produced(pattern('division', 144, 12, 3));
    expect(texts).not.toContain('12 × 12');
  });

  it('returns valid review questions for every operation and level', () => {
    seedMathRandom(18);
    for (const operation of OPERATIONS) {
      for (const difficulty of DIFFICULTY_LEVELS) {
        for (let p = 0; p < 30; p++) {
          const missed = generateQuestion(operation, difficulty);
          const source = pattern(operation, missed.firstOperand, missed.secondOperand, difficulty);
          for (let i = 0; i < 10; i++) {
            const question = generateSimilarQuestion(source);
            expect(validateQuestion(question)).toEqual([]);
            expect(question.source).toBe('mistake-review');
            expect(question.mistakePatternId).toBe(source.id);
            expect(question.difficulty).toBe(difficulty);
            expect(
              question.operation === source.operation &&
                question.firstOperand === source.firstOperand &&
                question.secondOperand === source.secondOperand,
            ).toBe(false);
          }
        }
      }
    }
  });

  it('never repeats the previous review question', () => {
    seedMathRandom(19);
    for (const operation of OPERATIONS) {
      const source = pattern(operation, 4, 2, 1);
      let previous = generateSimilarQuestion(source);
      for (let i = 0; i < 200; i++) {
        const next = generateSimilarQuestion(source, previous);
        expect(isSameQuestion(next, previous)).toBe(false);
        previous = next;
      }
    }
  });

  it('falls back to a valid question with the same operation and level', () => {
    seedMathRandom(20);
    // 20 × 20 does not fit Level 1, so no similar candidate is valid there.
    const source = pattern('multiplication', 20, 20, 1);
    for (let i = 0; i < 50; i++) {
      const question = generateSimilarQuestion(source);
      expect(validateQuestion(question)).toEqual([]);
      expect(question.operation).toBe('multiplication');
      expect(question.difficulty).toBe(1);
      expect(question.source).toBe('mistake-review');
      expect(question.mistakePatternId).toBe(source.id);
    }
  });
});
