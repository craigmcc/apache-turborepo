/**
 * Types for Ramp API model objects.
 */

// Data Models ---------------------------------------------------------------

/**
 * A Ramp Card object.
 */
export type RampCard = {
  // Unique identifier of the card
  id: string;
  // The name of the card
  cardholder_name: string | null;
  // The card program this card belongs to
  card_program_id: string | null;
  // Date/time this card was created (ISO 8601 format)
  created_at: string | null;
  // Cosmetic display name of the Card
  display_name: string;
  // Expiration date (MMYY) of the Card
  expiration: string;
  // Has the Card overridden the default settings for this Card Program?
  has_program_overridden: boolean;
  // Is this a physical card?
  is_physical: boolean;
  // The last four digits of the card number
  last_four: string;
  // Current state of this Card
  state: RampCardState | null;
  // Unique ID of the business Entity that this Card belongs to
  entity_id: string | null;
  // Unique ID of the Cardholder (User)
  cardholder_id: string;
  // The list of spending restrictions for this card
  spending_restrictions?: RampCardSpendingRestrictions | null;
}

/**
 * The state of a Ramp Card.
 */
export type RampCardState =
  "ACTIVE" | "CHIP_LOCKED" | "SUSPENDED" |
  "TERMINATED" | "UNACTIVATED";

/**
 * Separate table for spending_restrictions on a RampCard.
 * This will be in a 1:1 relationship with RampCard.
 *
 * NOTE: Not all Cards will have a spending_restrictions object,
 * since it is optional.
 */
export type RampCardSpendingRestrictions = {
  // Unique identifier of the card (same as RampCard.id)
  card_id: string;
  // Amount limit total per interval.
  amount: number | null;
  // Date to automatically lock the card (ISO 8601 format).
  // NOTE: This is not the same as the expiration date of the card.
  auto_lock_date: string | null;
  // The Ramp category codes blocked for this card
  blocked_categories: number[] | null;
  // The Ramp category codes allowed for this card
  categories: number[] | null;
  // The time interval that the spending restrictions apply to
  interval: RampCardSpendingRestrictionsInterval | null;
  // Whether this card has been locked
  suspended: boolean | null;
  // Maximum amount limit per transaction
  transaction_amount_limit: number | null;
}

/**
 * The time limit interval that the spending restrictions apply to
 * for a Ramp Card.
 */
export type RampCardSpendingRestrictionsInterval =
  "ANNUAL" | "DAILY" | "MONTHLY" | "QUARTERLY" |
  "TERTIARY" | "TOTAL" | "WEEKLY" | "YEARLY";

/**
 * A Ramp API Department object.
 */
export type RampDepartment = {
  // Unique identifier of the department
  id: string;
  // The name of the department
  name: string;
}

/**
 * A Ramp Limit object.
 */
export type RampLimit = {
  // Unique identifier of this Limit
  id: string;
  // Balances for this Limit
  balance: {
    // The current balance of this limit
    cleared: RampAmount | null;
    // The pending balance of this limit
    pending: RampAmount | null;
    // The total balance of this limit
    total: RampAmount | null;
  } | null;
  // The Ramp cards that are associated with this Limit
  cards: RampLimitCard[] | null;
  // Date/time this Limit was created (ISO 8601 format)
  created_at: string | null;
  // Cosmetic display name of the Limit
  display_name: string | null;
  // Unique ID of the Entity that the Limit belongs to
  entity_id: string | null;
  // Do Limit's settings override those of its spend program?
  has_program_overridden: boolean | null;
  // Is the spend limit shareable?
  is_shareable: boolean | null;
  // Permitted spend types for this Limit
  permitted_spend_types: RampLimitPermittedSpendTypes | null;
  // Restrictions imposed on this Limit
  restrictions: RampLimitRestrictions | null;
  // Unique of the associated spend program
  spend_program_id: string | null;
  // Current state of the Limit
  state: RampLimitState | null;
  // Suspension of this Limit
  suspension: RampLimitSuspension | null;
  // Users associated with this Limit
  users: RampLimitUser[] | null;
};

