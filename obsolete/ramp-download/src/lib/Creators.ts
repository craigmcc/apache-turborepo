/**
 * Utility functions for creating Prisma models from Ramp API models.
 */

// External Imports ----------------------------------------------------------

// Internal Imports ----------------------------------------------------------

import {
  RampAccountingGLAccount,
  RampCard,
  RampDepartment,
  RampLimit,
  RampLimitCard,
  RampLimitRestrictions,
  RampLimitUser,
  RampSpendProgram,
  RampTransaction,
  RampTransactionAccountingFieldSelection,
  RampTransactionLineItem,
  RampUser,
} from "@repo/ramp-api/Models";
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
  User,
} from "@repo/ramp-db/dist";

// Public Objects ------------------------------------------------------------

export function createAccountingGLAccount(
  rampAccount: RampAccountingGLAccount,
): AccountingGLAccount {
  return {
    // Scalar fields
    id: rampAccount.id,
    classification: rampAccount.classification || null,
    code: rampAccount.code || null,
    created_at: rampAccount.created_at || null,
    gl_account_category_id: rampAccount.gl_account_category_info?.id || null,
    gl_account_category_name: rampAccount.gl_account_category_info?.name || null,
    gl_account_ramp_id: rampAccount.gl_account_category_info?.ramp_id || null,
    is_active: rampAccount.is_active || false,
    name: rampAccount.name,
    updated_at: rampAccount.updated_at || null,
  };
}

export function createCard(rampCard: RampCard): Card {
  return {
    // Scalar fields
    id: rampCard.id,
    cardholder_name: rampCard.cardholder_name,
    card_program_id: rampCard.card_program_id,
    created_at: rampCard.created_at,
    display_name: rampCard.display_name,
    expiration: rampCard.expiration,
    has_program_overridden: rampCard.has_program_overridden || false,
    is_physical: rampCard.is_physical || false,
    last_four: rampCard.last_four,
    state: rampCard.state,
    // Potential relationships
    entity_id: rampCard.entity_id,
    // Actual relationships
    cardholder_id: rampCard.cardholder_id,
  };
}

export function createCardSpendingRestrictions(
  rampCard: RampCard,
): CardSpendingRestrictions {
  return {
    // Scalar fields
    card_id: rampCard.id,
    amount: rampCard.spending_restrictions?.amount || null,
    auto_lock_date: rampCard.spending_restrictions?.auto_lock_date || null,
    blocked_categories: rampCard.spending_restrictions?.blocked_categories?.join(",") || null,
    categories: rampCard.spending_restrictions?.categories?.join(",") || null,
    interval: rampCard.spending_restrictions?.interval || null,
    suspended: rampCard.spending_restrictions?.suspended || false,
    transaction_amount_limit: rampCard.spending_restrictions?.transaction_amount_limit || null,
  };
}

export function createDepartment(rampDepartment: RampDepartment): Department {
  return {
    // Scalar fields
    id: rampDepartment.id,
    name: rampDepartment.name,
  };
}

export function createLimit(rampLimit: RampLimit): Limit {
  return {
    // Scalar fields
    id: rampLimit.id,
    balance_cleared_amt: rampLimit.balance?.cleared?.amount || null,
    balance_cleared_cc: rampLimit.balance?.cleared?.currency_code || null,
    balance_pending_amt: rampLimit.balance?.pending?.amount || null,
    balance_pending_cc: rampLimit.balance?.pending?.currency_code || null,
    balance_total_amt: rampLimit.balance?.total?.amount || null,
    balance_total_cc: rampLimit.balance?.total?.currency_code || null,
    created_at: rampLimit.created_at,
    display_name: rampLimit.display_name,
    has_program_overridden: rampLimit.has_program_overridden || false,
    is_shareable: rampLimit.is_shareable || false,
    permitted_primary_card_enabled: rampLimit.permitted_spend_types?.primary_card_enabled || false,
    permitted_reimbursements_enabled: rampLimit.permitted_spend_types?.reimbursements_enabled || false,
    state: rampLimit.state,
    suspension_acting_user_id: rampLimit.suspension?.acting_user_id || null,
    suspension_inserted_at: rampLimit.suspension?.inserted_at || null,
    suspension_suspended_by_ramp: rampLimit?.suspension?.suspended_by_ramp || false,
    // Potential relationships
    entity_id: rampLimit.entity_id,
    // Actual relationships
    spend_program_id: rampLimit.spend_program_id || null,
  }
}

export function createLimitCard(rampLimitCard: RampLimitCard, rampLimit: RampLimit): LimitCard {
  return {
    // Scalar fields
    expiration: rampLimitCard.expiration,
    is_ap_card: rampLimitCard.is_ap_card || false,
    last_four: rampLimitCard.last_four,
    via_new_product_or_service: rampLimitCard.via_new_product_or_service || false,
    // Actual relationships
    card_id: rampLimitCard.card_id,
    limit_id: rampLimit.id,
  };
}

