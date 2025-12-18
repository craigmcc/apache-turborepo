/**
 * Type definitions for QuickBooks Online API interactions.
 * These are derived from QBO file IntuitBaseTypes.xsd for minversion 75.
 */

// TODO: Line 158
export type AttachableRef = {
  attachableRefEx?: IntuitAnyType;
  customField?: CustomField[];
  entityRef?: ReferenceType;
  includeOnSend?: boolean;
  lineInfo?: string;
}

// TODO: Line 379
export type BooleanTypeCustomFieldDefinition = {
}

// Line 1203 - Enumeration of AVSStreet and AVSZip match used in Credit Card
// payment transactions.
export enum CCAVSMatchEnum {
  Fail = "Fail",
  NotAvailable = "NotAvailable",
  Pass = "Pass",
}

// Line 1216 - Enumeration of the status of the Credit Card
// payment transaction.
export enum CCPaymentStatusEnum {
  Completed = "Completed",
  Unknown = "Unknown",
  Voided = "Voided",
}

// Line 1190 - Enumeration of Credit Card security code match used in
// Credit Card payment transactions.
export enum CCSecurityCodeMatchEnum {
  Fail = "Fail",
  NotAvailable = "NotAvailable",
  Pass = "Pass",
}

// Line 1229 = Enumeration of Credit Card transaction modes used in
// Credit Card payment transactions.
export enum CCTxnModeEnum {
  CardNotPresent = "CardNotPresent",
  CardPresent = "CardPresent",
}

// Line 1241 - Enumeration of Credit Card transaction types used in
// Credit Card payment transactions.
export enum CCTxnTypeEnum {
  Authorization = "Authorization",
  Capture = "Capture",
  Charge = "Charge",
  Refund = "Refund",
  VoiceAuthorization = "VoiceAuthorization",
}

// Line 516 = Types of ContactInfo entities.
export enum ContactTypeEnum {
  EmailAddress = "EmailAddress",
  GenericContactType = "GenericContactType",
  TelephoneNumber = "TelephoneNumber",
  WebsiteAddress = "WebsiteAddress",
}

// TODO: Line 530
export type ContactInfo = {
}

// Line 1256 - Enumeration of Credit Card types used in Credit Card
// payment transactions.
export enum CreditCardTypeEnum {
  Amex = "Amex",
  DebitCard = "DebitCard",
  Discover = "Discover",
  GiftCard = "GiftCard",
  MasterCard = "MasterCard",
  OtherCreditCard = "OtherCreditCard",
  Visa = "Visa",
}

// TODO: Line 1273
export type CreditChargeInfo = {
}

// TODO: Line 1395
export type CreditChargeResponse = {
}

