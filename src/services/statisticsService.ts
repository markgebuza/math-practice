import type { AppStatistics, OperationStatistics, PracticeAttempt } from '../types';
import { createEmptyCounts, createEmptyStatistics } from '../types';
import { calculateAccuracy } from '../utils/math';
import { clearData, readData, saveAttempt, writeData } from './storageService';

export function getAccuracy({ correct, attempted }: OperationStatistics) {
  return calculateAccuracy(correct, attempted);
}

function addToCounts(counts: OperationStatistics, isCorrect: boolean): OperationStatistics {
  return {
    attempted: counts.attempted + 1,
    correct: counts.correct + (isCorrect ? 1 : 0),
    incorrect: counts.incorrect + (isCorrect ? 0 : 1),
  };
}

// DECISIONS 3.2: statistics use the self-reported result.
export function addAttemptToStatistics(
  statistics: AppStatistics,
  attempt: PracticeAttempt,
): AppStatistics {
  const isCorrect = attempt.selfReportedCorrect;
  const reviewCounts = statistics.mistakeReview ?? createEmptyCounts();
  return {
    ...addToCounts(statistics, isCorrect),
    byOperation: {
      ...statistics.byOperation,
      [attempt.operation]: addToCounts(statistics.byOperation[attempt.operation], isCorrect),
    },
    byDifficulty: {
      ...statistics.byDifficulty,
      [attempt.difficulty]: addToCounts(statistics.byDifficulty[attempt.difficulty], isCorrect),
    },
    mistakeReview:
      attempt.source === 'mistake-review' ? addToCounts(reviewCounts, isCorrect) : reviewCounts,
  };
}

export function buildStatistics(attempts: PracticeAttempt[]): AppStatistics {
  return attempts.reduce(addAttemptToStatistics, createEmptyStatistics());
}

// The stored aggregate is the source of truth for totals (older attempts may be summarized later).
// Only when it is missing or unreadable is it rebuilt from the saved attempts.
export function loadStatistics(): AppStatistics {
  const stored = readData('statistics');
  if (stored.status === 'unavailable') {
    return stored.value;
  }
  if (stored.status === 'ok') {
    return stored.value.mistakeReview ? stored.value : addMissingReviewCounts(stored.value);
  }
  const attempts = readData('attempts').value;
  if (attempts.length === 0) {
    return stored.value;
  }
  const rebuilt = buildStatistics(attempts);
  writeData('statistics', rebuilt);
  return rebuilt;
}

// Totals saved before review counts existed get them from the saved review attempts.
function addMissingReviewCounts(statistics: AppStatistics): AppStatistics {
  const reviewAttempts = readData('attempts').value.filter(
    (attempt) => attempt.source === 'mistake-review',
  );
  const withReview = {
    ...statistics,
    mistakeReview: buildStatistics(reviewAttempts).mistakeReview,
  };
  writeData('statistics', withReview);
  return withReview;
}

// Saves the attempt and adds it to the totals exactly once; a repeated attempt changes nothing.
export function recordAttempt(attempt: PracticeAttempt): boolean {
  const attempts = readData('attempts').value;
  if (attempts.some((saved) => saved.questionId === attempt.questionId)) {
    return true;
  }
  const statistics = loadStatistics();
  if (!saveAttempt(attempt)) {
    return false;
  }
  if (!writeData('statistics', addAttemptToStatistics(statistics, attempt))) {
    // Removing the stale totals makes the next load rebuild them from the saved attempts.
    clearData(['statistics']);
    return false;
  }
  return true;
}

// DECISIONS 3.1: mistake patterns and settings are kept.
export function resetStatistics(): boolean {
  return clearData(['attempts', 'sessions', 'statistics']);
}
