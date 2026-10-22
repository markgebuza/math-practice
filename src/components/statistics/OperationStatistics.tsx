import type { AppStatistics } from '../../types';
import { OPERATION_LABELS, OPERATION_SYMBOLS, OPERATIONS } from '../../utils/labels';
import { StatCard } from './StatCard';

interface OperationStatisticsProps {
  byOperation: AppStatistics['byOperation'];
}

export function OperationStatistics({ byOperation }: OperationStatisticsProps) {
  return (
    <section className="stats-section" aria-labelledby="stats-operation-heading">
      <h2 id="stats-operation-heading">By type of math</h2>
      <ul className="stat-card-grid">
        {OPERATIONS.map((operation) => (
          <StatCard
            key={operation}
            title={
              <>
                <span className="stat-card__symbol" aria-hidden="true">
                  {OPERATION_SYMBOLS[operation]}
                </span>
                {OPERATION_LABELS[operation]}
              </>
            }
            counts={byOperation[operation]}
          />
        ))}
      </ul>
    </section>
  );
}
