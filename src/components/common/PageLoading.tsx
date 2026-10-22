import { EmptyState } from './EmptyState';
import '../layout/PageContainer.css';

export function PageLoading() {
  return (
    <main className="page" aria-busy="true">
      <div role="status">
        <EmptyState message="Getting your page ready..." />
      </div>
    </main>
  );
}
