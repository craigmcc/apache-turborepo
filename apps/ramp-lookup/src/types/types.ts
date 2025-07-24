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
  cardholder?: UserPlus | null;
  limit_cards?: LimitCardPlus[] | null;
  spending_restrictions?: CardSpendingRestrictions | null;
}

export type CardSpendingRestrictionsPlus = CardSpendingRestrictions & {
  card?: Card | null;
}

export type DepartmentPlus = Department & {
  users?: User[] | null;
};

export type LimitPlus = Limit & {
  cards?: LimitCardPlus[] | null;
  spend_program?: SpendProgram | null;
  spending_restrictions?: LimitSpendingRestrictions | null;
  users?: LimitUserPlus[] | null;
}

export type LimitCardPlus = LimitCard & {
  card?: CardPlus | null;
  limit?: LimitPlus | null;
}

export type LimitUserPlus = LimitUser & {
  limit?: LimitPlus | null;
  user?: UserPlus | null;
}

export type SpendProgramPlus = SpendProgram & {
  limits?: Limit[] | null;
}

export type TransactionPlus = Transaction & {
  accounting_field_selections?: TransactionAccountingFieldSelectionPlus[] | null;
  card?: Card | null;
  card_holder_user?: UserPlus | null;
  line_items?: TransactionLineItem[] | null;
  line_item_accounting_field_selections?: TransactionLineItemAccountingFieldSelection[] | null;
}

export type TransactionAccountingFieldSelectionPlus = TransactionAccountingFieldSelection & {
  transaction?: Transaction | null;
}

export type TransactionLineItemPlus = TransactionLineItem & {
  accounting_field_selections?: TransactionLineItemAccountingFieldSelectionPlus[] | null;
  transaction?: Transaction | null;
}

export type TransactionLineItemAccountingFieldSelectionPlus = TransactionLineItemAccountingFieldSelection & {
  transaction: Transaction | null;
  transaction_line_item?: TransactionLineItem | null;
}

export type UserPlus = User & {
  cards?: Card[] | null;
  department?: Department | null;
  managees?: UserPlus[] | null;
  manager?: UserPlus | null;
  limit_users?: LimitUserPlus[] | null;
};
