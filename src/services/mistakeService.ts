import type { MistakePattern, PracticeAttempt } from '../types';
import { createId } from '../utils/ids';
import { isSameQuestion } from './questionGenerator';
import { readData, writeData } from './storageService';

type MistakeFact = Pick<
  PracticeAttempt,
  'operation' | 'firstOperand' | 'secondOperand' | 'correctAnswer' | 'difficulty' | 'attemptedAt'
>;

export function loadMistakePatterns(): MistakePattern[] {
  return readData('mistakePatterns').value;
}

// DECISIONS 2.1 and 2.3: one pattern per fact; stored operands stay as first missed.
export function addMistake(
  patterns: MistakePattern[],
  mistake: MistakeFact,
  createPatternId: () => string = createId,
): MistakePattern[] {
  const existing = patterns.find((pattern) => isSameQuestion(pattern, mistake));
  if (!existing) {
    return [
      ...patterns,
      {
        id: createPatternId(),
        operation: mistake.operation,
        firstOperand: mistake.firstOperand,
        secondOperand: mistake.secondOperand,
        correctAnswer: mistake.correctAnswer,
        difficulty: mistake.difficulty,
        incorrectCount: 1,
        similarCorrectCount: 0,
        lastIncorrectAt: mistake.attemptedAt,
        mastered: false,
      },
    ];
  }
  return patterns.map((pattern) =>
    pattern === existing
      ? {
          ...pattern,
          difficulty: mistake.difficulty,
          incorrectCount: pattern.incorrectCount + 1,
          similarCorrectCount: 0,
          lastIncorrectAt: mistake.attemptedAt,
          mastered: false,
        }
      : pattern,
  );
}

// Correct answers leave patterns unchanged; only review answers count toward mastery (Phase 14).
export function recordMistake(attempt: PracticeAttempt): boolean {
  if (attempt.selfReportedCorrect) {
    return true;
  }
  return writeData('mistakePatterns', addMistake(loadMistakePatterns(), attempt));
}
