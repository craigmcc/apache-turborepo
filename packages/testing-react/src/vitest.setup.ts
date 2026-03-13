/// <reference types="vitest" />
import { beforeAll, afterEach, afterAll } from 'vitest';

// Importing the package top-level will register the matchers as a side-effect
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { server } from './msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
