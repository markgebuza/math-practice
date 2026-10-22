import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

let shouldThrow = true;

function Fragile() {
  if (shouldThrow) {
    throw new Error('Kaboom: secret technical details');
  }
  return <p>All good</p>;
}

beforeEach(() => {
  shouldThrow = true;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('shows the friendly error page with no stack trace instead of crashing', () => {
    render(
      <ErrorBoundary onReturnHome={() => {}}>
        <Fragile />
      </ErrorBoundary>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Oops! Something Went Wrong' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return Home' })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Kaboom|secret|Error:|at \w+ \(/);
  });

  it('Return Home calls the handler and shows the content again', async () => {
    const onReturnHome = vi.fn(() => {
      shouldThrow = false;
    });
    render(
      <ErrorBoundary onReturnHome={onReturnHome}>
        <Fragile />
      </ErrorBoundary>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Return Home' }));

    expect(onReturnHome).toHaveBeenCalledTimes(1);
    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something Went Wrong')).not.toBeInTheDocument();
  });

  it('renders its children normally when nothing goes wrong', () => {
    shouldThrow = false;
    render(
      <ErrorBoundary onReturnHome={() => {}}>
        <Fragile />
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});
