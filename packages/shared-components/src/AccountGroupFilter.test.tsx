console.debug('LOAD_TEST: AccountGroupFilter.test');
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@repo/testing-react';
import { AccountGroupFilter } from './AccountGroupFilter';

describe('AccountGroupFilter', () => {
  it('renders label and options and calls setter on change', async () => {
    const mockSet = vi.fn();
    const { getByLabelText, user } = renderWithProviders(
      <AccountGroupFilter accountGroupFilter="" setAccountGroupFilter={mockSet} />
    );

    const select = getByLabelText('Filter by Account Group:') as HTMLSelectElement;
    expect(select).toBeTruthy();

    // ensure there's at least one option to select (protects against a TypeScript
    // "possibly undefined" error when accessing select.options[1])
    expect(select.options.length).toBeGreaterThan(1);

    // change value using user.selectOptions for accessibility-friendly interaction
    const optionValue = select.options[1]!.value;
    await user.selectOptions(select, optionValue);

    expect(mockSet).toHaveBeenCalled();
  });
});
