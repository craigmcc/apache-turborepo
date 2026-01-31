/**
 * Refresh Accounts from QuickBooks Online.
 */

// External Modules ----------------------------------------------------------

import { fetchAccounts } from "@repo/qbo-api/AccountFunctions";
import { QboAccount } from "@repo/qbo-api/types/Finance";
import { QboApiInfo } from "@repo/qbo-api/types/Types";
import { dbQbo, Account } from "@repo/qbo-db/*";
import { serverLogger as logger} from "@repo/shared-utils/*";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export async function refreshAccounts(
  apiInfo: QboApiInfo,
): Promise<void> {

  // Fetch all accounts from QBO API
  const accounts = await fetchAllAccounts(apiInfo);
  logger.info({
    context: "AccountsRefresher.refreshAccounts.fetched",
    totalAccounts: accounts.length,
  })

  // Normalize IDs and build initial maps
  const idToAccount = new Map<string, Account>();
  const indegree = new Map<string, number>();
  const children = new Map<string, string[]>();

  for (const account of accounts) {
    const normId = String(account.id).trim();
    account.id = normId;
    // normalize parentId as well (keep null if absent)
    account.parentId = account.parentId ? String(account.parentId).trim() : null;

    idToAccount.set(normId, account);
    indegree.set(normId, 0);
    children.set(normId, []);
  }

  // Track parent IDs referenced that are not in the fetched set
  const referencedParents = new Set<string>();

  // Populate indegree and children adjacency
  for (const account of accounts) {
    const parentId = account.parentId;
    if (parentId && idToAccount.has(parentId)) {
      indegree.set(account.id, (indegree.get(account.id) ?? 0) + 1);
      children.get(parentId)!.push(account.id);
    } else if (parentId) {
      // parent is referenced but not in the fetched set
      referencedParents.add(parentId);
    }
  }

  // If some parents are referenced but not in the fetched set, check DB for them.
  // If they are not present in DB either, fail early - otherwise treat them as already present.
  if (referencedParents.size > 0) {
    const missingInDb: string[] = [];
    for (const pid of referencedParents) {
      const existing = await dbQbo.account.findUnique({ where: { id: pid } });
      if (!existing) missingInDb.push(pid);
    }
    if (missingInDb.length > 0) {
      /*
            throw new Error(
              `Missing parent accounts: ${missingInDb.join(", ")}. ` +
              `Either include them in the fetch or create them in DB before proceeding.`
            );
      */
      logger.warn({
        context: "AccountsRefresher.refreshAccounts.missingParents",
        message: "Creating placeholder accounts for missing parents",
        missingParentIds: missingInDb,
      });
      // Create placeholder accounts for missing parents
      for (const pid of missingInDb) {
        const placeholder: Account = {
          id: pid,
          createTime: null,
          domain: null,
          lastUpdatedTime: null,
          accountSubType: null,
          accountType: null,
          acctNum: null,
          active: null,
          classification: null,
          currencyRefName: null,
          currencyRefValue: null,
          currentBalance: null,
          description: null,
          fullyQualifiedName: null,
          name: `Placeholder Account ${pid}`,
          parentId: null,
          subAccount: null,
        };
        await dbQbo.account.create({ data: placeholder });
      }
    }
    // If parents exist in DB, children can be treated as having their parent already inserted.
  }

  // Kahn's algorithm: start with nodes of indegree 0
  const queue: string[] = [];
  for (const [id, deg] of indegree) {
    if (deg === 0) queue.push(id);
  }

  const orderedIds: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    orderedIds.push(id);
    for (const childId of children.get(id) ?? []) {
      indegree.set(childId, (indegree.get(childId) ?? 1) - 1);
      if (indegree.get(childId) === 0) queue.push(childId);
    }
  }

  // If not all nodes processed, there's a cycle among the provided accounts
  if (orderedIds.length !== accounts.length) {
    const unprocessed = accounts
      .filter(a => !orderedIds.includes(a.id))
      .map(a => a.id);
    throw new Error(`Cycle detected among accounts: ${unprocessed.join(", ")}`);
  }

  // Insert in topologically sorted order (parents before children)
  for (const id of orderedIds) {
    const account = idToAccount.get(id)!;
    logger.trace({
      context: "AccountsRefresher.upserting",
      id: account.id,
      acctNum: account.acctNum,
      parentId: account.parentId,
      name: account.name,
    });
    try {
      await dbQbo.account.upsert({
        where: {id: account.id},
        create: account,
        update: account,
      });
    } catch (error) {
      logger.error({
        context: "AccountsRefresher.upsert.error",
        id: account.id,
        acctNum: account.acctNum,
        name: account.name,
        parentId: account.parentId,
        error,
      });
      throw error;
    }
  }

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
    active: qboAccount.Active || false,
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
async function fetchAllAccounts(apiInfo: QboApiInfo): Promise<Account[]> {

  const accounts: Account[] = [];
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
        accounts.push(account);
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
