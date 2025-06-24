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
 * The response for a successful Bill login request will be a sessionId as a string.
 */

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
 * A Bill User object.
 */
export type BillUser = {
  // The Bill user ID
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
 * A Bill User Role object.
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
 * A Bill Vendor object.
 */
export type BillVendor = {
  // The Bill vendor ID
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
  rppsid?: string;
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
