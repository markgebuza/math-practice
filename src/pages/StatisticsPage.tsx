import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PageContainer } from '../components/layout/PageContainer';
import { DifficultyStatistics } from '../components/statistics/DifficultyStatistics';
import { OperationStatistics } from '../components/statistics/OperationStatistics';
import { RecentSessions } from '../components/statistics/RecentSessions';
import { StatisticsOverview } from '../components/statistics/StatisticsOverview';
import { useStatistics } from '../hooks/useStatistics';
import '../components/statistics/Statistics.css';

const RESET_DONE =
  'Your statistics have been reset. Your mistakes to practice and your settings are still saved.';
const RESET_FAILED = "Your statistics couldn't be reset right now. Please try again later.";

export function StatisticsPage() {
  const { statistics, recentSessions, reset } = useStatistics();
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const messageRef = useRef<HTMLParagraphElement>(null);
  const hasData = statistics.attempted > 0 || recentSessions.length > 0;

  // The Reset button disappears after a reset, so focus moves to the result message instead.
  useEffect(() => {
    if (message) {
      messageRef.current?.focus();
    }
  }, [message]);

  function confirmReset() {
    setIsConfirming(false);
    setMessage(reset() ? RESET_DONE : RESET_FAILED);
  }

  return (
    <PageContainer title="Your Statistics">
      <div className="statistics-page">
        <p ref={messageRef} className="statistics-page__message" role="status" tabIndex={-1}>
          {message}
        </p>
        <StatisticsOverview statistics={statistics} />
        {statistics.attempted > 0 && (
          <>
            <OperationStatistics byOperation={statistics.byOperation} />
            <DifficultyStatistics byDifficulty={statistics.byDifficulty} />
          </>
        )}
        <RecentSessions sessions={recentSessions} />
        {hasData && (
          <div className="statistics-page__reset">
            <p className="statistics-page__note">
              Want a fresh start? You can reset your statistics.
            </p>
            <Button variant="secondary" onClick={() => setIsConfirming(true)}>
              Reset Statistics
            </Button>
          </div>
        )}
      </div>
      {isConfirming && (
        <ConfirmDialog
          title="Reset your statistics?"
          message="This clears all your answers, practice sessions, and statistics. Your mistakes to practice and your settings will be kept. This can't be undone."
          confirmLabel="Yes, Reset Statistics"
          cancelLabel="Keep My Statistics"
          onConfirm={confirmReset}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </PageContainer>
  );
}
