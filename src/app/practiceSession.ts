import { createContext, type Dispatch } from 'react';
import type { ActiveSession, PracticeAttempt, PracticeSession, Question } from '../types';

export interface PracticeSessionState {
  currentSession: PracticeSession | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  isCardFlipped: boolean;
  attempts: PracticeAttempt[];
  isActive: boolean;
  // Pattern ids in priority order for a mistake-review session; null for regular practice.
  reviewQueue: string[] | null;
}

export type PracticeSessionAction =
  | {
      type: 'startSession';
      session: PracticeSession;
      firstQuestion: Question;
      reviewQueue?: string[];
    }
  | { type: 'selectAnswer'; answer: number }
  | { type: 'flipCard' }
  | { type: 'recordAttempt'; attempt: PracticeAttempt; nextQuestion: Question | null }
  | { type: 'endSession'; completedAt: string }
  | { type: 'reset' };

export const INITIAL_SESSION_STATE: PracticeSessionState = {
  currentSession: null,
  currentQuestion: null,
  currentQuestionIndex: 0,
  selectedAnswer: null,
  isCardFlipped: false,
  attempts: [],
  isActive: false,
  reviewQueue: null,
};

export function practiceSessionReducer(
  state: PracticeSessionState,
  action: PracticeSessionAction,
): PracticeSessionState {
  switch (action.type) {
    case 'startSession':
      return {
        currentSession: action.session,
        currentQuestion: action.firstQuestion,
        currentQuestionIndex: 0,
        selectedAnswer: null,
        isCardFlipped: false,
        attempts: [],
        isActive: true,
        reviewQueue: action.reviewQueue ?? null,
      };
    // The answer can't change after the card is flipped, and only a selected answer can be flipped.
    case 'selectAnswer':
      if (
        !state.isActive ||
        state.isCardFlipped ||
        !state.currentQuestion?.choices.includes(action.answer) ||
        state.selectedAnswer === action.answer
      ) {
        return state;
      }
      return { ...state, selectedAnswer: action.answer };
    case 'flipCard':
      if (!state.isActive || state.isCardFlipped || state.selectedAnswer === null) {
        return state;
      }
      return { ...state, isCardFlipped: true };
    case 'recordAttempt': {
      const { attempt, nextQuestion } = action;
      const session = state.currentSession;
      if (
        !state.isActive ||
        !session ||
        attempt.sessionId !== session.id ||
        attempt.questionId !== state.currentQuestion?.id ||
        state.attempts.some((a) => a.questionId === attempt.questionId)
      ) {
        return state;
      }
      const attempted = session.attempted + 1;
      const finished =
        nextQuestion === null ||
        (session.sessionLength !== 'continuous' && attempted >= session.sessionLength);
      return {
        ...state,
        currentSession: {
          ...session,
          attempted,
          correct: session.correct + (attempt.selfReportedCorrect ? 1 : 0),
          incorrect: session.incorrect + (attempt.selfReportedCorrect ? 0 : 1),
          completedAt: finished ? attempt.attemptedAt : undefined,
        },
        currentQuestion: finished ? null : nextQuestion,
        currentQuestionIndex: finished
          ? state.currentQuestionIndex
          : state.currentQuestionIndex + 1,
        selectedAnswer: null,
        isCardFlipped: false,
        attempts: [...state.attempts, attempt],
        isActive: !finished,
      };
    }
    case 'endSession':
      if (!state.isActive || !state.currentSession) {
        return state;
      }
      return {
        ...state,
        currentSession: { ...state.currentSession, completedAt: action.completedAt },
        currentQuestion: null,
        isActive: false,
      };
    case 'reset':
      return INITIAL_SESSION_STATE;
  }
}

export function toActiveSession(state: PracticeSessionState): ActiveSession | null {
  const { currentSession, currentQuestion, isActive } = state;
  if (!isActive || !currentSession || !currentQuestion) {
    return null;
  }
  return {
    session: currentSession,
    currentQuestion,
    currentQuestionIndex: state.currentQuestionIndex,
    selectedAnswer: state.selectedAnswer,
    isCardFlipped: state.isCardFlipped,
    attempts: state.attempts,
    reviewQueue: state.reviewQueue,
  };
}

export function fromActiveSession(active: ActiveSession | null): PracticeSessionState {
  if (!active) {
    return INITIAL_SESSION_STATE;
  }
  return {
    currentSession: active.session,
    currentQuestion: active.currentQuestion,
    currentQuestionIndex: active.currentQuestionIndex,
    selectedAnswer: active.selectedAnswer,
    isCardFlipped: active.isCardFlipped,
    attempts: active.attempts,
    isActive: true,
    reviewQueue: active.reviewQueue,
  };
}

interface PracticeSessionContextValue {
  state: PracticeSessionState;
  dispatch: Dispatch<PracticeSessionAction>;
}

export const PracticeSessionContext = createContext<PracticeSessionContextValue | null>(null);
