import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import { playSound } from '../services/soundService';
import { readData, STORAGE_KEYS, writeData } from '../services/storageService';
import { seedMathRandom } from '../test/seededRandom';
import { DEFAULT_SETTINGS, type AppSettings } from '../types';

vi.mock('../services/soundService', () => ({ playSound: vi.fn() }));

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );
  return router;
}

function saveStoredSettings(changes: Partial<AppSettings>) {
  writeData('settings', { ...DEFAULT_SETTINGS, ...changes });
}

const storedSettings = () => readData('settings').value;
const choice = (name: string | RegExp) => screen.getByRole('checkbox', { name });
const radio = (name: string | RegExp) => screen.getByRole('radio', { name });

async function goTo(router: ReturnType<typeof renderAt>, path: string, heading: string) {
  await act(() => router.navigate(path));
  await screen.findByRole('heading', { level: 1, name: heading });
}

async function startSessionFromSetup(router: ReturnType<typeof renderAt>) {
  await goTo(router, '/practice/setup', 'Get Ready to Practice');
  await userEvent.click(screen.getByRole('button', { name: 'Start Session' }));
  await screen.findByRole('region', { name: 'Question card' });
}

async function answer(result: 'I Got It Right' | 'I Got It Wrong') {
  const group = screen.getByRole('group', { name: 'Choose an answer' });
  await userEvent.click(within(group).getAllByRole('button')[0]);
  await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
  await userEvent.click(screen.getByRole('button', { name: result }));
}

afterEach(() => {
  vi.mocked(playSound).mockClear();
});

describe('SettingsPage', () => {
  it('shows every setting with the defaults from DECISIONS 4.2', async () => {
    renderAt('/settings');
    await screen.findByRole('heading', { level: 1, name: 'Settings' });

    expect(choice(/Sound effects/)).not.toBeChecked();
    expect(choice(/Card animation/)).toBeChecked();
    expect(choice(/Show explanations/)).toBeChecked();
    expect(choice(/Addition/)).toBeChecked();
    expect(choice(/Subtraction/)).not.toBeChecked();
    expect(radio(/Level 1: Beginner/)).toBeChecked();
    expect(radio(/10 questions/)).toBeChecked();
    expect(
      screen.getByRole('combobox', { name: 'Correct answers in a row to master a mistake' }),
    ).toHaveValue('3');
    expect(screen.getByRole('button', { name: 'Clear All Application Data' })).toBeInTheDocument();
  });

  it('shows the saved settings when the app starts', async () => {
    saveStoredSettings({ soundEffects: true, cardAnimation: false, masteryThreshold: 7 });
    renderAt('/settings');
    await screen.findByRole('heading', { level: 1, name: 'Settings' });

    expect(choice(/Sound effects/)).toBeChecked();
    expect(choice(/Card animation/)).not.toBeChecked();
    expect(screen.getByRole('combobox')).toHaveValue('7');
  });

  it('saves each change right away', async () => {
    renderAt('/settings');
    await screen.findByRole('heading', { level: 1, name: 'Settings' });

    await userEvent.click(choice(/Card animation/));
    await userEvent.click(choice(/Show explanations/));
    await userEvent.click(choice(/Division/));
    await userEvent.click(radio(/Level 3/));
    await userEvent.click(radio(/Keep going/));
    await userEvent.selectOptions(screen.getByRole('combobox'), '5');

    expect(storedSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      cardAnimation: false,
      showExplanations: false,
      defaultOperations: ['addition', 'division'],
      defaultDifficulty: 3,
      defaultSessionLength: 'continuous',
      masteryThreshold: 5,
    });
    expect(choice(/Card animation/)).not.toBeChecked();
    expect(radio(/Level 3/)).toBeChecked();
  });

  it('plays a sample sound when sound effects are turned on, and nothing when turned off', async () => {
    renderAt('/settings');
    await screen.findByRole('heading', { level: 1, name: 'Settings' });

    await userEvent.click(choice(/Sound effects/));
    expect(storedSettings().soundEffects).toBe(true);
    expect(playSound).toHaveBeenCalledExactlyOnceWith('right');

    await userEvent.click(choice(/Sound effects/));
    expect(storedSettings().soundEffects).toBe(false);
    expect(playSound).toHaveBeenCalledTimes(1);
  });

  it('keeps at least one default operation picked', async () => {
    renderAt('/settings');
    await screen.findByRole('heading', { level: 1, name: 'Settings' });

    expect(choice(/Addition/)).toBeDisabled();
    expect(screen.getByText('At least one kind stays picked.')).toBeInTheDocument();
    await userEvent.click(choice(/Subtraction/));
    expect(choice(/Addition/)).toBeEnabled();
    await userEvent.click(choice(/Addition/));
    expect(storedSettings().defaultOperations).toEqual(['subtraction']);
    expect(choice(/Subtraction/)).toBeDisabled();
  });
});

