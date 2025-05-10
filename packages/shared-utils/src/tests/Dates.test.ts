/**
 * Unit tests for Dates module.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { Dates } from "../Dates";

// Test Methods --------------------------------------------------------------

describe("Dates", () => {
  describe("decrement()", () => {
    it("should pass on valid input", () => {
      expect(Dates.decrement("2022-04-01", 5)).toBe("2022-03-27");
      expect(Dates.decrement("2022-04-16", 3)).toBe("2022-04-13");
    });
  });

  describe("fromObject()", () => {
    it("should pass on valid input", () => {
      const INPUT = "2022-05-03 12:34:56";
      const DATE = new Date(INPUT);
      expect(Dates.fromObject(DATE)).toBe(INPUT.substring(0, 10));
    });
  });

  describe("increment()", () => {
    it("should pass on valid input", () => {
      expect(Dates.increment("2022-03-30", 4)).toBe("2022-04-03");
      expect(Dates.increment("2022-04-16", 3)).toBe("2022-04-19");
    });
  });

  describe("today()", () => {
    it("should pass on valid input", () => {
      const NOW = new Date();
      expect(Dates.today()).toBe(Dates.fromObject(NOW));
    });
  });

  describe("toObject()", () => {
    it("should pass on valid input", () => {
      const INPUT = "2022-04-15";
      const OUTPUT = Dates.toObject(INPUT);
      expect(Dates.fromObject(OUTPUT).substring(0, 10)).toBe(INPUT);
    });
  });
});
