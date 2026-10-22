import { act, renderHook } from '@testing-library/react';
import { AppProvider } from '../app/AppProvider';
import { createQuestion, isSameQuestion } from '../services/questionGenerator';
import { generateSimilarQuestion } from '../services/similarQuestionGenerator';
import { readData, writeData } from '../services/storageService';
import { seedMathRandom } from '../test/seededRandom';
import type { MistakePattern, Question } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { usePracticeSession } from './usePracticeSession';

vi.mock('../services/similarQuestionGenerator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/similarQuestionGenerator')>();
  return { ...actual, generateSimilarQuestion: vi.fn(actual.generateSimilarQuestion) };
});

function makePattern(overrides: Partial<MistakePattern> = {}): MistakePattern {
  return {
    id: 'times-8-7',
    operation: 'multiplication',
    firstOperand: 8,
    secondOperand: 7,
    correctAnswer: 56,
    difficulty: 2,
    incorrectCount: 1,
    similarCorrectCount: 0,
    lastIncorrectAt: '2026-10-21T10:00:00.000Z',
    mastered: false,
    ...overrides,
  };
}

function reviewQuestion(question: Question, patternId: string): Question {
  return { ...question, source: 'mistake-review', mistakePatternId: patternId };
}

function renderSession() {
  return renderHook(() => usePracticeSession(), { wrapper: AppProvider });
}

type SessionResult = { current: ReturnType<typeof usePracticeSession> };

function startReview(result: SessionResult, length: number | 'continuous' = 5) {
  let started = false;
  act(() => {
    started = result.current.startReviewSession(length);
  });
  return started;
}

function report(result: SessionResult, correct: boolean) {
  act(() => {
    result.current.recordResult({ selectedAnswer: 0, selfReportedCorrect: correct });
  });
}

const patterns = () => readData('mistakePatterns').value;

beforeEach(() => {
  seedMathRandom(7);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('usePracticeSession review mode', () => {
  it('does not start without an active pattern', () => {
    writeData('mistakePatterns', [makePattern({ similarCorrectCount: 3, mastered: true })]);
    const { result } = renderSession();
    expect(startReview(result)).toBe(false);
    expect(result.current.currentSession).toBeNull();
  });

  it('starts with a similar question from the top-priority pattern', () => {
    const minor = makePattern({ id: 'minor', operation: 'addition', correctAnswer: 15 });
    const major = makePattern({ incorrectCount: 4 });
    writeData('mistakePatterns', [minor, major]);
    const { result } = renderSession();
    expect(startReview(result, 10)).toBe(true);
    const { currentQuestion, currentSession, reviewQueue } = result.current;
    expect(reviewQueue).toEqual(['times-8-7', 'minor']);
    expect(currentQuestion).toMatchObject({
      source: 'mistake-review',
      mistakePatternId: 'times-8-7',
      difficulty: 2,
    });
    expect(currentSession).toMatchObject({
      operations: ['addition', 'multiplication'],
      difficulty: 2,
      sessionLength: 10,
    });
  });

  it('updates the source pattern for a wrong review answer and never matches by fact', () => {
    const source = makePattern({ similarCorrectCount: 2 });
    writeData('mistakePatterns', [source]);
    vi.mocked(generateSimilarQuestion).mockReturnValueOnce(
      reviewQuestion(createQuestion('division', 56, 8, 2), 'times-8-7'),
    );
    const { result } = renderSession();
    startReview(result);
    expect(result.current.currentQuestion).toMatchObject({ operation: 'division' });
    report(result, false);
    expect(patterns()).toEqual([
      {
        ...source,
        incorrectCount: 2,
        similarCorrectCount: 0,
        lastIncorrectAt: result.current.attempts[0].attemptedAt,
        mastered: false,
      },
    ]);
  });

  it('counts correct review answers toward mastery, but not correct regular answers', () => {
    writeData('mistakePatterns', [makePattern()]);
    const { result } = renderSession();
    startReview(result);
    report(result, true);
    expect(patterns()[0]).toMatchObject({ similarCorrectCount: 1, mastered: false });

    act(() => {
      result.current.startSession({
        operations: ['multiplication'],
        difficulty: 2,
        sessionLength: 5,
      });
    });
    report(result, true);
    expect(patterns()[0]).toMatchObject({ similarCorrectCount: 1, mastered: false });
  });

  it('masters a pattern at the threshold from Settings and leaves it out of the session', () => {
    writeData('settings', { ...DEFAULT_SETTINGS, masteryThreshold: 2 });
    writeData('mistakePatterns', [
      makePattern({ incorrectCount: 3 }),
      makePattern({ id: 'plus', operation: 'addition', correctAnswer: 15 }),
    ]);
    const { result } = renderSession();
    startReview(result, 'continuous');
    const ids = () => result.current.currentQuestion?.mistakePatternId;
    expect(ids()).toBe('times-8-7');
    report(result, true);
    expect(ids()).toBe('plus');
    report(result, false);
    expect(ids()).toBe('times-8-7');
    report(result, true);
    expect(patterns()[0]).toMatchObject({ similarCorrectCount: 2, mastered: true });
    expect(ids()).toBe('plus');
    report(result, true);
    expect(ids()).toBe('plus');
    report(result, true);
    expect(patterns()[1]).toMatchObject({ similarCorrectCount: 2, mastered: true });
    expect(result.current.isActive).toBe(false);
    expect(result.current.currentSession?.attempted).toBe(5);
  });

  it('mixes patterns in priority order and never repeats a question twice in a row', () => {
    writeData('mistakePatterns', [
      makePattern({ id: 'a', incorrectCount: 3 }),
      makePattern({ id: 'b', operation: 'addition', firstOperand: 6, secondOperand: 5 }),
    ]);
    const { result } = renderSession();
    startReview(result, 20);
    const shown: Question[] = [];
    while (result.current.isActive) {
      shown.push(result.current.currentQuestion!);
      report(result, false);
    }
    expect(shown.map((q) => q.mistakePatternId)).toEqual(
      Array.from({ length: 20 }, (_, i) => (i % 2 === 0 ? 'a' : 'b')),
    );
    for (let i = 1; i < shown.length; i++) {
      expect(isSameQuestion(shown[i], shown[i - 1])).toBe(false);
    }
  });

  it('never shows the same question twice in a row with a single pattern', () => {
    writeData('mistakePatterns', [makePattern({ incorrectCount: 5 })]);
    const { result } = renderSession();
    startReview(result, 20);
    let previous = result.current.currentQuestion!;
    report(result, false);
    while (result.current.isActive) {
      const current = result.current.currentQuestion!;
      expect(isSameQuestion(current, previous)).toBe(false);
      previous = current;
      report(result, false);
    }
    expect(patterns()).toHaveLength(1);
    expect(patterns()[0].incorrectCount).toBe(25);
  });

  it('records review attempts in the statistics and as mistake-review attempts', () => {
    writeData('mistakePatterns', [makePattern()]);
    const { result } = renderSession();
    startReview(result);
    const question = result.current.currentQuestion!;
    report(result, true);
    expect(readData('attempts').value).toEqual([
      expect.objectContaining({ source: 'mistake-review', operation: question.operation }),
    ]);
    const statistics = readData('statistics').value;
    expect(statistics.attempted).toBe(1);
    expect(statistics.byOperation[question.operation].correct).toBe(1);
    expect(statistics.byDifficulty[2].correct).toBe(1);
  });
});
