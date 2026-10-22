import type { MistakePattern, PracticeAttempt } from '../types';
import { addMistake, loadMistakePatterns, recordMistake } from './mistakeService';
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
