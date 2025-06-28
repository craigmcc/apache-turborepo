/**
 * Extended model types for the BILL Lookup application.
 */

// External Imports ----------------------------------------------------------

import {
  Account,
  Bill,
  BillClassifications,
  BillLineItem,
  BillLineItemClassifications,
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
  classifications?: BillClassifications[] | null;
  billLineItems?: BillLineItem[] | null;
}

export type BillClassificationsPlus = BillClassifications & {
  account?: AccountPlus | null;
  bill?: BillPlus | null;
}

export type BillLineItemPlus = BillLineItem & {
  bill?: BillPlus | null;
  classifications?: BillLineItemClassifications[] | null;
}

export type BillLineItemClassificationsPlus = BillLineItemClassifications & {
  account?: AccountPlus | null;
  billLineItem?: BillLineItemPlus | null;
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
