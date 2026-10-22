import { useContext } from 'react';
import { isConfigReady, type PracticeConfig } from '../app/practiceConfig';
import { PracticeSessionContext, practiceSessionReducer } from '../app/practiceSession';
import { useStorage } from '../app/storageContext';
import type { QuestionCardResult } from '../components/practice/QuestionCard';
import {
  activePatterns,
  applyReviewAnswer,
  loadMistakePatterns,
  nextReviewPattern,
  rankPatterns,
  recordMistake,
  saveMistakePatterns,
} from '../services/mistakeService';
import { generateNextQuestion } from '../services/questionGenerator';
import { generateSimilarQuestion } from '../services/similarQuestionGenerator';
import { playSound } from '../services/soundService';
import { recordAttempt } from '../services/statisticsService';
import { saveSession } from '../services/storageService';
import type {
  DifficultyLevel,
  MistakePattern,
  PracticeAttempt,
  Question,
  SessionLength,
} from '../types';
import { createId } from '../utils/ids';
import { OPERATIONS } from '../utils/labels';

// Seconds; lets the answer sound finish before the session-complete tune.
const COMPLETE_SOUND_DELAY = 0.35;

// DECISIONS 2.4: never the same review question twice in a row.
function nextReviewQuestion(queue: string[], patterns: MistakePattern[], previous: Question) {
  const pattern = nextReviewPattern(queue, patterns, previous.mistakePatternId ?? null);
  return pattern ? generateSimilarQuestion(pattern, previous) : null;
}

// Questions are generated here, in event handlers, so the reducer stays pure and render never generates.
export function usePracticeSession() {
  const value = useContext(PracticeSessionContext);
  if (!value) {
    throw new Error('usePracticeSession must be used inside AppProvider');
  }
  const { state, dispatch } = value;
  const { reportSave, settings } = useStorage();

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

  // Each question uses its pattern's level; the session records the highest level reviewed.
  function startReviewSession(sessionLength: SessionLength) {
    const queue = rankPatterns(activePatterns(loadMistakePatterns(settings.masteryThreshold)));
    if (queue.length === 0) {
      return false;
    }
    dispatch({
      type: 'startSession',
      session: {
        id: createId(),
        startedAt: new Date().toISOString(),
        operations: OPERATIONS.filter((op) => queue.some((p) => p.operation === op)),
        difficulty: Math.max(...queue.map((p) => p.difficulty)) as DifficultyLevel,
        sessionLength,
        attempted: 0,
        correct: 0,
        incorrect: 0,
      },
      firstQuestion: generateSimilarQuestion(queue[0]),
      reviewQueue: queue.map((p) => p.id),
    });
    return true;
  }

  function recordResult({ selectedAnswer, selfReportedCorrect }: QuestionCardResult) {
    const { currentSession: session, currentQuestion: question, isActive, reviewQueue } = state;
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
    const reviewPatterns =
      question.mistakePatternId === undefined
        ? null
        : applyReviewAnswer(
            loadMistakePatterns(settings.masteryThreshold),
            question.mistakePatternId,
            selfReportedCorrect,
            attempt.attemptedAt,
            settings.masteryThreshold,
          );
    const isLast =
      session.sessionLength !== 'continuous' && session.attempted + 1 >= session.sessionLength;
    let nextQuestion: Question | null = null;
    if (!isLast) {
      nextQuestion = reviewQueue
        ? nextReviewQuestion(reviewQueue, reviewPatterns ?? loadMistakePatterns(), question)
        : generateNextQuestion(session.operations, session.difficulty, question);
    }
    const action = { type: 'recordAttempt', attempt, nextQuestion } as const;
    const next = practiceSessionReducer(state, action);
    if (next === state || !next.currentSession) {
      return;
    }
    dispatch(action);
    if (settings.soundEffects) {
      playSound(selfReportedCorrect ? 'right' : 'wrong');
      if (!next.isActive) {
        playSound('complete', COMPLETE_SOUND_DELAY);
      }
    }
    // Saved right away, so an answer is kept even if the session is never finished.
    const saved = [
      recordAttempt(attempt),
      reviewPatterns ? saveMistakePatterns(reviewPatterns) : recordMistake(attempt),
      saveSession(next.currentSession),
    ];
    reportSave(saved.every(Boolean));
  }

  function selectAnswer(answer: number) {
    dispatch({ type: 'selectAnswer', answer });
  }

  function flipCard() {
    dispatch({ type: 'flipCard' });
  }

  // Drops an unfinished session without saving it.
  function discardSession() {
    dispatch({ type: 'reset' });
  }

  function endSession() {
    const action = { type: 'endSession', completedAt: new Date().toISOString() } as const;
    const next = practiceSessionReducer(state, action);
    dispatch(action);
    // DECISIONS 3.3: a session with no answers is not saved.
    if (next !== state && next.currentSession && next.currentSession.attempted > 0) {
      reportSave(saveSession(next.currentSession));
      if (settings.soundEffects) {
        playSound('complete');
      }
    }
  }

  return {
    ...state,
    startSession,
    startReviewSession,
    selectAnswer,
    flipCard,
    recordResult,
    endSession,
    discardSession,
  };
}
