import { useState } from 'react';
import { useStorage } from '../app/storageContext';
import { loadMistakePatterns } from '../services/mistakeService';
import { loadStatistics, resetStatistics } from '../services/statisticsService';
import { loadRecentSessions } from '../services/storageService';

function loadAll(masteryThreshold: number) {
  return {
    statistics: loadStatistics(),
    recentSessions: loadRecentSessions(),
    mistakePatterns: loadMistakePatterns(masteryThreshold),
  };
}

export function useStatistics() {
  const { settings, reportSave } = useStorage();
  const [data, setData] = useState(() => loadAll(settings.masteryThreshold));

  function reset() {
    const cleared = resetStatistics();
    reportSave(cleared);
    setData(loadAll(settings.masteryThreshold));
    return cleared;
  }

  return { ...data, masteryThreshold: settings.masteryThreshold, reset };
}
