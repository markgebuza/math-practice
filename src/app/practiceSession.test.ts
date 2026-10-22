import type { PracticeAttempt, PracticeSession, Question, SessionLength } from '../types';
import {
  fromActiveSession,
  INITIAL_SESSION_STATE,
  practiceSessionReducer,
  toActiveSession,
  type PracticeSessionState,
} from './practiceSession';

function makeQuestion(id: string, firstOperand = 2): Question {
  return {
    id,
    operation: 'addition',
    firstOperand,
    secondOperand: 3,
    displayText: `${firstOperand} + 3`,
    correctAnswer: firstOperand + 3,
    choices: [firstOperand + 3, 1, 2, 3],
    difficulty: 1,
    source: 'regular',
  };
}

function makeSession(sessionLength: SessionLength): PracticeSession {
  return {
    id: 'session-1',
    startedAt: '2026-10-21T10:00:00.000Z',
    operations: ['addition'],
    difficulty: 1,
    sessionLength,
    attempted: 0,
    correct: 0,
    incorrect: 0,
  };
}

function makeAttempt(question: Question, selfReportedCorrect: boolean): PracticeAttempt {
  return {
    id: `attempt-${question.id}`,
    questionId: question.id,
    operation: question.operation,
    firstOperand: question.firstOperand,
    secondOperand: question.secondOperand,
    correctAnswer: question.correctAnswer,
    selectedAnswer: question.correctAnswer,
    selfReportedCorrect,
    difficulty: question.difficulty,
    source: question.source,
    attemptedAt: '2026-10-21T10:01:00.000Z',
    sessionId: 'session-1',
  };
}

function start(sessionLength: SessionLength): PracticeSessionState {
  return practiceSessionReducer(INITIAL_SESSION_STATE, {
    type: 'startSession',
    session: makeSession(sessionLength),
    firstQuestion: makeQuestion('q1'),
  });
}

function answer(state: PracticeSessionState, correct: boolean, nextId: string) {
  return practiceSessionReducer(state, {
    type: 'recordAttempt',
    attempt: makeAttempt(state.currentQuestion!, correct),
    nextQuestion: makeQuestion(nextId, Number(nextId.slice(1))),
  });
}

