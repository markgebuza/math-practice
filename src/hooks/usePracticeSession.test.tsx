import { act, renderHook } from '@testing-library/react';
import { AppProvider } from '../app/AppProvider';
import { usePracticeSession } from './usePracticeSession';

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
});
