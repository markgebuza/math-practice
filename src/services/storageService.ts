import type {
  AppSettings,
  AppStatistics,
  DifficultyLevel,
  MathOperation,
  MistakePattern,
  OperationStatistics,
  PracticeAttempt,
  PracticeSession,
} from '../types';
import { createEmptyStatistics, DEFAULT_SETTINGS } from '../types';
import { DIFFICULTY_LEVELS, OPERATIONS } from '../utils/labels';

export interface StoredData {
  settings: AppSettings;
  sessions: PracticeSession[];
  attempts: PracticeAttempt[];
  mistakePatterns: MistakePattern[];
  statistics: AppStatistics;
}

export type DataKey = keyof StoredData;

export const STORAGE_KEYS: Record<DataKey | 'version', string> = {
  settings: 'mathPractice.settings',
  sessions: 'mathPractice.sessions',
  attempts: 'mathPractice.attempts',
  mistakePatterns: 'mathPractice.mistakePatterns',
  statistics: 'mathPractice.statistics',
  version: 'mathPractice.version',
};

const DATA_KEYS: DataKey[] = ['settings', 'sessions', 'attempts', 'mistakePatterns', 'statistics'];

export const SCHEMA_VERSION = 1;

// DECISIONS 3.4
export const RECENT_SESSION_LIMIT = 20;

export type Migration = (storage: Storage) => void;

// MIGRATIONS[n] upgrades data stored with schema version n to version n + 1.
export const MIGRATIONS: Record<number, Migration> = {};

type Fields = Record<string, unknown>;

const isRecord = (value: unknown): value is Fields =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 0;
const isWholeNumber = (value: unknown): value is number => Number.isInteger(value);
const isText = (value: unknown): value is string => typeof value === 'string' && value !== '';
const isDate = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));
const isOperation = (value: unknown): value is MathOperation =>
  OPERATIONS.includes(value as MathOperation);
const isDifficulty = (value: unknown): value is DifficultyLevel =>
  DIFFICULTY_LEVELS.includes(value as DifficultyLevel);
