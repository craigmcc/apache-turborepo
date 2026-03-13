import type { RenderOptions } from '@testing-library/react';

export type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  route?: string;
  queryClientOptions?: unknown;
  providerWrapper?: React.ComponentType<{ children: React.ReactNode }>;
};
