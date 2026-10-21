import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes progress to screen readers', () => {
    render(<ProgressBar answered={3} total={10} />);
    const bar = screen.getByRole('progressbar', { name: 'Session progress' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 10 questions answered');
  });

  it('fills in proportion to the answers, never past full', () => {
    const { container, rerender } = render(<ProgressBar answered={1} total={4} />);
    const fill = container.querySelector<HTMLElement>('.progress-bar__fill')!;
    expect(fill.style.width).toBe('25%');
    rerender(<ProgressBar answered={6} total={4} />);
    expect(fill.style.width).toBe('100%');
  });
});
