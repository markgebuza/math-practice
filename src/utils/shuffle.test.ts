import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('returns a new array with the same items and leaves the input unchanged', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).not.toBe(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('puts the first item in every position over many shuffles', () => {
    const positions = new Set<number>();
    for (let i = 0; i < 200; i++) {
      positions.add(shuffle(['x', 'a', 'b', 'c']).indexOf('x'));
    }
    expect([...positions].sort()).toEqual([0, 1, 2, 3]);
  });

  it('handles empty and single-item arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([9])).toEqual([9]);
  });
});
