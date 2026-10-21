import { useMemo, useReducer, type ReactNode } from 'react';
import {
  DEFAULT_PRACTICE_CONFIG,
  PracticeConfigContext,
  practiceConfigReducer,
  type PracticeConfig,
} from './practiceConfig';

interface AppProviderProps {
  children: ReactNode;
  initialPracticeConfig?: PracticeConfig;
}

export function AppProvider({
  children,
  initialPracticeConfig = DEFAULT_PRACTICE_CONFIG,
}: AppProviderProps) {
  const [config, dispatch] = useReducer(practiceConfigReducer, initialPracticeConfig);
  const value = useMemo(() => ({ config, dispatch }), [config]);

  return <PracticeConfigContext.Provider value={value}>{children}</PracticeConfigContext.Provider>;
}
