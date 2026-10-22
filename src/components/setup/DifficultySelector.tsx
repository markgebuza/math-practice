import { usePracticeConfig } from '../../app/practiceConfig';
import {
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_NAMES,
  REVIEW_SETUP_HINT,
} from '../../utils/labels';
import { ChoiceTile } from './ChoiceTile';
import './SetupSection.css';

interface DifficultySelectorProps {
  disabled?: boolean;
}

export function DifficultySelector({ disabled = false }: DifficultySelectorProps) {
  const { config, dispatch } = usePracticeConfig();

  return (
    <fieldset className="setup-section" disabled={disabled}>
      <legend className="setup-section__legend">How hard should it be?</legend>
      <p className="setup-section__hint">{disabled ? REVIEW_SETUP_HINT : 'Pick one level.'}</p>
      <div className="setup-section__grid">
        {DIFFICULTY_LEVELS.map((level) => (
          <ChoiceTile
            key={level}
            type="radio"
            name="difficulty"
            value={String(level)}
            label={`Level ${level}: ${DIFFICULTY_NAMES[level]}`}
            description={DIFFICULTY_DESCRIPTIONS[level]}
            symbol={String(level)}
            disabled={disabled}
            checked={config.difficulty === level}
            onChange={() => dispatch({ type: 'setDifficulty', difficulty: level })}
          />
        ))}
      </div>
    </fieldset>
  );
}
