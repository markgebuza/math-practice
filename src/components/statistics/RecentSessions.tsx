import type { PracticeSession } from '../../types';
import { DIFFICULTY_NAMES, OPERATION_LABELS } from '../../utils/labels';
import { EmptyState } from '../common/EmptyState';
import { StatCounts } from './StatCounts';

interface RecentSessionsProps {
  sessions: PracticeSession[];
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <section className="stats-section" aria-labelledby="stats-sessions-heading">
      <h2 id="stats-sessions-heading">Recent sessions</h2>
      {sessions.length === 0 ? (
        <EmptyState message="When you finish a practice session, it will show up here." />
      ) : (
        <ol className="session-list">
          {sessions.map((session) => (
            <li key={session.id} className="stat-card session-card">
              <h3 className="stat-card__title">
                <time dateTime={session.completedAt}>
                  {dateFormat.format(new Date(session.completedAt!))}
                </time>
              </h3>
              <p className="session-card__details">
                {session.operations.map((op) => OPERATION_LABELS[op]).join(', ')}
                {' · '}
                Level {session.difficulty}: {DIFFICULTY_NAMES[session.difficulty]}
              </p>
              <StatCounts counts={session} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
