import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function createParam() {
  return {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  };
}

function createOscillatorMock() {
  return {
    type: 'square',
    frequency: createParam(),
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  state: AudioContextState = 'running';
  currentTime = 10;
  destination = { name: 'speakers' };
  oscillators: ReturnType<typeof createOscillatorMock>[] = [];
  gains: { gain: ReturnType<typeof createParam>; connect: ReturnType<typeof vi.fn> }[] = [];
  resume = vi.fn(() => Promise.resolve());

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    const oscillator = createOscillatorMock();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain() {
    const gain = { gain: createParam(), connect: vi.fn() };
    this.gains.push(gain);
    return gain;
  }
}

async function loadService() {
  vi.resetModules();
  return import('./soundService');
}

describe('playSound', () => {
  beforeEach(() => {
    FakeAudioContext.instances = [];
    vi.stubGlobal('AudioContext', FakeAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not create an AudioContext until a sound is played', async () => {
    await loadService();
    expect(FakeAudioContext.instances).toHaveLength(0);
  });

  it('plays two rising sine notes, C5 then E5, for a right answer', async () => {
    const { playSound } = await loadService();
    playSound('right');

    const [audio] = FakeAudioContext.instances;
    expect(audio.oscillators).toHaveLength(2);
    expect(audio.oscillators.map((osc) => osc.type)).toEqual(['sine', 'sine']);
    expect(audio.oscillators.map((osc) => osc.frequency.setValueAtTime.mock.calls[0])).toEqual([
      [523.25, 10],
      [659.25, 10.12],
    ]);
    expect(audio.oscillators[0].start).toHaveBeenCalledWith(10);
    expect(audio.oscillators[0].stop).toHaveBeenCalledWith(10.12);
    expect(audio.gains[1].connect).toHaveBeenCalledWith(audio.destination);
  });

  it('plays one soft low note (about G4, 200 ms) for a wrong answer', async () => {
    const { playSound } = await loadService();
    playSound('wrong');

    const [audio] = FakeAudioContext.instances;
    expect(audio.oscillators).toHaveLength(1);
    expect(audio.oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(392, 10);
    expect(audio.oscillators[0].stop).toHaveBeenCalledWith(10.2);
  });

  it('plays a three-note rising arpeggio when a session is complete', async () => {
    const { playSound } = await loadService();
    playSound('complete', 0.5);

    const [audio] = FakeAudioContext.instances;
    const notes = audio.oscillators.map((osc) => osc.frequency.setValueAtTime.mock.calls[0]);
    expect(notes).toHaveLength(3);
    expect(notes[0][1]).toBe(10.5);
    expect(notes.map(([frequency]) => frequency)).toEqual([523.25, 659.25, 783.99]);
  });

  it('keeps the volume low and fades every note in and out', async () => {
    const { playSound, SOUND_VOLUME } = await loadService();
    playSound('right');

    expect(SOUND_VOLUME).toBe(0.15);
    for (const { gain } of FakeAudioContext.instances[0].gains) {
      expect(gain.setValueAtTime.mock.calls[0][0]).toBe(0);
      const ramps = gain.linearRampToValueAtTime.mock.calls.map(([value]) => value);
      expect(ramps).toEqual([SOUND_VOLUME, 0]);
    }
  });

  it('reuses one AudioContext and resumes it when the browser suspended it', async () => {
    const { playSound } = await loadService();
    playSound('right');
    const [audio] = FakeAudioContext.instances;
    audio.state = 'suspended';
    playSound('wrong');

    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(audio.resume).toHaveBeenCalledTimes(1);
  });

  it('is silently skipped when Web Audio is unavailable', async () => {
    vi.stubGlobal('AudioContext', undefined);
    const { playSound } = await loadService();
    expect(() => playSound('right')).not.toThrow();
  });

  it('is silently skipped when creating the AudioContext fails', async () => {
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => {
        throw new Error('Not allowed');
      }),
    );
    const { playSound } = await loadService();
    expect(() => playSound('complete')).not.toThrow();
  });
});
