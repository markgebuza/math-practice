import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router';
import { useStorage } from '../app/storageContext';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PageContainer } from '../components/layout/PageContainer';
import { ProgressBar } from '../components/practice/ProgressBar';
import { QuestionCard } from '../components/practice/QuestionCard';
import { usePracticeSession } from '../hooks/usePracticeSession';
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
    attempts,
    isActive,
    reviewQueue,
    recordResult,
    endSession,
  } = usePracticeSession();
  const { settings } = useStorage();
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const firstShownIndex = useRef(currentQuestionIndex);

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
  const lastAttempt = attempts.at(-1);
  const questionNumber = currentQuestionIndex + 1;

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
        <div key={question.id} className="practice-page__card" ref={cardRef} tabIndex={-1}>
          <QuestionCard
            question={question}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            showExplanations={settings.showExplanations}
            animationEnabled={settings.cardAnimation}
            onResult={recordResult}
          />
        </div>
        <div className="practice-page__feedback" role="status">
          {lastAttempt &&
            (lastAttempt.selfReportedCorrect
              ? `Great job! Here is question ${questionNumber}.`
              : `Thanks for being honest! You are improving. Here is question ${questionNumber}.`)}
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
