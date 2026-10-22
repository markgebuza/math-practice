import type { ActiveSession, AppStatistics, PracticeAttempt, PracticeSession } from '../types';
import { createEmptyStatistics, DEFAULT_SETTINGS } from '../types';
import {
  clearAllData,
  clearData,
  initializeStorage,
  loadActiveSession,
  loadRecentSessions,
  readData,
  runMigrations,
  saveActiveSession,
  saveAttempt,
  saveSession,
  SCHEMA_VERSION,
  STORAGE_KEYS,
  writeData,
  type DataKey,
  type StoredData,
} from './storageService';

function makeAttempt(overrides: Partial<PracticeAttempt> = {}): PracticeAttempt {
  return {
    id: 'attempt-1',
    questionId: 'question-1',
    operation: 'multiplication',
    firstOperand: 8,
    secondOperand: 7,
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

function makeSession(overrides: Partial<PracticeSession> = {}): PracticeSession {
  return {
    id: 'session-1',
    startedAt: '2026-10-21T09:58:00.000Z',
    completedAt: '2026-10-21T10:05:00.000Z',
    operations: ['addition', 'multiplication'],
    difficulty: 2,
    sessionLength: 10,
    attempted: 10,
    correct: 8,
    incorrect: 2,
    ...overrides,
  };
}

// One answered question (8 × 7, missed), now on question 2 with 12 picked and the card flipped.
function makeActiveSession(overrides: Partial<ActiveSession> = {}): ActiveSession {
  return {
    session: makeSession({
      completedAt: undefined,
      attempted: 1,
      correct: 0,
      incorrect: 1,
    }),
    currentQuestion: {
      id: 'question-2',
      operation: 'addition',
      firstOperand: 7,
      secondOperand: 5,
      displayText: '7 + 5',
      correctAnswer: 12,
      choices: [11, 12, 13, 14],
      difficulty: 2,
      source: 'regular',
    },
    currentQuestionIndex: 1,
    selectedAnswer: 12,
    isCardFlipped: true,
    attempts: [makeAttempt()],
    reviewQueue: null,
    ...overrides,
  };
}

const VALID_DATA: StoredData = {
  settings: { ...DEFAULT_SETTINGS, soundEffects: true, defaultDifficulty: 3 },
  sessions: [makeSession()],
  attempts: [makeAttempt()],
  mistakePatterns: [
    {
      id: 'pattern-1',
      operation: 'multiplication',
      firstOperand: 8,
      secondOperand: 7,
      correctAnswer: 56,
      difficulty: 2,
      incorrectCount: 2,
      similarCorrectCount: 1,
      lastIncorrectAt: '2026-10-21T10:00:00.000Z',
      mastered: false,
    },
  ],
  statistics: {
    ...createEmptyStatistics(),
    attempted: 1,
    incorrect: 1,
    byOperation: {
      ...createEmptyStatistics().byOperation,
      multiplication: { attempted: 1, correct: 0, incorrect: 1 },
    },
  },
};

const DATA_KEYS = Object.keys(VALID_DATA) as DataKey[];

function storeAll() {
  for (const key of DATA_KEYS) {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(VALID_DATA[key]));
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('storageService', () => {
  describe('with no stored data', () => {
    it.each(DATA_KEYS)('returns defaults for %s', (key) => {
      const { value, status } = readData(key);
      expect(status).toBe('missing');
      expect(value).toEqual(
        key === 'settings' ? DEFAULT_SETTINGS : key === 'statistics' ? createEmptyStatistics() : [],
      );
    });

    it('has no recent sessions', () => {
      expect(loadRecentSessions()).toEqual([]);
    });
  });

  it.each(DATA_KEYS)('reads back valid %s exactly as written', (key) => {
    expect(writeData(key, VALID_DATA[key])).toBe(true);
    expect(readData(key)).toEqual({ value: VALID_DATA[key], status: 'ok' });
  });

  describe.each(DATA_KEYS)('corrupted %s', (corruptKey) => {
    it.each(['{not json', '"just a string"', 'null', '42'])(
      'resets only that key when it holds %s',
      (raw) => {
        storeAll();
        localStorage.setItem('otherApp.data', 'keep me');
        localStorage.setItem(STORAGE_KEYS[corruptKey], raw);

        const corrupt = readData(corruptKey);
        expect(corrupt.status).toBe('reset');
        expect(localStorage.getItem(STORAGE_KEYS[corruptKey])).toBeNull();

        for (const key of DATA_KEYS.filter((k) => k !== corruptKey)) {
          expect(readData(key)).toEqual({ value: VALID_DATA[key], status: 'ok' });
        }
        expect(localStorage.getItem('otherApp.data')).toBe('keep me');
      },
    );
  });

  it('keeps the valid records of a list and drops broken ones', () => {
    const good = makeAttempt();
    localStorage.setItem(
      STORAGE_KEYS.attempts,
      JSON.stringify([
        good,
        { ...good, id: 'bad-operation', operation: 'modulo' },
        { ...good, id: 'bad-date', attemptedAt: 'yesterday' },
        'not an attempt',
      ]),
    );
    expect(readData('attempts')).toEqual({ value: [good], status: 'ok' });
  });

  it('drops sessions whose totals do not add up', () => {
    localStorage.setItem(
      STORAGE_KEYS.sessions,
      JSON.stringify([makeSession(), makeSession({ id: 'session-2', correct: 9 })]),
    );
    expect(readData('sessions').value.map((s) => s.id)).toEqual(['session-1']);
  });

  it('drops invalid mistake patterns and keeps the valid ones', () => {
    const [good] = VALID_DATA.mistakePatterns;
    localStorage.setItem(
      STORAGE_KEYS.mistakePatterns,
      JSON.stringify([
        good,
        { ...good, id: '' },
        { ...good, id: 'bad-operation', operation: 'modulo' },
        { ...good, id: 'bad-difficulty', difficulty: 5 },
        { ...good, id: 'fraction', firstOperand: 7.5 },
        { ...good, id: 'negative-count', incorrectCount: -1 },
        { ...good, id: 'bad-progress', similarCorrectCount: 'two' },
        { ...good, id: 'bad-date', lastIncorrectAt: 'yesterday' },
        { ...good, id: 'bad-mastered', mastered: 'no' },
        { ...good, id: 'missing-answer', correctAnswer: undefined },
        null,
        [good],
      ]),
    );
    expect(readData('mistakePatterns')).toEqual({ value: [good], status: 'ok' });
  });

  it('resets statistics with a missing operation', () => {
    const byOperation: Partial<AppStatistics['byOperation']> = createEmptyStatistics().byOperation;
    delete byOperation.division;
    localStorage.setItem(
      STORAGE_KEYS.statistics,
      JSON.stringify({ ...createEmptyStatistics(), byOperation }),
    );
    expect(readData('statistics')).toEqual({ value: createEmptyStatistics(), status: 'reset' });
  });

  it('accepts totals without review counts but resets invalid review counts', () => {
    const withoutReview: Partial<AppStatistics> = createEmptyStatistics();
    delete withoutReview.mistakeReview;
    localStorage.setItem(STORAGE_KEYS.statistics, JSON.stringify(withoutReview));
    expect(readData('statistics')).toEqual({ value: withoutReview, status: 'ok' });

    localStorage.setItem(
      STORAGE_KEYS.statistics,
      JSON.stringify({
        ...createEmptyStatistics(),
        mistakeReview: { attempted: 2, correct: 2, incorrect: 1 },
      }),
    );
    expect(readData('statistics')).toEqual({ value: createEmptyStatistics(), status: 'reset' });
  });

  it('recovers invalid settings field by field', () => {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({
        soundEffects: true,
        cardAnimation: 'yes',
        defaultDifficulty: 7,
        defaultOperations: ['division', 'division'],
        defaultSessionLength: 'continuous',
        masteryThreshold: 11,
      }),
    );
    expect(readData('settings')).toEqual({
      value: { ...DEFAULT_SETTINGS, soundEffects: true, defaultSessionLength: 'continuous' },
      status: 'ok',
    });
  });

  it('loads settings saved before feedback messages existed with messages on', () => {
    const { feedbackMessages, ...oldSettings } = { ...DEFAULT_SETTINGS, soundEffects: true };
    expect(feedbackMessages).toBe(true);
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(oldSettings));
    expect(readData('settings')).toEqual({
      value: { ...DEFAULT_SETTINGS, soundEffects: true, feedbackMessages: true },
      status: 'ok',
    });

    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ ...oldSettings, feedbackMessages: 'off' }),
    );
    expect(readData('settings').value.feedbackMessages).toBe(true);

    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ ...oldSettings, feedbackMessages: false }),
    );
    expect(readData('settings').value.feedbackMessages).toBe(false);
  });

  describe('when storage fails', () => {
    it('reports a failed write instead of throwing when storage is full', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });
      expect(writeData('attempts', [makeAttempt()])).toBe(false);
      expect(saveAttempt(makeAttempt())).toBe(false);
      expect(saveSession(makeSession())).toBe(false);
      expect(initializeStorage()).toBe(false);
    });

    it('falls back to defaults when reading throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Access denied');
      });
      expect(readData('settings')).toEqual({ value: DEFAULT_SETTINGS, status: 'unavailable' });
      expect(loadRecentSessions()).toEqual([]);
    });

    it('handles localStorage being blocked entirely', () => {
      vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError');
      });
      expect(initializeStorage()).toBe(false);
      expect(readData('attempts').status).toBe('unavailable');
      expect(writeData('attempts', [])).toBe(false);
      expect(clearAllData()).toBe(false);
    });
  });

  describe('schema version', () => {
    it('stores the current version when none is stored', () => {
      expect(initializeStorage()).toBe(true);
      expect(localStorage.getItem(STORAGE_KEYS.version)).toBe(String(SCHEMA_VERSION));
    });

    it('keeps existing data when the version is missing', () => {
      storeAll();
      initializeStorage();
      for (const key of DATA_KEYS) {
        expect(readData(key).value).toEqual(VALID_DATA[key]);
      }
    });

    it('leaves data from a newer app version untouched', () => {
      storeAll();
      localStorage.setItem(STORAGE_KEYS.version, String(SCHEMA_VERSION + 1));
      expect(initializeStorage()).toBe(true);
      expect(localStorage.getItem(STORAGE_KEYS.version)).toBe(String(SCHEMA_VERSION + 1));
      expect(readData('attempts').value).toEqual(VALID_DATA.attempts);
    });

    it('runs each migration from the stored version up to the current one', () => {
      const ran: number[] = [];
      const migrations = Object.fromEntries(
        Array.from({ length: SCHEMA_VERSION + 1 }, (_, version) => [
          version,
          () => ran.push(version),
        ]),
      );
      runMigrations(localStorage, 0, migrations);
      expect(ran).toEqual(Array.from({ length: SCHEMA_VERSION }, (_, version) => version));
    });
  });

  describe('clearing', () => {
    it('clears only the chosen keys', () => {
      storeAll();
      clearData(['attempts', 'sessions', 'statistics']);
      expect(readData('attempts').status).toBe('missing');
      expect(readData('sessions').status).toBe('missing');
      expect(readData('statistics').status).toBe('missing');
      expect(readData('settings').value).toEqual(VALID_DATA.settings);
      expect(readData('mistakePatterns').value).toEqual(VALID_DATA.mistakePatterns);
    });

    it('clears all app data but nothing that belongs to another app', () => {
      storeAll();
      localStorage.setItem('otherApp.data', 'keep me');
      saveActiveSession(makeActiveSession());
      expect(clearAllData()).toBe(true);
      for (const key of DATA_KEYS) {
        expect(localStorage.getItem(STORAGE_KEYS[key])).toBeNull();
      }
      expect(localStorage.getItem(STORAGE_KEYS.activeSession)).toBeNull();
      expect(localStorage.getItem('otherApp.data')).toBe('keep me');
    });
  });

  describe('attempts and sessions', () => {
    it('appends attempts and never saves the same question twice', () => {
      expect(saveAttempt(makeAttempt())).toBe(true);
      expect(saveAttempt(makeAttempt({ id: 'attempt-2' }))).toBe(true);
      expect(saveAttempt(makeAttempt({ id: 'attempt-3', questionId: 'question-2' }))).toBe(true);
      expect(readData('attempts').value.map((a) => a.id)).toEqual(['attempt-1', 'attempt-3']);
    });

    it('updates a saved session in place', () => {
      saveSession(makeSession({ completedAt: undefined, attempted: 1, correct: 1, incorrect: 0 }));
      saveSession(makeSession({ id: 'session-2' }));
      saveSession(makeSession());
      const sessions = readData('sessions').value;
      expect(sessions).toHaveLength(2);
      expect(sessions.find((s) => s.id === 'session-1')).toEqual(makeSession());
    });

    it('loads the most recent completed sessions, newest first', () => {
      for (let n = 1; n <= 25; n++) {
        saveSession(
          makeSession({
            id: `session-${n}`,
            completedAt: new Date(Date.UTC(2026, 9, n)).toISOString(),
          }),
        );
      }
      saveSession(makeSession({ id: 'unfinished', completedAt: undefined }));
      const recent = loadRecentSessions();
      expect(recent).toHaveLength(20);
      expect(recent[0].id).toBe('session-25');
      expect(recent.at(-1)!.id).toBe('session-6');
      expect(loadRecentSessions(3).map((s) => s.id)).toEqual([
        'session-25',
        'session-24',
        'session-23',
      ]);
    });
  });

  describe('active session', () => {
    const storedActive = () => localStorage.getItem(STORAGE_KEYS.activeSession);

    it('saves and loads an unfinished session', () => {
      expect(saveActiveSession(makeActiveSession())).toBe(true);
      expect(loadActiveSession()).toEqual(makeActiveSession());
    });

    it('removes the saved session when given null', () => {
      saveActiveSession(makeActiveSession());
      expect(saveActiveSession(null)).toBe(true);
      expect(storedActive()).toBeNull();
      expect(loadActiveSession()).toBeNull();
    });

    it.each<[string, () => string | Partial<ActiveSession>]>([
      ['broken JSON', () => '{"session":'],
      [
        'a finished session',
        () => ({
          session: { ...makeActiveSession().session, completedAt: '2026-10-21T10:05:00.000Z' },
        }),
      ],
      ['totals that do not match the answers', () => ({ attempts: [] })],
      ['a wrong question index', () => ({ currentQuestionIndex: 3 })],
      ['an answer that is not a choice', () => ({ selectedAnswer: 99 })],
      ['a flipped card with no answer', () => ({ selectedAnswer: null })],
      [
        'an invalid question',
        () => ({ currentQuestion: { ...makeActiveSession().currentQuestion, correctAnswer: 13 } }),
      ],
      [
        'a review question without a review queue',
        () => ({
          currentQuestion: { ...makeActiveSession().currentQuestion, source: 'mistake-review' },
        }),
      ],
      [
        'an answer from another session',
        () => ({ attempts: [makeAttempt({ sessionId: 'other' })] }),
      ],
    ])('drops only the saved session when it has %s', (_, change) => {
      storeAll();
      const changed = change();
      localStorage.setItem(
        STORAGE_KEYS.activeSession,
        typeof changed === 'string' ? changed : JSON.stringify(makeActiveSession(changed)),
      );
      expect(loadActiveSession()).toBeNull();
      expect(storedActive()).toBeNull();
      for (const key of DATA_KEYS) {
        expect(readData(key).value).toEqual(VALID_DATA[key]);
      }
    });

    it('drops a session whose current question was already answered and saved', () => {
      saveActiveSession(makeActiveSession());
      saveAttempt(makeAttempt({ id: 'attempt-2', questionId: 'question-2' }));
      expect(loadActiveSession()).toBeNull();
      expect(storedActive()).toBeNull();
    });

    it('removes the old copy when saving fails, so it is never restored', () => {
      saveActiveSession(makeActiveSession());
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Full', 'QuotaExceededError');
      });
      expect(saveActiveSession(makeActiveSession({ selectedAnswer: 11 }))).toBe(false);
      vi.restoreAllMocks();
      expect(storedActive()).toBeNull();
    });
  });
});
