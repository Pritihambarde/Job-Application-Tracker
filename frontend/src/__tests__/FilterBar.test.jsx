import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import FilterBar from '../components/FilterBar';

function setup(overrides = {}) {
  const props = {
    search: '',
    onSearchChange: vi.fn(),
    status: '',
    onStatusChange: vi.fn(),
    sort: 'newest',
    onSortChange: vi.fn(),
    onExport: vi.fn(),
    ...overrides,
  };
  render(<FilterBar {...props} />);
  return props;
}

describe('FilterBar', () => {
  it('calls onSearchChange when the user types in the search box', async () => {
    const props = setup();
    await userEvent.type(screen.getByLabelText('Search applications'), 'g');
    expect(props.onSearchChange).toHaveBeenCalledWith('g');
  });

  it('shows the clear button only when there is search text, and clears on click', async () => {
    const props = setup({ search: 'google' });
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(props.onSearchChange).toHaveBeenCalledWith('');
  });

  it('hides the clear button when the search box is empty', () => {
    setup({ search: '' });
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('calls onStatusChange when a status filter is chosen', async () => {
    const props = setup();
    await userEvent.selectOptions(screen.getByLabelText('Filter by status'), 'Offer');
    expect(props.onStatusChange).toHaveBeenCalledWith('Offer');
  });

  it('calls onExport when Export CSV is clicked', async () => {
    const props = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(props.onExport).toHaveBeenCalledTimes(1);
  });
});
