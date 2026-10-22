import type { PracticeMode } from '../../app/practiceConfig';
import { ChoiceTile } from './ChoiceTile';
import './SetupSection.css';

interface ModeSelectorProps {
  mode: PracticeMode;
  activePatternCount: number;
  onChange: (mode: PracticeMode) => void;
}

function reviewDescription(count: number) {
  if (count === 0) {
    return 'Nothing to practice yet';
  }
  return count === 1 ? '1 fact to practice' : `${count} facts to practice`;
}

export function ModeSelector({ mode, activePatternCount, onChange }: ModeSelectorProps) {
  return (
    <fieldset className="setup-section">
      <legend className="setup-section__legend">How do you want to practice?</legend>
      <p className="setup-section__hint">
        {activePatternCount === 0
          ? 'Practice my mistakes opens up after you mark a card I Got It Wrong.'
          : 'Pick one.'}
      </p>
      <div className="setup-section__grid">
        <ChoiceTile
          type="radio"
          name="mode"
          value="regular"
          label="Regular practice"
          description="New questions from your choices below"
          symbol="▶"
          checked={mode === 'regular'}
          onChange={() => onChange('regular')}
        />
        <ChoiceTile
          type="radio"
          name="mode"
          value="mistake-review"
          label="Practice my mistakes"
          description={reviewDescription(activePatternCount)}
          symbol="↺"
          checked={mode === 'mistake-review'}
          disabled={activePatternCount === 0}
          onChange={() => onChange('mistake-review')}
        />
      </div>
    </fieldset>
  );
}
