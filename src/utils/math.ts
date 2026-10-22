export function randomInt(min: number, max: number) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new RangeError(`Invalid range [${min}, ${max}]`);
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function calculateAccuracy(correct: number, attempted: number) {
  // Round down so 100% only ever means every answer was right
  return attempted > 0 ? Math.floor((correct * 100) / attempted) : 0;
}

export function randomItem<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new RangeError('Cannot pick from an empty list');
  }
  return items[randomInt(0, items.length - 1)];
}