const isSessionLength = (value: unknown) => value === 'continuous' || (isCount(value) && value > 0);
const isOperationList = (value: unknown): value is MathOperation[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(isOperation) &&
  new Set(value).size === value.length;

function isAttempt(value: unknown): value is PracticeAttempt {
  return (
    isRecord(value) &&
    isText(value.id) &&
    isText(value.questionId) &&
    isText(value.sessionId) &&
    isOperation(value.operation) &&
    isDifficulty(value.difficulty) &&
    isWholeNumber(value.firstOperand) &&
    isWholeNumber(value.secondOperand) &&
    isWholeNumber(value.correctAnswer) &&
    isWholeNumber(value.selectedAnswer) &&
    typeof value.selfReportedCorrect === 'boolean' &&
    (value.source === 'regular' || value.source === 'mistake-review') &&
    isDate(value.attemptedAt)
  );
}

function isSession(value: unknown): value is PracticeSession {
  return (
    isRecord(value) &&
    isText(value.id) &&
    isDate(value.startedAt) &&
    (value.completedAt === undefined || isDate(value.completedAt)) &&
    isOperationList(value.operations) &&
    isDifficulty(value.difficulty) &&
    isSessionLength(value.sessionLength) &&
    isCount(value.attempted) &&
    isCount(value.correct) &&
    isCount(value.incorrect) &&
    value.correct + value.incorrect === value.attempted
  );
}

function isMistakePattern(value: unknown): value is MistakePattern {
  return (
    isRecord(value) &&
    isText(value.id) &&
    isOperation(value.operation) &&
    isDifficulty(value.difficulty) &&
    isWholeNumber(value.firstOperand) &&
    isWholeNumber(value.secondOperand) &&
    isWholeNumber(value.correctAnswer) &&
    isCount(value.incorrectCount) &&
    isCount(value.similarCorrectCount) &&
    isDate(value.lastIncorrectAt) &&
    typeof value.mastered === 'boolean'
  );
}

function isCounts(value: unknown): value is OperationStatistics {
  return (
    isRecord(value) &&
    isCount(value.attempted) &&
    isCount(value.correct) &&
    isCount(value.incorrect) &&
    value.correct + value.incorrect === value.attempted
  );
}

function isStatistics(value: unknown): value is AppStatistics {
  return (
    isRecord(value) &&
    isCounts(value) &&
    isRecord(value.byOperation) &&
    isRecord(value.byDifficulty) &&
    OPERATIONS.every((op) => isCounts((value.byOperation as Fields)[op])) &&
    DIFFICULTY_LEVELS.every((level) => isCounts((value.byDifficulty as Fields)[level]))
  );
}

const SETTING_CHECKS: { [K in keyof AppSettings]: (value: unknown) => boolean } = {
  soundEffects: (value) => typeof value === 'boolean',
  cardAnimation: (value) => typeof value === 'boolean',
  showExplanations: (value) => typeof value === 'boolean',
  defaultSessionLength: isSessionLength,
  defaultDifficulty: isDifficulty,
  defaultOperations: isOperationList,
  // DECISIONS 2.3
  masteryThreshold: (value) => isCount(value) && value >= 1 && value <= 10,
};

// Invalid fields fall back to their defaults one by one, so one bad value keeps the others.
function parseSettings(value: unknown): AppSettings | null {
  if (!isRecord(value)) {
    return null;
  }
  const settings: Fields = { ...DEFAULT_SETTINGS };
  for (const field of Object.keys(SETTING_CHECKS) as (keyof AppSettings)[]) {
    if (SETTING_CHECKS[field](value[field])) {
      settings[field] = value[field];
    }
  }
  return settings as unknown as AppSettings;
}

// Invalid records are dropped; the rest of the list is kept.
function listOf<T>(isItem: (value: unknown) => value is T) {
  return (value: unknown): T[] | null => (Array.isArray(value) ? value.filter(isItem) : null);
}

const PARSERS: { [K in DataKey]: (value: unknown) => StoredData[K] | null } = {
  settings: parseSettings,
  sessions: listOf(isSession),
  attempts: listOf(isAttempt),
  mistakePatterns: listOf(isMistakePattern),
  statistics: (value) => (isStatistics(value) ? value : null),
};

const DEFAULTS: { [K in DataKey]: () => StoredData[K] } = {
  settings: () => ({
    ...DEFAULT_SETTINGS,
    defaultOperations: [...DEFAULT_SETTINGS.defaultOperations],
  }),
  sessions: () => [],
  attempts: () => [],
  mistakePatterns: () => [],
  statistics: createEmptyStatistics,
};

// Reading window.localStorage itself throws in some browsers when site data is blocked.
function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export type ReadStatus = 'ok' | 'missing' | 'reset' | 'unavailable';

export function readData<K extends DataKey>(key: K): { value: StoredData[K]; status: ReadStatus } {
  const storage = getStorage();
  let raw: string | null;
  try {
    if (!storage) {
      throw new Error('Storage unavailable');
    }
    raw = storage.getItem(STORAGE_KEYS[key]);
  } catch {
    return { value: DEFAULTS[key](), status: 'unavailable' };
  }
  if (raw === null) {
    return { value: DEFAULTS[key](), status: 'missing' };
  }
  let parsed: StoredData[K] | null = null;
  try {
    parsed = PARSERS[key](JSON.parse(raw));
  } catch {
    // Corrupted JSON is handled like any other invalid value below.
  }
  if (parsed === null) {
    // Only this key is reset; the other categories stay as they are.
    removeKeys([STORAGE_KEYS[key]]);
    return { value: DEFAULTS[key](), status: 'reset' };
  }
  return { value: parsed, status: 'ok' };
}

export function writeData<K extends DataKey>(key: K, value: StoredData[K]): boolean {
  try {
    const storage = getStorage();
    if (!storage) {
      return false;
    }
    storage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeKeys(keys: string[]): boolean {
  try {
    const storage = getStorage();
    if (!storage) {
      return false;
    }
    keys.forEach((key) => storage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

export function clearData(keys: DataKey[]): boolean {
  return removeKeys(keys.map((key) => STORAGE_KEYS[key]));
}

// Removes only this app's keys, never anything else stored for the site.
export function clearAllData(): boolean {
  return clearData(DATA_KEYS);
}

export function runMigrations(
  storage: Storage,
  fromVersion: number,
  migrations: Record<number, Migration> = MIGRATIONS,
) {
  for (let version = fromVersion; version < SCHEMA_VERSION; version++) {
    migrations[version]?.(storage);
  }
}

// Returns false when storage cannot be used, so the app can warn that progress won't be saved.
export function initializeStorage(): boolean {
  try {
    const storage = getStorage();
    if (!storage) {
      return false;
    }
    const stored = Number(storage.getItem(STORAGE_KEYS.version));
    if (Number.isInteger(stored) && stored > SCHEMA_VERSION) {
      // Saved by a newer version of the app: leave it untouched.
      return true;
    }
    // A missing or unreadable version is treated as the current one; the parsers still check each key.
    if (Number.isInteger(stored) && stored >= 1 && stored < SCHEMA_VERSION) {
      runMigrations(storage, stored);
    }
    storage.setItem(STORAGE_KEYS.version, String(SCHEMA_VERSION));
    return true;
  } catch {
    return false;
  }
}

export function saveAttempt(attempt: PracticeAttempt): boolean {
  const attempts = readData('attempts').value;
  if (attempts.some((saved) => saved.questionId === attempt.questionId)) {
    return true;
  }
  return writeData('attempts', [...attempts, attempt]);
}

export function saveSession(session: PracticeSession): boolean {
  const sessions = readData('sessions').value.filter((saved) => saved.id !== session.id);
  return writeData('sessions', [...sessions, session]);
}

export function loadRecentSessions(limit = RECENT_SESSION_LIMIT): PracticeSession[] {
  return readData('sessions')
    .value.filter((session) => session.completedAt !== undefined)
    .sort((a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!))
    .slice(0, limit);
}