// Line 1598 - ISO 4217 Currency Code enumeration.
export enum CurrencyCode {
  AED = "AED",
  AFA = "AFA",
  ALL = "ALL",
  ANG = "ANG",
  AOA = "AOA",
  AOK = "AOK",
  ARP = "ARP",
  ARS = "ARS",
  AMD = "AMD",
  ATS = "ATS",
  AUD = "AUD",
  AWF = "AWF",
  AWG = "AWG",
  AZM = "AZM",
  BAM = "BAM",
  BBD = "BBD",
  BDT = "BDT",
  BEF = "BEF",
  BGL = "BGL",
  BHD = "BHD",
  BIF = "BIF",
  BMD = "BMD",
  BND = "BND",
  BOB = "BOB",
  BRC = "BRC",
  BRL = "BRL",
  BSD = "BSD",
  BTN = "BTN",
  BUK = "BUK",
  BWP = "BWP",
  BYR = "BYR",
  BZD = "BZD",
  CAD = "CAD",
  CDF = "CDF",
  CHF = "CHF",
  CLP = "CLP",
  CNY = "CNY",
  COP = "COP",
  CRC = "CRC",
  CZK = "CZK",
  DDM = "DDM",
  DEM = "DEM",
  DJF = "DJF",
  DKK = "DKK",
  DOP = "DOP",
  DZD = "DZD",
  ECS = "ECS",
  EEK = "EEK",
  EGP = "EGP",
  ERN = "ERN",
  ESP = "ESP",
  ETB = "ETB",
  EUR = "EUR",
  FIM = "FIM",
  FJD = "FJD",
  FKP = "FKP",
  FRF = "FRF",
  GBP = "GBP",
  GEL = "GEL",
  GHC = "GHC",
  GIP = "GIP",
  GMD = "GMD",
  GNF = "GNF",
  GRD = "GRD",
  GTQ = "GTQ",
  GWP = "GWP",
  GYD = "GYD",
  HKD = "HKD",
  HNL = "HNL",
  HRK = "HRK",
  HTG = "HTG",
  HUF = "HUF",
  IDR = "IDR",
  IEP = "IEP",
  ILS = "ILS",
  INR = "INR",
  IQD = "IQD",
  IRR = "IRR",
  ISK = "ISK",
  ITL = "ITL",
  JMD = "JMD",
  JOD = "JOD",
  KES = "KES",
  KGS = "KGS",
  KHR = "KHR",
  KMF = "KMF",
  KPW = "KPW",
  KRW = "KRW",
  KWD = "KWD",
  KYD = "KYD",
  KZT = "KZT",
  LAK = "LAK",
  LBP = "LBP",
  LKR = "LKR",
  LRD = "LRD",
  LSL = "LSL",
  LTL = "LTL",
  LUF = "LUF",
  LVL = "LVL",
  LYD = "LYD",
  MAD = "MAD",
  MDL = "MDL",
  MGF = "MGF",
  MKD = "MKD",
  MMK = "MMK",
  MNT = "MNT",
  MOP = "MOP",
  MRO = "MRO",
  MUR = "MUR",
  MVR = "MVR",
  MWK = "MWK",
  NAD = "NAD",
  NGN = "NGN",
  NIC = "NIC",
  NIO = "NIO",
  NLG = "NLG",
  NOK = "NOK",
  NPR = "NPR",
  NZD = "NZD",
  OMR = "OMR",
  PAB = "PAB",
  PEN = "PEN",
  PES = "PES",
  PGK = "PGK",
  PHP = "PHP",
  PKR = "PKR",
  PLN = "PLN",
  PLZ = "PLZ",
  PTE = "PTE",
  PYG = "PYG",
  QAR = "QAR",
  ROL = "ROL",
  RUR = "RUR",
  RWF = "RWF",
  SAR = "SAR",
  SBD = "SBD",
  SCR = "SCR",
  SDD = "SDD",
  SEK = "SEK",
  SGD = "SGD",
  SHP = "SHP",
  SIT = "SIT",
  SKK = "SKK",
  SLL = "SLL",
  SOS = "SOS",
  SRG = "SRG",
  STD = "STD",
  SUR = "SUR",
  SVC = "SVC",
  SYP = "SYP",
  SZL = "SZL",
  THB = "THB",
  TMM = "TMM",
  TND = "TND",
  TOP = "TOP",
  TRL = "TRL",
  TTD = "TTD",
  TWD = "TWD",
  TZS = "TZS",
  UAH = "UAH",
  UGS = "UGS",
  UGX = "UGX",
  USD = "USD",
  UYP = "UYP",
  UYU = "UYU",
  UZS = "UZS",
  VND = "VND",
  VUV = "VUV",
  VAL = "VAL",
  WST = "WST",
  XAF = "XAF",
  XCD = "XCD",
  XOF = "XOF",
  XPF = "XPF",
  YER = "YER",
  YUD = "YUD",
  ZAR = "ZAR",
  ZMK = "ZMK",
  ZRZ = "ZRZ",
  ZWD = "ZWD",
}

// Line 47
export type CustomField = {
  booleanValue?: boolean;
  dateValue?: string;
  definitionId?: string;
  name?: string;
  numberValue?: number;
  stringValue?: string;
  type?: CustomFieldTypeEnum;
  value?: string;
}

// TODO: Line 207
export type CustomFieldDefinition = {
}

// Line 1539 - Possible supported CustomFieldTypes.
export enum CustomFieldTypeEnum {
  BooleanType = "BooleanType",
  DateType = "DateType",
  NumberType = "NumberType",
  StringType = "StringType",
}

// TODO: Line 341
export type DateTypeCustomFieldDefinition = {
}

// Line 898 - Enum of different delivery types. Supports Email
// and Tradeshift delivery.
export enum DeliveryTypeEnum {
  Email = "Email",
  Tradeshift = "Tradeshift",
}

// TODO: Line 828
export type EmailAddress = {
}

// Line 1111 - Enumeration of type of email addresses that the data sync
// process understands.
export enum EmailAddressTypeEnum {
  CC = "CC",
  Primary = "Primary",
}