export function createLimitSpendingRestrictions(
  rampLimitRestrictions: RampLimitRestrictions,
  rampLimit: RampLimit,
): LimitSpendingRestrictions {
  return {
    // Scalar fields
    allowed_categories: rampLimitRestrictions.allowed_categories?.join(",") || null,
    allowed_vendors: rampLimitRestrictions.allowed_vendors?.join(",") || null,
    auto_lock_date: rampLimitRestrictions.auto_lock_date || null,
    blocked_categories: rampLimitRestrictions.blocked_categories?.join(",") || null,
    blocked_vendors: rampLimitRestrictions.blocked_vendors?.join(",") || null,
    interval: rampLimitRestrictions.interval || null,
    limit_amt: rampLimitRestrictions.limit.amount,
    limit_cc: rampLimitRestrictions.limit.currency_code,
    next_interval_reset: rampLimitRestrictions.next_interval_reset,
    start_of_interval: rampLimitRestrictions.start_of_interval,
    suspended: rampLimit.state === "SUSPENDED",
    temporary_limit_amt: rampLimitRestrictions.temporary_limit?.amount || null,
    temporary_limit_cc: rampLimitRestrictions.temporary_limit?.currency_code || null,
    transaction_amount_limit_amt: rampLimitRestrictions.transaction_amount_limit?.amount || null,
    transaction_amount_limit_cc: rampLimitRestrictions.transaction_amount_limit?.currency_code || null,
    // Actual relationships
    limit_id: rampLimit.id,
  };
}

export function createLimitUser(
  rampLimitUser: RampLimitUser,
  rampLimit: RampLimit,
): LimitUser {
  return {
    // Actual relationships
    limit_id: rampLimit.id,
    user_id: rampLimitUser.user_id,
  };
}

export function createSpendProgram(rampSpendProgram: RampSpendProgram): SpendProgram {
  return {
    // Scalar fields
    id: rampSpendProgram.id,
    description: rampSpendProgram.description,
    display_name: rampSpendProgram.display_name,
    is_shareable: rampSpendProgram.is_shareable,
    issue_physical_card_if_needed: rampSpendProgram.issue_physical_card_if_needed,
    permitted_primary_card_enabled: rampSpendProgram.permitted_spend_types?.primary_card_enabled || null,
    permitted_reimbursements_enabled: rampSpendProgram.permitted_spend_types?.reimbursements_enabled || null,
    restrictions_allowed_categories: rampSpendProgram.restrictions?.allowed_categories?.join(",")  || null,
    restrictions_auto_lock_date: rampSpendProgram.restrictions?.auto_lock_date || null,
    restrictions_blocked_categories: rampSpendProgram.restrictions?.blocked_categories?.join(",") || null,
    restrictions_interval: rampSpendProgram.restrictions?.interval || null,
    restrictions_limit_amt: rampSpendProgram.restrictions?.limit?.amount || null,
    restrictions_limit_cc: rampSpendProgram.restrictions?.limit?.currency_code || null,
    restrictions_next_interval_reset: rampSpendProgram.restrictions?.next_interval_reset || null,
    restrictions_start_of_interval: rampSpendProgram.restrictions?.start_of_interval || null,
    restrictions_temporary_limit_amt: rampSpendProgram.restrictions?.temporary_limit?.amount || null,
    restrictions_temporary_limit_cc: rampSpendProgram.restrictions?.temporary_limit?.currency_code || null,
    restrictions_transaction_amount_limit_amt: rampSpendProgram.restrictions?.transaction_amount_limit?.amount || null,
    restrictions_transaction_amount_limit_cc: rampSpendProgram.restrictions?.transaction_amount_limit?.currency_code || null,
  };
}

