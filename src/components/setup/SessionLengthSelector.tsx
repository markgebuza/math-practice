import { SESSION_LENGTH_OPTIONS, usePracticeConfig } from '../../app/practiceConfig';
import { sessionLengthLabel } from '../../utils/labels';
import { ChoiceTile } from './ChoiceTile';
import './SetupSection.css';

export function SessionLengthSelector() {
  const { config, dispatch } = usePracticeConfig();

  return (
    <fieldset className="setup-section">
      <legend className="setup-section__legend">How many questions?</legend>
      <div className="setup-section__grid">
        {SESSION_LENGTH_OPTIONS.map((length) => (
          <ChoiceTile
            key={length}
            type="radio"
            name="session-length"
            value={String(length)}
            label={sessionLengthLabel(length)}
            description={length === 'continuous' ? 'Stop whenever you like' : undefined}
            checked={config.sessionLength === length}
            onChange={() => dispatch({ type: 'setSessionLength', sessionLength: length })}
          />
        ))}
      </div>
    </fieldset>
  );
}
