import { useId } from 'react';
import type { Question } from '../../types';
import { spokenQuestion } from '../../utils/explanations';
import { Button } from '../common/Button';
import { AnswerChoice } from './AnswerChoice';

interface CardFrontProps {
  question: Question;
  questionNumber: number;
  totalQuestions?: number;
  selectedAnswer: number | null;
  locked: boolean;
  onSelect: (answer: number) => void;
  onFlip: () => void;
}

export function CardFront({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  locked,
  onSelect,
  onFlip,
}: CardFrontProps) {
  const hintId = useId();
  const canFlip = selectedAnswer !== null && !locked;

  return (
    <>
      <p className="question-card__progress">
        Question {questionNumber}
        {totalQuestions !== undefined && ` of ${totalQuestions}`}
      </p>
      <h2 className="question-card__question">
        <span aria-hidden="true">{question.displayText} = ?</span>
        <span className="visually-hidden">What is {spokenQuestion(question)}?</span>
      </h2>
      <div className="question-card__choices" role="group" aria-label="Choose an answer">
        {question.choices.map((choice) => (
          <AnswerChoice
            key={choice}
            value={choice}
            selected={choice === selectedAnswer}
            disabled={locked}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="question-card__actions">
        <Button
          size="lg"
          disabled={!canFlip}
          aria-describedby={selectedAnswer === null ? hintId : undefined}
          onClick={onFlip}
        >
          Flip Card
        </Button>
        {selectedAnswer === null && (
          <p id={hintId} className="question-card__hint">
            Pick an answer, then flip the card.
          </p>
        )}
      </div>
    </>
  );
}
