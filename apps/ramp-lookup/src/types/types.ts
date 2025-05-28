/**
 * Extended model types for the RAMP Lookup application.
 */

// External Imports ----------------------------------------------------------

import {
  Card,
  CardSpendingRestrictions,
  Department,
  Limit,
  LimitCard,
  LimitUser,
  SpendProgram,
  User
} from "@repo/ramp-db/client";

// Public Types --------------------------------------------------------------

/**
 * Define local storage keys used in the application.
 */

export const ACCESS_TOKEN_KEY = "ramp-lookup.AccessToken";  // string | null
export const CARD_KEY = "ramp-lookup.Card";                 // Card | null
export const DEPARTMENT_KEY = "ramp-lookup.Department";     // DepartmentPlus | null
export const USER_KEY = "ramp-lookup.User";                 // User | null

/**
 * Define extended model types that include optional related data.
 */

export type CardPlus = Card & {
  cardholder: User | null;
  department: Department | null;
  limit_cards: LimitCard[] | null;
  spending_restrictions: CardSpendingRestrictions | null;
  users: User[] | null;
}

export type CardSpendingRestrictionsPlus = CardSpendingRestrictions & {
  card: Card | null;
}

export type DepartmentPlus = Department & {
  users: User[] | null;
};

export type LimitPlus = Limit & {
  cards: LimitCard[] | null;
  spend_program: SpendProgram | null;
  users: LimitUser[] | null;
}

export type LimitCardPlus = LimitCard & {
  card: Card | null;
  limit: Limit | null;
}

export type LimitUserPlus = LimitUser & {
  limit: Limit | null;
  user: User | null;
}

export type SpendProgramPlus = SpendProgram & {
  limits: Limit[] | null;
}

export type UserPlus = User & {
  cards: Card[] | null;
  department: Department | null;
  limit_users: LimitUser[] | null;
};

