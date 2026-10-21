import type { DifficultyLevel, MathOperation } from '../types';

export const OPERATIONS: MathOperation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [1, 2, 3, 4];

export const OPERATION_LABELS: Record<MathOperation, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
};

export const OPERATION_SYMBOLS: Record<MathOperation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

// Screen-reader wording for the symbols (DECISIONS 7)
export const OPERATION_WORDS: Record<MathOperation, string> = {
  addition: 'plus',
  subtraction: 'minus',
  multiplication: 'times',
  division: 'divided by',
};

export const DIFFICULTY_NAMES: Record<DifficultyLevel, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Intermediate',
  4: 'Advanced',
};

// Summaries of the ranges in DECISIONS.md section 1
export const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  1: 'Numbers up to 10, times tables up to 5',
  2: 'Numbers up to 50, times tables up to 10',
  3: 'Numbers up to 100, multiplying up to 9 × 20',
  4: 'Big numbers up to 1,000',
};
