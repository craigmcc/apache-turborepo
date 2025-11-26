/**
 * Type definitions for QuickBooks Online API interactions.
 * These are derived from QBO file IntuitNameTypes.xsd for minversion 75.
 */

// Start next at line 118

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

// Line 49 - Job status enumeration.
export enum JobStatusEnum {
  Awarded = "Awarded",
  Closed = "Closed",
  InProgress = "InProgress",
  None = "None",
  NotAwarded = "NotAwarded",
  Pending = "Pending",
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

// Line 65 - Enumeration of types for time entries with paychecks.
export enum TimeEntryUsedForPaychecksEnum {
  DoNotUseTimeEntry = "DoNotUseTimeEntry",
  NotSet = "NotSet",
  UseTimeEntry = "UseTimeEntry",
}

// Line 79 - Enumeration of Tax Report Basis for France.
export enum TaxReportBasisTypeEnum {
  Accrual = "Accrual",
  Cash = "Cash",
}

