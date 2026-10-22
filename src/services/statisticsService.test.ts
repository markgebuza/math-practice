import type { AppStatistics, PracticeAttempt } from '../types';
import { createEmptyStatistics, DEFAULT_SETTINGS } from '../types';
import {
  addAttemptToStatistics,
  ATTEMPT_HISTORY_LIMIT,
  buildStatistics,
  getAccuracy,
  loadStatistics,
  recordAttempt,
  resetStatistics,
  summarizeOldAttempts,
} from './statisticsService';
import { readData, STORAGE_KEYS, writeData } from './storageService';

let nextId = 1;

function makeAttempt(overrides: Partial<PracticeAttempt> = {}): PracticeAttempt {
  const id = nextId++;
  return {
    id: `attempt-${id}`,
    questionId: `question-${id}`,
    operation: 'addition',
    firstOperand: 3,
    secondOperand: 4,
    correctAnswer: 7,
    selectedAnswer: 7,
    selfReportedCorrect: true,
    difficulty: 1,
    source: 'regular',
    attemptedAt: '2026-10-21T10:00:00.000Z',
    sessionId: 'session-1',
    ...overrides,
  };
}

const MIXED: PracticeAttempt[] = [
  makeAttempt({ operation: 'addition', difficulty: 1, selfReportedCorrect: true }),
  makeAttempt({ operation: 'addition', difficulty: 2, selfReportedCorrect: false }),
  makeAttempt({ operation: 'division', difficulty: 2, selfReportedCorrect: true }),
  makeAttempt({ operation: 'multiplication', difficulty: 4, selfReportedCorrect: false }),
  makeAttempt({ operation: 'multiplication', difficulty: 4, selfReportedCorrect: false }),
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getAccuracy', () => {
  it('is 0 with zero attempts, never NaN or Infinity', () => {
    const accuracy = getAccuracy({ attempted: 0, correct: 0, incorrect: 0 });
    expect(accuracy).toBe(0);
    expect(Number.isFinite(accuracy)).toBe(true);
  });

  it('is 100 when every answer is correct', () => {
    expect(getAccuracy({ attempted: 7, correct: 7, incorrect: 0 })).toBe(100);
  });

  it('is 0 when every answer is wrong', () => {
    expect(getAccuracy({ attempted: 6, correct: 0, incorrect: 6 })).toBe(0);
  });

  it('rounds to a whole percent', () => {
    expect(getAccuracy({ attempted: 5, correct: 4, incorrect: 1 })).toBe(80);
    expect(getAccuracy({ attempted: 3, correct: 1, incorrect: 2 })).toBe(33);
  });
});

