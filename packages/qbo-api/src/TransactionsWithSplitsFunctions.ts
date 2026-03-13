/**
 * Server-only actions for Transactions with Splits.  WARNING: This API is for a
 * custom report, so returns data of the Report type (see QboReportTypes)
 * This data does *not* include a unique primary key for each row, so our
 * typical use of Prisma's "upsert" functionality is not possible.  Instead, we
 * will need to delete all existing data (for a given date range), before
 * inserting the new data.
 */

// External Modules ----------------------------------------------------------

import { parseReport } from "@repo/qbo-api/QboReportParser";
import { Report } from "@repo/qbo-api/types/QboReportTypes";
import { ParsedReport } from "@repo/qbo-api/types/QboReportParsedTypes";
import { QboApiInfo } from "@repo/qbo-api/types/Types";
import { serverLogger as logger } from "@repo/shared-utils";
import z from "zod";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

/**
 * Selection properties for TransactionWithSplits report data.
 */
export type TransactionsWithSplitsParams = {
  // End date to select transactions (YYYY-MM-DD)
  endDate: string;
  // Start date to select transactions (YYYY-MM-DD)
  startDate: string;
}

/**
 * Fetch TransactionsWithSplits report data from the QBO API, for the given date range.
 *
 * @param apiInfo - QBO API connection information, including base URL and access token
 * @param params - Selection parameters for the report, including start and end dates (YYYY-MM-DD)
 *
 * @throws Error if parameter validation fails, or if the API request fails or returns an error response
 */
export async function fetchTransactionsWithSplits(apiInfo: QboApiInfo, params: TransactionsWithSplitsParams): Promise<ParsedReport> {

  // Validate parameters
  const parseResult = ParamsSchema.safeParse(params);
  if (!parseResult.success) {
    logger.error({
      context: "TransactionsWithSplitsFunctions.fetchTransactionsWithSplits",
      message: "Invalid parameters",
      errors: parseResult.error.errors,
      params,
    });
    throw new Error("Invalid parameters: " + JSON.stringify(parseResult.error.errors));
  }
  const { startDate, endDate } = parseResult.data;

  // Construct API URL with query parameters
  const url = new URL(`${apiInfo.baseUrl}/v3/company/${apiInfo.realmId}/reports/TransactionListWithSplits`);
  url.searchParams.set("columns", "tx_date,txn_type,doc_num,name,memo,account_name,nat_amount");
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("group_by", "Account");
  url.searchParams.set("minversion", apiInfo.minorVersion);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("sort_by", "account_name,tx_date");
  url.searchParams.set("sort_order", "ascend");
  logger.info({
    context: "TransactionsWithSplitsFunctions.fetchTransactionsWithSplits",
    outboundUrl: url,
  });

  // Fetch the report data from QBO and report any server-reported errors
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${apiInfo.accessToken}`,
    }
  });
  if (!response.ok) {
    logger.error({
      context: "TransactionsWithSplitsFunctions.fetchTransactionsWithSplits",
      message: "Failed to fetch TransactionListWithSplits report",
      url,
      body: response.body,
      status: response.status,
    });
    const text = JSON.stringify(response.body, null, 2);
    throw new Error(`Error fetching TransactionListWithSplits report: ${text}`);
  }

  // Parse and return the report data, or report any parsing errors
  try {
    const report = await response.json() as Report;
    return ( parseReport(report) );
  } catch (err) {
    logger.error({
      context: "TransactionsWithSplitsFunctions.fetchTransactionsWithSplits",
      message: "Error parsing TransactionListWithSplits report",
      error: err instanceof Error ? err.message : String(err),
      url,
      response: response.body,
    });
    throw new Error("Error parsing TransactionListWithSplits report: " + (err instanceof Error ? err.message : String(err)));
  }

}

// Private Objects -----------------------------------------------------------

const ParamsSchema = z.object({
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be in YYYY-MM-DD format"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be in YYYY-MM-DD format"),
}).refine((data) => {
  return data.endDate >= data.startDate;
}, {
  message: 'endDate must be the same as or after startDate',
  path: ['endDate'], // attach the error to endDate
});
