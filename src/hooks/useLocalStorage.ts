import { useCallback, useState } from 'react';
import { readData, writeData, type DataKey, type StoredData } from '../services/storageService';

export function useLocalStorage<K extends DataKey>(key: K, onSave?: (saved: boolean) => void) {
  const [value, setValue] = useState(() => readData(key).value);

  const save = useCallback(
    (next: StoredData[K]) => {
      setValue(next);
      onSave?.(writeData(key, next));
    },
    [key, onSave],
  );

  const reload = useCallback(() => {
    const stored = readData(key).value;
    setValue(stored);
    return stored;
  }, [key]);

  return [value, save, reload] as const;
}
