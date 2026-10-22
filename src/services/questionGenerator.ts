import type { DifficultyLevel, MathOperation, Question } from '../types';
import { createId } from '../utils/ids';
import { OPERATION_SYMBOLS, OPERATIONS } from '../utils/labels';
import { randomInt, randomItem } from '../utils/math';
import { shuffle } from '../utils/shuffle';
import { calculateAnswer, validateQuestion } from '../utils/validation';
import { DIFFICULTY_RANGES, type Range } from './difficultyRanges';
import { buildChoices } from './distractors';

export const MAX_GENERATION_ATTEMPTS = 20;

export class QuestionGenerationError extends Error {
  name = 'QuestionGenerationError';
}

type Operands = [first: number, second: number];

function randomIn([min, max]: Range) {
  return randomInt(min, max);
}

export function generateAdditionOperands(difficulty: DifficultyLevel): Operands {
  const { operand, maxResult } = DIFFICULTY_RANGES[difficulty].addition;
  const first = randomIn(operand);
  const second = randomInt(operand[0], Math.min(operand[1], maxResult - first));
  return [first, second];
}

export function generateSubtractionOperands(difficulty: DifficultyLevel): Operands {
  const { operand } = DIFFICULTY_RANGES[difficulty].subtraction;
  const first = randomIn(operand);
  const second = randomInt(operand[0], first);
  return [first, second];
}

export function generateMultiplicationOperands(difficulty: DifficultyLevel): Operands {
  const { shapes, zeroFactorChance } = DIFFICULTY_RANGES[difficulty].multiplication;
  const shape = randomItem(shapes);
  if (Math.random() < zeroFactorChance) {
    const other = randomInt(0, shape.second[1]);
    return shuffle([0, other]) as Operands;
  }
  return shuffle([randomIn(shape.first), randomIn(shape.second)]) as Operands;
}

export function generateDivisionOperands(difficulty: DifficultyLevel): Operands {
  const {
    divisor: divisorRange,
    quotient: quotientRange,
    maxDividend,
  } = DIFFICULTY_RANGES[difficulty].division;
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const divisor = randomIn(divisorRange);
    const quotient = randomIn(quotientRange);
    const dividend = divisor * quotient;
    if (dividend <= maxDividend) {
      return [dividend, divisor];
    }
  }
  throw new QuestionGenerationError(`No division question fits level ${difficulty}`);
}

const OPERAND_GENERATORS: Record<MathOperation, (difficulty: DifficultyLevel) => Operands> = {
  addition: generateAdditionOperands,
  subtraction: generateSubtractionOperands,
  multiplication: generateMultiplicationOperands,
  division: generateDivisionOperands,
};

// Builds a regular question from fixed operands; callers validate it.
export function createQuestion(
  operation: MathOperation,
  firstOperand: number,
  secondOperand: number,
  difficulty: DifficultyLevel,
): Question {
  const correctAnswer = calculateAnswer(operation, firstOperand, secondOperand);
  return {
    id: createId(),
    operation,
    firstOperand,
    secondOperand,
    displayText: `${firstOperand} ${OPERATION_SYMBOLS[operation]} ${secondOperand}`,
    correctAnswer,
    choices: buildChoices(operation, firstOperand, secondOperand),
    difficulty,
    source: 'regular',
  };
}

function buildQuestion(operation: MathOperation, difficulty: DifficultyLevel): Question {
  const [firstOperand, secondOperand] = OPERAND_GENERATORS[operation](difficulty);
  return createQuestion(operation, firstOperand, secondOperand, difficulty);
}

export function generateQuestion(operation: MathOperation, difficulty: DifficultyLevel): Question {
  if (!OPERATIONS.includes(operation)) {
    throw new QuestionGenerationError(`Unsupported operation: ${String(operation)}`);
  }
  if (!(difficulty in DIFFICULTY_RANGES)) {
    throw new QuestionGenerationError(`Unsupported difficulty: ${String(difficulty)}`);
  }
  let errors: string[] = [];
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const question = buildQuestion(operation, difficulty);
    errors = validateQuestion(question);
    if (errors.length === 0) {
      return question;
    }
  }
  throw new QuestionGenerationError(
    `Could not generate a valid ${operation} question at level ${difficulty}: ${errors.join('; ')}`,
  );
}

// Each question picks one of the selected operations at random (DECISIONS 4.1).
export function generateQuestionFromOperations(
  operations: readonly MathOperation[],
  difficulty: DifficultyLevel,
): Question {
  if (operations.length === 0) {
    throw new QuestionGenerationError('No operations selected');
  }
  return generateQuestion(randomItem(operations), difficulty);
}

type QuestionFact = Pick<Question, 'operation' | 'firstOperand' | 'secondOperand'>;

// DECISIONS 7: same operation and operands; for + and × the operand order does not matter.
export function isSameQuestion(a: QuestionFact, b: QuestionFact) {
  if (a.operation !== b.operation) {
    return false;
  }
  if (a.firstOperand === b.firstOperand && a.secondOperand === b.secondOperand) {
    return true;
  }
  const commutative = a.operation === 'addition' || a.operation === 'multiplication';
  return commutative && a.firstOperand === b.secondOperand && a.secondOperand === b.firstOperand;
}

// Regenerates until the question differs from the previous one, up to the retry limit.
export function generateNextQuestion(
  operations: readonly MathOperation[],
  difficulty: DifficultyLevel,
  previous: QuestionFact | null,
): Question {
  let question = generateQuestionFromOperations(operations, difficulty);
  for (
    let attempt = 1;
    previous && isSameQuestion(question, previous) && attempt < MAX_GENERATION_ATTEMPTS;
    attempt++
  ) {
    question = generateQuestionFromOperations(operations, difficulty);
  }
  return question;
}