export type RampLimitCard = {
  // Unique identifier of the Card
  card_id: string;
  // Expiration date of the LimitCard (MMYY)
  expiration: string;
  // Was this card created manually by Ramp for high velocity spend?
  is_ap_card: boolean;
  // Last four digits of the LimitCard number
  last_four: string;
  // Was this card created by the "New Product or Service" option?
  via_new_product_or_service: boolean;
}

/**
 * Also used for Spend Programs.
 */
export type RampLimitPermittedSpendTypes = {
  // Can the User's physical card be linked to this Limit?
  primary_card_enabled: boolean;
  // Can reimbursements be submitted against this Limit?
  reimbursements_enabled: boolean;
}

/**
 * Also used for Spend Programs.
 */
export type RampLimitRestrictions = {
  // Allowed Ramp categories for this Limit
  allowed_categories: number[];
  // Date/time to automatically lock the Limit (ISO 8601 format)
  auto_lock_date: string | null;
  // Blocked Ramp categories for this Limit
  blocked_categories: number[];
  // Time interval that the limit is applied on
  interval: RampLimitRestrictionsInterval | null;
  // Spending limit
  limit: RampAmount;
  // Date/time of the next interval reset (ISO 8601 format)
  next_interval_reset: string | null;
  // Date/time this interval started (ISO 8601 format)
  start_of_interval: string | null;
  // Temporary spending limit
  temporary_limit: RampAmount;
  // Per-transaction spending limit;
  transaction_amount_limit: RampAmount;
}

export type RampLimitRestrictionsInterval =
  "ANNUAL" | "DAILY" | "MONTHLY" | "QUARTERLY" |
  "TERTIARY" | "TOTAL" | "WEEKLY" | "YEARLY";

export type RampLimitState =
  "ACTIVE" | "SUSPENDED" | "TERMINATED";

export type RampLimitSuspension = {
  // Unique ID of the User who placed the suspension
  acting_user_id: string | null;
  // Date/time the suspension was placed (ISO 8601 format)
  inserted_at: string | null;
  // Was this suspension placed by Ramp?
  suspended_by_ramp: boolean | null;
}

export type RampLimitUser = {
  // Unique ID of a User that is associated with this Limit
  user_id: string;
}

/**
 * A Ramp Spend Program object.
 */
export type RampSpendProgram = {
  // Unique Identifier of the Spend Program
  id: string;
  // Description of the Spend Program
  description: string | null;
  // Display name of the Spend Program
  display_name: string | null;
  // TODO - skipping icon
  // Is the Spend Program shareable?
  is_shareable: boolean | null;
  // Should the Spend Program issue a physical card if needed?
  issue_physical_card_if_needed: boolean | null;
  // Permitted spend types for this Spend Program (same as RampLimit)
  permitted_spend_types: RampLimitPermittedSpendTypes | null;
  // Restrictions on this Spend Program (same as RampLimit)
  restrictions: RampLimitRestrictions | null;
}

/**
 * The OAuth2 response for a successful token request.
 */
export type RampTokenResponse = {
  // The access token
  access_token: string;
  // The type of token
  token_type: string;
  // The expiration time in seconds
  expires_in: number;
  // The scope of the token
  scope: string;
}

/**
 * A Ramp Transaction object.  NOTE - this has not been codified yet, so it is just an object.
 */
