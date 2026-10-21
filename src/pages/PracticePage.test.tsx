import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/AppRoutes';
import type { PracticeConfig } from '../app/practiceConfig';
import { seedMathRandom } from '../test/seededRandom';

function renderPractice(initialPracticeConfig: PracticeConfig) {
  const router = createMemoryRouter(routes, { initialEntries: ['/practice/session'] });
  render(
    <AppProvider initialPracticeConfig={initialPracticeConfig}>
      <RouterProvider router={router} />
    </AppProvider>,
  );
}

async function answerFirstChoice() {
  const group = await screen.findByRole('group', { name: 'Choose an answer' });
  await userEvent.click(within(group).getAllByRole('button')[0]);
  await userEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PracticePage', () => {
  it('shows a question card generated from the chosen configuration', async () => {
    seedMathRandom(6);
    renderPractice({ operations: ['division'], difficulty: 2, sessionLength: 5 });
    expect(await screen.findByText('Question 1 of 5')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^What is \d+ divided by \d+\?$/ })).toBeVisible();
    expect(screen.getByRole('list', { name: 'Your choices' })).toHaveTextContent('Math: Division');
  });

  it('lets the child report a result and try another question', async () => {
    seedMathRandom(7);
    renderPractice({ operations: ['addition'], difficulty: 1, sessionLength: 'continuous' });
    expect(await screen.findByText('Question 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^What is \d+ plus \d+\?$/ })).toBeVisible();

    await answerFirstChoice();
    await userEvent.click(screen.getByRole('button', { name: 'I Got It Right' }));
    expect(screen.getByRole('status')).toHaveTextContent('Great job!');

    await userEvent.click(screen.getByRole('button', { name: 'Try Another Question' }));
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Flip Card' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(screen.queryByRole('button', { name: 'Try Another Question' })).not.toBeInTheDocument();
    expect(document.activeElement).toHaveClass('practice-page__card');
  });

  it('stops offering new questions after the chosen number', async () => {
    renderPractice({ operations: ['subtraction'], difficulty: 1, sessionLength: 5 });
    for (let n = 1; n <= 5; n++) {
      expect(await screen.findByText(`Question ${n} of 5`)).toBeInTheDocument();
      await answerFirstChoice();
      await userEvent.click(screen.getByRole('button', { name: 'I Got It Wrong' }));
      expect(screen.getByRole('status')).toHaveTextContent('Keep practicing');
      if (n < 5) {
        await userEvent.click(screen.getByRole('button', { name: 'Try Another Question' }));
      }
    }
    expect(screen.queryByRole('button', { name: 'Try Another Question' })).not.toBeInTheDocument();
    expect(screen.getByText(/You tried all 5 questions/)).toBeInTheDocument();
  });

  it('asks the child to choose first when the configuration is incomplete', async () => {
    renderPractice({ operations: [], difficulty: 1, sessionLength: 10 });
    expect(await screen.findByText(/Choose what to practice first/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Question card' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change My Choices' })).toHaveAttribute(
      'href',
      '/practice/setup',
    );
  });
});
