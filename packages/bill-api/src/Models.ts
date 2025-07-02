/**
 * Types for Bill API model objects.
 */

// Data Models ---------------------------------------------------------------

/**
 * The parameters for a Bill login request are presented in
 * a content-type of "application/x-www-form-urlencoded"
 * with the following keys:
 * - `devKey`: The Bill developer key
 * - `orgId`: The Bill organization ID
 * - `password`: The Bill password
 * - `userName`: The Bill username
 */

/**
 * A Bill Chart of Accounts object (V2)
 */
export type BillAccount = {
  // The Bill-generated ID of the chart of accounts (begins with "0ca")
  id: string;
  // Account number
  accountNumber?: string;
  // Account type code (0-16)
  accountType?: string;
  // CA Form 1099 form type (0=none, 1=MISC2021, 2=NEC2021) for Sage Intacct
  ca1099FormType?: string;
  // CA Form 1099 filing categorization (0-14) for Sage Intacct
  ca1099Type?: string;
  // The date/time the account was created
  createdTime: string;
  // Description of this account
  description?: string;
  // Entity object type (should be "ChartOfAccount")
  entity?: string;
  // Error code (if this is an error response)
  error_code?: string;
  // Error message (if this is an error response)
  error_message?: string;
  // Is this account active (1=yes, 2=no)?
  isActive?: string;
  // Parent account that the current ID is merged into (if any)
  mergedIntoId?: string;
  // Name of this account
  name?: string;
  // ID of the parent account (if any)
  parentChartOfAccountId?: string;
  // The date/time the account was updated
  updatedTime: string;
}

/**
 * Mapping of account type codes to their descriptions.
 */
export const BillAccountTypes = new Map<string, string>([
  ["0", "Unspecified"],
  ["1", "Accounts Payable"],
  ["2", "Accounts Receivable"],
  ["3", "Bank"],
  ["4", "Cost of Goods Sold"],
  ["5", "Credit Card"],
  ["6", "Equity"],
  ["7", "Expense"],
  ["8", "Fixed Asset"],
  ["9", "Income"],
  ["10", "Long Term Liability"],
  ["11", "Other Asset"],
  ["12", "Other Current Asset"],
  ["13", "Other Current Liability"],
  ["14", "Other Expense"],
  ["15", "Other Income"],
  ["16", "Non Posting"],
]);

/**
 * A generic address object from the Bill API.
 */
export type BillAddress = {
  // The Bill address city
  city: string;
  // The country of the address (ISO2 two-letter country code)
  country: string;
  // Country name of the address
  countryName?: string;
  // Line 1 of the address
  line1: string;
  // Line 2 of the address
  line2?: string;
  // The state or province of the address
  stateOrProvince?: string;
  // The postal code of the address
  zipOrPostalCode: string;
}

export const BillApproverStatuses = new Map<string, string>([
  ["0", "Waiting"],
  ["1", "Viewed"],
  ["2", "Rerouted"],
  ["3", "Denied"],
  ["4", "Approved"],
  ["5", "Upcoming"],
  ["6", "Stale"],
]);

/**
 * A Bill "bill" object (V3).
 */
