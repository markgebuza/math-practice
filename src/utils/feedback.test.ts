import { pickFeedback, POSITIVE_FEEDBACK, SUPPORTIVE_FEEDBACK } from './feedback';

const SHAMING_WORDS = /\b(wrong|bad|fail|failed|silly|careless|stupid|oops|no!)\b/i;

describe('pickFeedback', () => {
  it('picks a positive message after a right answer and a supportive one after a mistake', () => {
    expect(POSITIVE_FEEDBACK).toContain(pickFeedback(true, null, () => 0.5));
    expect(SUPPORTIVE_FEEDBACK).toContain(pickFeedback(false, null, () => 0.5));
  });

  it('can pick every message in the list', () => {
    const picked = new Set(
      POSITIVE_FEEDBACK.map((_, index) =>
        pickFeedback(true, null, () => index / POSITIVE_FEEDBACK.length),
      ),
    );
    expect(picked).toEqual(new Set(POSITIVE_FEEDBACK));
    expect(pickFeedback(false, null, () => 0.9999)).toBe(SUPPORTIVE_FEEDBACK.at(-1));
  });

  it('never repeats the previous message', () => {
    for (const previous of [...POSITIVE_FEEDBACK, ...SUPPORTIVE_FEEDBACK]) {
      for (const random of [0, 0.3, 0.6, 0.9999]) {
        expect(pickFeedback(true, previous, () => random)).not.toBe(previous);
        expect(pickFeedback(false, previous, () => random)).not.toBe(previous);
      }
    }
  });

  it('uses short, kind wording only', () => {
    for (const message of [...POSITIVE_FEEDBACK, ...SUPPORTIVE_FEEDBACK]) {
      expect(message).not.toMatch(SHAMING_WORDS);
      expect(message.split(' ').length).toBeLessThanOrEqual(8);
    }
  });
});
