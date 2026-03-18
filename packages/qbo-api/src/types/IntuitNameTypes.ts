/**
 * Type definitions for QuickBooks Online API interactions.
 * These are derived from QBO file IntuitNameTypes.xsd for minversion 75.
 */

// Internal Modules ----------------------------------------------------------

import {
  ContactInfo,
  CreditChargeInfo,
  EmailAddress,
  IntuitEntity,
  PhysicalAddress,
  ReferenceType,
  WebsiteAddress,
} from "./IntuitBaseTypes";

// Public Objects ------------------------------------------------------------

// Line 36 - Valid only for UK region, CIS Rate for Vendor enumeration.
export enum CISRateEnum {
  "CIS gross rate (0%)" = "CIS gross rate (0%)",
  "CIS standard rate (20%)" = "CIS standard rate (20%)",
  "CIS higher rate (30%)" = "CIS higher rate (30%)",
}

// Line 333 - The Customer entity represents the consumer of the service
// or the product that your business offers. QBO allows categorizing the
// customers in a way that is meaningful to the business. For example,
// you can set up a category of customers to indicate which industry a
// customer represents, the geographic location of a customer, or how a
// customer came to know about the business. The categorization can be
// then used for reports or mails.
// Business Rules:  (1) The customer name must be unique, (2) The customer
// name must not include a colon (:), (3) The e-mail address of the customer
// must contain "@" and "." (dot), (4) The customer address field is
// mandatory.
export type Customer = NameBase & {
  // Name or number of the account associated with this customer.
  // Max. length: 99 characters.
  AcctNum?: string,
  // Name of the Alternate Customer contact.
  AltContactName?: string,
  // The A/R account ID for the customer. This is applicable only in FR where
  // each customer needs to have his own AR account.
  ARAccountRef?: ReferenceType | null,
  // Specifies the open balance amount or the amount unpaid by the customer.
  // For the create operation, this represents the opening balance for the
  // customer. When returned in response to the query request it represents
  // the current open balance (unpaid amount) for that customer.
  Balance?: number,
  // Cumulative open balance amount for the Customer (or Job) and all its
  // sub-jobs.
  BalanceWithJobs?: number,
  // Default billing address.
  BillAddr?: PhysicalAddress,
  // If true, this Customer is billed with its parent. If false, or null the
  // customer is not to be billed with its parent. This property is valid only
  // if this entity is a Job or sub Customer.
  BillWithParent?: boolean,
  // Business Number of the Customer. Applicable to CA/UK/IN versions of
  // QuickBooks. Referred to as PAN in India.
  BusinessNumber?: string,
  // Credit-card information to request a credit card payment from a merchant
  // account service.
  CCDetail?: CreditChargeInfo,
  // Name of the Customer contact.
  ContactName?: string,
  // Specifies the maximum amount of an unpaid customer balance.
  CreditLimit?: number,
  // Reference to the currency code for all the business transactions created
  // for or received from the customer.
  CurrencyRef?: ReferenceType,
  // Reference to a CustomerType associated with the Customer.
  CustomerTypeRef?: ReferenceType,
  // GST Identification Number of the Customer.
  // Applicable for IN region only.
  GSTIN?: string,
  // GST registration type of the Customer.
  // Applicable for IN region only.
  GSTRegistrationType?: string,
  // True if the customer is CIS contractor.
  IsCISContractor?: boolean,
  // Specifies whether this customer is a project.
  IsProject?: boolean,
  // If true, this is a Job or sub-customer. If false or null, this is a top
  // level customer, not a Job or sub-customer.
  Job?: boolean,
  // Information about the job. Relevant only if the Customer represents the
  // actual task or project, not just a person or organization.
  JobInfo?: JobInfo,
  // Specifies the level of the hierarchy in which the entity is located.
  // Zero specifies the top level of the hierarchy; anything above will be
  // level with respect to the parent.
  Level?: number,
  // Free form text describing the Customer. Max. length: 1024 characters.
  Notes?: string,
  // Date of the Open Balance for the create operation.
  OpenBalanceDate?: Date,
  // An address other than default billing  or shipping.
  OtherAddr?: PhysicalAddress[],
  // Over-due balance amount. Cannot be written to QuickBooks.
  OverDueBalance?: number,
  // The immediate parent of the Sub-Customer/Job in the hierarchical
  // "Customer:Job" list. Required for the create operation if the Customer
  // is a sub-customer or Job.
  ParentRef?: ReferenceType,
  // Reference to a PaymentMethod associated with the Customer.
  PaymentMethodRef?: ReferenceType,
  // Preferred delivery method. Vales are Print, Email, or None.
  PreferredDeliveryMethod?: string,
  // Reference to a PriceLevel associated with the Customer.
  PriceLevelRef?: ReferenceType,
  // Specifies primary Tax ID of the Person or Organization.
  PrimaryTaxIdentifier?: string,
  // Resale number or some additional info about the customer.
  ResaleNum?: string,
  // Reference to a SalesRep associated with the Customer.
  SalesRepRef?: ReferenceType,
  // Reference to a SalesTerm associated with the Customer.
  SalesTermRef?: ReferenceType,
  // Specifies secondary Tax ID of the Person or Organization. Applicable for
  // IN companies for CST Registration No. and in future can be extended to
  // other regions.
  SecondaryTaxIdentifier?: string,
  // Default shipping address.
  ShipAddr?: PhysicalAddress,
  // Originating source of the Customer. Valid values are defined
  // in SourceTypeEnum.
  Source?: string,
  // True if the customer is taxable.
  Taxable?: boolean,
  // Specifies tax exemption reason to be associated with Customer.
  TaxExemptReasonId?: string,
  // Tax regime of a customer which is required by CFDI4.0 in Mexico.
  // Visit http://omawww.sat.gob.mx/tramitesyservicios/Paginas/anexo_20_version3-3.htm
  // and find the catalogues that contain the accepted values of TaxRegime.
  TaxRegime?: string,
  // True, if TDS (Tax Deducted at Source) is enabled for this customer.
  TDSEnabled?: boolean,
  // The total expense amount for the Customer. Cannot be written to
  // QuickBooks.
  TotalExpense?: number,
  // The total revenue amount from the Customer. Cannot be written to
  // QuickBooks.
  TotalRevenue?: number,
}

