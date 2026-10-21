import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('shows the home page with the app title and a welcome message', async () => {
    render(<App />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Math Practice' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/ready to practice/i)).toBeInTheDocument();
  });
});
