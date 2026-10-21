import { createId } from './ids';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createId', () => {
  it('creates unique ids', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => createId()));
    expect(ids.size).toBe(1000);
  });

  it('falls back to timestamp + random when crypto.randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {});
    const ids = new Set(Array.from({ length: 100 }, () => createId()));
    expect(ids.size).toBe(100);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    }
  });
});