export function createTransaction(rampTransaction: RampTransaction): Transaction {
  return {
    // Scalar fields
    id: rampTransaction.id,
    accounting_date: rampTransaction.accounting_date,
    amount_amt: rampTransaction.amount ? rampTransaction.amount * 100 : null,
    amount_cc: rampTransaction.currency_code,
    card_present: rampTransaction.card_present || false,
    memo: rampTransaction.memo,
    merchant_category_code: rampTransaction.merchant_category_code,
    merchant_category_description: rampTransaction.merchant_category_code_description,
    merchant_name: rampTransaction.merchant_name,
    original_transaction_amount_amt: rampTransaction.original_transaction_amount?.amount
      ? rampTransaction.original_transaction_amount.amount
      : null,
    original_transaction_amount_cc: rampTransaction.original_transaction_amount?.currency_code
      ? rampTransaction.original_transaction_amount.currency_code
      : null,
    settlement_date: rampTransaction.settlement_date,
    sk_category_id: rampTransaction.sk_category_id?.toString() || null, // TODO - type???
    sk_category_name: rampTransaction.sk_category_name,
    state: rampTransaction.state,
    sync_status: rampTransaction.sync_status || "NOT_SYNC_READY", // TODO
    synced_at: rampTransaction.synced_at,
    trip_name: rampTransaction.trip_name,
    user_transaction_time: rampTransaction.user_transaction_time,
    // Potential relationships
    entity_id: rampTransaction.entity_id,
    limit_id: rampTransaction.limit_id,
    // Actual relationships
    merchant_id: rampTransaction.merchant_id,
    spend_program_id: rampTransaction.spend_program_id,
    statement_id: rampTransaction.statement_id,
    trip_id: rampTransaction.trip_id,
    // Actual relationships
    card_holder_user_id: rampTransaction.card_holder?.user_id
      ? rampTransaction.card_holder.user_id
      : null,
    card_id: rampTransaction.card_id,
  }
}

export function createTransactionAccountingFieldSelection(
  rampTransactionAccountingFieldSelection: RampTransactionAccountingFieldSelection,
  rampTransaction: RampTransaction
): TransactionAccountingFieldSelection {
  return {
    // Scalar fields
    category_info_external_id: rampTransactionAccountingFieldSelection.category_info?.external_id || null,
    category_info_id: rampTransactionAccountingFieldSelection.category_info?.id || null,
    category_info_name: rampTransactionAccountingFieldSelection.category_info?.name || null,
    category_info_type: rampTransactionAccountingFieldSelection.category_info?.type || null,
    external_code: rampTransactionAccountingFieldSelection.external_code || null,
    external_id: rampTransactionAccountingFieldSelection.external_id || null,
    name: rampTransactionAccountingFieldSelection.name || null,
    source_type: rampTransactionAccountingFieldSelection.source?.type || null,
    type: rampTransactionAccountingFieldSelection.type || null,
    // Actual relationships
    ramp_id: rampTransactionAccountingFieldSelection.id,
    transaction_id: rampTransaction.id,
  };
}

export function createTransactionLineItem(
  rampTransactionLineItem: RampTransactionLineItem,
  rampTransaction: RampTransaction,
  index_line_item: number,
): TransactionLineItem {
  return {
    // Scalar fields
    amount_amt: rampTransactionLineItem.amount?.amount
      ? rampTransactionLineItem.amount.amount : null,
    amount_cc: rampTransactionLineItem.amount?.currency_code
      ? rampTransactionLineItem.amount.currency_code : null,
    converted_amount_amt: rampTransactionLineItem.converted_amount?.amount
      ? rampTransactionLineItem.converted_amount.amount : null,
    converted_amount_cc: rampTransactionLineItem.converted_amount?.currency_code
      ? rampTransactionLineItem.converted_amount.currency_code : null,
    memo: rampTransactionLineItem.memo,
    // Actual relationships
    index_line_item: index_line_item,
    transaction_id: rampTransaction.id,
  };
}

export function createTransactionLineItemAccountingFieldSelection(
  rampAccountingFieldSelection: RampTransactionAccountingFieldSelection,
  rampTransaction: RampTransaction,
  index_line_item: number,
): TransactionLineItemAccountingFieldSelection {
  return {
    // Scalar fields
    category_info_external_id: rampAccountingFieldSelection.category_info?.external_id || null,
    category_info_id: rampAccountingFieldSelection.category_info?.id || null,
    category_info_name: rampAccountingFieldSelection.category_info?.name || null,
    category_info_type: rampAccountingFieldSelection.category_info?.type || null,
    external_code: rampAccountingFieldSelection.external_code,
    external_id: rampAccountingFieldSelection.external_id,
    name: rampAccountingFieldSelection.name,
    source_type: rampAccountingFieldSelection.source?.type || null,
    type: rampAccountingFieldSelection.type,
    // Actual relationships
    index_line_item: index_line_item,
    ramp_id: rampAccountingFieldSelection.id,
    transaction_id: rampTransaction.id,
  };
}

export function createUser(rampUser: RampUser): User {
  return {
    // Scalar fields
    id: rampUser.id,
    email: rampUser.email,
    employee_id: rampUser.employee_id,
    first_name: rampUser.first_name,
    is_manager: rampUser.is_manager || false,
    last_name: rampUser.last_name,
    phone: rampUser.phone,
    // Potential relationships
    entity_id: rampUser.entity_id,
    location_id: rampUser.location_id,
    manager_id: rampUser.manager_id,
    role: rampUser.role,
    status: rampUser.status,
    // Actual relationships
    department_id: rampUser.department_id,
  }
}
