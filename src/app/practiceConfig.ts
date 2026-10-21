import { createContext, useContext, type Dispatch } from 'react';
import type { DifficultyLevel, MathOperation, SessionLength } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { OPERATIONS } from '../utils/labels';

export interface PracticeConfig {
  operations: MathOperation[];
  difficulty: DifficultyLevel | null;
  sessionLength: SessionLength;
}

export type PracticeConfigAction =
  | { type: 'toggleOperation'; operation: MathOperation }
  | { type: 'setAllOperations'; selected: boolean }
  | { type: 'setDifficulty'; difficulty: DifficultyLevel }
  | { type: 'setSessionLength'; sessionLength: SessionLength };

export const SESSION_LENGTH_OPTIONS: SessionLength[] = [5, 10, 20, 'continuous'];

export const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  operations: DEFAULT_SETTINGS.defaultOperations,
  difficulty: DEFAULT_SETTINGS.defaultDifficulty,
  sessionLength: DEFAULT_SETTINGS.defaultSessionLength,
};

export function practiceConfigReducer(
  state: PracticeConfig,
  action: PracticeConfigAction,
): PracticeConfig {
  switch (action.type) {
    case 'toggleOperation': {
      const isSelected = state.operations.includes(action.operation);
      // Rebuild from OPERATIONS so the order is always + − × ÷
      const operations = OPERATIONS.filter((op) =>
        op === action.operation ? !isSelected : state.operations.includes(op),
      );
      return { ...state, operations };
    }
    case 'setAllOperations':
      return { ...state, operations: action.selected ? [...OPERATIONS] : [] };
    case 'setDifficulty':
      return { ...state, difficulty: action.difficulty };
    case 'setSessionLength':
      return { ...state, sessionLength: action.sessionLength };
  }
}

export function isConfigReady(config: PracticeConfig) {
  return config.operations.length > 0 && config.difficulty !== null;
}

export function allOperationsSelected(config: PracticeConfig) {
  return OPERATIONS.every((op) => config.operations.includes(op));
}

interface PracticeConfigContextValue {
  config: PracticeConfig;
  dispatch: Dispatch<PracticeConfigAction>;
}

export const PracticeConfigContext = createContext<PracticeConfigContextValue | null>(null);

export function usePracticeConfig() {
  const value = useContext(PracticeConfigContext);
  if (!value) {
    throw new Error('usePracticeConfig must be used inside AppProvider');
  }
  return value;
}
