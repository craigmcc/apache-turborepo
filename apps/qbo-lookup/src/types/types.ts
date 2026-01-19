/**
 * Extended model types for the QBO Lookup application.
 */

// External Imports ----------------------------------------------------------

import {
  Account,
  JournalEntry,
  JournalEntryLine,
} from "@repo/qbo-db/client";

// Public Types --------------------------------------------------------------

export type AccountPlus = Account & {
  childAccounts?: AccountPlus[] | null;
  journalEntryLines?: JournalEntryLinePlus[] | null;
  parentAccount?: AccountPlus | null;
};

export type JournalEntryPlus = JournalEntry & {
  lines?: JournalEntryLinePlus[] | null;
};

export type JournalEntryLinePlus = JournalEntryLine & {
  account?: AccountPlus | null;
  journalEntry?: JournalEntryPlus | null;
};
