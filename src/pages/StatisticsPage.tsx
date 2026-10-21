import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';

export function StatisticsPage() {
  return (
    <PageContainer title="Your Statistics">
      <EmptyState message="Your practice results will show up here soon.">
        <ButtonLink to="/">Back to Home</ButtonLink>
      </EmptyState>
    </PageContainer>
  );
}
