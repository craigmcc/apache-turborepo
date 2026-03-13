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
import { serverLogger as logger } from "@repo/shared-utils";

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

  // Load a map of account numbers to account IDs
  const accounts = await dbQbo.account.findMany({
    select: {
      id: true,
      acctNum: true,
    },
    where: {
      acctNum: {
        not: null,
      },
    }
  });
  const accountMap = new Map<string, string>();
  for (const account of accounts) {
    accountMap.set(account.acctNum!, account.id);
  }
  logger.info({
    context: "qbo-upload.accounts",
    accounts: accounts.length,
  });

  // Delete all existing transactions in the database
  const deleteResult = await dbQbo.transaction.deleteMany({});
  logger.info({
    context: "qbo-upload.deleted",
    deletedCount: deleteResult.count,
  });

// Write non-skipped rows to the database
  let rowsAccountsMissing = 0;
  let rowsSkipped = 0;
  let rowsKept = 0;
//  let rowsZero = 0;
  for (const row of rows) {
    if (row[1] === "Date") { // This is the header row
      continue;
    }
    if (row[0] !== "") {
      rowsSkipped++;
      if (rowsSkipped < 20) {
        logger.trace({
          context: "qbo-upload.csv-row-skipped",
          row,
        });
      }
/*
    } else if (Number(row[9]) === 0) {
      rowsZero++;
      if (rowsZero < 20) {
        logger.trace({
          context: "qbo-upload.csv-row-zero   ",
          row,
        });
      }
*/
    } else if (!accountMap.has(row[6]!.substring(0, 4))) {
      rowsAccountsMissing++;
      if (rowsAccountsMissing < 20) {
        logger.trace({
          context: "qbo-upload.csv-row-account",
          row,
        });
      }
    } else {
      rowsKept++;
      if (rowsKept < 20) {
        logger.trace({
          context: "qbo-upload.csv-row-kept   ",
          row,
        });
      }
      // Parse amount from columns 7 (positive) or 8 (negative). Trim and remove commas first.
      const rawAmountStr: string | null = (row[7] && row[7]!.length > 0)
        ? row[7]!.trim().replace(/,/g, "")
        : ((row[8] && row[8]!.length > 0)
            ? `-${row[8]!.trim().replace(/,/g, "")}`
            : null);
      let parsedAmount: number | null = null;
      if (rawAmountStr !== null) {
        const p = parseFloat(rawAmountStr);
        parsedAmount = Number.isFinite(p) ? p : null;
      }
      const amount = parsedAmount;
      const transaction: Transaction = {
        id: BigInt(rowsKept), // use row index as ID since report data does not include a unique identifier
        date: rearrangeDate(row[1]!),
        type: row[2] || null,
        documentNumber: row[3] || null,
        name: row[4] || null,
        memo: row[5] || null,
        accountId: accountMap.get(row[6]!.substring(0, 4))!,
        amount: amount,
      };
      await dbQbo.transaction.create({data: transaction});
/*
      if (transaction.documentNumber === "23345") {
        logger.info({
          context: "qbo-upload.csv-row-created",
          row,
          transaction,
        });
      }
*/
    }
  }
  logger.info({
    context: "qbo-upload.csv-validation",
    rowsAccountsMissing,
    rowsSkipped,
    rowsKept,
//    rowsZero,
  });

  // TODO - Upload the rows to the QBO database

}

function rearrangeDate(input: string): string {
  return input.substring(6, 10) + "-"
    + input.substring(0, 2) + "-"
    + input.substring(3, 5);
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
