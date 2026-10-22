import { useState } from 'react';
import { useStorage } from '../app/storageContext';
import { loadStatistics, resetStatistics } from '../services/statisticsService';
import { loadRecentSessions } from '../services/storageService';

function loadAll() {
  return { statistics: loadStatistics(), recentSessions: loadRecentSessions() };
}

export function useStatistics() {
  const [data, setData] = useState(loadAll);
  const { reportSave } = useStorage();

  function reset() {
    const cleared = resetStatistics();
    reportSave(cleared);
    setData(loadAll());
    return cleared;
  }

  return { ...data, reset };
}
