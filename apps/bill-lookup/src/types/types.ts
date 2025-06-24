/**
 * Extended model types for the BILL Lookup application.
 */

// External Imports ----------------------------------------------------------

import {
  User,
  Vendor,
  VendorAdditionalInfo,
  VendorAddress,
  VendorAutoPay,
  VendorPaymentInformation,
  VendorVirtualCard,
} from "@repo/bill-db/client";

// Public Types --------------------------------------------------------------

export type UserPlus = User & {
};

export type VendorPlus = Vendor & {
  additionalInfo?: VendorAdditionalInfo | null;
  address?: VendorAddress | null;
  autopay?: VendorAutoPay | null;
  paymentInformation?: VendorPaymentInformation | null;
  virtualCard?: VendorVirtualCard | null;
};
