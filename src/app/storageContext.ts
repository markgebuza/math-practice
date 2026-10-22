import { createContext, useContext } from 'react';
import type { AppSettings } from '../types';

interface StorageContextValue {
  settings: AppSettings;
  saveSettings: (settings: AppSettings) => void;
  saveFailed: boolean;
  reportSave: (saved: boolean) => void;
}

export const StorageContext = createContext<StorageContextValue | null>(null);

export function useStorage() {
  const value = useContext(StorageContext);
  if (!value) {
    throw new Error('useStorage must be used inside AppProvider');
  }
  return value;
}
