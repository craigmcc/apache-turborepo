import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import RouterMock from 'next-router-mock';
import { createTestQueryClient } from './createTestQueryClient';
import type { RenderWithProvidersOptions } from './types';

export type UserEventLike = {
  click(target: Element | Document | Window, options?: unknown): Promise<void>;
  type(target: Element | Document | Window, text: string, options?: unknown): Promise<void>;
  tab(): Promise<void>;
  clear(target: Element | Document | Window): Promise<void>;
  hover(target: Element | Document | Window): Promise<void>;
  dblClick(target: Element | Document | Window): Promise<void>;
  selectOptions(target: Element | Document | Window, values: string | string[]): Promise<void>;
  keyboard(text: string): Promise<void>;
  paste(target: Element | Document | Window, text: string): Promise<void>;
};

export type RenderWithProvidersResult = RenderResult & {
  user: UserEventLike;
  queryClient: QueryClient;
};

export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderWithProvidersResult {
  const { route = '/', providerWrapper: ProviderWrapper } = options;
  const queryClient = createTestQueryClient();

  if (route) {
    // next-router-mock uses push to set the route
    try {
      RouterMock.push(route);
    } catch (err) {
      // ignore if push isn't available
    }
  }

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const content = (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    if (ProviderWrapper) return <ProviderWrapper>{content}</ProviderWrapper>;

    return <>{content}</>;
  };

  const result = render(ui, { wrapper: Wrapper, ...options });
  return { ...result, user: userEvent.setup(), queryClient } as unknown as RenderWithProvidersResult;
}
