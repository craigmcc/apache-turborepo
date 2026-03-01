// Ensure React's newer `act` behavior is used so libraries that still import
// react-dom/test-utils do not emit the deprecation warning. This file will
// be included before other setup files.

// Normalize timer durations for test environment: if a NaN or non-finite
// value would be passed to setTimeout/setInterval, coerce it to 1ms. This
// prevents Node from emitting TimeoutNaNWarning when third-party libs
// (dom-helpers) accidentally compute NaN durations in JSDOM.
if (typeof globalThis !== 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const _origSetTimeout = globalThis.setTimeout;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.setTimeout = function (callback: any, delay?: any, ...args: any[]) {
      let d = typeof delay === 'undefined' ? 0 : Number(delay);
      if (!Number.isFinite(d) || isNaN(d)) d = 1;
      return _origSetTimeout(callback, d, ...args);
    } as unknown as typeof setTimeout;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const _origSetInterval = globalThis.setInterval;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.setInterval = function (callback: any, delay?: any, ...args: any[]) {
      let d = typeof delay === 'undefined' ? 0 : Number(delay);
      if (!Number.isFinite(d) || isNaN(d)) d = 1;
      return _origSetInterval(callback, d, ...args);
    } as unknown as typeof setInterval;
  } catch (e) {
    // fail open - do not prevent tests from running
  }
}

// Suppress test-only TimeoutNaNWarning noise (dom-helpers parseFloat('') -> NaN)
// This is intentionally minimal and only applied during tests to keep CI logs clean.
if (typeof process !== 'undefined') {
  try {
    const origEmitWarning = (process as any).emitWarning?.bind(process);
    if (typeof (process as any).emitWarning === 'function') {
      (process as any).emitWarning = function (warning: any, ...args: any[]) {
        try {
          const message = typeof warning === 'string' ? warning : (warning && warning.message) || '';
          if (typeof message === 'string' && message.includes('NaN is not a number')) {
            return; // drop this specific noisy warning
          }
          if (warning && (warning as any).name === 'TimeoutNaNWarning') {
            return;
          }
        } catch (e) {
          // ignore any errors in the suppression logic
        }
        return origEmitWarning ? origEmitWarning(warning, ...args) : undefined;
      };
    }

    if (typeof process.on === 'function') {
      process.on('warning', (warning: Error & { name?: string; message?: string }) => {
        try {
          if (warning && warning.name === 'TimeoutNaNWarning') return;
          if (warning && typeof warning.message === 'string' && warning.message.includes('NaN is not a number')) return;
        } catch (e) {
          // swallow
        }
        // otherwise allow the warning to show as normal
      });
    }
  } catch (e) {
    // fail open - don't prevent tests from running
  }
}

// Mock react-bootstrap OverlayTrigger and Tooltip to avoid transition behavior during tests
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { vi } = await import('vitest');
  vi.mock('react-bootstrap/OverlayTrigger', () => ({
    default: (props: any) => (props && props.children ? props.children : null),
  }));
  vi.mock('react-bootstrap/Tooltip', () => ({
    default: (props: any) => (props && props.children ? props.children : null),
  }));
} catch (e) {
  // ignore if mocking isn't available
}

// Mock react-transition-group to avoid running transition timing code in tests
// which can cause parseFloat('') -> NaN in dom-helpers (and noisy warnings).
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { vi } = await import('vitest');
  vi.mock('react-transition-group', async () => {
    // Use a synchronous no-op component; we don't need to import React here.
    const Noop = (props: any) => (props && props.children ? props.children : null);
    return {
      Transition: Noop,
      CSSTransition: Noop,
      TransitionGroup: Noop,
    } as unknown as Record<string, unknown>;
  });
  // Mock the dom-helpers transitionEnd implementation to avoid setTimeout with NaN
  try {
    vi.mock('dom-helpers/cjs/transitionEnd', () => ({
      default: (element: any) => {
        // emulateTransitionEnd returns a cleanup function
        return () => {};
      },
    }));
  } catch (e) {
    // ignore if path resolution differs
  }
} catch (e) {
  // ignore if mocking isn't available in some contexts
}

// Provide a getComputedStyle shim early so libraries that parse transition
// durations (dom-helpers used by react-bootstrap) do not read empty strings
// which can parseFloat -> NaN and lead to TimeoutNaNWarning. This shim is
// intentionally minimal and test-only; it returns '0s' for duration props.
if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
  const origGetComputedStyle = window.getComputedStyle.bind(window);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).getComputedStyle = (el?: Element | null) => {
    const style = origGetComputedStyle(el as any) as CSSStyleDeclaration;
    const proxy = new Proxy(style, {
      get(target, prop) {
        if (prop === 'transitionDuration' || prop === 'webkitTransitionDuration' || prop === 'animationDuration' || prop === 'webkitAnimationDuration') {
          const val = (target as any)[prop];
          return val ? val : '0s';
        }
        if (prop === 'getPropertyValue') {
          return (name: string) => {
            if (!name) return (target as any).getPropertyValue(name);
            const n = name.toLowerCase();
            if (n === 'transition-duration' || n === 'transitiondelay' || n === 'transition-delay' || n === 'animation-duration' || n === 'animation-delay') {
              return '0s';
            }
            return (target as any).getPropertyValue(name);
          };
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (target as any)[prop];
      },
    });
    return proxy as unknown as CSSStyleDeclaration;
  };
}

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

