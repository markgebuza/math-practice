import type { AppStatistics } from '../../types';
import { ButtonLink } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { StatCounts } from './StatCounts';

interface StatisticsOverviewProps {
  statistics: AppStatistics;
}

export function StatisticsOverview({ statistics }: StatisticsOverviewProps) {
  return (
    <section className="stats-section stats-overview" aria-labelledby="stats-overview-heading">
      <h2 id="stats-overview-heading">All your practice</h2>
      {statistics.attempted > 0 ? (
        <StatCounts counts={statistics} />
      ) : (
        <EmptyState message="You haven't answered any questions yet. Practice a little, and your results will show up here!">
          <ButtonLink to="/practice/setup" size="lg">
            Start Practice
          </ButtonLink>
        </EmptyState>
      )}
    </section>
  );
}
