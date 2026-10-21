import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';

export function SessionSummaryPage() {
  return (
    <PageContainer title="Session Summary">
      <EmptyState message="When you finish a practice session, you'll see how you did here.">
        <ButtonLink to="/">Back to Home</ButtonLink>
      </EmptyState>
    </PageContainer>
  );
}
