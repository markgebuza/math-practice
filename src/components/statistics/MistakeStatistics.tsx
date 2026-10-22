import { memo, useMemo } from 'react';
import {
  activePatterns,
  mostMissedFacts,
  mostMissedOperations,
  sortByIncorrectCount,
} from '../../services/mistakeService';
import type { MistakePattern, OperationStatistics } from '../../types';
import { OPERATION_LABELS, OPERATION_SYMBOLS, OPERATION_WORDS } from '../../utils/labels';
import { EmptyState } from '../common/EmptyState';

interface MistakeStatisticsProps {
  patterns: MistakePattern[];
  masteryThreshold: number;
  reviewCounts: OperationStatistics;
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

function times(count: number) {
  return count === 1 ? '1 time' : `${count.toLocaleString()} times`;
}

function joinWithAnd(items: string[]) {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function Fact({ pattern }: { pattern: MistakePattern }) {
  const { operation, firstOperand, secondOperand, correctAnswer } = pattern;
  return (
    <span
      className="fact"
      aria-label={`${firstOperand} ${OPERATION_WORDS[operation]} ${secondOperand} equals ${correctAnswer}`}
    >
      {firstOperand} {OPERATION_SYMBOLS[operation]} {secondOperand} = {correctAnswer}
    </span>
  );
}

function PatternCard({
  pattern,
  masteryThreshold,
}: {
  pattern: MistakePattern;
  masteryThreshold: number;
}) {
  const progress = Math.min(pattern.similarCorrectCount, masteryThreshold);
  return (
    <li className="stat-card pattern-card">
      <h4 className="stat-card__title">
        <Fact pattern={pattern} />
      </h4>
      <dl className="pattern-card__details">
        <div>
          <dt>Missed</dt>
          <dd>{times(pattern.incorrectCount)}</dd>
        </div>
        <div>
          <dt>Progress</dt>
          <dd>
            {pattern.mastered
              ? 'Mastered!'
              : `${progress} of ${masteryThreshold} similar questions right in a row`}
          </dd>
        </div>
        <div>
          <dt>Last missed</dt>
          <dd>
            <time dateTime={pattern.lastIncorrectAt}>
              {dateFormat.format(new Date(pattern.lastIncorrectAt))}
            </time>
          </dd>
        </div>
      </dl>
      {!pattern.mastered && (
        <progress
          className="pattern-card__progress"
          value={progress}
          max={masteryThreshold}
          aria-hidden="true"
        />
      )}
    </li>
  );
}

function PatternList({
  patterns,
  masteryThreshold,
}: {
  patterns: MistakePattern[];
  masteryThreshold: number;
}) {
  return (
    <ul className="stat-card-grid">
      {patterns.map((pattern) => (
        <PatternCard key={pattern.id} pattern={pattern} masteryThreshold={masteryThreshold} />
      ))}
    </ul>
  );
}

function groupPatterns(patterns: MistakePattern[]) {
  const sorted = sortByIncorrectCount(patterns);
  return {
    active: activePatterns(sorted),
    mastered: sorted.filter((pattern) => pattern.mastered),
    mostMissed: mostMissedOperations(patterns),
    missedFacts: mostMissedFacts(patterns),
  };
}

// Memoized so opening the reset dialog or showing a message doesn't re-sort every pattern.
export const MistakeStatistics = memo(function MistakeStatistics({
  patterns,
  masteryThreshold,
  reviewCounts,
}: MistakeStatisticsProps) {
  const { active, mastered, mostMissed, missedFacts } = useMemo(
    () => groupPatterns(patterns),
    [patterns],
  );
  const counts = [
    { label: 'Facts to practice', value: active.length },
    { label: 'Facts mastered', value: mastered.length },
    { label: 'Similar questions practiced', value: reviewCounts.attempted },
    { label: 'Review questions answered correctly', value: reviewCounts.correct },
  ];

  return (
    <section className="stats-section mistake-stats" aria-labelledby="stats-mistakes-heading">
      <h2 id="stats-mistakes-heading">Mistake practice</h2>
      <dl className="stat-counts">
        {counts.map(({ label, value }) => (
          <div key={label} className="stat-counts__item">
            <dt>{label}</dt>
            <dd>{value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
      {patterns.length === 0 ? (
        <EmptyState message="No mistakes to practice right now. When you mark a card I Got It Wrong, that fact shows up here so you can practice it again." />
      ) : (
        <>
          <div className="mistake-stats__group">
            <h3>Most missed type of math</h3>
            <p className="mistake-stats__most-missed">
              {joinWithAnd(mostMissed.operations.map((op) => OPERATION_LABELS[op]))}{' '}
              <span className="mistake-stats__note">
                (missed {times(mostMissed.incorrectCount)}
                {mostMissed.operations.length > 1 ? ' each' : ''})
              </span>
            </p>
          </div>
          <div className="mistake-stats__group">
            <h3>Most missed facts</h3>
            <ol className="missed-facts">
              {missedFacts.map((pattern) => (
                <li key={pattern.id} className="missed-facts__item">
                  <Fact pattern={pattern} />
                  <span className="mistake-stats__note">
                    Missed {times(pattern.incorrectCount)}
                    {pattern.mastered ? ' · Mastered!' : ''}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mistake-stats__group">
            <h3>Facts to practice</h3>
            {active.length === 0 ? (
              <EmptyState message="You've mastered every fact you missed. Great job!" />
            ) : (
              <PatternList patterns={active} masteryThreshold={masteryThreshold} />
            )}
          </div>
          <details className="mistake-stats__mastered">
            <summary>Mastered facts ({mastered.length})</summary>
            {mastered.length === 0 ? (
              <EmptyState message="No mastered facts yet. Answer similar questions right to master a fact." />
            ) : (
              <PatternList patterns={mastered} masteryThreshold={masteryThreshold} />
            )}
          </details>
        </>
      )}
    </section>
  );
});
