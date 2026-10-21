import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';

export function PracticeSetupPage() {
  return (
    <PageContainer title="Get Ready to Practice">
      <EmptyState message="Soon you'll pick what kind of math to practice here.">
        <ButtonLink to="/">Back to Home</ButtonLink>
      </EmptyState>
    </PageContainer>
  );
}
