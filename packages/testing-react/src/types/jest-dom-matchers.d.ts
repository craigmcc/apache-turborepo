// Minimal module declaration so importing '@testing-library/jest-dom/matchers' works with TS in this monorepo
declare module '@testing-library/jest-dom/matchers' {
  const matchers: Record<string, any>;
  export default matchers;
}

