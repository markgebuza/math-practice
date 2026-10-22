import type { MathOperation, MistakePattern, Question } from '../types';
import { randomItem } from '../utils/math';
import { calculateAnswer, validateQuestion } from '../utils/validation';
import {
  createQuestion,
  generateQuestion,
  isSameQuestion,
  MAX_GENERATION_ATTEMPTS,
} from './questionGenerator';

export type SimilarityStrategy = 'nearby' | 'reversed' | 'fact-family';

type QuestionFact = Pick<Question, 'operation' | 'firstOperand' | 'secondOperand'>;

const NEARBY_OFFSETS = [-2, -1, 1, 2];

function fact(operation: MathOperation, firstOperand: number, secondOperand: number): QuestionFact {
  return { operation, firstOperand, secondOperand };
}

function nearbyFacts({ operation, firstOperand: a, secondOperand: b }: QuestionFact) {
  if (operation === 'division') {
    // Change the quotient or the divisor so the answer stays a whole number.
    const quotient = a / b;
    return NEARBY_OFFSETS.flatMap((d) => [
      fact(operation, b * (quotient + d), b),
      fact(operation, (b + d) * quotient, b + d),
    ]);
  }
  return NEARBY_OFFSETS.flatMap((d) => [fact(operation, a + d, b), fact(operation, a, b + d)]);
}

// Only + and × are commutative; reversed − and ÷ are different facts (DECISIONS 2.1).
function reversedFacts({ operation, firstOperand: a, secondOperand: b }: QuestionFact) {
  return operation === 'addition' || operation === 'multiplication' ? [fact(operation, b, a)] : [];
}

function factFamilyFacts({ operation, firstOperand: a, secondOperand: b }: QuestionFact) {
  const answer = calculateAnswer(operation, a, b);
  switch (operation) {
    case 'addition':
      return [fact('subtraction', answer, a), fact('subtraction', answer, b)];
    case 'subtraction':
      return [fact('addition', b, answer), fact('addition', answer, b)];
    case 'multiplication':
      return [fact('division', answer, a), fact('division', answer, b)];
    case 'division':
      return [fact('multiplication', b, answer), fact('multiplication', answer, b)];
  }
}

const STRATEGIES: Record<SimilarityStrategy, (pattern: QuestionFact) => QuestionFact[]> = {
  nearby: nearbyFacts,
  reversed: reversedFacts,
  'fact-family': factFamilyFacts,
};

function hasWholeAnswer({ operation, firstOperand: a, secondOperand: b }: QuestionFact) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
    return false;
  }
  if (operation === 'division' && b === 0) {
    return false;
  }
  const answer = calculateAnswer(operation, a, b);
  return Number.isInteger(answer) && answer >= 0;
}

function isExactPattern(question: QuestionFact, pattern: QuestionFact) {
  return (
    question.operation === pattern.operation &&
    question.firstOperand === pattern.firstOperand &&
    question.secondOperand === pattern.secondOperand
  );
}

function candidatesByStrategy(pattern: MistakePattern, previous: QuestionFact | null) {
  return (Object.keys(STRATEGIES) as SimilarityStrategy[])
    .map((strategy) =>
      STRATEGIES[strategy](pattern)
        .filter(hasWholeAnswer)
        .filter((f) => !isExactPattern(f, pattern) && !(previous && isSameQuestion(f, previous)))
        .map((f) =>
          createQuestion(f.operation, f.firstOperand, f.secondOperand, pattern.difficulty),
        )
        .filter((question) => validateQuestion(question).length === 0),
    )
    .filter((candidates) => candidates.length > 0);
}

function fallbackQuestion(pattern: MistakePattern, previous: QuestionFact | null) {
  let question = generateQuestion(pattern.operation, pattern.difficulty);
  for (
    let attempt = 1;
    (isExactPattern(question, pattern) || (previous && isSameQuestion(question, previous))) &&
    attempt < MAX_GENERATION_ATTEMPTS;
    attempt++
  ) {
    question = generateQuestion(pattern.operation, pattern.difficulty);
  }
  return question;
}

// Picks a random strategy that can make a valid question at the pattern's level, then a random
// question from it. Falls back to a fresh question with the same operation and level.
// Never the exact missed question, and never the same as `previous` (DECISIONS 2.4).
export function generateSimilarQuestion(
  pattern: MistakePattern,
  previous: QuestionFact | null = null,
): Question {
  const strategies = candidatesByStrategy(pattern, previous);
  const question =
    strategies.length > 0
      ? randomItem(randomItem(strategies))
      : fallbackQuestion(pattern, previous);
  return { ...question, source: 'mistake-review', mistakePatternId: pattern.id };
}
