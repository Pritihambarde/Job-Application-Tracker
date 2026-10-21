import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import JobCard from '../components/JobCard';

const job = {
  _id: '1',
  company: 'Acme',
  role: 'Frontend Developer',
  status: 'Applied',
  link: 'https://example.com/job',
  notes: 'Referred by a friend',
  createdAt: new Date().toISOString(),
};

function setup(jobOverrides = {}) {
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn(), onStatusChange: vi.fn() };
  render(<JobCard job={{ ...job, ...jobOverrides }} {...handlers} />);
  return handlers;
}

describe('JobCard', () => {
  it('shows company, role and notes', () => {
    setup();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Referred by a friend')).toBeInTheDocument();
  });

  it('calls onStatusChange with the job and the new status', async () => {
    const handlers = setup();
    await userEvent.selectOptions(
      screen.getByLabelText('Change status for Frontend Developer at Acme'),
      'Interviewing'
    );
    expect(handlers.onStatusChange).toHaveBeenCalledWith(expect.objectContaining({ _id: '1' }), 'Interviewing');
  });

  it('has accessible labels on the edit and delete buttons, and they call their handlers', async () => {
    const handlers = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Edit Frontend Developer at Acme' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete Frontend Developer at Acme' }));
    expect(handlers.onEdit).toHaveBeenCalledTimes(1);
    expect(handlers.onDelete).toHaveBeenCalledTimes(1);
  });

  it('only shows the listing link when the job has one', () => {
    setup({ link: '' });
    expect(screen.queryByText(/Listing/)).not.toBeInTheDocument();
  });
});
