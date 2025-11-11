/**
 * API route to serve bills data from a CSV file.
 */

// External Imports ----------------------------------------------------------

import { dbBill} from "@repo/bill-db/*";
import { isAccountInGroup } from "@repo/shared-utils/*";
import { NextRequest } from "next/server";

// Internal Imports ----------------------------------------------------------

import {
  formatAccountNumberAndName,
  formatBillAmount,
  formatBillDueDate,
  formatBillExchangeRate,
  formatBillInvoiceDate,
  formatBillInvoiceNumber,
  formatBillPaidAmount,
  formatVendorName
} from "@/lib/Formatters";
import { BillPlus } from "@/types/types";

// Public Objects ------------------------------------------------------------

/**
 * GET /api/bills.csv?{queryParameters}
 *
 * Query Parameters (all are required):
 * - accountGroup - Name of the account group for which to retrieve bills
 * - fromDate - Start date for filtering bills (YYYY-MM-DD)
 * - toDate - End date for filtering bills (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {

  // Accumulator for errors
  const errors: string[] = [];

  const searchParams = request.nextUrl.searchParams;
  const accountGroup = searchParams.get("accountGroup");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  if (!accountGroup) {
    errors.push("Missing required parameter: accountGroup");
  }
  if (!fromDate) {
    errors.push("Missing required parameter: fromDate");
  }
  if (!toDate) {
    errors.push("Missing required parameter: toDate");
  }
  // TODO: Validate fromDate and toDate parameters formats?

  // If we have errors so far, return them
  if (errors.length > 0) {
    return returnErrors(errors);
  }

  // Select the bills by date range, and filter by accountGroup
  const bills = await lookupBillsByInvoiceDate(fromDate!, toDate!);
  const filteredBills = bills.filter(bill =>
    isAccountInGroup(bill.classifications?.account?.accountNumber, accountGroup!)
  );

  // Return a CSV response containing the filtered bills
  const rawHeaders = [
    "Vendor Name", "Invoice Date", "Invoice Number", "Due Date",
    "Total (USD)", "Paid (Local)", "Exchange Rate", "GL Account", "Archived"
  ];
  const headers: string[] = [];
  rawHeaders.forEach(header => { headers.push(enquote(header))});
  return returnData(headers, filteredBills, accountGroup!, fromDate!, toDate!);

}

// Private Objects -----------------------------------------------------------

/**
 * Add quotes around the specified value.  If the value has a single quote or
 * double quote inside it, the opposite will be used to avoid needing escapes.
 */
function enquote(value: string) {
  if (value.includes('"')) {
    return "'" + value + "'";
  } else {
    return '"' + value + '"';
  }
}

/**
 * Retrieve all bills in the specified date range (will be filtered by accountGroup separately).
 */
async function lookupBillsByInvoiceDate(fromDate: string, toDate: string): Promise<BillPlus[]> {

  return await dbBill.bill.findMany({
    include: {
      classifications: {
        include: {
          account: true,
        },
      },
      vendor: true,
    },
    orderBy: [
      { classifications: { account: { accountNumber: "asc" } } },
      { invoiceDate: "asc" },
    ],
    where: {
      invoiceDate: {
        gte: fromDate,
        lte: toDate,
      }
    }
  });

}

/**
 * Return a completed CSV response with the filtered data.
 */
function returnData(headers: string[], bills: BillPlus[], accountGroup: string, fromDate: string, toDate: string): Response {
  let csvContent: string = headers.map(header => header).join(",") + "\n";
  for (const bill of bills) {
    const row: string[] = [];
    row.push(enquote(formatVendorName(bill.vendor)));
    row.push(enquote(formatBillInvoiceDate(bill)));
    row.push(enquote(formatBillInvoiceNumber(bill)));
    row.push(enquote(formatBillDueDate(bill)));
    row.push(enquote(formatBillAmount(bill)));
    row.push(enquote(formatBillPaidAmount(bill)));
    row.push(enquote(formatBillExchangeRate(bill)));
    row.push(enquote(formatAccountNumberAndName(bill.classifications?.account)));
    row.push(enquote(bill.archived ? "Yes" : "No"));
    csvContent += row.join(",") + "\n";
  }
  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="Bill-${accountGroup}-${fromDate}-${toDate}.csv"`,
      "Content-Type": "text/csv",
    },
  });
}

/**
 * Return errors as a simplified CSV response.
 */
function returnErrors(errors: string[]): Response {
  const csvContent = '"Errors"\n'
    + errors.map(e => `"${e.replace(/"/g, '""')}"`).join("\n");
  return new Response(csvContent, {
    status: 400,
    headers: { "Content-Type": "text/csv" },
  });
}
