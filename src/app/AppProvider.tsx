import { useCallback, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  clearAllData as clearStoredData,
  initializeStorage,
  loadActiveSession,
  saveActiveSession,
} from '../services/storageService';
import type { AppSettings } from '../types';
import {
  PracticeConfigContext,
  practiceConfigFromSettings,
  practiceConfigReducer,
  type PracticeConfig,
} from './practiceConfig';
import {
  fromActiveSession,
  PracticeSessionContext,
  practiceSessionReducer,
  toActiveSession,
  type PracticeSessionAction,
} from './practiceSession';
import { StorageContext } from './storageContext';

interface AppProviderProps {
  children: ReactNode;
  initialPracticeConfig?: PracticeConfig;
}

function defaultsChanged(previous: AppSettings, next: AppSettings) {
  return (
    previous.defaultDifficulty !== next.defaultDifficulty ||
    previous.defaultSessionLength !== next.defaultSessionLength ||
    previous.defaultOperations.join() !== next.defaultOperations.join()
  );
}

export function AppProvider({ children, initialPracticeConfig }: AppProviderProps) {
  // Runs before the first read below, so stored data is migrated before it is loaded.
  const [saveFailed, setSaveFailed] = useState(() => !initializeStorage());
  const reportSave = useCallback((saved: boolean) => setSaveFailed(!saved), []);
  const [settings, writeSettings, reloadSettings] = useLocalStorage('settings', reportSave);

  const [config, dispatch] = useReducer(
    practiceConfigReducer,
    undefined,
    () => initialPracticeConfig ?? practiceConfigFromSettings(settings),
  );
  const configValue = useMemo(() => ({ config, dispatch }), [config]);
  const [session, setSession] = useState(() => fromActiveSession(loadActiveSession()));
  const sessionRef = useRef(session);
  // Saved in the same event as the answer itself, so a refresh can never restore a question
  // whose answer was already recorded. A finished session is removed from storage.
  const sessionDispatch = useCallback(
    (action: PracticeSessionAction) => {
      const next = practiceSessionReducer(sessionRef.current, action);
      if (next === sessionRef.current) {
        return;
      }
      sessionRef.current = next;
      setSession(next);
      if (!saveActiveSession(toActiveSession(next))) {
        reportSave(false);
      }
    },
    [reportSave],
  );
  const sessionValue = useMemo(
    () => ({ state: session, dispatch: sessionDispatch }),
    [session, sessionDispatch],
  );

  // New defaults are copied into the setup choices right away, so the setup page shows them.
  const saveSettings = useCallback(
    (next: AppSettings) => {
      writeSettings(next);
      if (defaultsChanged(settings, next)) {
        dispatch({ type: 'reset', config: practiceConfigFromSettings(next) });
      }
    },
    [settings, writeSettings],
  );

  // Settings and setup choices are re-read from the cleared storage, so they go back to the defaults.
  const clearAllData = useCallback(() => {
    const cleared = clearStoredData();
    reportSave(cleared);
    dispatch({ type: 'reset', config: practiceConfigFromSettings(reloadSettings()) });
    sessionDispatch({ type: 'reset' });
    return cleared;
  }, [reportSave, reloadSettings, sessionDispatch]);

  const storageValue = useMemo(
    () => ({ settings, saveSettings, saveFailed, reportSave, clearAllData }),
    [settings, saveSettings, saveFailed, reportSave, clearAllData],
  );

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
