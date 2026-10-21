import { SESSION_LENGTH_OPTIONS, usePracticeConfig } from '../../app/practiceConfig';
import type { SessionLength } from '../../types';
import { ChoiceTile } from './ChoiceTile';

function sessionLengthLabel(length: SessionLength) {
  return length === 'continuous' ? 'Keep going' : `${length} questions`;
}

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
