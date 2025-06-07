/**
 * Extended model types for the RAMP Lookup application.
 */

// External Imports ----------------------------------------------------------

import {
  AccountingGLAccount,
  Card,
  CardSpendingRestrictions,
  Department,
  Limit,
  LimitCard,
  LimitSpendingRestrictions,
  LimitUser,
  SpendProgram,
  Transaction,
  TransactionAccountingFieldSelection,
  TransactionLineItem,
  TransactionLineItemAccountingFieldSelection,
  User
} from "@repo/ramp-db/client";

// Public Types --------------------------------------------------------------

/**
 * Define local storage keys used in the application.
 */

export const CARD_KEY = "ramp-lookup.Card";                 // Card | null
export const DEPARTMENT_KEY = "ramp-lookup.Department";     // DepartmentPlus | null
export const LIMIT_KEY = "ramp-lookup.Limit";               // Limit | null
export const USER_KEY = "ramp-lookup.User";                 // User | null

/**
 * Define extended model types that include optional related data.
 */

export type AccountingGLAccountPlus = AccountingGLAccount & {
}

export type CardPlus = Card & {
  cardholder?: User | null;
  department?: Department | null;
  limit_cards?: LimitCard[] | null;
  spending_restrictions?: CardSpendingRestrictions | null;
  users?: User[] | null;
}

export type CardSpendingRestrictionsPlus = CardSpendingRestrictions & {
  card?: Card | null;
}

export type DepartmentPlus = Department & {
  users?: User[] | null;
};

export type LimitPlus = Limit & {
  cards?: LimitCard[] | null;
  spend_program?: SpendProgram | null;
  spending_restrictions?: LimitSpendingRestrictions | null;
  users?: LimitUser[] | null;
}

export type LimitCardPlus = LimitCard & {
  card?: Card | null;
  limit?: Limit | null;
}

export type LimitUserPlus = LimitUser & {
  limit?: Limit | null;
  user?: User | null;
}

export type SpendProgramPlus = SpendProgram & {
  limits?: Limit[] | null;
}

export type TransactionPlus = Transaction & {
  accounting_field_selections?: TransactionAccountingFieldSelectionPlus[] | null;
  card?: Card | null;
  card_holder_user?: User | null;
  line_items?: TransactionLineItemPlus[] | null;
  line_item_accounting_field_selections?: TransactionLineItemAccountingFieldSelectionPlus[] | null;
}

export type TransactionAccountingFieldSelectionPlus = TransactionAccountingFieldSelection & {
  transaction?: TransactionPlus | null;
}

export type TransactionLineItemPlus = TransactionLineItem & {
  accounting_field_selections?: TransactionLineItemAccountingFieldSelectionPlus[] | null;
  transaction?: TransactionPlus | null;
}

export type TransactionLineItemAccountingFieldSelectionPlus = TransactionLineItemAccountingFieldSelection & {
  transaction: TransactionPlus | null;
  transaction_line_item?: TransactionLineItemPlus | null;
}

export type UserPlus = User & {
  cards?: Card[] | null;
  department?: Department | null;
  limit_users?: LimitUser[] | null;
};