describe('default practice choices', () => {
  it('prefill the setup page from saved settings when the app starts', async () => {
    saveStoredSettings({
      defaultOperations: ['subtraction', 'multiplication'],
      defaultDifficulty: 2,
      defaultSessionLength: 20,
    });
    renderAt('/practice/setup');
    await screen.findByRole('heading', { level: 1, name: 'Get Ready to Practice' });

    expect(choice('Addition')).not.toBeChecked();
    expect(choice('Subtraction')).toBeChecked();
    expect(choice('Multiplication')).toBeChecked();
    expect(radio(/Level 2: Easy/)).toBeChecked();
    expect(radio(/20 questions/)).toBeChecked();
  });

  it('are applied to setup as soon as they change, and setup can still override them', async () => {
    const router = renderAt('/settings');
    await screen.findByRole('heading', { level: 1, name: 'Settings' });
    await userEvent.click(radio(/Level 4/));
    await userEvent.click(radio(/5 questions/));

    await goTo(router, '/practice/setup', 'Get Ready to Practice');
    expect(radio(/Level 4: Advanced/)).toBeChecked();
    expect(radio(/5 questions/)).toBeChecked();

    await userEvent.click(radio(/Level 1: Beginner/));
    await userEvent.click(choice('Division'));
    expect(radio(/Level 1: Beginner/)).toBeChecked();
    expect(storedSettings().defaultDifficulty).toBe(4);
    expect(storedSettings().defaultOperations).toEqual(['addition']);

    await goTo(router, '/settings', 'Settings');
    expect(radio(/Level 4/)).toBeChecked();
    expect(choice(/Division/)).not.toBeChecked();
  });
});

