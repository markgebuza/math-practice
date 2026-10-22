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
}

function emptyCounts(): OperationStatistics {
  return { attempted: 0, correct: 0, incorrect: 0 };
}

export function createEmptyStatistics(): AppStatistics {
  return {
    ...emptyCounts(),
    byOperation: {
      addition: emptyCounts(),
      subtraction: emptyCounts(),
      multiplication: emptyCounts(),
      division: emptyCounts(),
    },
    byDifficulty: { 1: emptyCounts(), 2: emptyCounts(), 3: emptyCounts(), 4: emptyCounts() },
  };
}
