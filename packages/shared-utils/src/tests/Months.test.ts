/**
 * Unit tests for Months module.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { Dates } from "../Dates";
import { Months } from "../Months";

// Test Methods --------------------------------------------------------------

describe("Months", () => {
  describe("decrement()", () => {
    it("should pass on valid input", () => {
      expect(Months.decrement("2022-06", 2)).toBe("2022-04");
      expect(Months.decrement("2022-06", 6)).toBe("2021-12");
    });
  });

  describe("end()", () => {
    it("should pass on valid input", () => {
      expect(Months.end("2020-02")).toBe("2020-02-29");
      expect(Months.end("2022-02")).toBe("2022-02-28");
      expect(Months.end("2022-06")).toBe("2022-06-30");
      expect(Months.end("2022-07")).toBe("2022-07-31");
    });
  });

  describe("increment()", () => {
    it("should pass on valid input", () => {
      expect(Months.increment("2022-06", 2)).toBe("2022-08");
      expect(Months.increment("2022-11", 6)).toBe("2023-05");
    });
  });

  describe("start()", () => {
    it("should pass on valid input", () => {
      expect(Months.start("2020-02")).toBe("2020-02-01");
      expect(Months.start("2022-02")).toBe("2022-02-01");
      expect(Months.start("2022-06")).toBe("2022-06-01");
      expect(Months.start("2022-07")).toBe("2022-07-01");
    });
  });

  describe("today()", () => {
    it("should pass on valid input", () => {
      const TODAY = Dates.today();
      expect(Months.today()).toBe(TODAY.substring(0, 7));
    });
  });
});
