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

  return [value, save] as const;
}
