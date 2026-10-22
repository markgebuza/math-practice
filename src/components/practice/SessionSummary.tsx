import type { PracticeSession } from '../../types';
import { calculateAccuracy } from '../../utils/math';
import { DIFFICULTY_NAMES, OPERATION_LABELS } from '../../utils/labels';
import './SessionSummary.css';

interface SessionSummaryProps {
  session: PracticeSession;
  reviewCount: number;
}

export function SessionSummary({ session, reviewCount }: SessionSummaryProps) {
  const accuracy = calculateAccuracy(session.correct, session.attempted);
  const stats = [
    { label: 'Attempted', value: session.attempted },
    { label: 'Correct', value: session.correct },
    { label: 'Incorrect', value: session.incorrect },
    { label: 'Accuracy', value: `${accuracy}%` },
  ];

  return (
    <section className="session-summary" aria-labelledby="session-summary-heading">
      <h2 id="session-summary-heading" className="session-summary__cheer">
        {accuracy >= 80 ? 'Great job!' : 'Nice work! Keep practicing, you are improving!'}
      </h2>
      <dl className="session-summary__stats">
        {stats.map(({ label, value }) => (
          <div key={label} className="session-summary__stat">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <dl className="session-summary__details">
        <div>
          <dt>Math practiced</dt>
          <dd>{session.operations.map((op) => OPERATION_LABELS[op]).join(', ')}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>
            Level {session.difficulty}: {DIFFICULTY_NAMES[session.difficulty]}
          </dd>
        </div>
        <div>
          <dt>Mistake-review questions</dt>
          <dd>{reviewCount}</dd>
        </div>
      </dl>
    </section>
  );
}
