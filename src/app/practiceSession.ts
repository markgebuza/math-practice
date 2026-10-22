import { createContext, type Dispatch } from 'react';
import type { PracticeAttempt, PracticeSession, Question } from '../types';

export interface PracticeSessionState {
  currentSession: PracticeSession | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  attempts: PracticeAttempt[];
  isActive: boolean;
}

export type PracticeSessionAction =
  | { type: 'startSession'; session: PracticeSession; firstQuestion: Question }
  | { type: 'recordAttempt'; attempt: PracticeAttempt; nextQuestion: Question | null }
  | { type: 'endSession'; completedAt: string }
  | { type: 'reset' };

export const INITIAL_SESSION_STATE: PracticeSessionState = {
  currentSession: null,
  currentQuestion: null,
  currentQuestionIndex: 0,
  attempts: [],
  isActive: false,
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
        attempts: [],
        isActive: true,
      };
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

interface PracticeSessionContextValue {
  state: PracticeSessionState;
  dispatch: Dispatch<PracticeSessionAction>;
}

export const PracticeSessionContext = createContext<PracticeSessionContextValue | null>(null);
