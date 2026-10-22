import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router';
import { useStorage } from '../app/storageContext';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PageContainer } from '../components/layout/PageContainer';
import { ProgressBar } from '../components/practice/ProgressBar';
import { QuestionCard, type QuestionCardResult } from '../components/practice/QuestionCard';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { spokenQuestion } from '../utils/explanations';
import { pickFeedback } from '../utils/feedback';
import { DIFFICULTY_NAMES, OPERATION_LABELS } from '../utils/labels';
import './PracticePage.css';

export interface PracticeRedirectState {
  noSession: true;
}

export function PracticePage() {
  const {
    currentSession: session,
    currentQuestion: question,
    currentQuestionIndex,
    isActive,
    reviewQueue,
    recordResult,
    endSession,
  } = usePracticeSession();
  const { settings } = useStorage();
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [revealed, setRevealed] = useState<{ questionId: string; selectedAnswer: number } | null>(
    null,
  );
  const [announcing, setAnnouncing] = useState(false);
  // Shown with the next card and kept until the child answers that card, so it is never cleared by a timer.
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const firstShownIndex = useRef(currentQuestionIndex);

  // Live regions only announce changes, so the first question is added just after the region appears.
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncing(true), 100);
    return () => window.clearTimeout(timer);
  }, []);

  // The answered card is replaced by a new one, so move focus to it.
  useEffect(() => {
    if (currentQuestionIndex !== firstShownIndex.current) {
      cardRef.current?.focus();
    }
  }, [currentQuestionIndex]);

  if (!session) {
    const state: PracticeRedirectState = { noSession: true };
    return <Navigate to="/practice/setup" replace state={state} />;
  }
  if (!isActive || !question) {
    return <Navigate to="/practice/summary" replace />;
  }

  const totalQuestions = session.sessionLength === 'continuous' ? undefined : session.sessionLength;
  const questionNumber = currentQuestionIndex + 1;
  const feedback = settings.feedbackMessages ? lastFeedback : null;

  function handleResult(result: QuestionCardResult) {
    setLastFeedback(pickFeedback(result.selfReportedCorrect, lastFeedback));
    recordResult(result);
  }

  const questionAnnouncement = `${feedback ?? ''} Question ${questionNumber}${
    totalQuestions ? ` of ${totalQuestions}` : ''
  }: What is ${spokenQuestion(question)}?`.trim();
  const announcement =
    revealed?.questionId === question.id
      ? `Correct answer: ${question.correctAnswer}. Your answer: ${revealed.selectedAnswer}.`
      : questionAnnouncement;

  return (
    <PageContainer title="Practice">
      <div className="practice-page">
        <ul className="practice-page__choices" aria-label="Your choices">
          {reviewQueue ? (
            <li>Practicing: My mistakes</li>
          ) : (
            <>
              <li>Math: {session.operations.map((op) => OPERATION_LABELS[op]).join(', ')}</li>
              <li>
                Level: Level {session.difficulty}: {DIFFICULTY_NAMES[session.difficulty]}
              </li>
            </>
          )}
          <li>Questions: {totalQuestions ? `${totalQuestions} questions` : 'Keep going'}</li>
        </ul>
        {totalQuestions ? (
          <ProgressBar answered={session.attempted} total={totalQuestions} />
        ) : (
          <p className="practice-page__count">
            {session.attempted === 1
              ? '1 question answered so far'
              : `${session.attempted} questions answered so far`}
          </p>
        )}
        <div
          key={question.id}
          className="practice-page__card"
          ref={cardRef}
          tabIndex={-1}
          role="group"
          aria-label={`Question ${questionNumber}`}
        >
          {settings.feedbackMessages && (
            <p className="practice-page__feedback">
              {feedback && `${feedback} Here is question ${questionNumber}.`}
            </p>
          )}
          <QuestionCard
            question={question}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            showExplanations={settings.showExplanations}
            animationEnabled={settings.cardAnimation}
            onReveal={(selectedAnswer) => setRevealed({ questionId: question.id, selectedAnswer })}
            onResult={handleResult}
          />
        </div>
        <div className="visually-hidden" role="status">
          {announcing && announcement}
        </div>
        {!totalQuestions && (
          <Button variant="secondary" size="lg" onClick={() => setConfirmingEnd(true)}>
            End Session
          </Button>
        )}
      </div>
      {confirmingEnd && (
        <ConfirmDialog
          title="End this session?"
          message="You can see how you did on the summary page."
          confirmLabel="Yes, End Session"
          cancelLabel="Keep Practicing"
          onConfirm={endSession}
          onCancel={() => setConfirmingEnd(false)}
        />
      )}
    </PageContainer>
  );
}
