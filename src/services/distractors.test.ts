import { seedMathRandom } from '../test/seededRandom';
import type { MathOperation } from '../types';
import { DIFFICULTY_LEVELS, OPERATIONS } from '../utils/labels';
import { buildChoices, DISTRACTOR_COUNT, generateDistractors } from './distractors';
import { generateQuestion } from './questionGenerator';

afterEach(() => {
  vi.restoreAllMocks();
});

function expectValidChoices(choices: number[], answer: number) {
  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(4);
  expect(choices.every((c) => Number.isInteger(c) && c >= 0)).toBe(true);
  expect(choices.filter((c) => c === answer)).toHaveLength(1);
}

// Every distractor seen across many seeded runs.
function seenDistractors(operation: MathOperation, a: number, b: number, runs = 200) {
  seedMathRandom(a * 1000 + b);
  const seen = new Set<number>();
  for (let i = 0; i < runs; i++) {
    generateDistractors(operation, a, b).forEach((d) => seen.add(d));
  }
  return seen;
}

describe('edge cases near zero', () => {
  it.each<[MathOperation, number, number, number]>([
    ['addition', 0, 0, 0],
    ['subtraction', 1, 1, 0],
    ['multiplication', 0, 5, 0],
    ['division', 0, 3, 0],
    ['multiplication', 1, 1, 1],
  ])('%s %i, %i: four unique non-negative whole choices, correct once', (op, a, b, answer) => {
    seedMathRandom(42);
    for (let i = 0; i < 200; i++) {
      expectValidChoices(buildChoices(op, a, b), answer);
    }
  });
});

describe('generateDistractors', () => {
  it.each(OPERATIONS)('%s: three valid distractors that never equal the answer', (operation) => {
    seedMathRandom(7);
    for (const level of DIFFICULTY_LEVELS) {
      for (let i = 0; i < 200; i++) {
        const q = generateQuestion(operation, level);
        const distractors = generateDistractors(operation, q.firstOperand, q.secondOperand);
        expect(distractors).toHaveLength(DISTRACTOR_COUNT);
        expect(new Set(distractors).size).toBe(DISTRACTOR_COUNT);
        expect(distractors).not.toContain(q.correctAnswer);
        expect(distractors.every((d) => Number.isInteger(d) && d >= 0)).toBe(true);
      }
    }
  });

  it('uses nearby numbers and common addition mistakes (forgot to carry, subtracted)', () => {
    const seen = seenDistractors('addition', 47, 38);
    expect([...seen].every((d) => [84, 86, 95, 75, 9].includes(d))).toBe(true);
    expect(seen).toContain(75);
    expect(seen).toContain(9);
    expect(seen).toContain(84);
  });

  it('uses common subtraction mistakes (smaller digit from larger, added)', () => {
    const seen = seenDistractors('subtraction', 52, 17);
    expect([...seen].every((d) => [34, 36, 45, 25, 69].includes(d))).toBe(true);
    expect(seen).toContain(45);
    expect(seen).toContain(69);
  });

  it('uses neighboring multiplication facts', () => {
    const seen = seenDistractors('multiplication', 7, 8);
    expect([...seen].sort((x, y) => x - y)).toEqual([15, 48, 49, 55, 57, 63, 64]);
  });

  it('uses division fact-family numbers', () => {
    const seen = seenDistractors('division', 56, 8);
    expect([...seen].every((d) => [5, 6, 8, 9, 48].includes(d))).toBe(true);
    expect(seen).toContain(8);
    expect(seen).toContain(6);
  });

  it('stops retrying and falls back safely when randomness keeps giving bad numbers', () => {
    // Always 0: the nearby picks are always answer − 1, which is negative for 0 + 0.
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const distractors = generateDistractors('addition', 0, 0);
    expect(distractors).toHaveLength(DISTRACTOR_COUNT);
    expect(new Set(distractors).size).toBe(DISTRACTOR_COUNT);
    expect(distractors.every((d) => d > 0)).toBe(true);
    expect(random.mock.calls.length).toBeLessThan(100);
  });

  it('rejects an answer that is not a non-negative whole number', () => {
    expect(() => generateDistractors('division', 7, 2)).toThrow(RangeError);
    expect(() => generateDistractors('subtraction', 2, 5)).toThrow(RangeError);
  });
});

describe('answer positions', () => {
  it('puts the correct answer in each of the four positions about 25% of the time', () => {
    seedMathRandom(2026);
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 1000; i++) {
      const q = generateQuestion(OPERATIONS[i % 4], DIFFICULTY_LEVELS[Math.floor(i / 4) % 4]);
      expectValidChoices(q.choices, q.correctAnswer);
      counts[q.choices.indexOf(q.correctAnswer)]++;
    }
    for (const count of counts) {
      expect(count).toBeGreaterThan(200);
      expect(count).toBeLessThan(300);
    }
  });
});
