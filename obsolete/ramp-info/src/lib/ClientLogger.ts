/**
 * Configure and return a Pino logger for client-generated messages.
 *
 * @packageDocumentation
 */

// External Modules ----------------------------------------------------------

import pino from "pino";

// Internal Modules ----------------------------------------------------------

import Timestamps from "@/lib/Timestamps";

// Public Objects -----------------------------------------------------------

export const logger = pino({
  base: null, // Remove "hostname", "name", and "pid"
  level: "info",
  timestamp: function (): string {
    return ',"time":"' + Timestamps.iso() + '"';
  },
});
