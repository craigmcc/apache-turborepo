/**
 * Convenience functions to construct date/time representations as strings
 * from Javascript Date objects, in either local time (YYYYMMDD-HHMMSS) format,
 * adjusted for the local time zone, or in ISO format (yyyy-mm-ddThh:mm:ss+nn)
 * with a timezone offset (+/-) in hours.
 *
 * @packageDocumentation
 */

// Public Objects ------------------------------------------------------------

const Timestamps = {
  /**
   * Return a timestamp string in ISO format (yyyy-mm-ddThh:mm:ss+nn) for the
   * specified JavaScript date.  Based on:
   * https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript
   *
   * @param {Date} date               Date to render (default is current date/time)
   * @return {string}                 yyyy-mm-ddThh:mm:ss+nn
   */
  iso(date: Date = new Date()): string {
    return (
      date.getFullYear() +
      "-" +
      leftPad(date.getMonth() + 1, 2) +
      "-" +
      leftPad(date.getDate(), 2) +
      "T" +
      leftPad(date.getHours(), 2) +
      ":" +
      leftPad(date.getMinutes(), 2) +
      ":" +
      leftPad(date.getSeconds(), 2) +
      localOffset(date)
    );
  },

  /**
   * Return a string in a useful format for logging (yyyymmdd-hhmmss), adjusted
   * for the local time zone.
   *
   * @param {Date} date               Date to render (default is current date/time)
   * @return {string}                 yyyymmdd-hhmmss
   */
  local(date: Date = new Date()): string {
    return (
      date.getFullYear() +
      leftPad(date.getMonth() + 1, 2) +
      leftPad(date.getDate(), 2) +
      "-" +
      leftPad(date.getHours(), 2) +
      leftPad(date.getMinutes(), 2) +
      leftPad(date.getSeconds(), 2)
    );
  },
};

export default Timestamps;

// Private Objects -----------------------------------------------------------

// Zero-pad the input string with zeros until it is of the requested size.
const leftPad = (input: string | number, size: number): string => {
  let output = String(input);
  while (output.length < size) {
    output = "0" + output;
  }
  return output;
};

// Return a local timezone offset string in the format required by ISO 8601.
const localOffset = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  return (
    (offset < 0 ? "+" : "-") +
    leftPad(Math.floor(Math.abs(offset / 60)), 2) +
    ":" +
    leftPad(Math.abs(offset % 60), 2)
  );
};
