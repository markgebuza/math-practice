import { useState } from 'react';
import { useStorage } from '../app/storageContext';
import { loadMistakePatterns } from '../services/mistakeService';
import { loadStatistics, resetStatistics } from '../services/statisticsService';
import { loadRecentSessions } from '../services/storageService';
import { usePracticeSession } from './usePracticeSession';

function loadAll(masteryThreshold: number) {
  return {
    statistics: loadStatistics(),
    recentSessions: loadRecentSessions(),
    mistakePatterns: loadMistakePatterns(masteryThreshold),
  };
}

export function useStatistics() {
  const { settings, reportSave } = useStorage();
  const { isActive: hasActiveSession, discardSession } = usePracticeSession();
  const [data, setData] = useState(() => loadAll(settings.masteryThreshold));

  // An unfinished session would save totals that include answers the reset just removed.
  function reset() {
    const cleared = resetStatistics();
    if (hasActiveSession) {
      discardSession();
    }
    reportSave(cleared);
    setData(loadAll(settings.masteryThreshold));
    return cleared;
  }

  return { ...data, masteryThreshold: settings.masteryThreshold, hasActiveSession, reset };
}
