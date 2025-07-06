/**
 * Shared utilities for identifying GL accounts that are part of an account group.
 */

// Public Objects ------------------------------------------------------------

export type AccountGroupsRange = {
  start: string;
  end: string;
}

export type AccountGroup = {
  groupName: string;
  groupRanges: AccountGroupsRange[];
  groupType: "GeneralLedger" | "Departmental";
};

export function isAccountInGroup(
  accountNumber: string,
  accountGroups: AccountGroup[],
): boolean {
  for (const group of accountGroups) {
    for (const range of group.groupRanges) {
      if ((accountNumber >= range.start) && (accountNumber <= range.end)) {
        return true;
      }
    }
  }
  return false;
}

export const ACCOUNT_GROUPS: AccountGroup[] = [
  // Departmental Account Groups
  {
    groupName: "Board/Operations",
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
      { start: "2100", end: "2199" },
      { start: "2200", end: "2299" },
      { start: "4150", end: "4199" },
      { start: "4200", end: "4299" },
      { start: "6300", end: "6399" },
    ],
    groupType: "Departmental",
  },
  {
    groupName: "Gov Affairs",
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
    groupName: "Legal Affairs",
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
    groupType: "GeneralLedger",
  },
  {
    groupName: "Liabilities",
    groupRanges: [
      { start: "2000", end: "2999" },
    ],
    groupType: "GeneralLedger",
  },
  {
    groupName: "Equity",
    groupRanges: [
      { start: "3000", end: "3999" },
    ],
    groupType: "GeneralLedger",
  },
  {
    groupName: "Revenue",
    groupRanges: [
      { start: "4000", end: "4999" },
    ],
    groupType: "GeneralLedger",
  },
  {
    groupName: "Expenses",
    groupRanges: [
      { start: "5000", end: "9999" },
    ],
    groupType: "GeneralLedger",
  },
];
