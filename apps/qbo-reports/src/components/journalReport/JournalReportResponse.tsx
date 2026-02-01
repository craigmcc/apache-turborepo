/**
 * Retrieve a Journal Report from the QuickBooks API, and
 * render it with the QBReportTable component.
 *
 * NOTE: This is a server component, so we can make the API call directly here.
 */

// External Modules ----------------------------------------------------------

import { fetchApiInfo } from "@repo/qbo-api/AuthFunctions";
import { QBReportTable } from "@repo/shared-components/QBReportTable";
import { serverLogger as logger } from "@repo/shared-utils/*";
import { Container } from "react-bootstrap";

// Internal Modules ----------------------------------------------------------


// Public Objects ------------------------------------------------------------

type JournalReportResponseProps = {
  // Array of columns to include in the report [Report Default Columns]
  columns?: COLUMN_NAME[];
  // End date for the report (YYYY-MM-DD)
  endDate: string;
  // Array of columns to sort by [acct_num_with_extn,tx_date]
  sortBy?: COLUMN_NAME[];
  // Sort order [ascend]
  sortOrder?: SORT_ORDER;
  // Start date for the report (YYYY-MM-DD)
  startDate: string;
}

export async function JournalReportResponse({
  columns,
  endDate,
  sortBy = ["acct_num_with_extn", "tx_date"],
  sortOrder = "ascend",
  startDate,
}:  JournalReportResponseProps){

  // Validate date properties
  if (!isValidYMD(startDate)) {
    return (
      <div className="text-bg-danger text-danger">
        Invalid startDate: must be in YYYY-MM-DD and a real calendar date.
      </div>
    )
  }
  if (!isValidYMD(endDate)) {
    return (
      <div className="text-bg-danger text-danger">
        Invalid endDate: must be in YYYY-MM-DD and a real calendar date.
      </div>
    )
  }
  if (endDate < startDate) {
    return (
      <div className="text-bg-danger text-danger">
        Invalid endDate: must be on or after startDate.
      </div>
    )
  }

  // Assemble comma delimited column and sortBy params
  const columnParam = columns ? columns.join(",") : undefined;
  const sortByParam = sortBy.join(",");

  // Set up the report request
  const apiInfo = await fetchApiInfo(API_TIMEOUT);
  const url = new URL(`${apiInfo.baseUrl}/v3/company/${apiInfo.realmId}/reports/JournalReport`);
  if (columnParam) {
    url.searchParams.set("columns", columnParam);
  }
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("sort_by", sortByParam);
  url.searchParams.set("sort_order", sortOrder);
  url.searchParams.set("start_date", startDate);

  // Perform the report request
  let jsonString: string = "";
  logger.info({
    context: "JournalReportResponse.requesting",
    url: url.toString(),
  });
  const response = await fetch(url, {
    // TODO: turn caching off
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${apiInfo.accessToken}`,
    }
  });
  if (!response.ok) {
    const text = JSON.stringify(response.body, null, 2);
    logger.error({
      context: "JournalReportResponse.error",
      body: response.body,
      status: response.status,
      text,
    });
    return (
      <div className="text-bg-danger text-danger">
        Error fetching Journal report: {text}
      </div>
    );
  } else {
    jsonString = await response.text();
    logger.info({
      context: "JournalReportResponse.response",
      json: JSON.stringify(jsonString, null, 2),
      length: jsonString.length,
    })
  }

  return (
    <Container fluid>
      <QBReportTable
        reportJsonText={jsonString}
      />
    </Container>
  );

}

// Private Objects -----------------------------------------------------------

// Timeout for API requests (in milliseconds) must allow sufficient time
// for a user to manually authenticate if necessary.
const API_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Supported column names for this report.
// Those marked "Default" are included if no columns are specified.
type COLUMN_NAME =
  "account_name" |          // Default
  "acct_num_with_extn" |    // Default
  "create_by" |
  "credit_amt" |            // Default
  "create_date" |
  "debt_amt" |              // Default
  "doc_num" |               // Default
  "due_date" |              // Default
  "is_ap_paid" |            // Default
  "is_ar_paid" |            // Default
  "item_name" |
  "journal_code_name" |     // Default
  "last_mod_by" |
  "last_mod_date" |
  "memo" |                  // Default
  "name" |
  "neg_open_bal" |
  "paid_date" |             // Default
  "pmt_mthd" |              // Default
  "quantity" |
  "rate" |
  "tx_date" |                // Default
  "txn_num" |                // Default
  "txn_type"                 // Default
  ;

export type SORT_ORDER = "ascend" | "descend";

function isValidYMD(dateString: string): boolean {
  // Check format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  // Check if it's a real date
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) {
    return false;
  }
  return date.toISOString().startsWith(dateString);
}

