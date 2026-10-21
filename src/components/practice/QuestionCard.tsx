import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { Question } from '../../types';
import { CardBack } from './CardBack';
import { CardFront } from './CardFront';
import './QuestionCard.css';

export interface QuestionCardResult {
  selectedAnswer: number;
  selfReportedCorrect: boolean;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions?: number;
  showExplanations?: boolean;
  animationEnabled?: boolean;
  onResult: (result: QuestionCardResult) => void;
}

// Keyed by question id so selection, flip and submission reset for every new question.
export function QuestionCard(props: QuestionCardProps) {
  return <QuestionCardContent key={props.question.id} {...props} />;
}

function QuestionCardContent({
  question,
  questionNumber,
  totalQuestions,
  showExplanations = true,
  animationEnabled = true,
  onResult,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);
  const backHeadingRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animated = animationEnabled && !prefersReducedMotion;

  useEffect(() => {
    if (isCardFlipped) {
      backHeadingRef.current?.focus();
    }
  }, [isCardFlipped]);

  function handleSelect(answer: number) {
    if (!isCardFlipped) {
      setSelectedAnswer(answer);
    }
  }

  function handleFlip() {
    if (selectedAnswer !== null) {
      setIsCardFlipped(true);
    }
  }

  function handleResult(selfReportedCorrect: boolean) {
    // The ref blocks a second click that arrives before React re-renders the disabled buttons.
    if (submittedRef.current || selectedAnswer === null) {
      return;
    }
    submittedRef.current = true;
    setSubmitted(true);
    onResult({ selectedAnswer, selfReportedCorrect });
  }

  const front = (
    <CardFront
      question={question}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      selectedAnswer={selectedAnswer}
      locked={isCardFlipped}
      onSelect={handleSelect}
      onFlip={handleFlip}
    />
  );
  const back = (
    <CardBack
      question={question}
      selectedAnswer={selectedAnswer}
      showExplanation={showExplanations}
      submitted={submitted}
      headingRef={backHeadingRef}
      onResult={handleResult}
    />
  );

  const className = [
    'question-card',
    animated && 'question-card--animated',
    isCardFlipped && 'question-card--flipped',
  ]
    .filter(Boolean)
    .join(' ');

  if (!animated) {
    return (
      <section className={className} aria-label="Question card">
        <div className="question-card__inner">
          <div className="question-card__face" data-face={isCardFlipped ? 'back' : 'front'}>
            {isCardFlipped ? back : front}
          </div>
        </div>
      </section>
    );
  }

  // Both faces stay mounted so the card can turn; the hidden one is inert and aria-hidden.
  return (
    <section className={className} aria-label="Question card">
      <div className="question-card__inner">
        <div
          className="question-card__face question-card__face--front"
          data-face="front"
          aria-hidden={isCardFlipped}
          inert={isCardFlipped}
        >
          {front}
        </div>
        <div
          className="question-card__face question-card__face--back"
          data-face="back"
          aria-hidden={!isCardFlipped}
          inert={!isCardFlipped}
        >
          {back}
        </div>
      </div>
    </section>
  );
}
