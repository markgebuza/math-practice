import './AnswerChoice.css';

interface AnswerChoiceProps {
  value: number;
  selected: boolean;
  disabled?: boolean;
  onSelect: (value: number) => void;
}

export function AnswerChoice({ value, selected, disabled = false, onSelect }: AnswerChoiceProps) {
  return (
    <button
      type="button"
      className={`answer-choice${selected ? ' answer-choice--selected' : ''}`}
      aria-pressed={selected}
      aria-label={`Answer ${value}`}
      disabled={disabled}
      onClick={() => onSelect(value)}
    >
      <span className="answer-choice__value">{value}</span>
      <span className="answer-choice__check" aria-hidden="true">
        {selected ? '✓' : ''}
      </span>
    </button>
  );
}