describe('settings during practice', () => {
  it('shows explanations and flips with animation by default', async () => {
    seedMathRandom(3);
    const router = renderAt('/');
    await startSessionFromSetup(router);
    expect(screen.getByRole('region', { name: 'Question card' })).toHaveClass(
      'question-card--animated',
    );
    const group = screen.getByRole('group', { name: 'Choose an answer' });
    await userEvent.click(within(group).getAllByRole('button')[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
    expect(document.querySelector('.question-card__explanation')).not.toBeNull();
  });

  it('hides explanations and turns off the flip animation when those settings are off', async () => {
    seedMathRandom(3);
    saveStoredSettings({ showExplanations: false, cardAnimation: false });
    const router = renderAt('/');
    await startSessionFromSetup(router);
    expect(screen.getByRole('region', { name: 'Question card' })).not.toHaveClass(
      'question-card--animated',
    );
    const group = screen.getByRole('group', { name: 'Choose an answer' });
    await userEvent.click(within(group).getAllByRole('button')[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
    expect(screen.getByText('Correct answer')).toBeInTheDocument();
    expect(document.querySelector('.question-card__explanation')).toBeNull();
  });

  it('plays no sounds when sound effects are off', async () => {
    seedMathRandom(5);
    saveStoredSettings({ defaultSessionLength: 5 });
    const router = renderAt('/');
    await startSessionFromSetup(router);
    for (let i = 0; i < 5; i++) {
      await answer(i % 2 === 0 ? 'I Got It Right' : 'I Got It Wrong');
    }
    expect(router.state.location.pathname).toBe('/practice/summary');
    expect(playSound).not.toHaveBeenCalled();
  });

  it('plays the right, wrong and session-complete sounds when sound effects are on', async () => {
    seedMathRandom(5);
    saveStoredSettings({ soundEffects: true, defaultSessionLength: 5 });
    const router = renderAt('/');
    await startSessionFromSetup(router);

    await answer('I Got It Right');
    expect(playSound).toHaveBeenLastCalledWith('right');
    await answer('I Got It Wrong');
    expect(playSound).toHaveBeenLastCalledWith('wrong');
    await answer('I Got It Right');
    await answer('I Got It Right');
    expect(playSound).not.toHaveBeenCalledWith('complete', expect.anything());
    await answer('I Got It Wrong');

    expect(vi.mocked(playSound).mock.calls.slice(-2)).toEqual([
      ['wrong'],
      ['complete', expect.any(Number)],
    ]);
    expect(playSound).toHaveBeenCalledTimes(6);
  });

  it('plays the session-complete sound when a continuous session ends with answers', async () => {
    seedMathRandom(5);
    saveStoredSettings({ soundEffects: true, defaultSessionLength: 'continuous' });
    const router = renderAt('/');
    await startSessionFromSetup(router);
    await answer('I Got It Right');
    await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, End Session' }));

    expect(vi.mocked(playSound).mock.calls).toEqual([['right'], ['complete']]);
  });

  it('plays no session-complete sound when a continuous session ends with no answers', async () => {
    seedMathRandom(5);
    saveStoredSettings({ soundEffects: true, defaultSessionLength: 'continuous' });
    const router = renderAt('/');
    await startSessionFromSetup(router);
    await userEvent.click(screen.getByRole('button', { name: 'End Session' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, End Session' }));

    expect(playSound).not.toHaveBeenCalled();
  });
});

describe('Clear All Application Data', () => {
  function seedEverything() {
    saveStoredSettings({ soundEffects: true, defaultDifficulty: 4, masteryThreshold: 9 });
    localStorage.setItem(STORAGE_KEYS.sessions, '[]');
    localStorage.setItem(STORAGE_KEYS.attempts, '[]');
    localStorage.setItem(STORAGE_KEYS.mistakePatterns, '[]');
    localStorage.setItem(STORAGE_KEYS.statistics, '{}');
    localStorage.setItem('someOtherSite.key', 'keep me');
  }

  it('asks first with a clear warning, and keeps everything when cancelled', async () => {
    seedEverything();
    const router = renderAt('/settings');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Clear All Application Data' }),
    );

    const dialog = screen.getByRole('dialog', { name: 'Clear all app data?' });
    expect(dialog).toHaveAccessibleDescription(
      /answers, practice sessions, statistics, mistakes to practice, and settings.*can't be undone/,
    );
    expect(within(dialog).getByRole('button', { name: 'Keep My Data' })).toHaveFocus();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Keep My Data' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/settings');
    expect(storedSettings().masteryThreshold).toBe(9);
    expect(localStorage.getItem(STORAGE_KEYS.mistakePatterns)).toBe('[]');
  });

  it('clears all app data, restores the defaults and returns home', async () => {
    seedEverything();
    const router = renderAt('/');
    await startSessionFromSetup(router);

    await goTo(router, '/settings', 'Settings');
    await userEvent.click(screen.getByRole('button', { name: 'Clear All Application Data' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, Clear Everything' }));

    await screen.findByRole('heading', { level: 1, name: 'Math Practice' });
    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByRole('status')).toHaveTextContent('All app data was cleared.');
    for (const key of [
      'settings',
      'sessions',
      'attempts',
      'mistakePatterns',
      'statistics',
    ] as const) {
      expect(localStorage.getItem(STORAGE_KEYS[key])).toBeNull();
    }
    expect(localStorage.getItem('someOtherSite.key')).toBe('keep me');

    await goTo(router, '/settings', 'Settings');
    expect(choice(/Sound effects/)).not.toBeChecked();
    expect(radio(/Level 1/)).toBeChecked();
    expect(screen.getByRole('combobox')).toHaveValue('3');

    await goTo(router, '/practice/setup', 'Get Ready to Practice');
    expect(radio(/Level 1: Beginner/)).toBeChecked();

    // The session that was running is gone too.
    await act(() => router.navigate('/practice/session'));
    expect(await screen.findByText(/Let's get your cards ready!/)).toBeInTheDocument();
  });
});