export type BillBill = {
  // The Bill-generated bill ID (begins with "00n")
  id: string;
  // Bill total amount (local currency)
  amount?: number;
  // Has this bill been archived?
  archived?: boolean;
  // Line items on this bill
  billLineItems?: BillBillLineItem[];
  // Classifications for this bill
  classifications?: BillBillClassifications;
  // Date/time the bill was created
  createdTime?: string;
  // Credit amount applied to this bill
  creditAmount?: number;
  // Description of the bill
  description?: string;
  // Amount still due (after subtracting credits, scheduled payments, and cleared payments)
  dueAmount?: number;
  // Due date for the bill payment (yyyy-MM-dd)
  dueDate?: string;
  // Exchange rate for bills not in USD (may differ at settlement time)
  exchangeRate?: number;
  // Bill total amount (USD)
  fundingAmount?: number;
  // Invoice information
  invoice?: {
    // The date of this invoice (yyyy-MM-dd)
    invoiceDate: string;
    // The user-generated invoice number
    invoiceNumber?: string;
  };
  // Amount that has been paid minus any credits
  paidAmount?: number;
  // Bill-generated ID of the chart of accounts for bill payment (begins with "0ca")
  payFromChartOfAccountId?: string;
  // Bill payment status
  paymentStatus?: BillBillPaymentStatus;
  // Amount scheduled to be paid and is pending clearance
  scheduledAmount?: number;
  // Date/time the bill was last updated
  updatedTime?: string;
  // Bill-generated ID of the bill vendor (begins with "009")
  vendorId: string;
  // Corresponding name of the bill vendor
  vendorName: string;
}

/**
 * General ledger classifications for a bill.
 */
export type BillBillClassifications = {
  // The Bill-generated ID of the accounting class (begins with "cls")
  accountingClassId?: string;
  // The Bill-generated ID of the chart of accounts (begins with "0ca")
  chartOfAccountId: string;
  // The Bill-generated ID of the department (begins with "0de")
  departmentId?: string;
  // The Bill-generated ID of the item (begins with "0ii")
  itemId?: string;
  // The Bill-generated ID of the location (begins with "loc")
  locationId?: string;
}

/**
 * A Bill Bill Approver (V2).
 * NOTE: This is not documented, but the V2 API endpoint seems to exist.
 */
export type BillBillApprover = {
  // The Bill-generated ID of the vendor credit approver (begins with "0ba")
  id: string;
  // The Bill-generated ID of the bill being approved (begins with "00n")
  billId: string;
  // Object type (should be "BillApprover")
  entity?: string;
  // Is this approver active? (1=yes, 2=no)
  isActive?: string;
  // Timestamp of last approval reminder sent to this approver
  lastReminderDate?: string;
  // Zero-relative index of this approver in the approval chain
  sortOrder?: number;
  // Status of this bill approval (will be replaced during refresh)
  status?: string;
  // Timestamp of the last status change
  statusChangedDate?: string;
  // Bill-generated ID of the User that is the approver (begins with "006")
  usersId: string;
}

/**
 * A line item on a bill (V3).
 */
export type BillBillLineItem = {
  // The Bill-generated ID of the bill line item (begins with "bli")
  id: string;
  // Amount for this line item (local currency)
  amount?: number;
  // General ledger classifications for this line item
  classifications?: BillBillLineItemClassifications
  // The description of the bill line item
  description?: string;
  // Bill-generated ID of the chart of accounts for the
  // Unit price for this line item (local currency)
  price?: number;
  // Quantity for this line item
  quantity?: number;
}

/**
 * General ledger classifications for a bill line item.
 */
export type BillBillLineItemClassifications = {
  // The Bill-generated ID of the accounting class (begins with "cls")
  accountingClassId?: string;
  // The Bill-generated ID of the chart of accounts (begins with "0ca")
  chartOfAccountId: string;
  // The Bill-generated ID of the customer (begins with "0cu")
  customerId?: string;
  // The Bill-generated ID of the department (begins with "0de")
  departmentId?: string;
  // The Bill-generated ID of the employee (begins with "emp")
  employeeId?: string;
  // The Bill-generated ID of the item (begins with "0ii")
  itemId?: string;
  // The Bill-generated ID of the job (begins with "job")
  jobId?: string;
  // The Bill-generated ID of the location (begins with "loc")
  locationId?: string;
}

export type BillBillPaymentStatus =
  "IN_PROCESS" | "PAID" | "PARTIALLY_PAID" |
  "SCHEDULED" | "UNDEFINED" | "UNPAID";

/**
 * An API operation that fails will return an error object with the following properties:
 * TODO: looks like v3 is different.
 */
