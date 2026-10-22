import { useEffect, useId, useRef } from 'react';
import type { Question } from '../../types';
import { spokenQuestion } from '../../utils/explanations';
import { Button } from '../common/Button';
import { AnswerChoice } from './AnswerChoice';

const ANSWER_KEYS = ['1', '2', '3', '4'];

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.closest('input, textarea, select') !== null)
  );
}

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
  const choicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (locked) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      const index = ANSWER_KEYS.indexOf(event.key);
      if (
        index === -1 ||
        index >= question.choices.length ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isTypingTarget(event.target) ||
        document.querySelector('[aria-modal="true"]')
      ) {
        return;
      }
      event.preventDefault();
      onSelect(question.choices[index]);
      choicesRef.current?.querySelectorAll('button')[index]?.focus();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [locked, question.choices, onSelect]);

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
      <div
        ref={choicesRef}
        className="question-card__choices"
        role="group"
        aria-label="Choose an answer"
      >
        {question.choices.map((choice, index) => (
          <AnswerChoice
            key={choice}
            value={choice}
            shortcutKey={ANSWER_KEYS[index]}
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
