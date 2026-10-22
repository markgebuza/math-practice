import { calculateAccuracy, randomInt, randomItem } from './math';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('randomInt', () => {
  it('stays within the inclusive range and reaches both ends', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const value = randomInt(3, 7);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
      seen.add(value);
    }
    expect([...seen].sort()).toEqual([3, 4, 5, 6, 7]);
  });

  it('maps the extremes of Math.random to min and max', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.999999);
    expect(randomInt(0, 10)).toBe(0);
    expect(randomInt(0, 10)).toBe(10);
  });

  it('returns the only value when min equals max', () => {
    expect(randomInt(4, 4)).toBe(4);
  });

  it('rejects invalid ranges', () => {
    expect(() => randomInt(5, 1)).toThrow(RangeError);
    expect(() => randomInt(0.5, 2)).toThrow(RangeError);
  });
});

describe('randomItem', () => {
  it('picks an item from the list', () => {
    expect(['a', 'b', 'c']).toContain(randomItem(['a', 'b', 'c']));
  });

  it('rejects an empty list', () => {
    expect(() => randomItem([])).toThrow(RangeError);
  });
});

describe('calculateAccuracy', () => {
  it('is 0 with no attempts, never NaN or Infinity', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('gives whole percentages for all-correct, all-wrong and mixed results', () => {
    expect(calculateAccuracy(5, 5)).toBe(100);
    expect(calculateAccuracy(0, 5)).toBe(0);
    expect(calculateAccuracy(4, 5)).toBe(80);
    expect(calculateAccuracy(2, 3)).toBe(67);
  });
});
