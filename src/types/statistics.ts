import type { DifficultyLevel, MathOperation } from './question';

export interface OperationStatistics {
  attempted: number;
  correct: number;
  incorrect: number;
}

export interface AppStatistics {
  attempted: number;
  correct: number;
  incorrect: number;
  byOperation: Record<MathOperation, OperationStatistics>;
  byDifficulty: Record<DifficultyLevel, OperationStatistics>;
  // Not in the spec: answers to mistake-review questions, kept in the aggregate so they survive
  // trimming of old attempts. Optional so totals saved before it existed stay valid.
  mistakeReview?: OperationStatistics;
}

export function createEmptyCounts(): OperationStatistics {
  return { attempted: 0, correct: 0, incorrect: 0 };
}

export function createEmptyStatistics(): AppStatistics {
  return {
    ...createEmptyCounts(),
    byOperation: {
      addition: createEmptyCounts(),
      subtraction: createEmptyCounts(),
      multiplication: createEmptyCounts(),
      division: createEmptyCounts(),
    },
    byDifficulty: {
      1: createEmptyCounts(),
      2: createEmptyCounts(),
      3: createEmptyCounts(),
      4: createEmptyCounts(),
    },
    mistakeReview: createEmptyCounts(),
  };
}
