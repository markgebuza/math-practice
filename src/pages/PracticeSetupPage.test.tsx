import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import type { PracticeConfig } from '../app/practiceConfig';

function renderSetup(initialPracticeConfig?: PracticeConfig) {
  const router = createMemoryRouter(routes, { initialEntries: ['/practice/setup'] });
  render(
    <AppProvider initialPracticeConfig={initialPracticeConfig}>
      <RouterProvider router={router} />
    </AppProvider>,
  );
  return router;
}

const startButton = () => screen.getByRole('button', { name: 'Start Session' });
const operationGroup = () => screen.getByRole('group', { name: 'What do you want to practice?' });
const checkbox = (name: string) => within(operationGroup()).getByRole('checkbox', { name });

describe('PracticeSetupPage', () => {
  it('starts with the default choices from DECISIONS.md and Start Session enabled', async () => {
    renderSetup();
    await screen.findByRole('heading', { name: 'Get Ready to Practice' });
    expect(checkbox('Addition')).toBeChecked();
    expect(checkbox('Subtraction')).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Level 1: Beginner/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: '10 questions' })).toBeChecked();
    expect(startButton()).toBeEnabled();
  });

  it('allows selecting several operations', async () => {
    renderSetup();
    await userEvent.click(await screen.findByText('Subtraction'));
    await userEvent.click(screen.getByText('Division'));
    expect(checkbox('Addition')).toBeChecked();
    expect(checkbox('Subtraction')).toBeChecked();
    expect(checkbox('Division')).toBeChecked();
    expect(checkbox('Multiplication')).not.toBeChecked();
  });

  it('Mixed operations selects all four, and clears them all when unchecked', async () => {
    renderSetup();
    const mixed = await screen.findByRole('checkbox', { name: /Mixed operations/ });
    await userEvent.click(mixed);
    for (const name of ['Addition', 'Subtraction', 'Multiplication', 'Division']) {
      expect(checkbox(name)).toBeChecked();
    }
    expect(mixed).toBeChecked();

    await userEvent.click(mixed);
    for (const name of ['Addition', 'Subtraction', 'Multiplication', 'Division']) {
      expect(checkbox(name)).not.toBeChecked();
    }
  });

  it('Mixed operations turns off when one operation is deselected, and on when all are picked', async () => {
    renderSetup();
    const mixed = await screen.findByRole('checkbox', { name: /Mixed operations/ });
    await userEvent.click(mixed);
    await userEvent.click(checkbox('Multiplication'));
    expect(mixed).not.toBeChecked();
    await userEvent.click(checkbox('Multiplication'));
    expect(mixed).toBeChecked();
  });

  it('disables Start Session with a friendly message when no operation is chosen', async () => {
    renderSetup();
    await userEvent.click(await screen.findByText('Addition'));
    expect(startButton()).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Pick at least one kind of math, then you can start!',
    );
    expect(startButton()).toHaveAccessibleDescription(
      'Pick at least one kind of math, then you can start!',
    );

    await userEvent.click(screen.getByText('Addition'));
    expect(startButton()).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('stays disabled until both an operation and a difficulty are chosen', async () => {
    renderSetup({ operations: [], difficulty: null, sessionLength: 10 });
    await screen.findByRole('heading', { name: 'Get Ready to Practice' });
    expect(startButton()).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Pick at least one kind of math and a level',
    );

    await userEvent.click(screen.getByText('Multiplication'));
    expect(startButton()).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Pick a level, then you can start!');

    await userEvent.click(screen.getByRole('radio', { name: /Level 2: Easy/ }));
    expect(startButton()).toBeEnabled();
  });

  it('allows only one difficulty level at a time', async () => {
    renderSetup();
    await userEvent.click(await screen.findByRole('radio', { name: /Level 3: Intermediate/ }));
    expect(screen.getByRole('radio', { name: /Level 3: Intermediate/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Level 1: Beginner/ })).not.toBeChecked();
  });

  it('works with the keyboard: Space toggles an operation', async () => {
    renderSetup();
    await screen.findByRole('heading', { name: 'Get Ready to Practice' });
    checkbox('Subtraction').focus();
    await userEvent.keyboard(' ');
    expect(checkbox('Subtraction')).toBeChecked();
  });

  it('passes the chosen configuration to the practice session', async () => {
    const router = renderSetup();
    await userEvent.click(await screen.findByText('Division'));
    await userEvent.click(screen.getByRole('radio', { name: /Level 4: Advanced/ }));
    await userEvent.click(screen.getByRole('radio', { name: /Keep going/ }));
    await userEvent.click(startButton());

    expect(router.state.location.pathname).toBe('/practice/session');
    const choices = await screen.findByRole('list', { name: 'Your choices' });
    expect(choices).toHaveTextContent('Math: Addition, Division');
    expect(choices).toHaveTextContent('Level: Level 4: Advanced');
    expect(choices).toHaveTextContent('Questions: Keep going');
  });

  it('keeps the choices when leaving setup and coming back', async () => {
    const router = renderSetup();
    await userEvent.click(await screen.findByText('Subtraction'));
    await router.navigate('/');
    await router.navigate('/practice/setup');
    expect(await screen.findByRole('checkbox', { name: 'Subtraction' })).toBeChecked();
  });
});
