/**
 * Type definitions for QuickBooks Online API interactions.
 * These are derived from QBO file IntuitNameTypes.xsd for minversion 75.
 */

// Internal Modules ----------------------------------------------------------

import {
  IntuitEntity,
} from "./IntuitBaseTypes";

// Public Objects ------------------------------------------------------------

// Line 36 - Valid only for UK region, CIS Rate for Vendor enumeration.
export enum CISRateEnum {
  "CIS gross rate (0%)" = "CIS gross rate (0%)",
  "CIS standard rate (20%)" = "CIS standard rate (20%)",
  "CIS higher rate (30%)" = "CIS higher rate (30%)",
}

// TODO Line 333 - The Customer entity represents the consumer of the service
// or the product that your business offers. QBO allows categorizing the
// customers in a way that is meaningful to the business. For example,
// you can set up a category of customers to indicate which industry a
// customer represents, the geographic location of a customer, or how a
// customer came to know about the business. The categorization can be
// then used for reports or mails.
export type Customer = NameBase & {
}

// TODO Line 1064 - Customer types allow categorizing customers in ways
// that are meaningful to the business. For example, one could set up
// customer types so that they indicate which industry a customer
// represents, a customer's geographic location, or how a customer
// first heard about the business. The categorization then can be
// used for reporting or mailings.
export type CustomerType = IntuitEntity & {
}

// TODO Line 1113 - Describes the Party as a Employee Role view.
export type EmployeeType = NameBase & {
}

// Line 8 - Employee type enumeration.
export enum EmployeeTypeEnum {
  Officer = "Officer",
  Owner = "Owner",
  Regular = "Regular",
  Statutory = "Statutory",
}

// Line 91 - Enumeration of Inventory Lots and Accounts calculation
export enum FifoCalculationStatus {
  Completed = "Completed",
  Error = "Error",
  InProgress = "InProgress",
  None = "None",
}

// TODO Line 1220 - Details for the Job. This is applicable only to
//  QuickBooks Windows desktop.
export type JobInfo = {
}

// Line 49 - Job status enumeration.
export enum JobStatusEnum {
  Awarded = "Awarded",
  Closed = "Closed",
  InProgress = "InProgress",
  None = "None",
  NotAwarded = "NotAwarded",
  Pending = "Pending",
}

// TODO Line 1278 - Job types allow for categorizing jobs so that similar
//  jobs can be grouped and subtotaled on reports. Ultimately, they will
//  help in determining which jobs are most profitable for the business.
export type JobType = IntuitEntity & {
}

// TODO Line 118 - Describes the base class of name entities (Customer,
//  Employee, Vendor, OtherName).
export type NameBase = IntuitEntity & {
}

// TODO Line 1326 - Describes the Other Name (aka Payee). QBD only.
export type OtherName = NameBase & {
}

// Line 105 - Enumeration of external sources that create the entites in QBO.
export enum SourceTypeEnum {
  QBCommerce = "QBCommerce",
}

// Line 22 - Valid only for UK region, Subcontractor type enumeration.
export enum SubcontractorTypeEnum {
  Individual = "Individual",
  Company = "Company",
  Partnership = "Partnership",
  Trust = "Trust",
}

// TODO Line 1402 - Represents a tax agency to whom sales/purchase/VAT
// taxes collected are paid.
export type TaxAgency = Vendor & {
}

// Line 79 - Enumeration of Tax Report Basis for France.
export enum TaxReportBasisTypeEnum {
  Accrual = "Accrual",
  Cash = "Cash",
}

// Line 65 - Enumeration of types for time entries with paychecks.
export enum TimeEntryUsedForPaychecksEnum {
  DoNotUseTimeEntry = "DoNotUseTimeEntry",
  NotSet = "NotSet",
  UseTimeEntry = "UseTimeEntry",
}

// TODO Line 736 - Represents a User with an Intuit account.  Note that based
// on privacy restrictions, information returned may be limited depending on
// calling origin and/or calling user permissions (ex: a user may be able to
// look up all of their information, but not the information regarding other
// users).
export type User = IntuitEntity & {
}

// TODO Line 775 - Describes the Party as a Vendor Role view.
export type Vendor = NameBase & {
}

// TODO Line 1453 - Contains Bank Account details to process the batch
// payment for Vendors. Applicable for AU region only.
export type VendorBankAccountDetail = {
}

// TODO Line 1365 - Vendor types allow categorizing vendors in ways
//  that are meaningful to the business. For example, one could set up
//  vendor types so that they indicate a vendor's industry or geographic
//  location. The categorization then can be used for reporting.
export type VendorType = IntuitEntity & {
}
