import { useContext } from 'react';
import { isConfigReady, type PracticeConfig } from '../app/practiceConfig';
import { PracticeSessionContext } from '../app/practiceSession';
import type { QuestionCardResult } from '../components/practice/QuestionCard';
import { generateNextQuestion } from '../services/questionGenerator';
import type { PracticeAttempt } from '../types';
import { createId } from '../utils/ids';

// Questions are generated here, in event handlers, so the reducer stays pure and render never generates.
export function usePracticeSession() {
  const value = useContext(PracticeSessionContext);
  if (!value) {
    throw new Error('usePracticeSession must be used inside AppProvider');
  }
  const { state, dispatch } = value;

  function startSession(config: PracticeConfig) {
    if (!isConfigReady(config) || config.difficulty === null) {
      return false;
    }
    dispatch({
      type: 'startSession',
      session: {
        id: createId(),
        startedAt: new Date().toISOString(),
        operations: [...config.operations],
        difficulty: config.difficulty,
        sessionLength: config.sessionLength,
        attempted: 0,
        correct: 0,
        incorrect: 0,
      },
      firstQuestion: generateNextQuestion(config.operations, config.difficulty, null),
    });
    return true;
  }

  function recordResult({ selectedAnswer, selfReportedCorrect }: QuestionCardResult) {
    const { currentSession: session, currentQuestion: question, isActive } = state;
    if (!isActive || !session || !question) {
      return;
    }
    const attempt: PracticeAttempt = {
      id: createId(),
      questionId: question.id,
      operation: question.operation,
      firstOperand: question.firstOperand,
      secondOperand: question.secondOperand,
      correctAnswer: question.correctAnswer,
      selectedAnswer,
      selfReportedCorrect,
      difficulty: question.difficulty,
      source: question.source,
      attemptedAt: new Date().toISOString(),
      sessionId: session.id,
    };
    const isLast =
      session.sessionLength !== 'continuous' && session.attempted + 1 >= session.sessionLength;
    const nextQuestion = isLast
      ? null
      : generateNextQuestion(session.operations, session.difficulty, question);
    dispatch({ type: 'recordAttempt', attempt, nextQuestion });
  }

  function endSession() {
    dispatch({ type: 'endSession', completedAt: new Date().toISOString() });
  }

  return { ...state, startSession, recordResult, endSession };
}
