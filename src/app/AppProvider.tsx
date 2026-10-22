import { useCallback, useMemo, useReducer, useState, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initializeStorage } from '../services/storageService';
import {
  DEFAULT_PRACTICE_CONFIG,
  PracticeConfigContext,
  practiceConfigReducer,
  type PracticeConfig,
} from './practiceConfig';
import {
  INITIAL_SESSION_STATE,
  PracticeSessionContext,
  practiceSessionReducer,
} from './practiceSession';
import { StorageContext } from './storageContext';

interface AppProviderProps {
  children: ReactNode;
  initialPracticeConfig?: PracticeConfig;
}

export function AppProvider({
  children,
  initialPracticeConfig = DEFAULT_PRACTICE_CONFIG,
}: AppProviderProps) {
  // Runs before the first read below, so stored data is migrated before it is loaded.
  const [saveFailed, setSaveFailed] = useState(() => !initializeStorage());
  const reportSave = useCallback((saved: boolean) => setSaveFailed(!saved), []);
  const [settings, saveSettings] = useLocalStorage('settings', reportSave);
  const storageValue = useMemo(
    () => ({ settings, saveSettings, saveFailed, reportSave }),
    [settings, saveSettings, saveFailed, reportSave],
  );

  const [config, dispatch] = useReducer(practiceConfigReducer, initialPracticeConfig);
  const configValue = useMemo(() => ({ config, dispatch }), [config]);
  const [session, sessionDispatch] = useReducer(practiceSessionReducer, INITIAL_SESSION_STATE);
  const sessionValue = useMemo(() => ({ state: session, dispatch: sessionDispatch }), [session]);

  return (
    <StorageContext.Provider value={storageValue}>
      <PracticeConfigContext.Provider value={configValue}>
        <PracticeSessionContext.Provider value={sessionValue}>
          {children}
        </PracticeSessionContext.Provider>
      </PracticeConfigContext.Provider>
    </StorageContext.Provider>
  );
}
