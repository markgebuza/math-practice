import { useLocation, useNavigate } from 'react-router';
import { isConfigReady, usePracticeConfig } from '../app/practiceConfig';
import { usePracticeSession } from '../hooks/usePracticeSession';
import type { PracticeRedirectState } from './PracticePage';
import { Button } from '../components/common/Button';
import { PageContainer } from '../components/layout/PageContainer';
import { DifficultySelector } from '../components/setup/DifficultySelector';
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
  const { startSession } = usePracticeSession();
  const navigate = useNavigate();
  const redirectState = useLocation().state as PracticeRedirectState | null;
  const ready = isConfigReady(config);
  const message = missingChoiceMessage(config.operations.length > 0, config.difficulty !== null);

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
          if (startSession(config)) {
            navigate('/practice/session');
          }
        }}
      >
        <OperationSelector />
        <DifficultySelector />
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
