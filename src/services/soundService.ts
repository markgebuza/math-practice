export type SoundName = 'right' | 'wrong' | 'complete';

interface Note {
  frequency: number;
  start: number;
  duration: number;
}

// DECISIONS 6
const SOUNDS: Record<SoundName, Note[]> = {
  right: [
    { frequency: 523.25, start: 0, duration: 0.12 },
    { frequency: 659.25, start: 0.12, duration: 0.12 },
  ],
  wrong: [{ frequency: 392, start: 0, duration: 0.2 }],
  complete: [
    { frequency: 523.25, start: 0, duration: 0.14 },
    { frequency: 659.25, start: 0.14, duration: 0.14 },
    { frequency: 783.99, start: 0.28, duration: 0.24 },
  ],
};

export const SOUND_VOLUME = 0.15;
const FADE_SECONDS = 0.02;

type AudioContextClass = typeof AudioContext;

let context: AudioContext | null = null;

// Created on first use, which is always inside a click handler, so browsers allow it to start.
function getContext(): AudioContext | null {
  if (context) {
    return context;
  }
  const AudioContextClass: AudioContextClass | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }
  context = new AudioContextClass();
  return context;
}

// `delay` is in seconds. Sounds are skipped silently when Web Audio is unavailable or fails.
export function playSound(name: SoundName, delay = 0) {
  try {
    const audio = getContext();
    if (!audio) {
      return;
    }
    if (audio.state === 'suspended') {
      audio.resume().catch(() => {});
    }
    for (const note of SOUNDS[name]) {
      const startAt = audio.currentTime + delay + note.start;
      const endAt = startAt + note.duration;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.frequency, startAt);
      // Quick fade in and out so notes don't click.
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(SOUND_VOLUME, startAt + FADE_SECONDS);
      gain.gain.setValueAtTime(SOUND_VOLUME, endAt - FADE_SECONDS);
      gain.gain.linearRampToValueAtTime(0, endAt);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(startAt);
      oscillator.stop(endAt);
    }
  } catch {
    // Sound is optional; practice keeps going without it.
  }
}
