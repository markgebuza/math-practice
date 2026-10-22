import type { DifficultyLevel, MathOperation } from './question';
import type { SessionLength } from './session';

export interface AppSettings {
  soundEffects: boolean;
  cardAnimation: boolean;
  showExplanations: boolean;
  // Not in the spec: lets the "Great job!" style messages between cards be turned off.
  feedbackMessages: boolean;
  defaultSessionLength: SessionLength;
  defaultDifficulty: DifficultyLevel;
  defaultOperations: MathOperation[];
  masteryThreshold: number;
}

// Values from DECISIONS.md 4.2
export const DEFAULT_SETTINGS: AppSettings = {
  soundEffects: false,
  cardAnimation: true,
  showExplanations: true,
  feedbackMessages: true,
  defaultSessionLength: 10,
  defaultDifficulty: 1,
  defaultOperations: ['addition'],
  masteryThreshold: 3,
};
