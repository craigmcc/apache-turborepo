/**
 * Refresh Customers from QuickBooks Online.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { fetchCustomers } from "@repo/qbo-api/CustomerFunctions";
import { QboCustomer } from "@repo/qbo-api/types/IntuitNameTypes";
import { QboApiInfo } from "@repo/qbo-api/types/Types";
import { dbQbo, Customer } from "@repo/qbo-db/*";
import {serverLogger as logger} from "@repo/shared-utils";

// Public Objects ------------------------------------------------------------

export async function refreshCustomers(
  apiInfo: QboApiInfo,
): Promise<void> {

  // Fetch all customers from QBO API
  const qboCustomers = await fetchAllCustomers(apiInfo);
  logger.info({
    context: "CustomersRefresher.refreshCustomers.fetched",
    totalCustomers: qboCustomers.length,
  });

  // Add the Customers to the database
  let count = 0;
  for (const qboCustomer of qboCustomers) {
    const customer = createCustomer(qboCustomer);
    await dbQbo.customer.upsert({
      where: {id: customer.id},
      create: customer,
      update: customer,
    });
    count++;
  }
  logger.info({
    context: "CustomersRefresher.refreshCustomers.upserted",
    count: count,
  });

}

// Private Objects -------------------------------------------------

function createCustomer(qboCustomer: QboCustomer): Customer {
  return {
    id: qboCustomer.Id || "", // Should never be missing
    createTime: qboCustomer.MetaData?.CreateTime || null,
    domain: qboCustomer.domain || null,
    lastUpdatedTime: qboCustomer.MetaData?.LastUpdatedTime || null,
    active: qboCustomer.Active || null,
    currency: qboCustomer.CurrencyRef?.value || null,
    email: qboCustomer.PrimaryEmailAddr?.Address || null,
    name: qboCustomer.FullyQualifiedName || null,
  }
}

async function fetchAllCustomers(
  apiInfo: QboApiInfo,
): Promise<QboCustomer[]> {

  const allCustomers: QboCustomer[] = [];
  let startPosition = 1;
  const maxResults = 1000;

  while (true) {
    const fetched = await fetchCustomers(apiInfo, {
      startPosition,
      maxResults,
    });
    allCustomers.push(...fetched);
    if (fetched.length < maxResults) {
      break;
    }
    startPosition += fetched.length;
  }

  return allCustomers;

}
