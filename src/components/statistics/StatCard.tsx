import type { ReactNode } from 'react';
import type { OperationStatistics } from '../../types';
import { StatCounts } from './StatCounts';

interface StatCardProps {
  title: ReactNode;
  counts: OperationStatistics;
}

export function StatCard({ title, counts }: StatCardProps) {
  return (
    <li className="stat-card">
      <h3 className="stat-card__title">{title}</h3>
      {counts.attempted > 0 ? (
        <StatCounts counts={counts} />
      ) : (
        <p className="stat-card__empty">Not practiced yet</p>
      )}
    </li>
  );
}
