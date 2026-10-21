import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { Button, ButtonLink } from './Button';

describe('Button', () => {
  it('is a non-submitting button by default and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Flip Card</Button>);
    const button = screen.getByRole('button', { name: 'Flip Card' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('can be activated with the keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Go' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not respond when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Start
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies variant and size classes', () => {
    render(
      <Button variant="secondary" size="lg">
        Big
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Big' })).toHaveClass(
      'button',
      'button--secondary',
      'button--lg',
    );
  });
});

describe('ButtonLink', () => {
  it('renders a link styled as a button', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/statistics">View Statistics</ButtonLink>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'View Statistics' });
    expect(link).toHaveAttribute('href', '/statistics');
    expect(link).toHaveClass('button', 'button--primary');
  });
});