describe('building statistics', () => {
  it('starts with zero everywhere', () => {
    const empty = buildStatistics([]);
    expect(empty).toEqual(createEmptyStatistics());
    expect(getAccuracy(empty)).toBe(0);
    expect(getAccuracy(empty.byOperation.division)).toBe(0);
    expect(getAccuracy(empty.byDifficulty[3])).toBe(0);
  });

  it('adds one attempt to the totals, its operation and its level without changing the input', () => {
    const before = createEmptyStatistics();
    const after = addAttemptToStatistics(
      before,
      makeAttempt({ operation: 'subtraction', difficulty: 3, selfReportedCorrect: false }),
    );
    expect(before).toEqual(createEmptyStatistics());
    expect(after).toMatchObject({ attempted: 1, correct: 0, incorrect: 1 });
    expect(after.byOperation.subtraction).toEqual({ attempted: 1, correct: 0, incorrect: 1 });
    expect(after.byDifficulty[3]).toEqual({ attempted: 1, correct: 0, incorrect: 1 });
    expect(after.byOperation.addition.attempted).toBe(0);
    expect(after.byDifficulty[1].attempted).toBe(0);
  });

  it('counts totals by operation and by level', () => {
    const statistics = buildStatistics(MIXED);
    expect(statistics).toMatchObject({ attempted: 5, correct: 2, incorrect: 3 });
    expect(statistics.byOperation).toEqual({
      addition: { attempted: 2, correct: 1, incorrect: 1 },
      subtraction: { attempted: 0, correct: 0, incorrect: 0 },
      multiplication: { attempted: 2, correct: 0, incorrect: 2 },
      division: { attempted: 1, correct: 1, incorrect: 0 },
    });
    expect(statistics.byDifficulty).toEqual({
      1: { attempted: 1, correct: 1, incorrect: 0 },
      2: { attempted: 2, correct: 1, incorrect: 1 },
      3: { attempted: 0, correct: 0, incorrect: 0 },
      4: { attempted: 2, correct: 0, incorrect: 2 },
    });
    expect(getAccuracy(statistics)).toBe(40);
    expect(getAccuracy(statistics.byOperation.division)).toBe(100);
    expect(getAccuracy(statistics.byOperation.multiplication)).toBe(0);
  });

  it('counts mistake-review answers separately as well as in the totals', () => {
    const statistics = buildStatistics([
      ...MIXED,
      makeAttempt({ source: 'mistake-review', operation: 'division', selfReportedCorrect: true }),
      makeAttempt({ source: 'mistake-review', selfReportedCorrect: false }),
      makeAttempt({ source: 'mistake-review', selfReportedCorrect: true }),
    ]);
    expect(statistics.mistakeReview).toEqual({ attempted: 3, correct: 2, incorrect: 1 });
    expect(statistics.attempted).toBe(8);
    expect(statistics.byOperation.division.attempted).toBe(2);
    expect(buildStatistics(MIXED).mistakeReview).toEqual({
      attempted: 0,
      correct: 0,
      incorrect: 0,
    });
  });

  it('uses the self-reported result, not the selected answer (DECISIONS 3.2)', () => {
    const statistics = buildStatistics([
      makeAttempt({ selectedAnswer: 7, correctAnswer: 7, selfReportedCorrect: false }),
    ]);
    expect(statistics).toMatchObject({ correct: 0, incorrect: 1 });
  });
});

describe('loadStatistics', () => {
  it('returns empty statistics with no stored data and saves nothing', () => {
    expect(loadStatistics()).toEqual(createEmptyStatistics());
    expect(localStorage.getItem(STORAGE_KEYS.statistics)).toBeNull();
  });

  it('keeps the stored totals as the source of truth', () => {
    const stored: AppStatistics = buildStatistics(MIXED);
    writeData('statistics', stored);
    writeData('attempts', MIXED.slice(0, 1));
    expect(loadStatistics()).toEqual(stored);
  });

  it('adds review counts from saved attempts to totals stored before they existed', () => {
    const review = makeAttempt({ source: 'mistake-review', selfReportedCorrect: true });
    const old: AppStatistics = buildStatistics([...MIXED, review]);
    delete old.mistakeReview;
    writeData('statistics', old);
    writeData('attempts', [MIXED[0], review]);
    const loaded = loadStatistics();
    expect(loaded.attempted).toBe(6);
    expect(loaded.mistakeReview).toEqual({ attempted: 1, correct: 1, incorrect: 0 });
    expect(readData('statistics').value).toEqual(loaded);
  });

  it('rebuilds missing totals from saved attempts and stores them', () => {
    writeData('attempts', MIXED);
    expect(loadStatistics()).toEqual(buildStatistics(MIXED));
    expect(readData('statistics')).toEqual({ value: buildStatistics(MIXED), status: 'ok' });
  });

  it('rebuilds corrupted totals from saved attempts', () => {
    writeData('attempts', MIXED);
    localStorage.setItem(STORAGE_KEYS.statistics, '{not json');
    expect(loadStatistics()).toEqual(buildStatistics(MIXED));
  });
});

