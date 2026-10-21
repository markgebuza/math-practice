import type { DifficultyLevel } from '../types';

// Every number range used by the question generator, from DECISIONS.md section 1.
// All ranges are inclusive [min, max].

export type Range = readonly [min: number, max: number];

export interface AdditionRange {
  operand: Range;
  maxResult: number;
}

// Subtraction uses the same operand range; the first operand is never smaller
// than the second, so answers are never negative (DECISIONS 1.2 and 1.7).
export interface SubtractionRange {
  operand: Range;
}

// A question uses one shape, with the two factors in random order.
export interface FactorShape {
  first: Range;
  second: Range;
}

export interface MultiplicationRange {
  shapes: FactorShape[];
  // Chance that a question has a 0 factor; 0 means zero factors never appear.
  zeroFactorChance: number;
}

export interface DivisionRange {
  divisor: Range;
  quotient: Range;
  maxDividend: number;
}

export interface LevelRanges {
  addition: AdditionRange;
  subtraction: SubtractionRange;
  multiplication: MultiplicationRange;
  division: DivisionRange;
}

export const DIFFICULTY_RANGES: Record<DifficultyLevel, LevelRanges> = {
  1: {
    addition: { operand: [0, 10], maxResult: 20 },
    subtraction: { operand: [0, 10] },
    multiplication: { shapes: [{ first: [1, 5], second: [1, 5] }], zeroFactorChance: 0.1 },
    division: { divisor: [1, 5], quotient: [1, 5], maxDividend: 25 },
  },
  2: {
    addition: { operand: [0, 50], maxResult: 100 },
    subtraction: { operand: [0, 50] },
    multiplication: { shapes: [{ first: [1, 10], second: [1, 10] }], zeroFactorChance: 0.1 },
    division: { divisor: [1, 10], quotient: [1, 10], maxDividend: 100 },
  },
  3: {
    addition: { operand: [0, 100], maxResult: 200 },
    subtraction: { operand: [0, 100] },
    multiplication: {
      shapes: [
        { first: [2, 9], second: [2, 9] },
        { first: [2, 9], second: [10, 20] },
      ],
      zeroFactorChance: 0,
    },
    division: { divisor: [1, 12], quotient: [1, 12], maxDividend: 144 },
  },
  4: {
    addition: { operand: [0, 1000], maxResult: 1000 },
    subtraction: { operand: [0, 1000] },
    multiplication: {
      shapes: [
        { first: [10, 99], second: [2, 9] },
        { first: [10, 25], second: [10, 25] },
      ],
      zeroFactorChance: 0,
    },
    division: { divisor: [2, 25], quotient: [2, 40], maxDividend: 1000 },
  },
};

export function inRange(value: number, [min, max]: Range) {
  return Number.isInteger(value) && value >= min && value <= max;
}
