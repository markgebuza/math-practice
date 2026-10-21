import { DIFFICULTY_RANGES, inRange, type FactorShape } from '../services/difficultyRanges';
import type { DifficultyLevel, MathOperation, Question } from '../types';
import { DIFFICULTY_LEVELS, OPERATIONS } from './labels';

export function calculateAnswer(operation: MathOperation, first: number, second: number) {
  switch (operation) {
    case 'addition':
      return first + second;
    case 'subtraction':
      return first - second;
    case 'multiplication':
      return first * second;
    case 'division':
      return first / second;
  }
}

function factorsFitShape(a: number, b: number, shape: FactorShape) {
  return (
    (inRange(a, shape.first) && inRange(b, shape.second)) ||
    (inRange(b, shape.first) && inRange(a, shape.second))
  );
}

function fitsDifficulty(question: Question, difficulty: DifficultyLevel) {
  const { firstOperand: a, secondOperand: b, correctAnswer } = question;
  const ranges = DIFFICULTY_RANGES[difficulty];
  switch (question.operation) {
    case 'addition': {
      const { operand, maxResult } = ranges.addition;
      return inRange(a, operand) && inRange(b, operand) && correctAnswer <= maxResult;
    }
    case 'subtraction': {
      const { operand } = ranges.subtraction;
      return inRange(a, operand) && inRange(b, operand) && a >= b;
    }
    case 'multiplication': {
      const { shapes, zeroFactorChance } = ranges.multiplication;
      if (zeroFactorChance > 0 && (a === 0 || b === 0)) {
        const other = a === 0 ? b : a;
        return shapes.some(
          (s) => other === 0 || inRange(other, s.first) || inRange(other, s.second),
        );
      }
      return shapes.some((shape) => factorsFitShape(a, b, shape));
    }
    case 'division': {
      const { divisor, quotient, maxDividend } = ranges.division;
      return inRange(b, divisor) && inRange(correctAnswer, quotient) && a <= maxDividend;
    }
  }
}

// Spec section 17, "before displaying a question". Returns the broken rules; empty means valid.
export function validateQuestion(question: Question): string[] {
  const { operation, firstOperand: a, secondOperand: b, correctAnswer, choices } = question;

  if (!OPERATIONS.includes(operation)) {
    return [`Unsupported operation: ${String(operation)}`];
  }
  if (!DIFFICULTY_LEVELS.includes(question.difficulty)) {
    return [`Unsupported difficulty: ${String(question.difficulty)}`];
  }

  const errors: string[] = [];
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    errors.push('Operands must be whole numbers');
  }
  if (operation === 'division' && b === 0) {
    errors.push('Division by zero');
  } else if (operation === 'division' && !Number.isInteger(a / b)) {
    errors.push('Division answer is not a whole number');
  }
  if (
    !Number.isInteger(correctAnswer) ||
    correctAnswer < 0 ||
    correctAnswer !== calculateAnswer(operation, a, b)
  ) {
    errors.push('Correct answer is not valid');
  }
  if (choices.length !== 4) {
    errors.push('There must be exactly four choices');
  }
  if (new Set(choices).size !== choices.length) {
    errors.push('Choices must be unique');
  }
  if (choices.filter((choice) => choice === correctAnswer).length !== 1) {
    errors.push('Exactly one choice must equal the correct answer');
  }
  if (errors.length === 0 && !fitsDifficulty(question, question.difficulty)) {
    errors.push(`Question does not fit difficulty level ${question.difficulty}`);
  }
  return errors;
}
