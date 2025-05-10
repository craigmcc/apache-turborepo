/**
 * Unit tests for Timestamps module.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { Timestamps } from "../Timestamps";

// Test Methods --------------------------------------------------------------

describe("Timestamps", () => {
  describe("iso()", () => {
    it("should pass on valid input", () => {
      const INPUT = "2022-05-03 12:34:56";
      const OUTPUT = "2022-05-03T12:34:56-";
      const DATE = new Date(INPUT);
      const RESULT = Timestamps.iso(DATE);
      expect(RESULT.substring(0, OUTPUT.length)).toBe(OUTPUT);
    });
  });

  describe("local()", () => {
    it("should pass on valid input", () => {
      const INPUT = "2022-05-03 12:34:56";
      const OUTPUT = "20220503-123456";
      const DATE = new Date(INPUT);
      expect(Timestamps.local(DATE)).toBe(OUTPUT);
    });
  });
});
