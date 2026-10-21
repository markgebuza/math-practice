import {
  allOperationsSelected,
  DEFAULT_PRACTICE_CONFIG,
  isConfigReady,
  practiceConfigReducer,
  type PracticeConfig,
} from './practiceConfig';

const empty: PracticeConfig = { operations: [], difficulty: null, sessionLength: 10 };

describe('practiceConfigReducer', () => {
  it('toggles an operation on and off', () => {
    const on = practiceConfigReducer(empty, { type: 'toggleOperation', operation: 'division' });
    expect(on.operations).toEqual(['division']);
    const off = practiceConfigReducer(on, { type: 'toggleOperation', operation: 'division' });
    expect(off.operations).toEqual([]);
  });

  it('keeps operations in + − × ÷ order regardless of click order', () => {
    let state = practiceConfigReducer(empty, { type: 'toggleOperation', operation: 'division' });
    state = practiceConfigReducer(state, { type: 'toggleOperation', operation: 'addition' });
    expect(state.operations).toEqual(['addition', 'division']);
  });

  it('selects and clears all operations', () => {
    const all = practiceConfigReducer(empty, { type: 'setAllOperations', selected: true });
    expect(all.operations).toEqual(['addition', 'subtraction', 'multiplication', 'division']);
    expect(allOperationsSelected(all)).toBe(true);
    const none = practiceConfigReducer(all, { type: 'setAllOperations', selected: false });
    expect(none.operations).toEqual([]);
  });

  it('sets difficulty and session length', () => {
    let state = practiceConfigReducer(empty, { type: 'setDifficulty', difficulty: 3 });
    state = practiceConfigReducer(state, { type: 'setSessionLength', sessionLength: 'continuous' });
    expect(state.difficulty).toBe(3);
    expect(state.sessionLength).toBe('continuous');
  });

  it('does not mutate the previous state', () => {
    const before = { ...empty, operations: ['addition' as const] };
    practiceConfigReducer(before, { type: 'toggleOperation', operation: 'subtraction' });
    expect(before.operations).toEqual(['addition']);
  });
});

describe('isConfigReady', () => {
  it('needs at least one operation and a difficulty', () => {
    expect(isConfigReady(empty)).toBe(false);
    expect(isConfigReady({ ...empty, operations: ['addition'] })).toBe(false);
    expect(isConfigReady({ ...empty, difficulty: 2 })).toBe(false);
    expect(isConfigReady({ ...empty, operations: ['addition'], difficulty: 2 })).toBe(true);
  });

  it('is ready with the defaults from DECISIONS.md 4.2', () => {
    expect(DEFAULT_PRACTICE_CONFIG).toEqual({
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 10,
    });
    expect(isConfigReady(DEFAULT_PRACTICE_CONFIG)).toBe(true);
  });
});
