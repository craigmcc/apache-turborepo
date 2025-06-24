/**
 * Utility functions for creating Prisma models from Bill API models.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import {
  BillUser,
  BillVendor,
} from "@repo/bill-api/Models";
import {
  User,
  Vendor,
  VendorAdditionalInfo,
  VendorAddress,
  VendorAutoPay,
  VendorPaymentInformation,
  VendorVirtualCard,
} from "@repo/bill-db/Models";

// Public Objects ------------------------------------------------------------

export function createUser(billUser: BillUser): User {
  return {
    // Scalar fields
    id: billUser.id,
    archived: billUser.archived,
    createdTime: billUser.createdTime,
    email: billUser.email,
    firstName: billUser.firstName,
    lastName: billUser.lastName,
    roleDescription: billUser.role.description || null,
    roleId: billUser.role.id || null,
    roleType: billUser.role.type || null,
    updatedTime: billUser.updatedTime,
    // Potential relationships
    // Actual relationships
  };
}

export function createVendor(billVendor: BillVendor): Vendor {
  return {
    id: billVendor.id,
    accountNumber: billVendor.accountNumber || null,
    accountType: billVendor.accountType || null,
    archived: billVendor.archived,
    balance_amount: billVendor.balance?.amount || null,
    balance_lastUpdatedDate: billVendor.balance?.lastUpdatedDate || null,
    billCurrency: billVendor.billCurrency || null,
    createdTime: billVendor.createdTime,
    email: billVendor.email || null,
    name: billVendor.name,
    networkStatus: billVendor.networkStatus || null,
    phone: billVendor.phone || null,
    recurringPayments: billVendor.recurringPayments || null,
    rppsid: billVendor.rppsid || null,
    shortName: billVendor.shortName || null,
    updatedTime: billVendor.updatedTime,
  };
}

export function createVendorAdditionalInfo(billVendor: BillVendor): VendorAdditionalInfo | null {
  if (!billVendor.additionalInfo) {
    return null;
  }
  return {
    vendorId: billVendor.id,
    combinePayment: billVendor.additionalInfo.combinePayment || null,
    companyName: billVendor.additionalInfo.companyName || null,
    leadTimeInDays: billVendor.additionalInfo.leadTimeInDays || null,
    paymentTermId: billVendor.additionalInfo.paymentTermId || null,
    taxId: billVendor.additionalInfo.taxId || null,
    taxIdType: billVendor.additionalInfo.taxIdType || null,
    track1099: billVendor.additionalInfo.track1099 || null,
  };
}

export function createVendorAddress(billVendor: BillVendor): VendorAddress | null {
  if (!billVendor.address) {
    return null;
  }
  return {
    vendorId: billVendor.id,
    city: billVendor.address.city || null,
    country: billVendor.address.country || null,
    countryName: billVendor.address.countryName || null,
    line1: billVendor.address.line1 || null,
    line2: billVendor.address.line2 || null,
    stateOrProvince: billVendor.address.stateOrProvince || null,
    zipOrPostalCode: billVendor.address.zipOrPostalCode || null,
  };
}

export function createVendorAutoPay(billVendor: BillVendor): VendorAutoPay | null {
  if (!billVendor.autoPay) {
    return null;
  }
  return {
    vendorId: billVendor.id,
    bankAccountId: billVendor.autoPay.bankAccountId || null,
    createdBy: billVendor.autoPay.createdBy || null,
    daysBeforeDueDate: billVendor.autoPay.daysBeforeDueDate || null,
    enabled: billVendor.autoPay.enabled || false,
    maxAmount: billVendor.autoPay.maxAmount || null,
  };
}

export function createVendorPaymentInformation(billVendor: BillVendor): VendorPaymentInformation | null {
  if (!billVendor.paymentInformation) {
    return null;
  }
  return {
    vendorId: billVendor.id,
    email: billVendor.paymentInformation.email || null,
    lastPaymentDate: billVendor.paymentInformation.lastPaymentDate || null,
    payBySubType: billVendor.paymentInformation.payBySubType || "UNDEFINED",
    payByType: billVendor.paymentInformation.payByType || "UNDEFINED",
    payeeName: billVendor.paymentInformation.payeeName || null,
  };
}

export function createVendorVirtualCard(billVendor: BillVendor): VendorVirtualCard | null {
  if (!billVendor.paymentInformation || !billVendor.paymentInformation.virtualCard) {
    return null;
  }
  return {
    vendorId: billVendor.id,
    alternatePayByType: billVendor.paymentInformation.virtualCard.alternatePayByType || null,
    declineDate: billVendor.paymentInformation.virtualCard.declineDate || null,
    enrollDate: billVendor.paymentInformation.virtualCard.enrollDate || null,
    remitEmail: billVendor.paymentInformation.virtualCard.remitEmail || null,
    status: billVendor.paymentInformation.virtualCard.status || null,
  }
}

