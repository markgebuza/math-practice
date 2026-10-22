import type { MistakePattern, PracticeAttempt } from '../types';
import {
  activePatterns,
  addMistake,
  applyMasteryThreshold,
  applyReviewAnswer,
  loadMistakePatterns,
  mostMissedFacts,
  mostMissedOperations,
  nextReviewPattern,
  rankPatterns,
  recordMistake,
  sortByIncorrectCount,
} from './mistakeService';
import { readData, STORAGE_KEYS, writeData } from './storageService';

let nextId = 1;

function makeAttempt(overrides: Partial<PracticeAttempt> = {}): PracticeAttempt {
  const id = nextId++;
  return {
    id: `attempt-${id}`,
    questionId: `question-${id}`,
    operation: 'multiplication',
    firstOperand: 7,
    secondOperand: 8,
    correctAnswer: 56,
    selectedAnswer: 54,
    selfReportedCorrect: false,
    difficulty: 2,
    source: 'regular',
    attemptedAt: '2026-10-21T10:00:00.000Z',
    sessionId: 'session-1',
    ...overrides,
  };
}

function makePattern(overrides: Partial<MistakePattern> = {}): MistakePattern {
  return {
    id: 'pattern-1',
    operation: 'multiplication',
    firstOperand: 7,
    secondOperand: 8,
    correctAnswer: 56,
    difficulty: 2,
    incorrectCount: 1,
    similarCorrectCount: 0,
    lastIncorrectAt: '2026-10-21T10:00:00.000Z',
    mastered: false,
    ...overrides,
  };
}

const fixedId = () => 'new-pattern';

describe('addMistake', () => {
  it('creates a pattern with the fact, difficulty, timestamp and starting counts', () => {
    expect(addMistake([], makeAttempt(), fixedId)).toEqual([
      {
        id: 'new-pattern',
        operation: 'multiplication',
        firstOperand: 7,
        secondOperand: 8,
        correctAnswer: 56,
        difficulty: 2,
        incorrectCount: 1,
        similarCorrectCount: 0,
        lastIncorrectAt: '2026-10-21T10:00:00.000Z',
        mastered: false,
      },
    ]);
  });

  it('increments the existing pattern instead of adding a duplicate', () => {
    const later = makeAttempt({ attemptedAt: '2026-10-22T09:00:00.000Z' });
    expect(addMistake([makePattern()], later, fixedId)).toEqual([
      makePattern({ incorrectCount: 2, lastIncorrectAt: '2026-10-22T09:00:00.000Z' }),
    ]);
  });

  it.each(['addition', 'multiplication'] as const)(
    'treats swapped operands as the same %s pattern and keeps the first-missed order',
    (operation) => {
      const pattern = makePattern({ operation, correctAnswer: operation === 'addition' ? 15 : 56 });
      const swapped = makeAttempt({
        operation,
        firstOperand: 8,
        secondOperand: 7,
        correctAnswer: pattern.correctAnswer,
      });
      const [updated, ...rest] = addMistake([pattern], swapped, fixedId);
      expect(rest).toEqual([]);
      expect(updated).toMatchObject({
        id: 'pattern-1',
        firstOperand: 7,
        secondOperand: 8,
        incorrectCount: 2,
      });
    },
  );

  it.each([
    ['subtraction', 10, 3, 7, 3, 10, -7],
    ['division', 56, 8, 7, 56, 7, 8],
  ] as const)(
    'keeps %s facts with different operands apart',
    (operation, a, b, answer, c, d, other) => {
      const pattern = makePattern({
        operation,
        firstOperand: a,
        secondOperand: b,
        correctAnswer: answer,
      });
      const different = makeAttempt({
        operation,
        firstOperand: c,
        secondOperand: d,
        correctAnswer: other,
      });
      const patterns = addMistake([pattern], different, fixedId);
      expect(patterns).toHaveLength(2);
      expect(patterns[0]).toEqual(pattern);
      expect(patterns[1]).toMatchObject({ id: 'new-pattern', firstOperand: c, secondOperand: d });
    },
  );

  it('does not match the same operands under another operation', () => {
    const sum = makeAttempt({ operation: 'addition', correctAnswer: 15 });
    expect(addMistake([makePattern()], sum, fixedId)).toHaveLength(2);
  });

  it('keeps one pattern across levels and moves it to the latest level', () => {
    const levelThree = makeAttempt({ difficulty: 3 });
    expect(addMistake([makePattern({ difficulty: 1 })], levelThree, fixedId)).toEqual([
      makePattern({ difficulty: 3, incorrectCount: 2 }),
    ]);
  });

  it('un-masters a mastered pattern and restarts its progress', () => {
    const mastered = makePattern({ mastered: true, similarCorrectCount: 3, incorrectCount: 4 });
    expect(addMistake([mastered], makeAttempt(), fixedId)).toEqual([
      makePattern({ mastered: false, similarCorrectCount: 0, incorrectCount: 5 }),
    ]);
  });

  it('resets progress toward mastery on a new mistake', () => {
    const inProgress = makePattern({ similarCorrectCount: 2 });
    expect(addMistake([inProgress], makeAttempt(), fixedId)[0].similarCorrectCount).toBe(0);
  });

  it('leaves the other patterns untouched', () => {
    const other = makePattern({ id: 'pattern-2', operation: 'addition', correctAnswer: 15 });
    const patterns = addMistake([other, makePattern()], makeAttempt(), fixedId);
    expect(patterns[0]).toBe(other);
    expect(patterns[1].incorrectCount).toBe(2);
  });
});