export type BillErrorResponse = {
  response_status: number; // Will be 1 for an error
  response_message: string; // Will be "Error" for an error
  response_data: {
    error_code: string; // A unique error code
    error_message: string; // A human-readable error message
  }
}

/**
 * A generic list response from the Bill API.  The generic type `T` should be replaced with the specific type of the items in the list.
 */
export type BillListResponse<T> = {
  // The optional ID for the next page of results, if there are more results available
  nextPage?: string;
  // The optional ID for the previous page of results, if there are previous results available
  prevPage?: string;
  // The list of results in the response
  results: T[];
}

/**
 * The request parameters for a Bill login request.
 */
export type BillLoginRequest = {
  // The Bill developer key
  devKey: string;
  // The Bill organization ID
  organizationId: string;
  // The Bill password
  password: string;
  // The Bill username
  username: string;
}

/**
 * The response for a successful Bill login request.
 */
export type BillLoginResponse = {
  // The API endpoint URL for the Bill API (V2 only)
  apiEndpoint?: string;
  // The bill organization ID
  organizationId: string;
  // The session ID to use for subsequent API requests
  sessionId: string;
  // Is this session trusted?
  trusted: boolean;
  // The user ID for the Bill API
  userId: string;
}

/**
 * A Bill User object (V3).
 */
export type BillUser = {
  // The Bill user ID (begins with "006")
  id: string;
  // Has this User been archived?
  archived: boolean;
  // The date/time the Bill user was created
  createdTime: string;
  // The Bill user email address
  email: string;
  // The Bill user first name
  firstName: string;
  // The Bill user last name
  lastName: string;
  // The Bill user role
  role: BillUserRole;
  // The date/time the Bill user was last updated
  updatedTime: string;
}

/**
 * A Bill User Role object (V3).
 */
export type BillUserRole = {
  // The Bill user role description
  description?: string;
  // The Bill user role ID
  id: string;
  // The Bill user role type
  type: BillUserRoleType;
}

/**
 * The valid user role types for the Bill API.
 */
export type BillUserRoleType =
  "ACCOUNTANT" | "ADMINISTRATOR" | "APPROVER" | "AUDITOR" |
  "CLERK" | "CUSTOM" | "INTERNAL" | "MEMBER" | "NO_ACCESS" |
  "PARTNER" | "PAYER" | "PURCHASE_REQUESTER" | "REVIEWER" | "UNDEFINED";

/**
 * A Bill Vendor object (V3).
 */
export type BillVendor = {
  // The Bill vendor ID (begins with "009")
  id: string;
  // User account number set by the vendor
  accountNumber?: string;
  // Vendor account type
  accountType?: BillVendorType;
  // Vendor additional information
  additionalInfo?: BillVendorAdditionalInfo;
  // The Bill vendor address
  address?: BillAddress;
  // Has this Vendor been archived?
  archived: boolean;
  // The Bill vendor autopay information
  autoPay?: BillVendorAutoPay;
  // The Bill vendor balance information
  balance?: BillVendorBalance;
  // The Bill vendor bank account status
  bankAccountStatus?: BillVendorBankAccountStatus;
  // The bill currency for this vendor (ISO 4217 three-letter currency code)
  billCurrency?: string;
  // The date/time the Bill vendor was created
  createdTime: string;
  // The Bill vendor email address
  email?: string;
  // The Bill vendor name
  name: string;
  // Network connection status (if available to this vendor)
  networkStatus?: BillVendorNetworkStatus;
  // The Bill vendor payment information
  paymentInformation?: BillVendorPaymentInformation;
  // Vendor phone number (overridden when using Bill Network vendors)
  phone?: string;
  // Does this vendor have recurring payments enabled?
  recurringPayments?: boolean;
  // Bill-generated ID of the verified national vendor (if any)
  rppsId?: string;
  // The Bill vendor short name
  shortName?: string;
  // The date/time the Bill vendor was last updated
  updatedTime: string;
}

