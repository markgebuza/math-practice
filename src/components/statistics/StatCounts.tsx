import { getAccuracy } from '../../services/statisticsService';
import type { OperationStatistics } from '../../types';
import './Statistics.css';

interface StatCountsProps {
  counts: OperationStatistics;
}

export function StatCounts({ counts }: StatCountsProps) {
  const stats = [
    { label: 'Attempted', value: counts.attempted.toLocaleString() },
    { label: 'Correct', value: counts.correct.toLocaleString() },
    { label: 'Incorrect', value: counts.incorrect.toLocaleString() },
    { label: 'Accuracy', value: `${getAccuracy(counts)}%` },
  ];

  return (
    <dl className="stat-counts">
      {stats.map(({ label, value }) => (
        <div key={label} className="stat-counts__item">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