describe('recordAttempt', () => {
  it('saves the attempt and updates the stored totals', () => {
    expect(recordAttempt(MIXED[0])).toBe(true);
    expect(recordAttempt(MIXED[3])).toBe(true);
    expect(readData('attempts').value).toEqual([MIXED[0], MIXED[3]]);
    expect(readData('statistics').value).toEqual(buildStatistics([MIXED[0], MIXED[3]]));
  });

  it('counts the same question only once', () => {
    const attempt = makeAttempt();
    recordAttempt(attempt);
    recordAttempt({ ...attempt, id: 'another-id' });
    expect(readData('attempts').value).toHaveLength(1);
    expect(readData('statistics').value.attempted).toBe(1);
  });

  it('adds to stored totals that include attempts no longer in the list', () => {
    writeData('statistics', buildStatistics(MIXED));
    recordAttempt(makeAttempt({ operation: 'division', selfReportedCorrect: false }));
    const statistics = readData('statistics').value;
    expect(statistics).toMatchObject({ attempted: 6, correct: 2, incorrect: 4 });
    expect(statistics.byOperation.division).toEqual({ attempted: 2, correct: 1, incorrect: 1 });
  });

  it('includes earlier attempts when there were no stored totals yet', () => {
    writeData('attempts', MIXED.slice(0, 2));
    recordAttempt(MIXED[2]);
    expect(readData('statistics').value).toEqual(buildStatistics(MIXED.slice(0, 3)));
  });

  it('returns false and changes nothing when storage is full', () => {
    recordAttempt(MIXED[0]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(recordAttempt(MIXED[1])).toBe(false);
    vi.restoreAllMocks();
    expect(readData('attempts').value).toEqual([MIXED[0]]);
    expect(readData('statistics').value).toEqual(buildStatistics([MIXED[0]]));
  });

  it('drops stale totals when only the totals fail to save, so they are rebuilt correctly', () => {
    recordAttempt(MIXED[0]);
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === STORAGE_KEYS.statistics) {
        throw new Error('QuotaExceededError');
      }
      setItem.call(this, key, value);
    });
    expect(recordAttempt(MIXED[1])).toBe(false);
    vi.restoreAllMocks();
    expect(localStorage.getItem(STORAGE_KEYS.statistics)).toBeNull();
    expect(loadStatistics()).toEqual(buildStatistics(MIXED.slice(0, 2)));
  });
});

const OPERATIONS = ['addition', 'subtraction', 'multiplication', 'division'] as const;

// Varied operations, levels, results and sources, so every total is exercised.
function makeHistory(count: number) {
  return Array.from({ length: count }, (_, i) =>
    makeAttempt({
      operation: OPERATIONS[i % 4],
      difficulty: ((i % 3) + 1) as 1 | 2 | 3,
      selfReportedCorrect: i % 5 !== 0,
      source: i % 7 === 0 ? 'mistake-review' : 'regular',
    }),
  );
}

