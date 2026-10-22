import { render, screen } from '@testing-library/react';
import type { PracticeSession } from '../../types';
import { SessionSummary } from './SessionSummary';

const session: PracticeSession = {
  id: 'session-1',
  startedAt: '2026-10-21T10:00:00.000Z',
  completedAt: '2026-10-21T10:05:00.000Z',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  difficulty: 4,
  sessionLength: 10,
  attempted: 10,
  correct: 0,
  incorrect: 10,
};

function stat(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent;
}

describe('SessionSummary', () => {
  it('shows totals, accuracy, choices and the mistake-review count', () => {
    render(<SessionSummary session={session} reviewCount={3} />);
    expect(stat('Attempted')).toBe('10');
    expect(stat('Correct')).toBe('0');
    expect(stat('Incorrect')).toBe('10');
    expect(stat('Accuracy')).toBe('0%');
    expect(stat('Math practiced')).toBe('Addition, Subtraction, Multiplication, Division');
    expect(stat('Level')).toBe('Level 4: Advanced');
    expect(stat('Mistake-review questions')).toBe('3');
  });

  it('stays encouraging when every answer was wrong', () => {
    render(<SessionSummary session={session} reviewCount={0} />);
    expect(
      screen.getByRole('heading', { name: 'Nice work! Keep practicing, you are improving!' }),
    ).toBeInTheDocument();
  });

  it('cheers an all-correct session', () => {
    render(<SessionSummary session={{ ...session, correct: 10, incorrect: 0 }} reviewCount={0} />);
    expect(stat('Accuracy')).toBe('100%');
    expect(screen.getByRole('heading', { name: 'Great job!' })).toBeInTheDocument();
  });
});
