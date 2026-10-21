import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';

export function SettingsPage() {
  return (
    <PageContainer title="Settings">
      <EmptyState message="Soon you'll be able to change how the app works here.">
        <ButtonLink to="/">Back to Home</ButtonLink>
      </EmptyState>
    </PageContainer>
  );
}
