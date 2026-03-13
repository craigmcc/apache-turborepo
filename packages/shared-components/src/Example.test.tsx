import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@repo/testing-react';

describe('Example smoke test', () => {
  it('renders simple content with providers', () => {
    const { getByText } = renderWithProviders(<div>hello from shared-components</div>);
    expect(getByText('hello from shared-components')).toBeTruthy();
  });
});