describe('recordMistake', () => {
  it('saves a new pattern for a wrong answer right away', () => {
    expect(recordMistake(makeAttempt())).toBe(true);
    const patterns = readData('mistakePatterns').value;
    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toMatchObject({
      operation: 'multiplication',
      firstOperand: 7,
      secondOperand: 8,
      incorrectCount: 1,
    });
    expect(patterns[0].id).toEqual(expect.any(String));
  });

  it('increments the saved pattern when the same mistake happens again', () => {
    recordMistake(makeAttempt());
    recordMistake(makeAttempt({ firstOperand: 8, secondOperand: 7 }));
    const patterns = loadMistakePatterns();
    expect(patterns).toHaveLength(1);
    expect(patterns[0].incorrectCount).toBe(2);
  });

  it('creates nothing for a correct answer', () => {
    expect(recordMistake(makeAttempt({ selfReportedCorrect: true }))).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.mistakePatterns)).toBeNull();
  });

  it('does not change existing patterns for a correct regular answer', () => {
    const pattern = makePattern({ similarCorrectCount: 1 });
    writeData('mistakePatterns', [pattern]);
    recordMistake(makeAttempt({ selfReportedCorrect: true }));
    expect(loadMistakePatterns()).toEqual([pattern]);
  });

  it('drops invalid stored patterns without crashing and keeps the valid ones', () => {
    const valid = makePattern({ id: 'valid', operation: 'addition', correctAnswer: 15 });
    localStorage.setItem(
      STORAGE_KEYS.mistakePatterns,
      JSON.stringify([valid, { ...valid, id: 'broken', incorrectCount: -1 }, 'nonsense']),
    );
    expect(recordMistake(makeAttempt())).toBe(true);
    expect(loadMistakePatterns().map((p) => p.id)).toEqual(['valid', expect.any(String)]);
  });

  it('starts over when the stored patterns are not readable at all', () => {
    localStorage.setItem(STORAGE_KEYS.mistakePatterns, '{not json');
    expect(recordMistake(makeAttempt())).toBe(true);
    expect(loadMistakePatterns()).toHaveLength(1);
  });

  it('reports a failed save instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(recordMistake(makeAttempt())).toBe(false);
    vi.restoreAllMocks();
  });
});

const NOW = Date.parse('2026-10-21T12:00:00.000Z');
const DAYS_AGO = (days: number) => new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString();

describe('mastery threshold', () => {
  it('masters patterns already at or above a lowered threshold', () => {
    const patterns = [
      makePattern({ id: 'a', similarCorrectCount: 2 }),
      makePattern({ id: 'b', similarCorrectCount: 1 }),
    ];
    expect(applyMasteryThreshold(patterns, 2).map((p) => p.mastered)).toEqual([true, false]);
  });

  it('does not un-master patterns when the threshold is raised', () => {
    const mastered = makePattern({ similarCorrectCount: 3, mastered: true });
    expect(applyMasteryThreshold([mastered], 5)).toEqual([mastered]);
  });

  it('applies the threshold when patterns load', () => {
    writeData('mistakePatterns', [makePattern({ similarCorrectCount: 2 })]);
    expect(loadMistakePatterns()[0].mastered).toBe(false);
    expect(loadMistakePatterns(2)[0].mastered).toBe(true);
    expect(activePatterns(loadMistakePatterns(2))).toEqual([]);
  });
});

