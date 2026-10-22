import type { DifficultyLevel, MathOperation, MistakePattern } from '../types';
import { DIFFICULTY_LEVELS, OPERATIONS } from '../utils/labels';
import { validateQuestion } from '../utils/validation';
import {
  createFallbackQuestion,
  generateQuestion,
  MAX_GENERATION_ATTEMPTS,
  QuestionGenerationError,
} from './questionGenerator';
import { generateSimilarQuestion } from './similarQuestionGenerator';

vi.mock('../utils/validation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/validation')>()),
  validateQuestion: vi.fn(),
}));

const mockedValidate = vi.mocked(validateQuestion);
const { validateQuestion: realValidate } =
  await vi.importActual<typeof import('../utils/validation')>('../utils/validation');

const COMBINATIONS = OPERATIONS.flatMap((operation) =>
  DIFFICULTY_LEVELS.map((level) => [operation, level] as [MathOperation, DifficultyLevel]),
);

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  mockedValidate.mockReset();
  vi.restoreAllMocks();
});

describe('generateQuestion failure handling', () => {
  it.each(COMBINATIONS)(
    'falls back to a valid %s question at level %i after the retry limit',
    (operation, level) => {
      mockedValidate.mockReturnValue(['forced failure']);
      const question = generateQuestion(operation, level);

      expect(mockedValidate).toHaveBeenCalledTimes(MAX_GENERATION_ATTEMPTS);
      expect(question.operation).toBe(operation);
      expect(question.difficulty).toBe(level);
      expect(question.source).toBe('regular');
      expect(realValidate(question)).toEqual([]);
    },
  );

  it('logs the reason for developers when it falls back', () => {
    mockedValidate.mockReturnValue(['forced failure']);
    generateQuestion('addition', 1);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Could not generate a valid addition question at level 1'),
      ['forced failure'],
    );
  });

  it.each(COMBINATIONS)('the %s fallback at level %i is always valid', (operation, level) => {
    for (let i = 0; i < 50; i++) {
      expect(realValidate(createFallbackQuestion(operation, level))).toEqual([]);
    }
  });

  it('returns the first question that passes after a failed attempt, without logging', () => {
    mockedValidate.mockReturnValueOnce(['forced failure']).mockReturnValue([]);
    const question = generateQuestion('division', 2);
    expect(question.operation).toBe('division');
    expect(mockedValidate).toHaveBeenCalledTimes(2);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('still rejects an unsupported operation or level', () => {
    expect(() => generateQuestion('modulo' as MathOperation, 1)).toThrow(QuestionGenerationError);
    expect(() => generateQuestion('addition', 7 as DifficultyLevel)).toThrow(
      QuestionGenerationError,
    );
  });

  it('gives a review session a valid question when every similar question fails', () => {
    mockedValidate.mockReturnValue(['forced failure']);
    const pattern: MistakePattern = {
      id: 'pattern-1',
      operation: 'multiplication',
      firstOperand: 8,
      secondOperand: 7,
      correctAnswer: 56,
      difficulty: 2,
      incorrectCount: 1,
      similarCorrectCount: 0,
      lastIncorrectAt: '2026-10-21T10:00:00.000Z',
      mastered: false,
    };
    const question = generateSimilarQuestion(pattern);
    expect(realValidate(question)).toEqual([]);
    expect(question).toMatchObject({ source: 'mistake-review', mistakePatternId: 'pattern-1' });
  });
});