export type BillVendorAdditionalInfo = {
  // OK to combine a bulk payment for this vendor?
  combinePayment?: boolean;
  // Vendor business name (required by IRS)
  companyName?: string;
  // Lead time in days for vendor payments
  leadTimeInDays?: number;
  // Bill-generated ID of the payment term for this vendor
  paymentTermId?: string;
  // Vendor tax ID
  taxId?: string;
  // Vendor tax ID type
  taxIdType?: BillVendorTaxIdType;
  // Vendor eligible to receive 1099?
  track1099?: boolean;
}

export type BillVendorAlternatePayByType =
  "ACH" | "AMEX" | "CHECK" | "CREDIT_CARD" | "INTERNATIONAL_E_PAYMENT" |
  "OFFLINE" | "PAYPAL" | "RPPS" | "UNDEFINED" | "VIRTUAL_CARD" | "WALLET";

export type BillVendorAutoPay = {
  // Bill-generated ID of the organization bank account used for autopay
  bankAccountId?: string;
  // Bill-generated ID of the user that set up vendor autopay
  createdBy?: string;
  // Number of days before the bill payment due date that autopay is enabled
  daysBeforeDueDate?: number;
  // Is vendor auto pay enabled?
  enabled?: boolean;
  // Maximum amount for which vendor autopay is enabled
  maxAmount?: number;
}

export type BillVendorBalance = {
  // Amount to be paid to the vendor
  amount?: number;
  // Last date/time the balance amount was updated
  lastUpdatedDate?: string;
}

export type BillVendorBankAccountStatus =
  "NET_LINKED_ACCOUNT" | "NO_ACCOUNT" | "NO_NET_LINKED_ACCOUNT" | "UNDEFINED";

export type BillVendorNetworkStatus =
  "CONNECTED" | "CONNECTED_RPPS" | "NOT_CONNECTED" | "PENDING";

export type BillVendorPayBySubType =
  "ACH" | "IACH" | "LOCAL" | "MULTIPLE" | "NONE" | "UNDEFINED" | "WIRE";

export type BillVendorPayByType =
  "ACH" | "CHECK" | "INTERNATIONAL_E_PAYMENT" | "OFFLINE" | "RPPS" |
  "UNDEFINED" | "VIRTUAL_CARD" | "WALLET";

export type BillVendorPaymentInformation = {
  // Vendor email address for receiving payment information
  email?: string;
  // Last payment date
  lastPaymentDate?: string;
  // Payment delivery method for making international payments
  payBySubType?: BillVendorPayBySubType;
  // Payment method for Bill payments
  payByType?: BillVendorPayByType;
  // Vendor name for check and electronic payments (overridden for Bill Network vendors)
  payeeName?: string;
  // Virtual card information
  virtualCard?: BillVendorVirtualCard;
}

export type BillVendorTaxIdType =
  "EIN" | "SSN" | "UNDEFINED";

export type BillVendorType =
  "BUSINESS" | "NONE" | "PERSON" | "UNDEFINED";

export type BillVendorVirtualCard = {
  // The alternate payment method for virtual card settlement
  alternatePayByType?: BillVendorAlternatePayByType;
  // Date/time the virtual card was declined
  declineDate?: string;
  // Date/time the virtual card was enrolled
  enrollDate?: string;
  // Remittance email address for this vendor
  remitEmail?: string;
  // Enrollment status for this vendor
  status: BillVendorVirtualCardStatus;
}

export type BillVendorVirtualCardStatus =
  "CONFIRMED" | "DECLINED" | "ENROLLED" | "ON_HOLD" | "OPEN" |
  "PAY_FOR_YOUR_OPPORTUNITY" | "PAYER_ASSIST" | "PENDING" |
  "PHONE_NUMBER_NEEDED" | "RECRUITING" | "REQUIRE_MORE_INFO" |
  "UNDEFINED" | "UNKNOWN" | "VERBAL_COMMITMENT";

