import type { AppStatistics } from '../../types';
import { DIFFICULTY_LEVELS, DIFFICULTY_NAMES } from '../../utils/labels';
import { StatCard } from './StatCard';

interface DifficultyStatisticsProps {
  byDifficulty: AppStatistics['byDifficulty'];
}

export function DifficultyStatistics({ byDifficulty }: DifficultyStatisticsProps) {
  return (
    <section className="stats-section" aria-labelledby="stats-difficulty-heading">
      <h2 id="stats-difficulty-heading">By level</h2>
      <ul className="stat-card-grid">
        {DIFFICULTY_LEVELS.map((level) => (
          <StatCard
            key={level}
            title={`Level ${level}: ${DIFFICULTY_NAMES[level]}`}
            counts={byDifficulty[level]}
          />
        ))}
      </ul>
    </section>
  );
}
