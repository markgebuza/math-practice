import { useNavigate } from 'react-router';
import { isConfigReady, usePracticeConfig } from '../app/practiceConfig';
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
  const navigate = useNavigate();
  const ready = isConfigReady(config);
  const message = missingChoiceMessage(config.operations.length > 0, config.difficulty !== null);

  return (
    <PageContainer title="Get Ready to Practice">
      <form
        className="setup"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) {
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
