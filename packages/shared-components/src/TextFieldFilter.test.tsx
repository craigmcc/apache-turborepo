console.debug('LOAD_TEST: TextFieldFilter.test');
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@repo/testing-react';
import { TextFieldFilter } from './TextFieldFilter';

describe('TextFieldFilter', () => {
  it('renders and calls setter on input', async () => {
    const mockSet = vi.fn();
    const { getByLabelText, user } = renderWithProviders(
      <TextFieldFilter textFieldFilter="" setTextFieldFilter={mockSet} />
    );

    const input = getByLabelText('Filter by Text:') as HTMLInputElement;
    expect(input).toBeTruthy();

    // use user.type and then assert that the collected calls combine to the expected string
    await user.type(input, 'foo');

    // collect all calls and join their first arguments into a single string
    const calls = mockSet.mock.calls.map((c) => String(c[0] ?? ''));
    const combined = calls.join('');

    expect(combined).toBe('foo');
  });
});
