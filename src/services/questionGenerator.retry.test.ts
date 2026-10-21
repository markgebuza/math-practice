import { validateQuestion } from '../utils/validation';
import {
  generateQuestion,
  MAX_GENERATION_ATTEMPTS,
  QuestionGenerationError,
} from './questionGenerator';

vi.mock('../utils/validation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/validation')>()),
  validateQuestion: vi.fn(),
}));

const mockedValidate = vi.mocked(validateQuestion);

afterEach(() => {
  mockedValidate.mockReset();
});

describe('generateQuestion failure handling', () => {
  it('retries a limited number of times, then throws with the reason', () => {
    mockedValidate.mockReturnValue(['forced failure']);
    expect(() => generateQuestion('addition', 1)).toThrow(
      new QuestionGenerationError(
        'Could not generate a valid addition question at level 1: forced failure',
      ),
    );
    expect(mockedValidate).toHaveBeenCalledTimes(MAX_GENERATION_ATTEMPTS);
  });

  it('returns the first question that passes after a failed attempt', () => {
    mockedValidate.mockReturnValueOnce(['forced failure']).mockReturnValue([]);
    const question = generateQuestion('division', 2);
    expect(question.operation).toBe('division');
    expect(mockedValidate).toHaveBeenCalledTimes(2);
  });
});