// Line 1553 - Possible Status of an Entity.
export enum EntityStatusEnum {
  Deleted = "Deleted", // Object has been deleted but not yet purged from database
  Draft = "Draft", // Object has been voided from an accounting perspective
  InTransit = "InTransit", // Object is currently being written to QuickBooks during an active synchronization, cloud will not permit writes to the entity
  Pending = "Pending", // Object has been written to the cloud but is pending sync to QuickBooks Desktop
  SyncError = "SyncError", // Object failed to sync to QuickBooks
  Synchronized = "Synchronized", // Object is synchronized with QuickBooks data, this is the normal state in QBO as there is no synchronization needed in QBO
  Voided = "Voided", // Object has been voided from an accounting perspective
}

// Line 1057 - ExternalKey type allows an associated external ID
// like QuickBooks ID to be represented in Data Services.
export type ExternalKey = string;

// TODO: Line 872
export type EmailMessage = {
}

// Line 1167 - Gender of a person enumeration.
export enum Gender {
  Female = "Female",
  Male = "Male",
}

// TODO: Line 958
export type GenericContactType = {
}

// Line 1797 - Enumeration of possible Id Domains. NG- next gen (int);
// QB - Provisional DB id (string); QBO; BM (Billing Manager);
// QBSDK - ListID, TxnID, or TxnLineId.
export enum IdDomainEnum {
  BM = "BM",
  NG = "NG",
  PMT = "PMT",
  QB = "QB",
  QBO = "QBO",
  QBSDK = "QBSDK",
}

// Line 1066 - Allows for strong-typing of Ids and qualifying the
// domain origin of the Id.  The valid values for the domain are
// defined in the idDomainEnum.
export type IdType = string;

// Line 1179 - Definition of IntuitAnyType to add and extend new
// elements to the existing entities.
export type IntuitAnyType = never;

// For IntuitEntity:
// TODO: skipping AttachableRef property for now.
// TODO: skipping BooleanTypeCustomFieldDefinition type for now.
// TODO: skipping CustomField property for now.
// TODO: skipping CustomFieldDefinition property for now.
// TODO: skipping DateTypeCustomFieldDefinition type for now.
// TODO: skipping NumberTypeCustomFieldDefinition type for now.
// TODO: skipping StringTypeCustomFieldDefinition type for now.
type Foo = {};

// Line 12 - Base type of any top level Intuit Entity of small business type.
export type IntuitEntity = {
  // Domain in which the entity belongs.
  domain?: string;
  // Unique Identifier for an Intuit entity (object).
  // Required for the update operation.
  Id?: string;
  // Descriptive information about the entity.  The MetaData values are set
  // by Data Services and are read only for all applications.
  MetaData?: ModificationMetaData;
  // True if the entity representation has a partial set of elements. Output only field.
  sparse?: boolean;
  // System status of the entity. Output only field.
  status?: EntityStatusEnum;
  // Version number of the entity.  The SyncToken is used to lock the entity
  // for use by one application at a time. As soon as an application modifies
  // an entity, its SyncToken is incremented; another application's request
  // to modify the entity with the same SyncToken will fail. Only the latest
  // version of the entity is maintained by Data Services.  An attempt to
  // modify an entity specifying an older SyncToken will fail.
  //
  // Required for the update operation.
  SyncToken?: string;
}

// Line 427 - Metadata for the instance of the entity.
// All properties are read only.
export type ModificationMetaData = {
  // Reference to the user who created the data. Read only property.
  CreatedByRef?: ReferenceType;
  // Time the entity was created in the source domain (QBD or QBO).
  // Read only property.
  CreateTime?: Date;
  //Time the entity was last updated in QB. Read only property.
  LastChangedInQB?: Date;
  // Reference to the user who last modified the entity.
  // Read only property.
  LastModifiedByRef?: ReferenceType;
  // Time the entity was last updated in the source domain (QBD or QBO).
  // Read only property.
  LastUpdatedTime?: Date;
  // If true, the data on the cloud has been synchronized with QuickBooks
  // for Windows. If false, the data has been created or updated on the
  // cloud but has not been synchronized with QuickBooks for Windows.
  // Read-only field.
  Synchronized?: boolean;
}

