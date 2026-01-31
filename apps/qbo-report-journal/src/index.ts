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
import { fetchApiInfo } from "@repo/qbo-api/AuthFunctions";

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
    context: "qbo-report-journal.parameters",
    startDate: args.values.startDate,
    endDate: args.values.endDate,
    to: args.values.to,
  });

  // Set up the report request
  const apiInfo = await fetchApiInfo(API_TIMEOUT);
  const url = new URL(`${apiInfo.baseUrl}/v3/company/${apiInfo.realmId}/reports/JournalReport`);
  // Accept the default columns for now
  url.searchParams.set("end_date", args.values.endDate);
  url.searchParams.set("sort_by", "acct_num_with_extn,tx_date");
  url.searchParams.set("sort_order", "ASCENDING");
  url.searchParams.set("start_date", args.values.startDate);

  // Perform the report request
  log({
    context: "qbo-report-journal.requesting",
    url: url.toString(),
  });
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${apiInfo.accessToken}`,
    }
  });
  if (!response.ok) {
    log({
      context: "qbo-report-journal.error",
      body: response.body,
      status: response.status,
    });
    const text = JSON.stringify(response.body, null, 2);
    throw new Error(`Error fetching Journal report: ${text}`);
  }
  const json = await response.json();
  log({
    context: "qbo-report-journal.received",
    status: response.status,
  });

  // Forward the response data to the output
  if (args.values.to) {
    fs.writeFileSync(args.values.to, JSON.stringify(json, null, 2) + "\n");
  } else {
    process.stdout.write(JSON.stringify(json, null, 2) + "\n");
  }

}

// Main Program --------------------------------------------------------------

main()
  .then(() => {
    exit(0);
  });
