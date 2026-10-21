import type { MathOperation } from '../types';
import { randomInt } from '../utils/math';
import { shuffle } from '../utils/shuffle';
import { calculateAnswer } from '../utils/validation';

export const DISTRACTOR_COUNT = 3;
export const MAX_DISTRACTOR_ATTEMPTS = 20;
const NEARBY_DISTANCE = 5;

function digits(value: number) {
  return String(value).split('').reverse().map(Number);
}

// Combines the two numbers column by column (ones, tens, ...) with no carrying or borrowing.
function columnwise(a: number, b: number, combine: (x: number, y: number) => number) {
  const [da, db] = [digits(a), digits(b)];
  let result = 0;
  for (let i = Math.max(da.length, db.length) - 1; i >= 0; i--) {
    result = result * 10 + combine(da[i] ?? 0, db[i] ?? 0);
  }
  return result;
}

function additionMistakes(a: number, b: number, answer: number) {
  return [
    answer - 1,
    answer + 1,
    answer + 10,
    answer - 10,
    columnwise(a, b, (x, y) => (x + y) % 10),
    Math.abs(a - b),
  ];
}

function subtractionMistakes(a: number, b: number, answer: number) {
  return [
    answer - 1,
    answer + 1,
    answer + 10,
    answer - 10,
    columnwise(a, b, (x, y) => Math.abs(x - y)),
    a + b,
  ];
}

function multiplicationMistakes(a: number, b: number, answer: number) {
  return [a * (b - 1), a * (b + 1), (a - 1) * b, (a + 1) * b, answer - 1, answer + 1, a + b];
}

function divisionMistakes(a: number, b: number, answer: number) {
  return [answer - 1, answer + 1, answer - 2, answer + 2, b, a / (b + 1), a / (b - 1), a - b];
}

const MISTAKES: Record<MathOperation, (a: number, b: number, answer: number) => number[]> = {
  addition: additionMistakes,
  subtraction: subtractionMistakes,
  multiplication: multiplicationMistakes,
  division: divisionMistakes,
};

export function generateDistractors(
  operation: MathOperation,
  firstOperand: number,
  secondOperand: number,
): number[] {
  const answer = calculateAnswer(operation, firstOperand, secondOperand);
  if (!Number.isInteger(answer) || answer < 0) {
    throw new RangeError(`Answer ${answer} is not a non-negative whole number`);
  }
  const distractors = new Set<number>();
  const add = (value: number) => {
    if (
      distractors.size < DISTRACTOR_COUNT &&
      Number.isInteger(value) &&
      value >= 0 &&
      value !== answer
    ) {
      distractors.add(value);
    }
  };

  shuffle(MISTAKES[operation](firstOperand, secondOperand, answer)).forEach(add);

  for (
    let attempt = 0;
    attempt < MAX_DISTRACTOR_ATTEMPTS && distractors.size < DISTRACTOR_COUNT;
    attempt++
  ) {
    const offset = randomInt(1, NEARBY_DISTANCE) * (Math.random() < 0.5 ? -1 : 1);
    add(answer + offset);
  }

  // Safe fallback: numbers just above the answer are always valid and eventually unused.
  for (let value = answer + 1; distractors.size < DISTRACTOR_COUNT; value++) {
    add(value);
  }

  return [...distractors];
}

export function buildChoices(
  operation: MathOperation,
  firstOperand: number,
  secondOperand: number,
): number[] {
  const answer = calculateAnswer(operation, firstOperand, secondOperand);
  return shuffle([answer, ...generateDistractors(operation, firstOperand, secondOperand)]);
}
