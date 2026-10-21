import type { Question } from '../types';
import { OPERATION_SYMBOLS, OPERATION_WORDS } from './labels';

// "7 times 8" for screen readers, instead of the × symbol
export function spokenQuestion(question: Question) {
  return `${question.firstOperand} ${OPERATION_WORDS[question.operation]} ${question.secondOperand}`;
}

const PLUS = OPERATION_SYMBOLS.addition;
const MINUS = OPERATION_SYMBOLS.subtraction;
const TIMES = OPERATION_SYMBOLS.multiplication;
const DIVIDE = OPERATION_SYMBOLS.division;

// Card back explanations from DECISIONS.md section 5. They never say whether the child was right.
export function explainQuestion(question: Question): string {
  const { firstOperand: a, secondOperand: b, correctAnswer: c, difficulty } = question;
  const isLevel3Plus = difficulty >= 3;

  switch (question.operation) {
    case 'addition': {
      const carries = isLevel3Plus && (a % 10) + (b % 10) >= 10;
      if (isLevel3Plus && b >= 10) {
        return carries
          ? `Add the tens, then the ones, and carry the extra ten: ${a} ${PLUS} ${b} = ${c}.`
          : `Add the tens, then the ones: ${a} ${PLUS} ${b} = ${c}.`;
      }
      return carries
        ? `Start at ${a} and count on ${b} more to get ${c}, carrying into the next ten.`
        : `Start at ${a} and count on ${b} more to get ${c}.`;
    }
    case 'subtraction': {
      const borrows = isLevel3Plus && a % 10 < b % 10;
      const fact = `${a} ${MINUS} ${b} = ${c}`;
      return borrows
        ? `${fact}, borrowing a ten for the ones. Check it: ${c} ${PLUS} ${b} = ${a}.`
        : `${fact}. Check it: ${c} ${PLUS} ${b} = ${a}.`;
    }
    case 'multiplication': {
      const fact = `${a} ${TIMES} ${b} = ${c}`;
      if (a === 0 || b === 0) {
        return `Any number times 0 is 0, so ${fact}.`;
      }
      if (a === 1 || b === 1) {
        return `Any number times 1 stays the same, so ${fact}.`;
      }
      return `${a} ${TIMES} ${b} means ${a} groups of ${b}, which is ${c}.`;
    }
    case 'division':
      return `${a} ${DIVIDE} ${b} = ${c} because ${b} ${TIMES} ${c} = ${a}.`;
  }
}