// Line 1064 - Customer types allow categorizing customers in ways
// that are meaningful to the business. For example, one could set up
// customer types so that they indicate which industry a customer
// represents, a customer's geographic location, or how a customer
// first heard about the business. The categorization then can be
// used for reporting or mailings.
export type CustomerType = IntuitEntity & {
  // True if the customer type is active.
  Active?: boolean,
  // Fully qualified name of the entity.  The fully qualified name prepends
  // the topmost parent, followed by each sub element separated by colons.
  // Takes the form of Parent:Customer:Job:Sub-job. Limited to 5 levels.
  FullyQualifiedName?: string,
  // User recognizable name for the CustomerType.
  Name?: string,
  // Reference to the CustomerTypeParent.
  ParentRef?: ReferenceType,
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

// Line 1220 - Details for the Job. This is applicable only to
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

// Line 118 - Describes the base class of name entities (Customer,
//  Employee, Vendor, OtherName).
export type NameBase = IntuitEntity & {
  // If true, this entity is currently enabled for use by QuickBooks.
  // The default value is true.
  Active?: boolean,
  // Alternate phone number.
  AlternatePhone?: TelephoneNumber,
  // The name of the company associated with the person or organization.
  CompanyName?: string,
  // Reference to the tax code associated with the Customer or Vendor by
  // default for sales or purchase taxes.
  DefaultTaxCodeRef?: ReferenceType,
  // The name of the person or organization as displayed. If not provided,
  // this is populated from FullName.
  DisplayName?: string,
  // Family name or the last name of the person.
  // Max. length: 15 characters.
  // Validation Rules: At least one of the name elements is required:
  // Title, GivenName, MiddleName, FamilyName, or Suffix.
  FamilyName?: string,
  // Fax number.
  Fax?: TelephoneNumber,
  // Fully qualified name of the entity. The fully qualified name
  // prepends the topmost parent, followed by each sub element separated
  // by colons. Takes the form of Parent:Customer:Job:Sub-job.
  // Limited to 5 levels.  Max. length: 41 characters (single name) or
  // 209 characters (fully qualified name).
  FullyQualifiedName?: string,
  // Given name or first name of a person. Max. length: 25 characters
  // Validation Rules: At least one of the name elements is required:
  // Title, GivenName, MiddleName, FamilyName, or Suffix.
  GivenName?: string,
  // Represents the realm id, authid or an entity id. An entity is a new type
  // of IAM identity that represents a person or a business which has no
  // Intuit authentication context.
  IntuitId?: string,
  // Middle name of the person. The person can have zero or more middle names.
  // Max. length: 15 characters.
  // // Validation Rules: At least one of the name elements is required:
  // Title, GivenName, MiddleName, FamilyName, or Suffix.
  MiddleName?: string[],
  // Mobile phone number.
  MobilePhone?: TelephoneNumber,
  // True if the entity represents an organization; otherwise the entity
  // represents a person. Default is NULL or False, representing a person.
  Organization?: boolean,
  // List of ContactInfo entities of any contact info type. The ContactInfo
  // Type values are defined in the ContactTypeEnum.
  OtherContactInfo?: ContactInfo[],
  // Primary email address.
  PrimaryEmailAddr?: EmailAddress,
  // Primary phone number.
  PrimaryPhone?: TelephoneNumber,
  // Name of the person or organization as printed on a check. If not
  // provided, this is populated from FullName.
  PrintOnCheckName?: string,
  // Suffix appended to the name of a person. For example, Senior, Junior,
  // etc. Max. length: 15 characters.
  // Validation Rules: At least one of the name elements is required:
  // Title, GivenName, MiddleName, FamilyName, or Suffix.
  Suffix?: string,
  // Title of the person. The person can have zero or more titles.
  // Validation Rules: At least one of the name elements is required:
  // Title, GivenName, MiddleName, FamilyName, or Suffix.
  Title?: string[],
  // The ID of the Intuit user associated with this name.  Note: this is
  // NOT the Intuit AuthID of the user.
  UserId?: string,
  // Auto generated Public ID when a new customer/vendor/employee is added
  // to QBO. (ReadOnly)
  V4IDPseudonym?: string,
  // Website address (URI).
  WebAddr?: WebsiteAddress,
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

// Line TODO - TelephoneNumber
export type TelephoneNumber = {
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
