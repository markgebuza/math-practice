import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

function Harness({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <ConfirmDialog
          title="End this session?"
          message="You can see how you did on the summary page."
          confirmLabel="Yes, End Session"
          cancelLabel="Keep Practicing"
          onConfirm={onConfirm}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}

async function openDialog(onConfirm = vi.fn()) {
  render(<Harness onConfirm={onConfirm} />);
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  return onConfirm;
}

describe('ConfirmDialog', () => {
  it('is a labelled modal dialog that starts focus on the safe choice', async () => {
    await openDialog();
    const dialog = screen.getByRole('dialog', { name: 'End this session?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('You can see how you did on the summary page.');
    expect(screen.getByRole('button', { name: 'Keep Practicing' })).toHaveFocus();
  });

  it('calls onConfirm only when confirmed', async () => {
    const onConfirm = await openDialog();
    expect(onConfirm).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Yes, End Session' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      'the cancel button',
      () => userEvent.click(screen.getByRole('button', { name: 'Keep Practicing' })),
    ],
    ['Escape', () => userEvent.keyboard('{Escape}')],
  ])('closes with %s and returns focus to the opener', async (_, close) => {
    const onConfirm = await openDialog();
    await close();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('keeps Tab focus inside the dialog', async () => {
    await openDialog();
    const cancel = screen.getByRole('button', { name: 'Keep Practicing' });
    const confirm = screen.getByRole('button', { name: 'Yes, End Session' });
    await userEvent.tab();
    expect(confirm).toHaveFocus();
    await userEvent.tab();
    expect(cancel).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(confirm).toHaveFocus();
  });
});
