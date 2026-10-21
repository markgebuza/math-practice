import { useMemo, useReducer, type ReactNode } from 'react';
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

interface AppProviderProps {
  children: ReactNode;
  initialPracticeConfig?: PracticeConfig;
}

export function AppProvider({
  children,
  initialPracticeConfig = DEFAULT_PRACTICE_CONFIG,
}: AppProviderProps) {
  const [config, dispatch] = useReducer(practiceConfigReducer, initialPracticeConfig);
  const configValue = useMemo(() => ({ config, dispatch }), [config]);
  const [session, sessionDispatch] = useReducer(practiceSessionReducer, INITIAL_SESSION_STATE);
  const sessionValue = useMemo(() => ({ state: session, dispatch: sessionDispatch }), [session]);

  return (
    <PracticeConfigContext.Provider value={configValue}>
      <PracticeSessionContext.Provider value={sessionValue}>
        {children}
      </PracticeSessionContext.Provider>
    </PracticeConfigContext.Provider>
  );
}
