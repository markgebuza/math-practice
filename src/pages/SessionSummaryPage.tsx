import { useNavigate } from 'react-router';
import { Button, ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';
import { SessionSummary } from '../components/practice/SessionSummary';
import { usePracticeSession } from '../hooks/usePracticeSession';
import './SessionSummaryPage.css';

export function SessionSummaryPage() {
  const { currentSession: session, attempts, isActive, startSession } = usePracticeSession();
  const navigate = useNavigate();

  if (!session) {
    return (
      <PageContainer title="Session Summary">
        <EmptyState message="When you finish a practice session, you'll see how you did here.">
          <ButtonLink to="/practice/setup">Start Practice</ButtonLink>
          <ButtonLink to="/" variant="secondary">
            Back to Home
          </ButtonLink>
        </EmptyState>
      </PageContainer>
    );
  }

  if (isActive) {
    return (
      <PageContainer title="Session Summary">
        <EmptyState message="You're still practicing! Finish your session to see how you did.">
          <ButtonLink to="/practice/session">Keep Practicing</ButtonLink>
        </EmptyState>
      </PageContainer>
    );
  }

  const reviewCount = attempts.filter((attempt) => attempt.source === 'mistake-review').length;

  const { operations, difficulty, sessionLength } = session;

  function practiceAgain() {
    if (startSession({ operations, difficulty, sessionLength })) {
      navigate('/practice/session');
    }
  }

  return (
    <PageContainer title="Session Summary">
      <div className="summary-page">
        {session.attempted > 0 ? (
          <SessionSummary session={session} reviewCount={reviewCount} />
        ) : (
          <EmptyState message="No questions answered this time. That's okay, you can try again whenever you're ready!" />
        )}
        <div className="summary-page__actions">
          <Button variant="success" size="lg" onClick={practiceAgain}>
            Practice Again
          </Button>
          <Button size="lg" disabled aria-describedby="practice-mistakes-note">
            Practice Mistakes
          </Button>
          <p id="practice-mistakes-note" className="summary-page__note">
            Practicing your mistakes is coming soon!
          </p>
          <ButtonLink to="/practice/setup" variant="secondary" size="lg">
            Change Settings
          </ButtonLink>
          <ButtonLink to="/statistics" variant="secondary" size="lg">
            View Statistics
          </ButtonLink>
          <ButtonLink to="/" variant="secondary" size="lg">
            Return Home
          </ButtonLink>
        </div>
      </div>
    </PageContainer>
  );
}
