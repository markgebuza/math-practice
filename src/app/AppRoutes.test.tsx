import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from './AppProvider';
import { routes } from './AppRoutes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );
  return router;
}

describe('routes', () => {
  it.each([
    ['/', 'Math Practice'],
    ['/practice/setup', 'Get Ready to Practice'],
    ['/practice/summary', 'Session Summary'],
    ['/statistics', 'Your Statistics'],
    ['/settings', 'Settings'],
  ])('%s renders its page', async (path, heading) => {
    renderAt(path);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('moves focus to the new page after in-app navigation, but not when the app opens', async () => {
    renderAt('/');
    await screen.findByRole('heading', { level: 1, name: 'Math Practice' });
    expect(screen.getByRole('main')).not.toHaveFocus();

    const nav = screen.getByRole('navigation', { name: 'Main' });
    await userEvent.click(within(nav).getByRole('link', { name: 'Statistics' }));
    await screen.findByRole('heading', { level: 1, name: 'Your Statistics' });
    expect(screen.getByRole('main')).toHaveFocus();

    await userEvent.click(screen.getByRole('link', { name: 'Start Practice' }));
    await screen.findByRole('heading', { level: 1, name: 'Get Ready to Practice' });
    expect(screen.getByRole('main')).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Start Session' }));
    await screen.findByRole('region', { name: 'Question card' });
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('shows a friendly not-found page with a way home for unknown URLs', async () => {
    const router = renderAt('/no-such-page');
    expect(
      await screen.findByRole('heading', { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Go Home' }));
    expect(router.state.location.pathname).toBe('/');
  });

  it.each([
    ['Start Practice', '/practice/setup'],
    ['View Statistics', '/statistics'],
    ['Settings', '/settings'],
  ])('home button "%s" goes to %s', async (label, path) => {
    const router = renderAt('/');
    const main = await screen.findByRole('main');
    await userEvent.click(within(main).getByRole('link', { name: label }));
    expect(router.state.location.pathname).toBe(path);
  });

  it('marks the current page in the navigation', async () => {
    renderAt('/statistics');
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Statistics' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('sets the browser tab title for each page', async () => {
    renderAt('/settings');
    await screen.findByRole('heading', { level: 1, name: 'Settings' });
    expect(document.title).toBe('Settings | Math Practice');
  });
});
