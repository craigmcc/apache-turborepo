/**
 * Application that generates journal reports from the QBO online API.
 * The output will be JSON data written to standard output or to a specified file.
 *
 * Command Line Options:
 *   --endDate YYYY-MM-DD    End date for included journal entries (required)
 *   --startDate YYYY-MM-DD  Start date for included journal entries (required)
 *   --to {filename}         Output file (default is standard output,
 *                           but it will have pnpm stuff at the beginning
 *                           unless you do "pnpm run --silent <script> <args> 2>{errorfile}")
 */

// External Modules ----------------------------------------------------------

import fs from "node:fs";
import { exit } from "node:process";
import { parseArgs } from "node:util";
import { fetchApiInfo } from "@repo/qbo-api/AuthActions";

// Private Objects -----------------------------------------------------------

// Log the specified data to standard error, as JSON.
function log(input: object) {
  const output: object = {
    timestamp: new Date().toLocaleString(),
  }
  Object.assign(output, input);
  process.stderr.write(JSON.stringify(output, null, 2) + "\n");
}

// Timeout for API requests (in milliseconds) must allow sufficient time
// for a user to manually authenticate if necessary.
const API_TIMEOUT = 5 * 60 * 1000; // 5 minutes

async function main() {

  // Process command line arguments
  const args = parseArgs({
    options: {
      endDate: {
        type: "string",
      },
      startDate: {
        type: "string",
      },
      to: {
        type: "string",
      }
    },
    strict: true,
  });
  if (!args.values.endDate) {
    throw new Error("endDate argument is required");
  }
  if (!args.values.startDate) {
    throw new Error("startDate argument is required");
  }
  if (args.values.endDate < args.values.startDate) {
    throw new Error("endDate must be on or after startDate");
  }
  log({
    context: "qbo-report-journal.started",
    startDate: args.values.startDate,
    endDate: args.values.endDate,
  });

  // Execute the report request
  const apiInfo = await fetchApiInfo(API_TIMEOUT);
  // ...
  const result = {
    report: "journal",
    startDate: args.values.startDate,
    endDate: args.values.endDate,
  }

  // Send the result to the specified destination
  if (args.values.to) {
    fs.writeFileSync(args.values.to, JSON.stringify(result, null, 2) + "\n");
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  }

}

// Main Program --------------------------------------------------------------

main()
  .then(() => {
    exit(0);
  });
