/**
 * Type definitions for QuickBooks Online API interactions.
 * These are derived from QBO XSD file IntuitBaseTypes.xsd for minversion 75.
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

// TODO: Line 1057
export type ExternalKey = {
}

// TODO: Line 872
export type EmailMessage = {
}

// TODO: Line 1167
export type Gender = {
}

// TODO: Line 958
export type GenericContactType = {
}

// TODO: Line 1797
export type IdDomainEnum = {
}

// TODO: Line 1066
export type IdType = {
}

// TODO: Line 1179
export type IntuitAnyType = {
  // TODO - IntuitBaseTypes.xsd line 1179+
}

// Line 12
export type IntuitEntity = {
  id?: string;
  domain?: string;
  metaData?: ModificationMetaData;
  sparse?: boolean;
  status?: string;
  syncToken?: string;
}

// TODO: Line 427
export type ModificationMetaData = {
}

// TODO: Line 490
export type Money = {
}

// TODO: Line 401
export type NameValue = {
}

// TODO: Line 303
export type NumberTypeCustomFieldDefinition = {
}

// TODO: Line 1827
export type ObjectNameEnumType = {
}

// TODO: Line 582
export type PhysicalAddress = {
}

// TODO: Line 1123
export type PhysicalAddressTypeEnum = {
}

// TODO: Line 1093
export type Quantity = {
}

// TODO: Line 1102
export type Ratio = {
}

// TODO: Line 1813
export type ReferenceType = {
  // TODO - IntuitBaseTypes.xsd line 1813+
}

// TODO: Line 1897
export type ReportBasisEnum = {
}

// TODO: Line 265
export type StringTypeCustomFieldDefinition = {
}

// TODO: Line 1084
export type SyncToken = {
}

// TODO: Line 1153
export type TelephoneDeviceTypeEnum = {
}

// TODO: Line 746
export type TelephoneNumber = {
}

// TODO: Line 1135
export type TelephoneNumberTypeEnum = {
}

// TODO: Line 924
export type TransactionDeliveryInfo = {
}

// TODO: Line 1015
export type WebsiteAddress = {
}
