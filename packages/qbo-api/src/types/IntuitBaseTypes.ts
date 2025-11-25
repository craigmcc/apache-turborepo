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

// TODO: Line 1203
export type CCAVSMatchEnum = {
}

// TODO: Line 1216
export type CCPaymentStatusEnum = {
}

// TODO: Line 1190
export type CCSecurityCodeMatchEnum = {
}

// TODO: Line 1229
export type CCTxnModeEnum = {
}

// TODO: Line 1241
export type CCTxnTypeEnum = {
}

// TODO: Line 516
export type ContactTypeEnum = {
}

// TODO: Line 530
export type ContactInfo = {
}

// TODO: Line 1256
export type CreditCardTypeEnum = {
}

// TODO: Line 1273
export type CreditChargeInfo = {
}

// TODO: Line 1395
export type CreditChargeResponse = {
}

// TODO: Line 1598
export type CurrencyCode = {
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

// TODO: Line 1539
export enum CustomFieldTypeEnum {
}

// TODO: Line 341
export type DateTypeCustomFieldDefinition = {
}

// TODO: Line 898
export type DeliveryTypeEnum = {
}

// TODO: Line 828
export type EmailAddress = {
}

// TODO: Line 1111
export type EmailAddressTypeEnum = {
}

// TODO: Line 1553
export type EntityStatusEnum = {
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
