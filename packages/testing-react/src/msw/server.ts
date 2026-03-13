import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export type ServerLike = {
  listen: (opts?: Record<string, unknown>) => void;
  close: () => void;
  resetHandlers: (...handlers: unknown[]) => void;
  use: (...handlers: unknown[]) => void;
  printHandlers?: () => void;
};

const _server = setupServer(...(handlers as any));

export const server: ServerLike = {
  listen: (opts?: Record<string, unknown>) => {
    // delegate to real server
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_server as any).listen(opts);
  },
  close: () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_server as any).close();
  },
  resetHandlers: (...h: unknown[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_server as any).resetHandlers(...(h as any));
  },
  use: (...h: unknown[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_server as any).use(...(h as any));
  },
  printHandlers: () => {
    // optional helper provided by msw in some versions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = (_server as any).printHandlers;
    if (typeof fn === 'function') fn();
  },
};
