import { usePracticeConfig } from '../../app/practiceConfig';
import { DIFFICULTY_DESCRIPTIONS, DIFFICULTY_LEVELS, DIFFICULTY_NAMES } from '../../utils/labels';
import { ChoiceTile } from './ChoiceTile';

export function DifficultySelector() {
  const { config, dispatch } = usePracticeConfig();

  return (
    <fieldset className="setup-section">
      <legend className="setup-section__legend">How hard should it be?</legend>
      <p className="setup-section__hint">Pick one level.</p>
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
            checked={config.difficulty === level}
            onChange={() => dispatch({ type: 'setDifficulty', difficulty: level })}
          />
        ))}
      </div>
    </fieldset>
  );
}
