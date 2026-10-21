import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('shows the app title and a welcome message', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Math Practice' })).toBeInTheDocument();
    expect(screen.getByText(/let's practice some math/i)).toBeInTheDocument();
  });
});
