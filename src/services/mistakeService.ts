import type { MathOperation, MistakePattern, PracticeAttempt } from '../types';
import { createId } from '../utils/ids';
import { OPERATIONS } from '../utils/labels';
import { isSameQuestion } from './questionGenerator';
import { readData, writeData } from './storageService';

type MistakeFact = Pick<
  PracticeAttempt,
  'operation' | 'firstOperand' | 'secondOperand' | 'correctAnswer' | 'difficulty' | 'attemptedAt'
>;

const DAY_MS = 24 * 60 * 60 * 1000;

// DECISIONS 2.3: patterns already at or above the threshold become mastered when patterns load.
// A higher threshold never un-masters a pattern.
export function applyMasteryThreshold(
  patterns: MistakePattern[],
  masteryThreshold: number,
): MistakePattern[] {
  return patterns.map((pattern) =>
    !pattern.mastered && pattern.similarCorrectCount >= masteryThreshold
      ? { ...pattern, mastered: true }
      : pattern,
  );
}

export function loadMistakePatterns(masteryThreshold?: number): MistakePattern[] {
  const patterns = readData('mistakePatterns').value;
  return masteryThreshold === undefined
    ? patterns
    : applyMasteryThreshold(patterns, masteryThreshold);
}

export function saveMistakePatterns(patterns: MistakePattern[]): boolean {
  return writeData('mistakePatterns', patterns);
}

export function activePatterns(patterns: MistakePattern[]) {
  return patterns.filter((pattern) => !pattern.mastered);
}

function recencyBonus(lastIncorrectAt: string, now: number) {
  const age = now - Date.parse(lastIncorrectAt);
  if (age <= DAY_MS) {
    return 2;
  }
  return age <= 7 * DAY_MS ? 1 : 0;
}

// Frequently missed, recently missed and less-reviewed patterns score higher.
export function reviewPriority(pattern: MistakePattern, now: number) {
  return (
    pattern.incorrectCount -
    pattern.similarCorrectCount +
    recencyBonus(pattern.lastIncorrectAt, now)
  );
}

// Equal scores are ordered by `random`, so the same pattern doesn't always lead.
export function rankPatterns(
  patterns: MistakePattern[],
  now: number = Date.now(),
  random: () => number = Math.random,
): MistakePattern[] {
  return patterns
    .map((pattern) => ({ pattern, score: reviewPriority(pattern, now), tieBreak: random() }))
    .sort((a, b) => b.score - a.score || a.tieBreak - b.tieBreak)
    .map(({ pattern }) => pattern);
}

// Most missed first; equal counts put the most recently missed first.
export function sortByIncorrectCount(patterns: MistakePattern[]): MistakePattern[] {
  return [...patterns].sort(
    (a, b) =>
      b.incorrectCount - a.incorrectCount ||
      Date.parse(b.lastIncorrectAt) - Date.parse(a.lastIncorrectAt),
  );
}

export function mostMissedFacts(patterns: MistakePattern[], limit = 5): MistakePattern[] {
  return sortByIncorrectCount(patterns).slice(0, limit);
}

// Sums incorrectCount per operation; every operation tied for the most is returned, in the usual
// operation order.
export function mostMissedOperations(patterns: MistakePattern[]) {
  const totals = new Map<MathOperation, number>();
  for (const pattern of patterns) {
    totals.set(pattern.operation, (totals.get(pattern.operation) ?? 0) + pattern.incorrectCount);
  }
  const most = Math.max(0, ...totals.values());
  return {
    operations: most === 0 ? [] : OPERATIONS.filter((operation) => totals.get(operation) === most),
    incorrectCount: most,
  };
}

// DECISIONS 2.4: patterns repeat in priority order; mastered ones are skipped.
export function nextReviewPattern(
  queue: string[],
  patterns: MistakePattern[],
  afterPatternId: string | null,
): MistakePattern | null {
  const start = afterPatternId === null ? 0 : queue.indexOf(afterPatternId) + 1;
  for (let offset = 0; offset < queue.length; offset++) {
    const id = queue[(start + offset) % queue.length];
    const pattern = patterns.find((p) => p.id === id && !p.mastered);
    if (pattern) {
      return pattern;
    }
  }
  return null;
}

// DECISIONS 2.2 and 2.3: a review answer updates its source pattern, never one matched by fact.
export function applyReviewAnswer(
  patterns: MistakePattern[],
  patternId: string,
  correct: boolean,
  attemptedAt: string,
  masteryThreshold: number,
): MistakePattern[] {
  return patterns.map((pattern) => {
    if (pattern.id !== patternId) {
      return pattern;
    }
    if (correct) {
      const similarCorrectCount = pattern.similarCorrectCount + 1;
      return {
        ...pattern,
        similarCorrectCount,
        mastered: pattern.mastered || similarCorrectCount >= masteryThreshold,
      };
    }
    return {
      ...pattern,
      incorrectCount: pattern.incorrectCount + 1,
      similarCorrectCount: 0,
      lastIncorrectAt: attemptedAt,
      mastered: false,
    };
  });
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

// For regular questions. Correct answers leave patterns unchanged (only review answers count
// toward mastery).
export function recordMistake(attempt: PracticeAttempt): boolean {
  if (attempt.selfReportedCorrect) {
    return true;
  }
  return writeData('mistakePatterns', addMistake(loadMistakePatterns(), attempt));
}
