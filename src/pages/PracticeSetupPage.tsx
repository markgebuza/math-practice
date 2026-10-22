import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { isConfigReady, usePracticeConfig, type PracticeMode } from '../app/practiceConfig';
import { useStorage } from '../app/storageContext';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { activePatterns, loadMistakePatterns } from '../services/mistakeService';
import type { PracticeRedirectState } from './PracticePage';
import { Button } from '../components/common/Button';
import { PageContainer } from '../components/layout/PageContainer';
import { DifficultySelector } from '../components/setup/DifficultySelector';
import { ModeSelector } from '../components/setup/ModeSelector';
import { OperationSelector } from '../components/setup/OperationSelector';
import { SessionLengthSelector } from '../components/setup/SessionLengthSelector';
import './PracticeSetupPage.css';

function missingChoiceMessage(hasOperation: boolean, hasDifficulty: boolean) {
  if (!hasOperation && !hasDifficulty) {
    return 'Pick at least one kind of math and a level, then you can start!';
  }
  if (!hasOperation) {
    return 'Pick at least one kind of math, then you can start!';
  }
  if (!hasDifficulty) {
    return 'Pick a level, then you can start!';
  }
  return '';
}

export function PracticeSetupPage() {
  const { config } = usePracticeConfig();
  const { settings } = useStorage();
  const { startSession, startReviewSession } = usePracticeSession();
  const navigate = useNavigate();
  const redirectState = useLocation().state as PracticeRedirectState | null;
  const [activePatternCount] = useState(
    () => activePatterns(loadMistakePatterns(settings.masteryThreshold)).length,
  );
  const [mode, setMode] = useState<PracticeMode>('regular');
  const reviewing = mode === 'mistake-review';
  const ready = reviewing ? activePatternCount > 0 : isConfigReady(config);
  const message = reviewing
    ? ''
    : missingChoiceMessage(config.operations.length > 0, config.difficulty !== null);

  return (
    <PageContainer title="Get Ready to Practice">
      {redirectState?.noSession && (
        <p className="setup__notice" role="status">
          Let's get your cards ready! Choose what to practice, then press Start Session.
        </p>
      )}
      <form
        className="setup"
        onSubmit={(event) => {
          event.preventDefault();
          const started = reviewing
            ? startReviewSession(config.sessionLength)
            : startSession(config);
          if (started) {
            navigate('/practice/session');
          }
        }}
      >
        <ModeSelector mode={mode} activePatternCount={activePatternCount} onChange={setMode} />
        <OperationSelector disabled={reviewing} />
        <DifficultySelector disabled={reviewing} />
        <SessionLengthSelector />
        <div className="setup__start">
          <p id="setup-status" className="setup__message" role="status">
            {message}
          </p>
          <Button
            type="submit"
            variant="success"
            size="lg"
            disabled={!ready}
            aria-describedby={ready ? undefined : 'setup-status'}
          >
            Start Session
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
