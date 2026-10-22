import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { SESSION_LENGTH_OPTIONS } from '../app/practiceConfig';
import { useStorage } from '../app/storageContext';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PageContainer } from '../components/layout/PageContainer';
import { ChoiceTile } from '../components/setup/ChoiceTile';
import '../components/setup/SetupSection.css';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { playSound } from '../services/soundService';
import type { AppSettings, MathOperation } from '../types';
import {
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_NAMES,
  OPERATION_LABELS,
  OPERATION_SYMBOLS,
  OPERATIONS,
  sessionLengthLabel,
} from '../utils/labels';
import './SettingsPage.css';

export interface HomeRedirectState {
  dataCleared: boolean;
}

// DECISIONS 2.3
const MASTERY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Toggle = 'soundEffects' | 'cardAnimation' | 'showExplanations';

export function SettingsPage() {
  const { settings, saveSettings, clearAllData } = useStorage();
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isConfirming, setIsConfirming] = useState(false);
  const masteryId = useId();
  const masteryHintId = useId();

  function update(changes: Partial<AppSettings>) {
    saveSettings({ ...settings, ...changes });
  }

  function toggle(field: Toggle) {
    const turnedOn = !settings[field];
    update({ [field]: turnedOn });
    // A sample, so the child hears what the sounds are like (and that they work).
    if (field === 'soundEffects' && turnedOn) {
      playSound('right');
    }
  }

  function toggleOperation(operation: MathOperation) {
    const selected = settings.defaultOperations.includes(operation);
    update({
      defaultOperations: OPERATIONS.filter((op) =>
        op === operation ? !selected : settings.defaultOperations.includes(op),
      ),
    });
  }

  function confirmClear() {
    const state: HomeRedirectState = { dataCleared: clearAllData() };
    navigate('/', { state });
  }

  const onlyOperation =
    settings.defaultOperations.length === 1 ? settings.defaultOperations[0] : null;

  return (
    <PageContainer title="Settings">
      <div className="settings">
        <p className="settings__intro">Changes are saved right away.</p>

        <fieldset className="setup-section">
          <legend className="setup-section__legend">Sounds and cards</legend>
          <div className="setup-section__grid">
            <ChoiceTile
              type="checkbox"
              name="soundEffects"
              value="on"
              label="Sound effects"
              description="Play gentle sounds when you answer."
              checked={settings.soundEffects}
              onChange={() => toggle('soundEffects')}
            />
            <ChoiceTile
              type="checkbox"
              name="cardAnimation"
              value="on"
              label="Card animation"
              description={
                prefersReducedMotion
                  ? 'Your device asks for less motion, so cards turn over without moving.'
                  : 'Cards flip over when you check your answer.'
              }
              checked={settings.cardAnimation}
              onChange={() => toggle('cardAnimation')}
            />
            <ChoiceTile
              type="checkbox"
              name="showExplanations"
              value="on"
              label="Show explanations"
              description="Show how to work it out on the back of the card."
              checked={settings.showExplanations}
              onChange={() => toggle('showExplanations')}
            />
          </div>
        </fieldset>

        <section className="settings__group" aria-labelledby="settings-defaults">
          <h2 id="settings-defaults" className="settings__heading">
            Starting choices for practice
          </h2>
          <p className="settings__hint">
            These are picked for you on the setup page. You can still change them before each
            session.
          </p>

          <fieldset className="setup-section">
            <legend className="setup-section__legend">Math to practice</legend>
            <p className="setup-section__hint">Pick one or more.</p>
            <div className="setup-section__grid">
              {OPERATIONS.map((operation) => (
                <ChoiceTile
                  key={operation}
                  type="checkbox"
                  name="defaultOperations"
                  value={operation}
                  label={OPERATION_LABELS[operation]}
                  symbol={OPERATION_SYMBOLS[operation]}
                  description={
                    operation === onlyOperation ? 'At least one kind stays picked.' : undefined
                  }
                  checked={settings.defaultOperations.includes(operation)}
                  disabled={operation === onlyOperation}
                  onChange={() => toggleOperation(operation)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="setup-section">
            <legend className="setup-section__legend">Level</legend>
            <div className="setup-section__grid">
              {DIFFICULTY_LEVELS.map((level) => (
                <ChoiceTile
                  key={level}
                  type="radio"
                  name="defaultDifficulty"
                  value={String(level)}
                  label={`Level ${level}: ${DIFFICULTY_NAMES[level]}`}
                  description={DIFFICULTY_DESCRIPTIONS[level]}
                  symbol={String(level)}
                  checked={settings.defaultDifficulty === level}
                  onChange={() => update({ defaultDifficulty: level })}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="setup-section">
            <legend className="setup-section__legend">Number of questions</legend>
            <div className="setup-section__grid">
              {SESSION_LENGTH_OPTIONS.map((length) => (
                <ChoiceTile
                  key={length}
                  type="radio"
                  name="defaultSessionLength"
                  value={String(length)}
                  label={sessionLengthLabel(length)}
                  description={length === 'continuous' ? 'Stop whenever you like' : undefined}
                  checked={settings.defaultSessionLength === length}
                  onChange={() => update({ defaultSessionLength: length })}
                />
              ))}
            </div>
          </fieldset>
        </section>

        <section className="settings__group" aria-labelledby="settings-mistakes">
          <h2 id="settings-mistakes" className="settings__heading">
            Practicing mistakes
          </h2>
          <label className="settings__label" htmlFor={masteryId}>
            Correct answers in a row to master a mistake
          </label>
          <p id={masteryHintId} className="settings__hint">
            When a tricky fact is answered right this many times in a row, it counts as learned and
            stops coming back in mistake practice.
          </p>
          <select
            id={masteryId}
            className="settings__select"
            aria-describedby={masteryHintId}
            value={settings.masteryThreshold}
            onChange={(event) => update({ masteryThreshold: Number(event.target.value) })}
          >
            {MASTERY_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </section>

        <section
          className="settings__group settings__danger"
          aria-labelledby="settings-clear-heading"
        >
          <h2 id="settings-clear-heading" className="settings__heading">
            Start over
          </h2>
          <p className="settings__hint">
            Delete everything this app has saved on this device and go back to the starting
            settings.
          </p>
          <Button variant="secondary" onClick={() => setIsConfirming(true)}>
            Clear All Application Data
          </Button>
        </section>
      </div>
      {isConfirming && (
        <ConfirmDialog
          title="Clear all app data?"
          message="This deletes everything this app has saved on this device: all your answers, practice sessions, statistics, mistakes to practice, and settings. Settings go back to how they started. This can't be undone."
          confirmLabel="Yes, Clear Everything"
          cancelLabel="Keep My Data"
          onConfirm={confirmClear}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </PageContainer>
  );
}