describe('practiceSessionReducer', () => {
  it('has no session until one is started', () => {
    expect(INITIAL_SESSION_STATE.currentSession).toBeNull();
    expect(INITIAL_SESSION_STATE.isActive).toBe(false);
  });

  it('starts a session with its id, choices, first question and zero totals', () => {
    const state = start(5);
    expect(state.isActive).toBe(true);
    expect(state.currentSession).toMatchObject({
      id: 'session-1',
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      attempted: 0,
      correct: 0,
      incorrect: 0,
    });
    expect(state.currentQuestion?.id).toBe('q1');
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.attempts).toEqual([]);
  });

  it('records a result, updates the totals and moves to the next question', () => {
    let state = answer(start(5), true, 'q2');
    state = answer(state, false, 'q3');
    expect(state.currentSession).toMatchObject({ attempted: 2, correct: 1, incorrect: 1 });
    expect(state.attempts.map((a) => a.questionId)).toEqual(['q1', 'q2']);
    expect(state.currentQuestion?.id).toBe('q3');
    expect(state.currentQuestionIndex).toBe(2);
  });

  it('counts each attempt exactly once', () => {
    const started = start(5);
    const duplicate = {
      type: 'recordAttempt' as const,
      attempt: makeAttempt(started.currentQuestion!, true),
      nextQuestion: makeQuestion('q2'),
    };
    const once = practiceSessionReducer(started, duplicate);
    const twice = practiceSessionReducer(once, duplicate);
    expect(twice).toBe(once);
    expect(twice.attempts).toHaveLength(1);
    expect(twice.currentSession?.attempted).toBe(1);
  });

  it('ignores attempts for another session or when no session is active', () => {
    const started = start(5);
    const attempt = { ...makeAttempt(started.currentQuestion!, true), sessionId: 'other' };
    expect(
      practiceSessionReducer(started, { type: 'recordAttempt', attempt, nextQuestion: null }),
    ).toBe(started);
    expect(
      practiceSessionReducer(INITIAL_SESSION_STATE, {
        type: 'recordAttempt',
        attempt: makeAttempt(makeQuestion('q1'), true),
        nextQuestion: null,
      }),
    ).toBe(INITIAL_SESSION_STATE);
  });

  it('finishes a fixed-length session after the last attempt', () => {
    let state = start(2);
    state = answer(state, true, 'q2');
    state = answer(state, true, 'q3');
    expect(state.isActive).toBe(false);
    expect(state.currentQuestion).toBeNull();
    expect(state.currentSession).toMatchObject({ attempted: 2, correct: 2 });
    expect(state.currentSession?.completedAt).toBe('2026-10-21T10:01:00.000Z');
    expect(answer({ ...state, currentQuestion: makeQuestion('q3') }, true, 'q4')).toMatchObject({
      attempts: state.attempts,
    });
  });

  it('keeps a continuous session going without an endpoint', () => {
    let state = start('continuous');
    for (let i = 2; i <= 30; i++) {
      state = answer(state, i % 2 === 0, `q${i}`);
    }
    expect(state.isActive).toBe(true);
    expect(state.currentSession?.attempted).toBe(29);
    expect(state.currentQuestion?.id).toBe('q30');
  });

  it('ends a session on request and records when it ended', () => {
    const ended = practiceSessionReducer(answer(start('continuous'), true, 'q2'), {
      type: 'endSession',
      completedAt: '2026-10-21T10:05:00.000Z',
    });
    expect(ended.isActive).toBe(false);
    expect(ended.currentQuestion).toBeNull();
    expect(ended.currentSession).toMatchObject({
      attempted: 1,
      completedAt: '2026-10-21T10:05:00.000Z',
    });
    expect(practiceSessionReducer(ended, { type: 'endSession', completedAt: 'later' })).toBe(ended);
  });

  it('does not mutate the previous state', () => {
    const started = start(5);
    const snapshot = structuredClone(started);
    answer(started, true, 'q2');
    expect(started).toEqual(snapshot);
  });
});

describe('practiceSessionReducer card state', () => {
  const select = (state: PracticeSessionState, answer: number) =>
    practiceSessionReducer(state, { type: 'selectAnswer', answer });
  const flip = (state: PracticeSessionState) => practiceSessionReducer(state, { type: 'flipCard' });

  it('keeps the selected answer and flip state, and clears them for the next question', () => {
    const selected = select(start(5), 1);
    expect(selected.selectedAnswer).toBe(1);
    expect(selected.isCardFlipped).toBe(false);
    const flipped = flip(selected);
    expect(flipped.isCardFlipped).toBe(true);
    const next = answer(flipped, true, 'q4');
    expect(next.selectedAnswer).toBeNull();
    expect(next.isCardFlipped).toBe(false);
  });

  it('only flips a card with a selected answer', () => {
    const state = start(5);
    expect(flip(state)).toBe(state);
  });

  it('does not change the answer after flipping or accept an answer that is not a choice', () => {
    const flipped = flip(select(start(5), 1));
    expect(select(flipped, 2)).toBe(flipped);
    const state = start(5);
    expect(select(state, 99)).toBe(state);
  });

  it('turns an active session into saved data and back', () => {
    const state = flip(select(answer(start(5), false, 'q4'), 7));
    const saved = toActiveSession(state);
    expect(saved).toMatchObject({
      currentQuestionIndex: 1,
      selectedAnswer: 7,
      isCardFlipped: true,
    });
    expect(fromActiveSession(structuredClone(saved))).toEqual(state);
  });

  it('saves nothing for a finished or missing session', () => {
    expect(toActiveSession(INITIAL_SESSION_STATE)).toBeNull();
    const ended = practiceSessionReducer(start('continuous'), {
      type: 'endSession',
      completedAt: '2026-10-21T10:02:00.000Z',
    });
    expect(toActiveSession(ended)).toBeNull();
    expect(fromActiveSession(null)).toBe(INITIAL_SESSION_STATE);
  });
});
