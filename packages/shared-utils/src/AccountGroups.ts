/**
 * Shared utility for defining GL account groups, and for identifying GL accounts
 * that are part of a particular account group.
 */

// Internal Modules ----------------------------------------------------------

import accountGroupsData from "./AccountGroups.json";
type AccountGroupsDataType = typeof accountGroupsData;

// Public Objects ------------------------------------------------------------

export type AccountGroupRange = {
  start: string;
  end: string;
}

export type AccountGroup = {
  groupName: string;
  groupRanges: AccountGroupRange[];
  groupType: string;
};

/**
 * Is the given account number part of the specified account group?
 */
export function isAccountInGroup(
  accountNumber: string | null | undefined,
  groupName: string,
): boolean {
  if (!accountNumber) {
    return false;
  }
  const accountGroup = getAccountGroupByName(groupName);
  if (!accountGroup) {
    return false;
  }
  for (const range of accountGroup.groupRanges) {
    if ((accountNumber >= range.start) && (accountNumber <= range.end)) {
      return true;
    }
  }
  return false;
}

/**
 * Look up and return the Account Group definition for the specified group name,
 * if it exists.
 */
export function getAccountGroupByName(
  groupName: string,
): AccountGroup | null {
  const accountGroup = ACCOUNT_GROUPS_MAP.get(groupName);
  return accountGroup || null;
}

export const ACCOUNT_GROUPS = (accountGroupsData as AccountGroupsDataType);

export const ACCOUNT_GROUPS_MAP: Map<string, AccountGroup> = new Map();
for (const group of ACCOUNT_GROUPS) {
  ACCOUNT_GROUPS_MAP.set(group.groupName, group);
}
