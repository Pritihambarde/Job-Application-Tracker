import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import JobModal from '../components/JobModal';
import ConfirmDialog from '../components/ConfirmDialog';

describe('JobModal', () => {
  it('is exposed as a labelled modal dialog', () => {
    render(<JobModal onClose={vi.fn()} onSave={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: 'Add application' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('closes when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<JobModal onClose={onClose} onSave={vi.fn()} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the dialog and keeps Tab inside it', async () => {
    render(
      <div>
        <button>Outside</button>
        <JobModal onClose={vi.fn()} onSave={vi.fn()} />
      </div>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 12; i++) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('shows an error and does not save when company and role are only spaces', async () => {
    const onSave = vi.fn();
    render(<JobModal onClose={vi.fn()} onSave={onSave} />);
    await userEvent.type(screen.getByLabelText(/company/i), '   ');
    await userEvent.type(screen.getByLabelText(/role/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Add application' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Company and role are required.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with the form values when company and role are filled', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(<JobModal onClose={vi.fn()} onSave={onSave} />);
    await userEvent.type(screen.getByLabelText(/company/i), 'Acme');
    await userEvent.type(screen.getByLabelText(/role/i), 'Frontend Developer');
    await userEvent.click(screen.getByRole('button', { name: 'Add application' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ company: 'Acme', role: 'Frontend Developer', status: 'Applied' }));
  });
});

describe('ConfirmDialog', () => {
  it('has the alertdialog role, and Cancel and Escape both call onCancel', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog title="Delete?" message="This cannot be undone." onConfirm={vi.fn()} onCancel={onCancel} />);
    expect(screen.getByRole('alertdialog', { name: 'Delete?' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('calls onConfirm when the delete button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog title="Delete?" message="Sure?" onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
