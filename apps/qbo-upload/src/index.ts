/**
 * Application that uploads the data from an exported QBO "General Ledger"
 * link, then (the download is an Excel file) converts to CSV, and now
 * uploads to the QBO database.
 *
 * Command Line Options:
 *   --from PATH                        The CSV file to upload (required)
 */

// External Modules ----------------------------------------------------------

import { parse } from "csv-parse/sync";
import fs from "node:fs";
import { exit } from "node:process";
import { parseArgs } from "node:util";
import { dbQbo, Transaction } from "@repo/qbo-db/*";
import { serverLogger as logger } from "@repo/shared-utils/*";

// Internal Modules -----------------------------------------------------------

// Private Objects ------------------------------------------------------------

export async function main() {

  // Process command line arguments
  const args = parseArgs({
    options: {
      from: {
        type: "string",
      },
    },
    strict: true,
  });
/*
  if (!args.values.from) {
    throw new Error("from argument is required");
  }
*/
  logger.info({
    context: "qbo-upload.parameters",
    from: args.values.from,
  });
  const filePath =  // args.values.from;
    "General_ledger.csv";

  // Load and parse the CSV file
  const input = fs.readFileSync(filePath, "utf-8");
  const rows = parse(input, {
//    columns: true,
    from_line: 6, // Skip the first 5 lines of metadata
    skip_empty_lines: true,
//    to: 10000,
  });
  logger.info({
    context: "qbo-upload.csv",
    rows: rows.length,
  })

  // Validate that we can skip the correct rows
  let rowsSkipped = 0;
  let rowsKept = 0;
  for (const row of rows) {
    if (row[0] !== "") {
      logger.info({
        context: "qbo-upload.csv-row-skipped",
        row,
      });
      rowsSkipped++;
    } else {
      rowsKept++;
      if (rowsKept < 20) {
        logger.info({
          context: "qbo-upload.csv-row-kept   ",
          row,
        });
      }
    }
  }
  logger.info({
    context: "qbo-upload.csv-validation",
    rowsSkipped,
    rowsKept,
  });

  // TODO - Upload the rows to the QBO database

}

// Main Program ----------------------------------------------------------------

main()
  .then(() => {
    exit(0);
  })
/*
  .catch((error) => {
    logger.error({
      context: "qbo-upload.error",
      error,
    })
    exit(1);
  });
*/
