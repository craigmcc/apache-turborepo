/**
 * Create a Account from a QboAccount.
 */

// External Modules ----------------------------------------------------------

import { QboAccount } from "@repo/qbo-api/types/Finance";
import { Account } from "@repo/qbo-db/*";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

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
