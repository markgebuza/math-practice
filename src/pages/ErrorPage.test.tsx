import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';

const crash = vi.hoisted(() => ({ enabled: true }));

vi.mock('./StatisticsPage', () => ({
  StatisticsPage: () => {
    if (crash.enabled) {
      throw new Error('Kaboom: secret technical details');
    }
    return <h1>Your Statistics</h1>;
  },
}));

beforeEach(() => {
  crash.enabled = true;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );
  return router;
}

describe('ErrorPage', () => {
  it('shows a friendly message without technical details when a page crashes', async () => {
    renderAt('/statistics');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Oops! Something Went Wrong' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/It's not your fault!/)).toBeInTheDocument();
    expect(document.title).toBe('Oops! Something Went Wrong | Math Practice');

    const text = document.body.textContent!;
    expect(text).not.toMatch(/Kaboom|secret technical details|Error:|at \w+ \(|\.tsx/);
  });

  it('Return Home leaves the error page and shows the home page', async () => {
    const router = renderAt('/statistics');
    await screen.findByRole('heading', { level: 1, name: 'Oops! Something Went Wrong' });

    await userEvent.click(screen.getByRole('button', { name: 'Return Home' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Math Practice' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
    expect(screen.queryByText('Oops! Something Went Wrong')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('lets the child open the page again once it works', async () => {
    const router = renderAt('/statistics');
    await userEvent.click(await screen.findByRole('button', { name: 'Return Home' }));
    await screen.findByRole('heading', { level: 1, name: 'Math Practice' });

    crash.enabled = false;
    await router.navigate('/statistics');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your Statistics' }),
    ).toBeInTheDocument();
  });
});
