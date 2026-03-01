// Ensure React's newer `act` behavior is used so libraries that still import
// react-dom/test-utils do not emit the deprecation warning. This file will
// be included before other setup files.

// Set the global flag so React's act environment is enabled.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Suppress only the specific ReactDOMTestUtils.act deprecation message so test
// output is quieter while preserving other warnings/errors. We avoid blanket
// suppression and only filter messages that clearly match the known deprecation
// string.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
(() => {
  try {
    const origWarn = console.warn.bind(console);
    const origError = console.error.bind(console);

    function isActDeprecation(args: unknown[]) {
      if (!args || args.length === 0) return false;
      try {
        const text = args
          .map((a) => (typeof a === 'string' ? a : String(a)))
          .join(' ');
        return text.includes('ReactDOMTestUtils.act') && text.includes('deprecated');
      } catch (e) {
        return false;
      }
    }

    // Override warn/error to filter the exact deprecation message
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.warn = (...args: unknown[]) => {
      if (isActDeprecation(args)) return;
      return origWarn(...(args as [any, ...any[]]));
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.error = (...args: unknown[]) => {
      if (isActDeprecation(args)) return;
      return origError(...(args as [any, ...any[]]));
    };
  } catch (e) {
    // If anything goes wrong, fail open and do not prevent tests from running.
  }
})();

// No exports — this file is executed for its side-effects.