// Line 490 - Monetary value represented with as a currency code and
// decimal value. Money is always associated with another IntuitEntity
// and will not be manipulated as a standalone hence it is not extended
// from IntuitEntity.
export type Money = {
  // Monetary value.
  Amount?: number;
  // Monetary unit as described by the ISO 4217 three letter currency code.
  CurCode?: string;
}

// Line 401 - A name/value pair that allows the client to include data that is
// meaningful in the domain of origin, outside of the Intuit domain.
export type NameValue = {
  // Name of the element.
  Name?: string;
  // Value of the element.
  Value?: string;
}

// TODO: Line 303
export type NumberTypeCustomFieldDefinition = {
}

// Line 1827 - Supported Intuit entity/object names.
export enum ObjectNameEnumType {
  Account = "Account",
  All = "All",
  Attachable = "Attachable",
  Bill = "Bill",
  BillPayment = "BillPayment",
  BOMComponent = "BOMComponent",
  ChangeOrder = "ChangeOrder",
  ChargeCredit = "ChargeCredit",
  Company = "Company",
  CompanyInfo = "CompanyInfo",
  CreditCardPaymentTxn = "CreditCardPaymentTxn",
  CreditMemo = "CreditMemo",
  Customer = "Customer",
  CustomFieldDefinition = "CustomFieldDefinition",
  Department = "Department",
  Deposit = "Deposit",
  Discount = "Discount",
  Employee = "Employee",
  Estimate = "Estimate",
  FixedAsset = "FixedAsset",
  InventoryAdjustment = "InventoryAdjustment",
  InventorySite = "InventorySite",
  Invoice = "Invoice",
  Item = "Item",
  ItemReceipt = "ItemReceipt",
  JournalEntry = "JournalEntry",
  ListObjectType = "ListObjectType",
  Names = "Names",
  OtherName = "OtherName",
  Payment = "Payment",
  PaymentMethod = "PaymentMethod",
  Preferences = "Preferences",
  PriceLevel = "PriceLevel",
  Purchase = "Purchase",
  PurchaseOrder = "PurchaseOrder",
  RecurringTransaction = "RecurringTransaction",
  RefundReceipt = "RefundReceipt",
  Report = "Report",
  SalesOrder = "SalesOrder",
  SalesReceipt = "SalesReceipt",
  SalesRep = "SalesRep",
  ShipMethod = "ShipMethod",
  StatementCharge = "StatementCharge",
  Tag = "Tag",
  TaxCode = "TaxCode",
  TaxClassification = "TaxClassification",
  TaxPayment = "TaxPayment",
  TaxRate = "TaxRate",
  TaxReturn = "TaxReturn",
  Term = "Term",
  TimeActivity = "TimeActivity",
  Transaction = "Transaction",
  Transfer = "Transfer",
  TxnLocation = "TxnLocation",
  UOM = "UOM",
  Vendor = "Vendor",
  VendorCredit = "VendorCredit",
}

// TODO: Line 582
export type PhysicalAddress = {
}

// Line 1123 - Enumeration of type of addresses that the data sync
// process understands.
export enum PhysicalAddressTypeEnum {
  Billing = "Billing",
  Shipping = "Shipping",
}

// TODO: Line 1093
export type Quantity = {
}

// TODO: Line 1102
export type Ratio = {
}

// Line 1813 - Reference type of all IDs that are taken as input or output.
export type ReferenceType = {
  name?: string;
  type?: string;
}

// Line 1897 - Enumeration of Summary Report basis.
export enum ReportBasisEnum {
  Accrual = "Accrual",
  Cash = "Cash",
}

// TODO: Line 265
export type StringTypeCustomFieldDefinition = {
}

// TODO: Line 1084
export type SyncToken = {
}

// Line 1153 - Telephone device type enumeration.
export enum TelephoneDeviceTypeEnum {
  Fax = "Fax",
  LandLine = "LandLine",
  Mobile = "Mobile",
  Pager = "Pager",
}

// TODO: Line 746
export type TelephoneNumber = {
}

// Line 1135 - Enumeration of type of phones that the data sync
// process understands.
export enum TelephoneNumberTypeEnum {
  Business = "Business",
  Fax = "Fax",
  Home = "Home",
  Mobile = "Mobile",
  Other = "Other",
  Pager = "Pager",
  Primary = "Primary",
  Secondary = "Secondary",
}

// TODO: Line 924
export type TransactionDeliveryInfo = {
}

// TODO: Line 1015
export type WebsiteAddress = {
}