describe('attempt history limit', () => {
  it('keeps the newest attempts in detail and summarizes older ones without changing totals', () => {
    const history = makeHistory(ATTEMPT_HISTORY_LIMIT + 50);
    history.forEach(recordAttempt);
    const attempts = readData('attempts').value;
    expect(attempts).toHaveLength(ATTEMPT_HISTORY_LIMIT);
    expect(attempts).toEqual(history.slice(50));
    expect(readData('statistics').value).toEqual(buildStatistics(history));
    expect(readData('archivedStatistics').value).toEqual(buildStatistics(history.slice(0, 50)));
  });

  it('summarizes 5,000 seeded attempts with identical totals, review counts included', () => {
    const history = makeHistory(5000);
    const totals = buildStatistics(history);
    const patterns = '[{"kept": "exactly"}]';
    writeData('attempts', history);
    writeData('statistics', totals);
    localStorage.setItem(STORAGE_KEYS.mistakePatterns, patterns);

    expect(summarizeOldAttempts()).toBe(true);

    expect(readData('attempts').value).toEqual(history.slice(-ATTEMPT_HISTORY_LIMIT));
    expect(loadStatistics()).toEqual(totals);
    expect(loadStatistics().mistakeReview).toEqual(totals.mistakeReview);
    expect(localStorage.getItem(STORAGE_KEYS.mistakePatterns)).toBe(patterns);
  });

  it('rebuilds missing or corrupted totals exactly from the summary and the kept attempts', () => {
    const history = makeHistory(ATTEMPT_HISTORY_LIMIT + 300);
    history.forEach(recordAttempt);
    localStorage.removeItem(STORAGE_KEYS.statistics);
    expect(loadStatistics()).toEqual(buildStatistics(history));
    localStorage.setItem(STORAGE_KEYS.statistics, '{not json');
    expect(loadStatistics()).toEqual(buildStatistics(history));
  });

  it('rebuilds from the summary alone when no detailed attempts are left', () => {
    writeData('archivedStatistics', buildStatistics(MIXED));
    expect(loadStatistics()).toEqual(buildStatistics(MIXED));
  });

  it('still counts a repeated answer once after summarizing', () => {
    const history = makeHistory(ATTEMPT_HISTORY_LIMIT + 1);
    history.forEach(recordAttempt);
    recordAttempt({ ...history.at(-1)!, id: 'double-click' });
    expect(readData('statistics').value).toEqual(buildStatistics(history));
    localStorage.removeItem(STORAGE_KEYS.statistics);
    expect(loadStatistics()).toEqual(buildStatistics(history));
  });

  it('restores the summary when the shortened list cannot be saved', () => {
    const history = makeHistory(ATTEMPT_HISTORY_LIMIT);
    history.forEach(recordAttempt);
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === STORAGE_KEYS.attempts) {
        throw new Error('QuotaExceededError');
      }
      setItem.call(this, key, value);
    });
    expect(recordAttempt(makeAttempt())).toBe(false);
    vi.restoreAllMocks();
    expect(readData('attempts').value).toEqual(history);
    expect(readData('archivedStatistics').value).toEqual(createEmptyStatistics());
    localStorage.removeItem(STORAGE_KEYS.statistics);
    expect(loadStatistics()).toEqual(buildStatistics(history));
  });
});

describe('resetStatistics', () => {
  it('clears attempts, sessions and totals but keeps mistake patterns and settings', () => {
    const settings = { ...DEFAULT_SETTINGS, soundEffects: true };
    const pattern = {
      id: 'pattern-1',
      operation: 'multiplication' as const,
      firstOperand: 8,
      secondOperand: 7,
      correctAnswer: 56,
      difficulty: 2 as const,
      incorrectCount: 2,
      similarCorrectCount: 0,
      lastIncorrectAt: '2026-10-21T10:00:00.000Z',
      mastered: false,
    };
    MIXED.forEach(recordAttempt);
    writeData('sessions', [
      {
        id: 'session-1',
        startedAt: '2026-10-21T09:58:00.000Z',
        completedAt: '2026-10-21T10:05:00.000Z',
        operations: ['addition'],
        difficulty: 1,
        sessionLength: 5,
        attempted: 5,
        correct: 2,
        incorrect: 3,
      },
    ]);
    writeData('settings', settings);
    writeData('mistakePatterns', [pattern]);
    localStorage.setItem(STORAGE_KEYS.version, '1');

    expect(resetStatistics()).toBe(true);

    expect(localStorage.getItem(STORAGE_KEYS.attempts)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.sessions)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.statistics)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.archivedStatistics)).toBeNull();
    expect(loadStatistics()).toEqual(createEmptyStatistics());
    expect(readData('settings').value).toEqual(settings);
    expect(readData('mistakePatterns').value).toEqual([pattern]);
    expect(localStorage.getItem(STORAGE_KEYS.version)).toBe('1');
  });
});
