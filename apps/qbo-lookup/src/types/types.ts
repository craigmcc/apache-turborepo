/**
 * Extended model types for the QBO Lookup application.
 */

// External Imports ----------------------------------------------------------

import {
  Account,
  JournalEntry,
  JournalEntryLine, Transaction,
} from "@repo/qbo-db/client";

// Public Types --------------------------------------------------------------

export type AccountPlus = Account & {
  childAccounts?: AccountPlus[] | null;
  journalEntryLines?: JournalEntryLinePlus[] | null;
  parentAccount?: AccountPlus | null;
  transactions?: TransactionPlus[] | null;
};

export type JournalEntryPlus = JournalEntry & {
  lines?: JournalEntryLinePlus[] | null;
};

export type JournalEntryLinePlus = JournalEntryLine & {
  account?: AccountPlus | null;
  journalEntry?: JournalEntryPlus | null;
};

export type TransactionPlus = Transaction & {
  account?: AccountPlus | null;
}
