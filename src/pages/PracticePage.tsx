import { useEffect, useRef, useState } from 'react';
import { isConfigReady, usePracticeConfig, type PracticeConfig } from '../app/practiceConfig';
import { Button, ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';
import { QuestionCard, type QuestionCardResult } from '../components/practice/QuestionCard';
import { generateQuestionFromOperations } from '../services/questionGenerator';
import type { Question } from '../types';
import { DIFFICULTY_NAMES, OPERATION_LABELS } from '../utils/labels';
import './PracticePage.css';

function newQuestion(config: PracticeConfig): Question | null {
  return isConfigReady(config) && config.difficulty !== null
    ? generateQuestionFromOperations(config.operations, config.difficulty)
    : null;
}

// A try-out of the question card. The full practice session (recording, progress) is Phase 7.
export function PracticePage() {
  const { config } = usePracticeConfig();
  const [question, setQuestion] = useState(() => newQuestion(config));
  const [questionNumber, setQuestionNumber] = useState(1);
  const [result, setResult] = useState<QuestionCardResult | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // The Try Another button disappears when clicked, so move focus to the new card.
  useEffect(() => {
    if (questionNumber > 1) {
      cardRef.current?.focus();
    }
  }, [questionNumber]);

  const operations = config.operations.map((op) => OPERATION_LABELS[op]).join(', ');
  const difficulty = config.difficulty
    ? `Level ${config.difficulty}: ${DIFFICULTY_NAMES[config.difficulty]}`
    : 'none';
  const length =
    config.sessionLength === 'continuous' ? 'Keep going' : `${config.sessionLength} questions`;
  const totalQuestions = config.sessionLength === 'continuous' ? undefined : config.sessionLength;
  const hasMoreQuestions = totalQuestions === undefined || questionNumber < totalQuestions;

  function handleTryAnother() {
    setQuestion(newQuestion(config));
    setQuestionNumber((n) => n + 1);
    setResult(null);
  }

  const choices = (
    <ul className="practice-page__choices" aria-label="Your choices">
      <li>Math: {operations || 'none'}</li>
      <li>Level: {difficulty}</li>
      <li>Questions: {length}</li>
    </ul>
  );

  if (!question) {
    return (
      <PageContainer title="Practice">
        <EmptyState message="Choose what to practice first, then your cards will show up here.">
          {choices}
          <ButtonLink to="/practice/setup">Change My Choices</ButtonLink>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Practice">
      <div className="practice-page">
        <div className="practice-page__card" ref={cardRef} tabIndex={-1}>
          <QuestionCard
            question={question}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            onResult={setResult}
          />
        </div>
        <div className="practice-page__feedback" role="status">
          {result &&
            (result.selfReportedCorrect
              ? 'Great job! Thanks for checking your answer.'
              : 'Thanks for being honest! Keep practicing, you are improving.')}
        </div>
        {result && hasMoreQuestions && (
          <Button size="lg" onClick={handleTryAnother}>
            Try Another Question
          </Button>
        )}
        {result && !hasMoreQuestions && (
          <p className="practice-page__note">
            You tried all {totalQuestions} questions. Full practice sessions are coming soon!
          </p>
        )}
        <div className="practice-page__setup">
          {choices}
          <ButtonLink to="/practice/setup" variant="secondary">
            Change My Choices
          </ButtonLink>
        </div>
      </div>
    </PageContainer>
  );
}