export type RampTransaction = {
  // Unique identifier of the Transaction
  id: string;
  // Date/time of the Transaction (ISO 8601 format) for accounting purposes
  accounting_date: string | null;
  // List of accounting fields selected to code the transaction
  accounting_field_selections: TransactionAccountingFieldSelection[] | null;
  // Settled amount of the Transaction (amount)
  amount: number | null;
  // Unique ID of the CardHolder for this Transaction
  card_holder: TransactionCardHolder | null;
  // Unique ID of the Card for this Transaction
  card_id: string | null;
  // Was the Transaction processed using a card present terminal?
  card_present: boolean | null;
  // Settled amount of the Transaction (currency)
  currency_code: string | null;
  // Unique ID of the Entity that the Transaction belongs to
  entity_id: string | null;
  // Unique ID of the Spend Limit for this transaction
  limit_id: string | null;
  // Line items for this transaction
  line_items: TransactionLineItem[] | null;
  // Optional memo for this Transaction
  memo: string | null;
  /// Merchant category code (ISP 18245) classifying types of goods and services
  merchant_category_code: string | null;
  /// Description of the Merchant category code
  merchant_category_code_description: string | null;
  // Unique ID of the Merchant for this transaction
  merchant_id: string | null;
  // Name of the Merchant
  merchant_name: string | null;
  // Original amount of the Transaction
  original_transaction_amount: RampAmount | null;
  // Settlement date/time (ISO 8601 format) when funds transferred
  settlement_date: string | null;
  // Ramp category code
  sk_category_id: number | null;
  // Ramp category name
  sk_category_name: string | null;
  // Unique ID of the Spend Program for this Transaction
  spend_program_id: string | null;
  // Current state of this Transaction
  state: TransactionState | null;
  /// Unique ID of the Statement associated with this Transaction
  statement_id: string | null;
  // Status of synchronization for this transaction
  sync_status: TransactionSyncStatus | null;
  // Date/time the transaction was synced (ISO 8601 format)
  synced_at: string | null;
  // Unique ID of the Trip associated with this Transaction
  trip_id: string | null;
  // Name of the Trip for this Transaction
  trip_name: string | null;
  // Date/time the transaction was user created (ISO 8601 format)
  user_transaction_time: string | null;
};

export type TransactionAccountingFieldCategoryInfo = {
  // External ID of this option (should uniquely identify it on the ERP)
  external_id: string | null;
  // Unique ID of this accounting field (within Ramp)
  id: string | null;
  // Name of this accounting field option
  name: string | null;
  // Type of this accounting field
  type: TransactionAccountingFieldType | null;
}

export type TransactionAccountingFieldSelection = {
  // The accounting field category info this option belongs to
  category_info: TransactionAccountingFieldCategoryInfo | null;
  // External code of this option (displayed on the ERP)
  external_code: string | null;
  // External ID of this option (should uniquely identify it on the ERP)
  external_id: string | null;
  // Unique ID of an accounting field (within Ramp)
  id: string | null;
  // Name of this accounting field option
  name: string | null;
  // Source of this accounting field option
  source: {
    type: string | null;
  } | null;
  // Accounting field type
  type: TransactionAccountingFieldType | null;
};

export type TransactionCardHolder = {
  department_id: string | null;
  department_name: string | null;
  employee_id: string | null;
  first_name: string | null;
  last_name: string | null;
  location_id: string | null;
  location_name: string | null;
  user_id: string | null;
}

export type TransactionLineItem = {
  amount: RampAmount | null;
  converted_amount: RampAmount | null;
  // Accounting Field Selections relevant to this line item
  accounting_field_selections: TransactionAccountingFieldSelection[] | null;
  memo: string | null;
}

export type TransactionAccountingFieldType =
  "AMORTIZATION_TEMPLATE" | "BILLABLE" | "COST_CENTER" | "CUSTOMERS_JOBS" |
  "DEFERRAL_CODE" | "EXPENSE_ENTITY" | "GL_ACCOUNT" | "INVENTORY_ITEM" |
  "JOURNAL" | "MERCHANT" | "OTHER" | "PROJECT" | "REPORTING_TAG" |
  "SUBSIDIARY" | "TAX_CODE";

export type TransactionState =
  "ALL" | "CLEARED" | "COMPLETION" | "DECLINED" |
  "ERROR" | "PENDING" | "PENDING_INITIATION";

export type TransactionSyncStatus =
  "NOT_SYNC_READY" | "SYNCED" | "SYNC_READY";

/**
 * A Ramp API User object.
 */
