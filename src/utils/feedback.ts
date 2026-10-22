export const POSITIVE_FEEDBACK = [
  'Great job!',
  'Nice work!',
  'You got it!',
  'Super thinking!',
  'Way to go!',
];

export const SUPPORTIVE_FEEDBACK = [
  'Thanks for being honest! You are improving.',
  'Keep practicing! You are getting better.',
  'Good try! Every mistake helps you learn.',
  'Nice effort! You will get it next time.',
  'You are improving! Keep going.',
];

// Never repeats the previous message, so a new answer always shows a visible change.
export function pickFeedback(
  correct: boolean,
  previous: string | null,
  random: () => number = Math.random,
): string {
  const options = (correct ? POSITIVE_FEEDBACK : SUPPORTIVE_FEEDBACK).filter(
    (message) => message !== previous,
  );
  return options[Math.floor(random() * options.length)];
}
