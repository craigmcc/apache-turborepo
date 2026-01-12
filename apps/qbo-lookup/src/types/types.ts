/**
 * Extended model types for the QBO Lookup application.
 */

// External Imports ----------------------------------------------------------

import {
  Account,
} from "@repo/qbo-db/client";

// Public Types --------------------------------------------------------------

export type AccountPlus = Account & {
  childAccounts?: AccountPlus[] | null;
  parentAccount?: AccountPlus | null;
};
