/**
 * Type definitions for QuickBooks Online API interactions.  These are derived
 * from the QBO XSD files for minversion 75.
 */

export type AttachableRef = {
  // TODO
//  attachableRefEx?: IntuitAnyType;
  customField?: CustomField[];
  entityRef?: ReferenceType;
  includeOnSend?: boolean;
  lineInfo?: string;
}

export type BooleanTypeCustomFieldDefinition = {
  // TODO - IntuitBaseTypes.xsd line 379+
}

export type CCAVSMatchEnum = {
  // TODO - IntuitBaseTypes.xsd line 1203+
}

export type CCPaymentStatusEnum = {
  // TODO - IntuitBaseTypes.xsd line 1216+
}

export type CCSecurityCodeMatchEnum = {
  // TODO - IntuitBaseTypes.xsd line 1190+
}

export type CCTxnModeEnum = {
  // TODO - IntuitBaseTypes.xsd line 1229+
}

export type CCTxnTypeEnum = {
  // TODO - IntuitBaseTypes.xsd line 1241+
}

export type ContactTypeEnum = {
  // TODO - IntuitBaseTypes.xsd line 516+
}

export type ContactInfo = {
  // TODO - IntuitBaseTypes.xsd line 530+
}

export type CreditCardTypeEnum = {
  // TODO - IntuitBaseTypes.xsd line 1256+
}

export type CreditChargeInfo = {
  // TODO - IntuitBaseTypes.xsd line 1273+
}

export type CreditChargeResponse = {
  // TODO - IntuitBaseTypes.xsd line 1395+
}

export type CurrencyCode = {
  // TODO - IntuitBaseTypes.xsd line 1598+
}

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

export type CustomFieldDefinition = {
  // TODO - IntuitBaseTypes.xsd line 207+
}

export enum CustomFieldTypeEnum {
  // TODO - IntuitBaseTypes.xsd line 1539+
}

export type DateTypeCustomFieldDefinition = {
  // TODO - IntuitBaseTypes.xsd line 341+
}

export type DeliveryTypeEnum = {
  // TODO - IntuitBaseTypes.xsd line 898+
}

export type EmailAddress = {
  // TODO - IntuitBaseTypes.xsd line 828+
}

export type EmailAddressTypeEnum = {
  // TODO - IntuitBaseTypes.xsd line 1111+
}

export type EntityStatusEnum = {
  // TODO - IntuitBaseTypes.xsd line 1553+
}

export type ExternalKey = {
  // TODO - IntuitBaseTypes.xsd line 1057+
}

export type EmailMessage = {
  // TODO - IntuitBaseTypes.xsd line 872+
}

export type Gender = {
  // TODO - IntuitBaseTypes.xsd line 1167+
}

export type GenericContactType = {
  // TODO - IntuitBaseTypes.xsd line 958+
}

export type IdDomainEnum = {
  // TODO - IntuitBaseTypes.xsd line 1797+
}

export type IdType = {
  // TODO - IntuitBaseTypes.xsd line 1066+
}

export type IntuitAnyType = {
  // TODO - IntuitBaseTypes.xsd line 1179+
}

export type IntuitEntity = {
  id?: string;
  domain?: string;
  metaData?: ModificationMetaData;
  sparse?: boolean;
  status?: string;
  syncToken?: string;
}

export type ModificationMetaData = {
  // TODO - IntuitBaseTypes.xsd line 427+
}

export type Money = {
  // TODO - IntuitBaseTypes.xsd line 490+
}

export type NameValue = {
  // TODO - IntuitBaseTypes.xsd line 401+
}

export type NumberTypeCustomFieldDefinition = {
  // TODO - IntuitBaseTypes.xsd line 303+
}

export type ObjectNameEnumType = {
  // TODO - IntuitBaseTypes.xsd line 1827+
}

export type PhysicalAddress = {
  // TODO - IntuitBaseTypes.xsd line 582+
}

export type PhysicalAddressTypeEnum = {
  // TODO - IntuitBaseTypes.xsd line 1123+
}

export type Quantity = {
  // TODO - IntuitBaseTypes.xsd line 1093+
}

export type Ratio = {
  // TODO - IntuitBaseTypes.xsd line 1102+
}

export type ReferenceType = {
  // TODO - IntuitBaseTypes.xsd line 1813+
}

export type ReportBasisEnum = {
  // TODO - IntuitBaseTypes.xsd line 1897+
}

export type StringTypeCustomFieldDefinition = {
  // TODO - IntuitBaseTypes.xsd line 265+
}

export type SyncToken = {
  // TODO - IntuitBaseTypes.xsd line 1084+
}

export type TelephoneDeviceTypeEnum = {
  // TODO - IntuitBaseTypes.xsd line 1153+
}

export type TelephoneNumber = {
  // TODO - IntuitBaseTypes.xsd line 746+
}

export type TelephoneNumberTypeEnum = {
  // TODO - IntuitBaseTypes.xsd line 1135+
}

export type TransactionDeliveryInfo = {
  // TODO - IntuitBaseTypes.xsd line 924+
}

export type WebsiteAddress = {
  // TODO - IntuitBaseTypes.xsd line 1015+
}
