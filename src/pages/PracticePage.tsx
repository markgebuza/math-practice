import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';

export function PracticePage() {
  return (
    <PageContainer title="Practice">
      <EmptyState message="Your practice cards will show up here soon.">
        <ButtonLink to="/">Back to Home</ButtonLink>
      </EmptyState>
    </PageContainer>
  );
}
