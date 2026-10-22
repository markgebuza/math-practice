import { act, renderHook } from '@testing-library/react';
import { AppProvider } from '../app/AppProvider';
import { generateNextQuestion } from '../services/questionGenerator';
import { readData, writeData } from '../services/storageService';
import type { MistakePattern, Question } from '../types';
import { usePracticeSession } from './usePracticeSession';

vi.mock('../services/questionGenerator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/questionGenerator')>();
  return { ...actual, generateNextQuestion: vi.fn(actual.generateNextQuestion) };
});

function renderSession() {
  return renderHook(() => usePracticeSession(), { wrapper: AppProvider });
}

describe('usePracticeSession', () => {
  it.each([
    { operations: [], difficulty: 2 as const, sessionLength: 5 },
    { operations: ['addition' as const], difficulty: null, sessionLength: 5 },
  ])('does not start a session from an incomplete configuration', (config) => {
    const { result } = renderSession();
    let started = true;
    act(() => {
      started = result.current.startSession(config);
    });
    expect(started).toBe(false);
    expect(result.current.currentSession).toBeNull();
  });

  it('starts a session from the setup configuration with a matching first question', () => {
    const { result } = renderSession();
    act(() => {
      result.current.startSession({
        operations: ['multiplication', 'division'],
        difficulty: 3,
        sessionLength: 20,
      });
    });
    const { currentSession, currentQuestion, isActive } = result.current;
    expect(isActive).toBe(true);
    expect(currentSession).toMatchObject({
      operations: ['multiplication', 'division'],
      difficulty: 3,
      sessionLength: 20,
      attempted: 0,
    });
    expect(currentSession?.id).toEqual(expect.any(String));
    expect(['multiplication', 'division']).toContain(currentQuestion?.operation);
    expect(currentQuestion?.difficulty).toBe(3);
  });

  it('stores a complete attempt for the shown question', () => {
    const { result } = renderSession();
    act(() => {
      result.current.startSession({ operations: ['addition'], difficulty: 1, sessionLength: 5 });
    });
    const question = result.current.currentQuestion!;
    act(() => {
      result.current.recordResult({
        selectedAnswer: question.choices[0],
        selfReportedCorrect: false,
      });
    });
    expect(result.current.attempts).toEqual([
      expect.objectContaining({
        questionId: question.id,
        operation: 'addition',
        firstOperand: question.firstOperand,
        secondOperand: question.secondOperand,
        correctAnswer: question.correctAnswer,
        selectedAnswer: question.choices[0],
        selfReportedCorrect: false,
        difficulty: 1,
        source: 'regular',
        sessionId: result.current.currentSession!.id,
      }),
    ]);
    expect(result.current.currentSession).toMatchObject({ attempted: 1, correct: 0, incorrect: 1 });
    expect(result.current.currentQuestion?.id).not.toBe(question.id);
  });

  describe('mistake patterns', () => {
    function factQuestion(firstOperand: number, secondOperand: number): Question {
      return {
        id: `question-${firstOperand}-${secondOperand}`,
        operation: 'multiplication',
        firstOperand,
        secondOperand,
        displayText: `${firstOperand} × ${secondOperand}`,
        correctAnswer: 56,
        choices: [54, 56, 63, 48],
        difficulty: 2,
        source: 'regular',
      };
    }

    function startWith(...questions: Question[]) {
      for (const question of questions) {
        vi.mocked(generateNextQuestion).mockReturnValueOnce(question);
      }
      const view = renderSession();
      act(() => {
        view.result.current.startSession({
          operations: ['multiplication'],
          difficulty: 2,
          sessionLength: 5,
        });
      });
      return view;
    }

    function report(result: { current: ReturnType<typeof usePracticeSession> }, correct: boolean) {
      act(() => {
        result.current.recordResult({ selectedAnswer: 54, selfReportedCorrect: correct });
      });
    }

    it('saves a pattern as soon as I Got It Wrong is reported', () => {
      const { result } = startWith(factQuestion(7, 8), factQuestion(3, 4));
      report(result, false);
      expect(readData('mistakePatterns').value).toEqual([
        expect.objectContaining({
          operation: 'multiplication',
          firstOperand: 7,
          secondOperand: 8,
          correctAnswer: 56,
          difficulty: 2,
          incorrectCount: 1,
          similarCorrectCount: 0,
          lastIncorrectAt: result.current.attempts[0].attemptedAt,
          mastered: false,
        }),
      ]);
      expect(result.current.isActive).toBe(true);
    });

    it('updates the same pattern for a repeated mistake, including a swapped fact', () => {
      const { result } = startWith(factQuestion(7, 8), factQuestion(8, 7), factQuestion(3, 4));
      report(result, false);
      report(result, false);
      const patterns = readData('mistakePatterns').value;
      expect(patterns).toHaveLength(1);
      expect(patterns[0]).toMatchObject({ firstOperand: 7, secondOperand: 8, incorrectCount: 2 });
    });

    it('creates nothing for I Got It Right', () => {
      const { result } = startWith(factQuestion(7, 8), factQuestion(3, 4));
      report(result, true);
      expect(readData('mistakePatterns').value).toEqual([]);
    });

    it('builds on the patterns saved before the app started', () => {
      const saved: MistakePattern = {
        id: 'saved',
        operation: 'multiplication',
        firstOperand: 8,
        secondOperand: 7,
        correctAnswer: 56,
        difficulty: 1,
        incorrectCount: 3,
        similarCorrectCount: 3,
        lastIncorrectAt: '2026-10-20T10:00:00.000Z',
        mastered: true,
      };
      writeData('mistakePatterns', [saved]);
      const { result } = startWith(factQuestion(7, 8), factQuestion(3, 4));
      report(result, false);
      expect(readData('mistakePatterns').value).toEqual([
        {
          ...saved,
          difficulty: 2,
          incorrectCount: 4,
          similarCorrectCount: 0,
          lastIncorrectAt: result.current.attempts[0].attemptedAt,
          mastered: false,
        },
      ]);
    });
  });

  it('stops generating questions once a fixed-length session is complete', () => {
    const { result } = renderSession();
    act(() => {
      result.current.startSession({ operations: ['addition'], difficulty: 1, sessionLength: 2 });
    });
    vi.mocked(generateNextQuestion).mockClear();
    for (let i = 0; i < 2; i++) {
      act(() => {
        result.current.recordResult({
          selectedAnswer: result.current.currentQuestion!.choices[0],
          selfReportedCorrect: true,
        });
      });
    }
    expect(generateNextQuestion).toHaveBeenCalledTimes(1);
    expect(result.current.isActive).toBe(false);
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.currentSession).toMatchObject({
      attempted: 2,
      completedAt: expect.any(String),
    });
  });
});
