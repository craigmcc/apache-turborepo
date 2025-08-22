/**
 * Utility functions for creating Prisma models from Bill API models.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import {
  BillAccount,
  BillBill,
  BillBillApprover,
  BillBillLineItem,
  BillRecurringBill,
  BillRecurringBillLineItem,
  BillUser,
  BillVendor,
  BillVendorCredit,
  BillVendorCreditApprover,
  BillVendorCreditLineItem,
  BillVendorCreditUsage,
} from "@repo/bill-api/Models";
import {
  Account,
  Bill,
  BillApprover,
  BillClassifications,
  BillLineItem,
  BillLineItemClassifications,
  RecurringBill,
  RecurringBillLineItem,
  RecurringBillLineItemClassifications,
  RecurringBillSchedule,
  User,
  Vendor,
  VendorAdditionalInfo,
  VendorAddress,
  VendorAutoPay,
  VendorCredit,
  VendorCreditApprover,
  VendorCreditLineItem,
  VendorCreditLineItemClassifications,
  VendorCreditUsage,
  VendorPaymentInformation,
  VendorVirtualCard,
} from "@repo/bill-db/Models";

// Public Objects ------------------------------------------------------------

export function createAccount(billAccount: BillAccount): Account {
  return {
    id: billAccount.id,
    accountNumber: billAccount.accountNumber || null,
    accountType: billAccount.accountType || null,
    ca1099FormType: billAccount.ca1099FormType || null,
    ca1099Type: billAccount.ca1099Type || null,
    createdTime: billAccount.createdTime || null,
    description: billAccount.description || null,
    entity: billAccount.entity || null,
    isActive: billAccount.isActive === "1",
    name: billAccount.name || null,
    updatedTime: billAccount.updatedTime || null,
    parentChartOfAccountId: billAccount.parentChartOfAccountId || null,
  };
}

export function createBill(bill: BillBill): Bill {
  return {
    id: bill.id,
    amount: bill.amount || null,
    archived: bill.archived || null,
    createdTime: bill.createdTime || null,
    creditAmount: bill.creditAmount || null,
    description: bill.description || null,
    dueAmount: bill.dueAmount || null,
    dueDate: bill.dueDate || null,
    exchangeRate: bill.exchangeRate || null,
    fundingAmount: bill.fundingAmount || null,
    invoiceDate: bill.invoice?.invoiceDate || null,
    invoiceNumber: bill.invoice?.invoiceNumber || null,
    paidAmount: bill.paidAmount || null,
    updatedTime: bill.updatedTime || null,
    vendorName: bill.vendorName || null,
    payFromChartOfAccountId: bill.payFromChartOfAccountId || null,
    vendorId: bill.vendorId,
  };
}

export function createBillApprover(billBillApprover: BillBillApprover): BillApprover {
  return {
    id: billBillApprover.id,
    entity: billBillApprover.entity || null,
    isActive: billBillApprover.isActive === "1",
    lastReminderDate: billBillApprover.lastReminderDate || null,
    sortOrder: billBillApprover.sortOrder || null,
    status: billBillApprover.status || "UNDEFINED",
    statusChangedDate: billBillApprover.statusChangedDate || null,
    billId: billBillApprover.billId,
    userId: billBillApprover.usersId,
  };
}

export function createBillClassifications(bill: BillBill): BillClassifications | null {
  if (!bill.classifications) {
    return null;
  }
  return {
    billId: bill.id,
    accountingClassId: bill.classifications.accountingClassId || null,
    chartOfAccountId: bill.classifications.chartOfAccountId || null,
    departmentId: bill.classifications.departmentId || null,
    itemId: bill.classifications.itemId || null,
    locationId: bill.classifications.locationId || null,
  };
}

export function createBillLineItem(bill: BillBill, billLineItem: BillBillLineItem): BillLineItem {
  return {
    id: billLineItem.id,
    amount: billLineItem.amount || null,
    description: billLineItem.description || null,
    price: billLineItem.price || null,
    quantity: billLineItem.quantity || null,
    billId: bill.id,
  };
}

export function createBillLineItemClassifications(bill: BillBill, billLineItem: BillBillLineItem): BillLineItemClassifications {
  return {
    billLineItemId: billLineItem.id,
    accountingClassId: billLineItem.classifications?.accountingClassId || null,
    chartOfAccountId: billLineItem.classifications?.chartOfAccountId || null,
    customerId: billLineItem.classifications?.customerId || null,
    departmentId: billLineItem.classifications?.departmentId || null,
    employeeId: billLineItem.classifications?.employeeId || null,
    itemId: billLineItem.classifications?.itemId || null,
    jobId: billLineItem.classifications?.jobId || null,
    locationId: billLineItem.classifications?.locationId || null,
  };
}

export function createRecurringBill(bill: BillRecurringBill): RecurringBill {
  return {
    id: bill.id,
    archived: bill.archived || null,
    createdTime: bill.createdTime || null,
    description: bill.description || null,
    paymentInformationBankAccountId: bill.paymentInformation?.bankAccountId || null,
    processingOptionsAutoPay: bill.processingOptions?.autoPay || null,
    updatedTime: bill.updatedTime || null,
    vendorId: bill.vendorId,
  };
}

export function createRecurringBillLineItem(bill: BillRecurringBill, billLineItem: BillBillLineItem): RecurringBillLineItem {
  return {
    id: billLineItem.id,
    amount: billLineItem.amount || null,
    description: billLineItem.description || null,
    recurringBillId: bill.id,
  };
}

export function createRecurringBillLineItemClassifications(bill: BillRecurringBill, billLineItem: BillRecurringBillLineItem): RecurringBillLineItemClassifications {
  return {
    id: billLineItem.id,
    accountingClassId: billLineItem.classifications?.accountingClassId || null,
    chartOfAccountId: billLineItem.classifications?.chartOfAccountId || null,
    departmentId: billLineItem.classifications?.departmentId || null,
    employeeId: billLineItem.classifications?.employeeId || null,
    itemId: billLineItem.classifications?.itemId || null,
    jobId: billLineItem.classifications?.jobId || null,
    locationId: billLineItem.classifications?.locationId || null,
  };
}

export function createRecurringBillSchedule(bill: BillRecurringBill): RecurringBillSchedule {
  return {
    id: bill.id,
    daysInAdvance: bill.schedule?.daysInAdvance || null,
    endDate: bill.schedule?.endDate || null,
    frequency: bill.schedule?.frequency || null,
    period: bill.schedule?.period || null,
  }
}

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
    rppsId: billVendor.rppsId || null,
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

export function createVendorCredit(billVendorCredit: BillVendorCredit): VendorCredit {
  return {
    id: billVendorCredit.id,
    amount: billVendorCredit.amount || null,
    appliedAmount: billVendorCredit.appliedAmount || null,
    archived: billVendorCredit.archived || null,
    createdDate: billVendorCredit.createdDate || null,
    description: billVendorCredit.description || null,
    referenceNumber: billVendorCredit.referenceNumber || null,
    vendorCreditStatus: billVendorCredit.vendorCreditStatus || "UNDEFINED",
    applyToBankAccountId: billVendorCredit.applyToBankAccountId || null,
    applyToChartOfAccountId: billVendorCredit.applyToChartOfAccountId || null,
    vendorId: billVendorCredit.vendorId!,
  };
}

export function createVendorCreditApprover(billVendorCreditApprover: BillVendorCreditApprover): VendorCreditApprover {
  return {
    id: billVendorCreditApprover.id,
    entity: billVendorCreditApprover.entity || null,
    isActive: billVendorCreditApprover.isActive === "1",
    lastReminderDate: billVendorCreditApprover.lastReminderDate || null,
    sortOrder: billVendorCreditApprover.sortOrder || null,
    status: billVendorCreditApprover.status || "UNDEFINED",
    statusChangedDate: billVendorCreditApprover.statusChangedDate || null,
    userId: billVendorCreditApprover.usersId,
    vendorCreditId: billVendorCreditApprover.vendorCreditId,
  };
}

export function createVendorCreditLineItem(vendorCreditId: string, billVendorCredit: BillVendorCredit): VendorCreditLineItem {
  return {
    id: billVendorCredit.id,
    amount: billVendorCredit.amount || null,
    description: billVendorCredit.description || null,
    vendorCreditId: vendorCreditId,
  };
}

export function createVendorCreditLineItemClassifications(billVendorCreditLineItem: BillVendorCreditLineItem): VendorCreditLineItemClassifications {
  return {
    id: billVendorCreditLineItem.id,
    accountingClassId: billVendorCreditLineItem.classifications?.accountingClassId || null,
    customerId: billVendorCreditLineItem.classifications?.customerId || null,
    departmentId: billVendorCreditLineItem.classifications?.departmentId || null,
    employeeId: billVendorCreditLineItem.classifications?.employeeId || null,
    itemId: billVendorCreditLineItem.classifications?.itemId || null,
    jobId: billVendorCreditLineItem.classifications?.jobId || null,
    locationId: billVendorCreditLineItem.classifications?.locationId || null,
    chartOfAccountId: billVendorCreditLineItem.classifications?.chartOfAccountId || null,
  }
}

export function createVendorCreditUsage(billVendorCreditId: string, usage: BillVendorCreditUsage, index: number): VendorCreditUsage {
  return {
    vendorCreditId: billVendorCreditId,
    index: index,
    amount: usage.amount || null,
    billId: usage.billId || null,
    paymentId: usage.paymentId || null,
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