describe('rankPatterns', () => {
  const fixedRandom = () => 0.5;
  const ids = (patterns: MistakePattern[]) => patterns.map((p) => p.id);

  it('puts frequently missed patterns first', () => {
    const once = makePattern({ id: 'once', incorrectCount: 1, lastIncorrectAt: DAYS_AGO(30) });
    const often = makePattern({ id: 'often', incorrectCount: 4, lastIncorrectAt: DAYS_AGO(30) });
    expect(ids(rankPatterns([once, often], NOW, fixedRandom))).toEqual(['often', 'once']);
  });

  it('puts recently missed patterns first', () => {
    const old = makePattern({ id: 'old', lastIncorrectAt: DAYS_AGO(30) });
    const week = makePattern({ id: 'week', lastIncorrectAt: DAYS_AGO(3) });
    const today = makePattern({ id: 'today', lastIncorrectAt: DAYS_AGO(0.1) });
    expect(ids(rankPatterns([old, week, today], NOW, fixedRandom))).toEqual([
      'today',
      'week',
      'old',
    ]);
  });

  it('puts patterns with little successful review first', () => {
    const reviewed = makePattern({ id: 'reviewed', similarCorrectCount: 2 });
    const fresh = makePattern({ id: 'fresh', similarCorrectCount: 0 });
    expect(ids(rankPatterns([reviewed, fresh], NOW, fixedRandom))).toEqual(['fresh', 'reviewed']);
  });

  it('weighs the three together', () => {
    // Scores: 3 + 0 = 3, 1 + 2 = 3, 3 - 1 + 2 = 4.
    const oldFrequent = makePattern({
      id: 'old',
      incorrectCount: 3,
      lastIncorrectAt: DAYS_AGO(30),
    });
    const newOnce = makePattern({ id: 'new', incorrectCount: 1, lastIncorrectAt: DAYS_AGO(0) });
    const top = makePattern({
      id: 'top',
      incorrectCount: 3,
      similarCorrectCount: 1,
      lastIncorrectAt: DAYS_AGO(0),
    });
    expect(rankPatterns([oldFrequent, newOnce, top], NOW, fixedRandom)[0].id).toBe('top');
  });

  it('shuffles equally ranked patterns with the given randomness', () => {
    const a = makePattern({ id: 'a' });
    const b = makePattern({ id: 'b' });
    const values =
      (...v: number[]) =>
      () =>
        v.shift()!;
    expect(ids(rankPatterns([a, b], NOW, values(0.2, 0.8)))).toEqual(['a', 'b']);
    expect(ids(rankPatterns([a, b], NOW, values(0.8, 0.2)))).toEqual(['b', 'a']);
  });

  it('never lets randomness move a pattern past a higher-ranked one', () => {
    const high = makePattern({ id: 'high', incorrectCount: 3 });
    const low = makePattern({ id: 'low', incorrectCount: 1 });
    const values =
      (...v: number[]) =>
      () =>
        v.shift()!;
    expect(ids(rankPatterns([low, high], NOW, values(0, 0.99)))).toEqual(['high', 'low']);
  });

  it('leaves the input unchanged', () => {
    const patterns = [makePattern({ id: 'a' }), makePattern({ id: 'b', incorrectCount: 5 })];
    rankPatterns(patterns, NOW, fixedRandom);
    expect(ids(patterns)).toEqual(['a', 'b']);
  });
});

describe('nextReviewPattern', () => {
  const a = makePattern({ id: 'a' });
  const b = makePattern({ id: 'b' });
  const c = makePattern({ id: 'c' });
  const queue = ['a', 'b', 'c'];

  it('starts with the first pattern and repeats the queue in order', () => {
    const order: (string | undefined)[] = [];
    let current: string | null = null;
    for (let i = 0; i < 5; i++) {
      current = nextReviewPattern(queue, [a, b, c], current)?.id ?? null;
      order.push(current ?? undefined);
    }
    expect(order).toEqual(['a', 'b', 'c', 'a', 'b']);
  });

  it('skips mastered patterns', () => {
    const masteredB = { ...b, mastered: true };
    expect(nextReviewPattern(queue, [a, masteredB, c], 'a')?.id).toBe('c');
    expect(nextReviewPattern(queue, [a, masteredB, c], 'c')?.id).toBe('a');
  });

  it('returns null when every pattern is mastered or gone', () => {
    expect(nextReviewPattern(queue, [{ ...a, mastered: true }], 'a')).toBeNull();
  });
});

