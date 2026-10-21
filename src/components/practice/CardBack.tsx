import type { Ref } from 'react';
import type { Question } from '../../types';
import { explainQuestion, spokenQuestion } from '../../utils/explanations';
import { Button } from '../common/Button';

interface CardBackProps {
  question: Question;
  selectedAnswer: number | null;
  showExplanation: boolean;
  submitted: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  onResult: (selfReportedCorrect: boolean) => void;
}

export function CardBack({
  question,
  selectedAnswer,
  showExplanation,
  submitted,
  headingRef,
  onResult,
}: CardBackProps) {
  return (
    <>
      <h2 ref={headingRef} className="question-card__question" tabIndex={-1}>
        <span aria-hidden="true">
          {question.displayText} = {question.correctAnswer}
        </span>
        <span className="visually-hidden">
          {spokenQuestion(question)} equals {question.correctAnswer}
        </span>
      </h2>
      <dl className="question-card__answers">
        <div className="question-card__answer">
          <dt>Correct answer</dt>
          <dd>{question.correctAnswer}</dd>
        </div>
        <div className="question-card__answer">
          <dt>Your answer</dt>
          <dd>{selectedAnswer ?? '—'}</dd>
        </div>
      </dl>
      {showExplanation && <p className="question-card__explanation">{explainQuestion(question)}</p>}
      <p className="question-card__prompt">How did you do?</p>
      <div className="question-card__results">
        <Button variant="success" size="lg" disabled={submitted} onClick={() => onResult(true)}>
          I Got It Right
        </Button>
        <Button variant="secondary" size="lg" disabled={submitted} onClick={() => onResult(false)}>
          I Got It Wrong
        </Button>
      </div>
    </>
  );
}