/**
 * A Bill Vendor Credit object (V3).
 */
export type BillVendorCredit = {
  // The Bill-generated ID of the vendor credit (begins with "vcr")
  id: string;
  // Amount of the vendor credit
  amount?: number;
  // Amount of the vendor credit that has been applied to invoices
  appliedAmount?: number;
  // NOTE: Only one of the following two properties should be set.
  // ID of the Bank Account for this vendor credit (begins with "bac")
  applyToBankAccountId?: string;
  // ID of the Chart of Accounts for this vendor credit (begins with "0ca")
  applyToChartOfAccountId?: string;
  // Has this vendor credit been archived?
  archived?: boolean;
  // Date this vendor credit was created (yyyy-MM-dd)
  createdDate?: string;
  // Vendor credit description
  description?: string;
  // User-generated reference number for this vendor credit
  referenceNumber?: string;
  // Usage information for this vendor credit
  usage?: BillVendorCreditUsage[];
  // Line items for this vendor credit
  vendorCreditLineItems?: BillVendorCreditLineItem[];
  // Status of this vendor credit
  vendorCreditStatus?: BillVendorCreditStatus;
  // ID of the Vendor this credit is for (begins with "009")
  vendorId?: string;
}

export type BillVendorCreditStatus =
  "FULLY_APPLIED" | "NOT_APPLIED" | "PARTIALLY_APPLIED" | "UNDEFINED";

/**
 * A Bill Vendor Credit Approver (V2).
 */
export type BillVendorCreditApprover = {
  // The Bill-generated ID of the vendor credit approver (begins with "vca")
  id: string;
  // Object type (should be "VendorCreditApprover")
  entity?: string;
  // Is this approver active? (1=yes, 2=no)
  isActive?: string;
  // Timestamp of last approval reminder sent to this approver
  lastReminderDate?: string;
  // Zero-relative index of this approver in the approval chain
  sortOrder?: number;
  // Status of this vendor credit approval (will be replaced during refresh)
  status?: string;
  // Timestamp of the last status change
  statusChangedDate?: string;
  // Bill-generated ID of the User that is the approver (begins with "006")
  usersId: string;
  // Bill-generated ID of the vendor credit (begins with "vcr")
  vendorCreditId: string;
}

/**
 * A Bill Vendor Credit Line Item object (V3).
 */
export type BillVendorCreditLineItem = {
  // The Bill-generated ID of the vendor credit line item (begins with "vci")
  id: string;
  // Amount for this line item
  amount?: number;
  // Classifications for this vendor credit line item
  classifications?: BillVendorCreditLineItemClassifications;
  // Description of this line item
  description?: string;
}

/**
 * A Bill Vendor Credit Line Item Classifications object (V3).
 */
export type BillVendorCreditLineItemClassifications = {
  // The Bill-generated ID of the accounting class (begins with "cls")
  accountingClassId?: string;
  // The Bill-generated ID of the chart of accounts (begins with "0ca")
  chartOfAccountId: string;
  // The Bill-generated ID of the customer (begins with "0cu")
  customerId?: string;
  // The Bill-generated ID of the department (begins with "0de")
  departmentId?: string;
  // The Bill-generated ID of the employee (begins with "emp")
  employeeId?: string;
  // The Bill-generated ID of the item (begins with "0ii")
  itemId?: string;
  // The Bill-generated ID of the job (begins with "job")
  jobId?: string;
  // The Bill-generated ID of the location (begins with "loc")
  locationId?: string;
}

/**
 * A Bill Vendor Credit Usage object (V3).
 */
export type BillVendorCreditUsage = {
  // Amount of the vendor credit that has been applied
  amount?: number;
  // ID of the bill to which this vendor credit has been applied (begins with "00n")
  billId?: string;
  // The Bill-generated ID of the payment
  paymentId?: string;
}