describe('applyReviewAnswer', () => {
  const at = '2026-10-22T09:00:00.000Z';

  it('counts a correct review answer toward mastery', () => {
    const [updated] = applyReviewAnswer([makePattern()], 'pattern-1', true, at, 3);
    expect(updated).toMatchObject({ similarCorrectCount: 1, mastered: false, incorrectCount: 1 });
    expect(updated.lastIncorrectAt).toBe(makePattern().lastIncorrectAt);
  });

  it('masters the pattern when the threshold is reached', () => {
    let patterns = [makePattern()];
    for (let i = 0; i < 3; i++) {
      patterns = applyReviewAnswer(patterns, 'pattern-1', true, at, 3);
    }
    expect(patterns[0]).toMatchObject({ similarCorrectCount: 3, mastered: true });
    expect(activePatterns(patterns)).toEqual([]);
  });

  it('uses the threshold it is given', () => {
    const [updated] = applyReviewAnswer([makePattern()], 'pattern-1', true, at, 1);
    expect(updated.mastered).toBe(true);
  });

  it('updates the source pattern on a wrong review answer (DECISIONS 2.2)', () => {
    const pattern = makePattern({ incorrectCount: 2, similarCorrectCount: 2 });
    expect(applyReviewAnswer([pattern], 'pattern-1', false, at, 3)).toEqual([
      {
        ...pattern,
        incorrectCount: 3,
        similarCorrectCount: 0,
        lastIncorrectAt: at,
        mastered: false,
      },
    ]);
  });

  it('leaves other patterns alone and ignores a pattern that no longer exists', () => {
    const other = makePattern({ id: 'other' });
    const patterns = applyReviewAnswer([makePattern(), other], 'pattern-1', false, at, 3);
    expect(patterns[1]).toBe(other);
    expect(applyReviewAnswer([other], 'gone', false, at, 3)).toEqual([other]);
  });
});

describe('frequently missed areas', () => {
  const patterns = [
    makePattern({ id: 'a', operation: 'addition', incorrectCount: 2 }),
    makePattern({
      id: 'm-old',
      operation: 'multiplication',
      incorrectCount: 3,
      lastIncorrectAt: '2026-10-19T10:00:00.000Z',
    }),
    makePattern({
      id: 'm-new',
      operation: 'multiplication',
      incorrectCount: 3,
      lastIncorrectAt: '2026-10-21T10:00:00.000Z',
    }),
    makePattern({ id: 'd', operation: 'division', incorrectCount: 5, mastered: true }),
    makePattern({ id: 's', operation: 'subtraction', incorrectCount: 1 }),
    makePattern({ id: 'a2', operation: 'addition', incorrectCount: 1 }),
  ];

  it('sorts by incorrect count, then most recently missed first', () => {
    expect(sortByIncorrectCount(patterns).map((p) => p.id)).toEqual([
      'd',
      'm-new',
      'm-old',
      'a',
      's',
      'a2',
    ]);
    expect(patterns[0].id).toBe('a');
  });

  it('lists the top 5 most missed facts', () => {
    expect(mostMissedFacts(patterns).map((p) => p.id)).toEqual(['d', 'm-new', 'm-old', 'a', 's']);
    expect(mostMissedFacts(patterns, 2)).toHaveLength(2);
  });

  it('finds the operation with the most misses, counting mastered patterns', () => {
    expect(mostMissedOperations(patterns)).toEqual({
      operations: ['multiplication'],
      incorrectCount: 6,
    });
    expect(mostMissedOperations(patterns.slice(0, 3))).toEqual({
      operations: ['multiplication'],
      incorrectCount: 6,
    });
  });

  it('returns every operation tied for the most misses, in the usual order', () => {
    const tied = [
      makePattern({ id: 'd', operation: 'division', incorrectCount: 4 }),
      makePattern({ id: 'm', operation: 'multiplication', incorrectCount: 4 }),
      makePattern({ id: 'a', operation: 'addition', incorrectCount: 3 }),
    ];
    expect(mostMissedOperations(tied)).toEqual({
      operations: ['multiplication', 'division'],
      incorrectCount: 4,
    });
  });

  it('returns no operation without patterns', () => {
    expect(mostMissedOperations([])).toEqual({ operations: [], incorrectCount: 0 });
    expect(mostMissedFacts([])).toEqual([]);
  });
});
