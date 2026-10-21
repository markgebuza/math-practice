import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer title="Oops! Page Not Found">
      <EmptyState message="We looked everywhere, but we couldn't find that page. Let's head back and keep practicing!">
        <ButtonLink to="/" size="lg">
          Go Home
        </ButtonLink>
      </EmptyState>
    </PageContainer>
  );
}
