/**
 * Extended model types for the BILL Lookup application.
 */

// External Imports ----------------------------------------------------------

import {
  Account,
  Bill,
  BillApprover,
  BillClassifications,
  BillLineItem,
  BillLineItemClassifications,
  RecurringBill,
  RecurringBillApprover,
  RecurringBillLineItem,
  RecurringBillLineItemClassifications,
  RecurringBillSchedule,
  User,
  Vendor,
  VendorAdditionalInfo,
  VendorAddress,
  VendorAutoPay,
  VendorPaymentInformation,
  VendorVirtualCard,
} from "@repo/bill-db/client";

// Public Types --------------------------------------------------------------

export type AccountPlus = Account & {
  bills?: Bill[] | null;
  billClassifications?: BillClassificationsPlus[] | null;
  billLineItemClassifications?: BillLineItemClassifications[] | null;
};

export type BillPlus = Bill & {
  account?: AccountPlus | null;
  classifications?: BillClassificationsPlus | null;
  lineItems?: BillLineItemPlus[] | null;
  vendor?: VendorPlus | null;
}

export type BillApproverPlus = BillApprover & {
  bill?: BillPlus | null;
  user?: UserPlus | null;
}

export type BillClassificationsPlus = BillClassifications & {
  account?: Account | null;
  bill?: BillPlus | null;
}

export type BillLineItemPlus = BillLineItem & {
  bill?: BillPlus | null;
  classifications?: BillLineItemClassificationsPlus | null;
}

export type BillLineItemClassificationsPlus = BillLineItemClassifications & {
  account?: Account | null;
  billLineItem?: BillLineItemPlus | null;
}

export type RecurringBillPlus = RecurringBill & {
  approvers?: RecurringBillApproverPlus[] | null;
  lineItems?: RecurringBillLineItemPlus[] | null;
  schedule?: RecurringBillSchedulePlus | null;
  vendor?: VendorPlus | null;
}

export type RecurringBillApproverPlus = RecurringBillApprover & {
  recurringBill?: RecurringBillPlus | null;
  user?: UserPlus | null;
}

export type RecurringBillLineItemPlus = RecurringBillLineItem & {
  classifications?: RecurringBillLineItemClassificationsPlus | null;
  recurringBill?: RecurringBillPlus | null;
}

export type RecurringBillLineItemClassificationsPlus = RecurringBillLineItemClassifications & {
  account?: Account | null;
  lineItem?: RecurringBillLineItemPlus | null;
}

export type RecurringBillSchedulePlus = RecurringBillSchedule & {
  recurringBill?: RecurringBillPlus | null;
}

export type UserPlus = User & {
};

export type VendorPlus = Vendor & {
  additionalInfo?: VendorAdditionalInfo | null;
  address?: VendorAddress | null;
  autopay?: VendorAutoPay | null;
  paymentInformation?: VendorPaymentInformation | null;
  virtualCard?: VendorVirtualCard | null;
};
