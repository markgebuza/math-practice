import { act, renderHook } from '@testing-library/react';
import { readData } from '../services/storageService';
import { DEFAULT_SETTINGS } from '../types';
import { useLocalStorage } from './useLocalStorage';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useLocalStorage', () => {
  it('starts with the stored value and saves updates', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useLocalStorage('settings', onSave));
    expect(result.current[0]).toEqual(DEFAULT_SETTINGS);

    const updated = { ...DEFAULT_SETTINGS, soundEffects: true };
    act(() => result.current[1](updated));
    expect(result.current[0]).toEqual(updated);
    expect(readData('settings').value).toEqual(updated);
    expect(onSave).toHaveBeenCalledWith(true);
  });

  it('keeps the new value in memory and reports when saving fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const onSave = vi.fn();
    const { result } = renderHook(() => useLocalStorage('attempts', onSave));
    act(() => result.current[1]([]));
    expect(result.current[0]).toEqual([]);
    expect(onSave).toHaveBeenCalledWith(false);
  });
});
