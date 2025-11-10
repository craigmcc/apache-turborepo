/**
 * Shared utility for defining GL account groups, and for identifying GL accounts
 * that are part of a particular account group.
 */

// Public Objects ------------------------------------------------------------

export type AccountGroupRange = {
  start: string;
  end: string;
}

export type AccountGroup = {
  groupName: string;
  groupRanges: AccountGroupRange[];
  groupType: "All"  | "Departmental" | "Ledger";
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
  const accountGroup = ACCOUNT_GROUPS_MAP.get(groupName);
  if (!accountGroup) {
    return false;
  }
  for (const range of accountGroup.groupRanges) {
    if ((accountNumber >= range.start) && (accountNumber <= range.end)) {
//      console.log("[debug] Account " + accountNumber + " is in group " + groupName);
      return true;
    }
  }
  console.log("[debug] Account " + accountNumber + " is NOT in group " + groupName);
  return false;
}

export const ACCOUNT_GROUPS: ReadonlyArray<AccountGroup> = [
  // All Account Groups
  {
    groupName: "All",
    groupRanges: [
      { start: "0000", end: "9999" },
    ],
    groupType: "All",
  },
  // Departmental Account Groups (name must be a single word without spaces)
  {
    groupName: "Board",
    groupRanges: [
      { start: "6000", end: "6099" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Brand",
    groupRanges: [
      { start: "6100", end: "6149" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "ComDev",
    groupRanges: [
      { start: "6150", end: "6199" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Conferences",
    groupRanges: [
      { start: "4000", end: "4099" },
      { start: "6200", end: "6299" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Diversity",
    groupRanges: [
      { start: "6900", end: "6999" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Fundraising",
    groupRanges: [
//      { start: "2100", end: "2199" },
//      { start: "2200", end: "2299" },
      { start: "4150", end: "4199" },
      { start: "4200", end: "4299" },
      { start: "6300", end: "6399" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "GovAffairs",
    groupRanges: [
      { start: "7100", end: "7199" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Infrastructure",
    groupRanges: [
      { start: "6400", end: "6499" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "LegalAffairs",
    groupRanges: [
      { start: "7200", end: "7299" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Marketing",
    groupRanges: [
      { start: "6600", end: "6699" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Other",
    groupRanges: [
      { start: "8000", end: "9999" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Privacy",
    groupRanges: [
      { start: "7000", end: "7099" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Programs",
    groupRanges: [
      { start: "4100", end: "4149" },
      { start: "6500", end: "6599" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Reserve",
    groupRanges: [
      { start: "4900", end: "4999" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Security",
    groupRanges: [
      { start: "7300", end: "7399" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Staffing",
    groupRanges: [
      { start: "7500", end: "7599" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "TAC",
    groupRanges: [
      { start: "6800", end: "6899" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Tooling",
    groupRanges: [
      { start: "7400", end: "7499" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Treasury",
    groupRanges: [
      { start: "6700", end: "6799" },
    ],
    groupType: "Departmental",
  },
  // General Ledger Account Groups
  {
    groupName: "Assets",
    groupRanges: [
      { start: "1000", end: "1999" },
    ],
    groupType: "Ledger",
  },
  {
    groupName: "Liabilities",
    groupRanges: [
      { start: "2000", end: "2999" },
    ],
    groupType: "Ledger",
  },
  {
    groupName: "Equity",
    groupRanges: [
      { start: "3000", end: "3999" },
    ],
    groupType: "Ledger",
  },
  {
    groupName: "Revenue",
    groupRanges: [
      { start: "4000", end: "4999" },
    ],
    groupType: "Ledger",
  },
  {
    groupName: "Expenses",
    groupRanges: [
      { start: "5000", end: "9999" },
    ],
    groupType: "Ledger",
  },
];

export const ACCOUNT_GROUPS_MAP: ReadonlyMap<string, AccountGroup> = new Map(
  ACCOUNT_GROUPS.map((group) => [group.groupName, group]),
);
