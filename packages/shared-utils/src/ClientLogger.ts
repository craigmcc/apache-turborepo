/**
 * Configure and return a Pino logger for client-generated messages.
 *
 * @packageDocumentation
 */

// External Modules ----------------------------------------------------------

import pino from "pino";

// Internal Modules ----------------------------------------------------------

import { Timestamps } from "./Timestamps";

// Public Objects -----------------------------------------------------------

export const clientLogger = pino({
  base: null, // Remove "hostname", "name", and "pid"
  level: "info",
  timestamp: function (): string {
    return ',"time":"' + Timestamps.locale() + '"';
  },
});