export type RampUser = {
  // Unique identifier of the company that the user belongs to
  business_id: string | null;
  // A list of custom fields for this user
  custom_fields: {
    [key: string]: string | number | boolean | null;
  };
  // Unique identifier of the user's department
  department_id: string | null;
  // The user's email address
  email: string;
  // Alternative identifier for an employee, which is from an external system,
  // that can be used in place of an email
  employee_id: string | null;
  // Unique identifier of the business entity that the user belongs to
  entity_id: string | null;
  // First name of the user
  first_name: string | null;
  // Unique user identifier
  id: string;
  // Is this user a manager?
  is_manager: boolean;
  // Last name of the user
  last_name: string | null;
  // Unique identifier of the user's location
  location_id: string | null;
  // Unique identifier of the user's manager
  manager_id: string | null;
  // The user's phone number
  phone: string | null;
  // The user's role
  role: UserRole | null;
  // The user's status with respect to Ramp
  status: UserStatus;
}

/**
 * Role of a User
 */
export type UserRole =
  "ADVISOR_CONSOLE_ADMIN" | "ADVISOR_CONSOLE_USER" | "AUDITOR" |
  "BUSINESS_ADMIN" | "BUSINESS_BOOKKEEPER" | "BUSINESS_OWNER" |
  "BUSINESS_USER" | "DEVELOPER_ADMIN" | "GUEST_USER" | "IT_ADMIN" |
  "PRESALES_DEMO_USER" | "UNBUNDLED_ADMIN" | "UNBUNDLED_BOOKKEEPER" |
  "UNBUNDLED_OWNER" | "UNBUNDLED_USER" | "VENDOR_NETWORK_ADMIN";

/**
 * Status of a User.
 */
export type UserStatus =
  "INVITE_EXPIRED" | "INVITE_PENDING" | "USER_ACTIVE" |
  "USER_INACTIVE" | "USER_ONBOARDING" | "USER_SUSPENDED";

// Interface Definitions -----------------------------------------------------

/**
 * A compound amount of money in the smallest denomination of the currency.
 * For USD, that is cents.
 */
export type RampAmount = {
  // The amount of money, in the smallest denomination of the currency
  amount: number;
  // The currency of the money
  currency_code: string;
}

/**
 * The Ramp API response for a fetch cards request.
 */
export type RampCardsResponse = {
  // The list of cards
  data: RampCard[];
  // Optional forward link for pagination
  page?: {
    next?: string;
  }
}

/**
 * The Ramp API response for a fetch departments request.
 */
export type RampDepartmentsResponse = {
  // The list of departments
  data: RampDepartment[];
  // Optional forward link for pagination
  page?: {
    next?: string;
  }
}

/**
 * The "error_v2" portion of the Ramp response with an error, plus a spot for
 * the HTTP status code.
 */
export type RampError = {
  // Additional info about the error (if any)
  additional_info?: {
    [key: string]: string;
  };
  // The error code
  error_code: string;
  // The error message
  message: string;
  // Notes about the error
  notes?: string;
  // The HTTP status code
  status: number;
}

/**
 * The Ramp API response for a fetch limits request.
 */
export type RampLimitsResponse = {
  // The list of limits
  data: RampLimit[];
  // Optional forward link for pagination
  page?: {
    next?: string;
  }
}

/**
 * The Ramp API response for a fetch spend programs request.
 */
export type RampSpendProgramsResponse = {
  // The list of spend programs
  data: RampSpendProgram[];
  // Optional forward link for pagination
  page?: {
    next?: string;
  }
}

/**
 * Generic describing the result returned by a Ramp API call.
 * Either an error or a model object will be included, but not both.
 * The headers from the response are normally included.
 *
 * @param M                             The type of model object being returned
 * @param E                             The type of error object being returned
 *                                      (defaults to RampError)
 */
export type RampResult<M, E = RampError> = {
  // The error object returned by the action (if any)
  error?: E;
  // The headers returned by the action (if any)
  headers?: Headers;
  // The model object returned by the action (if any)
  model?: M;
}

/**
 * The Ramp API response for a fetch transactions request.
 */
export type RampTransactionsResponse = {
  // The list of transactions
  data: RampTransaction[];
  // Optional forward link for pagination
  page?: {
    next?: string;
  }
}

/**
 * The Ramp API response for a fetch users request.
 */
export type RampUsersResponse = {
  // The list of users
  data: RampUser[];
  // Optional forward link for pagination
  page?: {
    next?: string;
  }
}
