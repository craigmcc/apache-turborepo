/**
 * Refresh Accounts from QuickBooks Online.
 */

// External Modules ----------------------------------------------------------

import { fetchAccounts } from "@repo/qbo-api/AccountActions";
import { QboAccount } from "@repo/qbo-api/types/Finance";
import { QboApiInfo } from "@repo/qbo-api/types/Types";
import { dbQbo, Account } from "@repo/qbo-db/*";
import { serverLogger as logger} from "@repo/shared-utils/*";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export async function refreshAccounts(apiInfo: QboApiInfo): Promise<void> {

  const accounts = await fetchAllAccounts(apiInfo);
  const storedIds: Set<string> = new Set(); // IDs of accounts already stored

  // STEP 1 - Store all accounts that are not subaccounts
  for (const account of accounts.values()) {
    if (!account.parentId) {
      await dbQbo.account.upsert({
        where: {
          id: account.id,
        },
        create: account,
        update: account,
      });
      storedIds.add(account.id);
    }
  }
  logger.info({
    context: "AccountsRefresher.refreshAccounts.step1",
    nonSubaccounts: storedIds.size,
    totalAccounts: accounts.size,
  })

  // STEP 2 - Recursively store subaccounts where the parent has already been stored
  while (true) {
    for (const account of accounts.values()) {
      if (account.parentId && !storedIds.has(account.id) && storedIds.has(account.parentId)) {
        await dbQbo.account.upsert({
          where: {
            id: account.id,
          },
          create: account,
          update: account,
        });
        storedIds.add(account.id);
      }
    }
    if (storedIds.size === accounts.size) {
      break;
    }
  }
  logger.info({
    context: "AccountsRefresher.refreshAccounts.step2",
    totalStored: storedIds.size,
    totalAccounts: accounts.size,
  });

}

// Private Objects -----------------------------------------------------------

export function createAccount(qboAccount: QboAccount): Account {
  return {
    id: qboAccount.Id || "", // should never be missing
    // IntuitEntity fields
    createTime: qboAccount.MetaData?.CreateTime || null,
    domain: qboAccount.domain || null,
    lastUpdatedTime: qboAccount.MetaData?.LastUpdatedTime || null,
    // Account fields
    accountSubType: qboAccount.AccountSubType || null,
    accountType: qboAccount.AccountType || null,
    acctNum: qboAccount.AcctNum || null,
    active: qboAccount.Active || null,
    classification: qboAccount.Classification || null,
    currencyRefName: qboAccount.CurrencyRef?.name || null,
    currencyRefValue: qboAccount.CurrencyRef?.value || null,
    currentBalance: qboAccount.CurrentBalance || null,
    description: qboAccount.Description || null,
    fullyQualifiedName: qboAccount.FullyQualifiedName || null,
    name: qboAccount.Name || null,
    parentId: qboAccount.ParentRef?.value || null,
    subAccount: qboAccount.SubAccount || null,
  };
}

const MAX_RESULTS = 100; // Maximum results per QBO API request

/**
 * Fetch all Accounts from QBO API after converting them to local models.
 */
async function fetchAllAccounts(apiInfo: QboApiInfo): Promise<Map<string, Account>> {

  const accounts: Map<string, Account> = new Map();
  let startPosition = 1;

  while (true) {

    const qboAccounts = await fetchAccounts(apiInfo, {
      startPosition: startPosition,
      maxResults: MAX_RESULTS,
    });

    for (const qboAccount of qboAccounts) {
      const account = createAccount(qboAccount);
      if (account.id === "") {
        logger.warn({
          context: "AccountRefresher.fetchAllAccounts",
          message: "Skipping account with missing ID",
          qboAccount: qboAccount,
        });
      } else {
        accounts.set(account.id, account);
      }
    }

    if (qboAccounts.length < MAX_RESULTS) {
      break;
    } else {
      startPosition += MAX_RESULTS;
    }

  }

  return accounts;

}
