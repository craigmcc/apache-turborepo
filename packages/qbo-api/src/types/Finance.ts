/**
 * Type definitions for QuickBooks Online API interactions.
 * These are derived from QBO file Finance.xsd for minversion 75.
 *
 * NOTE:  Names of top level entities prefixed with "Qbo" to avoid
 * conflicts with internal Prisma model names.
 * NOTE:  Only the relevant types from this file will be included here.
 */

// Internal Modules ----------------------------------------------------------

import {
  IntuitAnyType,
  IntuitEntity,
  ReferenceType,
} from "./IntuitBaseTypes";

// Public Objects ------------------------------------------------------------

// Line 8549 - Account is a component of a Chart Of Accounts, and is
// part of a Ledger. Used to record a total monetary amount allocated
// against a specific use.  Accounts are one of five basic types: asset,
// liability, revenue (income),	expenses, or equity.
export type QboAccount = IntuitEntity & {
  // Display Name of the account that will be shown in Transaction Forms
  // based on Account	Category.
  AccountAlias?: string;
  // Extension placeholder.
  AccountExt?: IntuitAnyType;
  // Internal use only: Account purpose indicates the mapping of the
  // chart-of-account to a purpose (eg: DEFAULT_QB_CASH_CHECKING_ACCOUNT).
  // A chart-of-account can have multiple account purpose mapping.
  AccountPurposes?: ReferenceType[];
  // Specifies QBO on detail type. If not specified default value
  // are listed for each SubType
  AccountSubType?: string;
  // Type is a detailed account classification that specifies the use of
  // this account.
  AccountType?: AccountTypeEnum;
  // User entered/specified account number to help the user in identifying
  // the account within the chart-of-accounts and in deciding what should
  // be posted to the	account.
  AcctNum?: string;
  // An extension to the base account number that can be added to
  // Customer A/R or Supplier A/P accounts.
  AcctNumExtn?: string;
  // Whether or not this account is active. Inactive accounts may be hidden
  // from most display purposes and may not be posted to.
  Active?: boolean | null;
  // Bank Account Number, should include routing number whatever else
  // depending upon the context, this may be the credit card number or the
  // checking account number, etc.
  BankNumber?: string;
  // 5 types of classification an account classified. Suggested examples of
  // account type are Asset, Equity, Expense, Liability, Revenue
  Classification?: AccountClassificationEnum;
  // Reference to the Currency that this account will hold the amounts in.
  CurrencyRef?: ReferenceType | null;
  // Specifies the balance amount for the current Account. Valid for
  // Balance Sheet accounts.
  CurrentBalance?: number;
  // Specifies the cumulative balance amount for the current Account
  // and all its subaccounts.
  CurrentBalanceWithSubAccounts?: number;
  // User entered description for the account, which may include user
  // entered information to guide bookkeepers/accountants in deciding
  // what journal entries to post to the account.
  Description?: string;
  // Indicates the name of financial institution if Account is linked
  // with Online banking. Valid only if account is online banking enabled.
  // This is optional and read-only.
  FIName?: string;
  // Fully qualified name of the entity. The fully qualified name prepends
  // the topmost parent, followed by each sub element separated by colons.
  // Takes the form of: Parent:Account1:SubAccount1:SubAccount2
  FullyQualifiedName?: string;
  //  The Journal Code that is associated with the account. This is
  // 	required only for Bank accounts. This is applicable only in FR.
  JournalCodeRef?: ReferenceType | null;
  // User recognizable name for the Account.
  Name?: string;
  // Specifies the Opening Balance amount when creating a new Balance Sheet
  // account.
  OpeningBalance?: number;
  // Specifies the Date of the Opening Balance amount when creating a new
  // Balance Sheet account.
  OpeningBalanceDate?: Date;
  // Indicates if the Account is linked with Online Banking feature
  // (automatically download transactions) of QuickBooks Online or
  // QuickBooks Desktop. Null or false indicates not linked with
  // online banking. True if Online banking based download is enabled
  // for this account.
  OnlineBankingEnabled?: boolean | null;
  // Specifies the Parent AccountId if this represents a SubAccount.
  // Else null or empty.
  ParentRef?: ReferenceType | null;
  // Specifies the Account is a SubAccount or Not. True if subaccount,
  // false or null if it is top-level account.
  SubAccount?: boolean | null;
  // Describes if the account is taxable.
  TaxAccount?: boolean | null;
  // If the account is taxable, refers to taxcode reference if applicable.
  TaxCodeRef?: ReferenceType | null;
  // Location Type for the Transaction.
  TxnLocationType?: ReferenceType;
}

// Line 64 - Enumeration of basic Account types used generally in the
// accounting activities.
export enum AccountClassificationEnum {
  Asset = "Asset",
  Equity = "Equity",
  Expense = "Expense",
  Liability = "Liability",
  Revenue = "Revenue",
}

// Line 220 - Enumeration of Account sub-types(QBW) and Account types(QBO)
// used to specifically categorize accounts. Note: QBO doesn't support the
// "Non-Posting" Account type.
export enum AccountTypeEnum {
  "Accounts Receivable" = "Accounts Receivable",
  Bank = "Bank",
  "Cost of Goods Sold" = "Cost of Goods Sold",
  "Credit Card" = "Credit Card",
  Equity = "Equity",
  Expense = "Expense",
  FixedAsset = "Fixed Asset",
  Income = "Income",
  "Long Term Liability" = "Long Term Liability",
  "Non-Posting" = "Non-Posting",
  "Other Asset" = "Other Asset",
  "Other Current Asset" = "Other Current Asset",
  "Other Current Liability" = "Other Current Liability",
  "Other Expense" = "Other Expense",
  "Other Income" = "Other Income",
}

// Line 8962 - TODO - CheckPayment
export type QboCheckPayment = {
}

// Line 9027 - TODO - CreditCardPayment
export type QboCreditCardPayment = {
}
0
// Line TODO - EmailAddress
export type QboEmailAddress = {
}

// Line TODO - EmailStatusEnum
export enum QboEmailStatusEnum {
}

// Line TODO - GlobalTaxCalculationEnum
export enum QboGlobalTaxCalculationEnum {
}

// Line 5744 - TODO - Invoice
export type QboInvoice = QboSalesTransaction & {
}

// Line 3548 - TODO - JournalCodeTypeEnum ???
export enum QboJournalCodeTypeEnum {
}

// Line 11984 - JournalEntry
export type QboJournalEntry = QboTransaction & {
}

// Line 8212 - TODO - JournalEntryLineDetail
export type QboJournalEntryLineDetail = {
}

// Line 6355 - TODO - Line
export type QboLine = {
}

// Line TODO - LineDetailTypeEnum ???
export enum QboLineDetailTypeEnum {
}

// Line TODO - LinkedTxn
export type QboLinkedTxn = {
}

// Line TODO - MemoRef
export type QboMemoRef = {

}

// Line TODO - PaymentTypeEnum
export enum QboPaymentTypeEnum {
}

// Line TODO - PhysicalAddress
export type QboPhysicalAddress = {
}

// Line TODO - PostingTypeEnum {
export enum QboPostingTypeEnum {
}

// Line TODO - PrintStatusEnum
export enum QboPrintStatusEnum {
}

// Line TODO - RecurringInfo
export type QboRecurringInfo = {
}

// Line 5155 - Base class of all Sales transaction entities.
export type QboSalesTransaction = QboTransaction & {
  // If false or null, calculate the sales tax first, and then apply the
  // discount.  If true, subtract the discount first and then calculate the
  // sales tax.
  ApplyTaxAfterDiscount?: boolean | null;
  // Reference to the ARA (Accounts Receivable Account) associated with
  // the transaction.
  ARAAccountRef?: ReferenceType | null;
  // If true, DocNumber is generated automatically.  If false or null,
  // DocNumber is generated based on preference of the user.
  AutoDocNumber?: boolean | null;
  // Balance reflecting any payments made against the transaction.
  // Initially, will be equal to TotalAmt.
  Balance?: number;
  // Bill-to address of the invoice.
  BillAddr?: QboPhysicalAddress | null;
  // The email address where the invoice is sent.
  BillEmail?: QboEmailAddress | null;
  // The BCC email address where the invoice is sent.
  BillEmailBcc?: QboEmailAddress | null;
  // The CC email address where the invoice is sent.
  BillEmailCc?: QboEmailAddress | null;
  // Information about a check payment for the invoice.
  // Applicable to: Estimate, SalesOrder.
  CheckPayment?: QboCheckPayment | null;
  // Reference to the Class associated with the transaction.
  ClassRef?: ReferenceType | null;
  // Information about a credit card payment for the invoice.
  CreditCardPayment?: QboCreditCardPayment | null;
  // For an invoice, this is the user-entered message to the customer that
  // does appear in the invoice and in the printed invoice.
  // For a Bill, this is the memo of the transaction to provide more detail,
  // and does not appear in the printed Bill.
  // For a CreditCardCharge, this message appears in the printed record.
  CustomerMemo?: QboMemoRef | null;
  // Reference to a Customer or job.
  CustomerRef?: ReferenceType | null;
  // Last delivery information for the transaction.
  DeliveryInfo?: QboTransactionDeliveryInfo;
  // Reference to the DepositToAccount entity.  If not specified, the
  // Undeposited Funds account will be used.
  DepositToAccountRef?: ReferenceType | null;
  // The discount amount applied to the transaction as a whole.  Will be
  // prorated through item lines for tax calculation.
  DiscountAmt?: number;
  // The discount rate applied to the transaction as a whole.  Will be
  // prorated through item lines for tax calculation.
  DiscountRate?: number;
  // Date when the payment of the invoice is due.
  DueDate?: Date;
  // Email status of the invoice.
  EmailStatus?: QboEmailStatusEnum | null;
  // Indicates whether the transaction is a finance charge.
  FinanceCharge?: boolean | null;
  // FOB (Free on Board), the terms between buyer and seller regarding
  // transportation costs.
  FOB?: string;
  // Specifies whether the shipping address is in free form or
  // structured form (city/state etc.).
  FreeFormAddress?: boolean | null;
  // Indicates the GlobalTax model if the model inclusive of tax,
  // exclusive of tax, or not applicable.
  GlobalTaxCalculation?: QboGlobalTaxCalculationEnum | null;
  // The NotaFiscal created for the sales transaction.
  GovtTxnRefIdentifier?: string;
  // Balance reflecting any payments made against the transaction
  // in the home currency for multi-currency enabled companies.
  // Initially will be equal to HomeTotalAmt.
  HomeBalance?: number;
  // Total amount in the home currency for multi-currency enabled
  // companies.
  HomeTotalAmt?: number;
  // Reference to the PaymentMethod.
  PaymentMethodRef?: ReferenceType | null;
  // Reference number for the payment received (check number for a check,
  // envelope number for a cash donation, CreditCardTransactionId for a
  // credit card).
  PaymentRefNum?: string;
  // Valid values are Cash, CVheck, CreditCard, or Other.
  PaymentType?: QboPaymentTypeEnum | null;
  // Purchase order number.
  PONumber?: string;
  // Printing status of the invoice.
  PrintStatus?: QboPrintStatusEnum | null;
  // Reference to the party receiving payment.
  RemitToRef?: ReferenceType | null;
  // Reference to the SalesRep associated with the transaction.
  SalesRepRef?: ReferenceType | null;
  // Reference to the SalesTerm associated with the transaction.
  SalesTermRef?: ReferenceType | null;
  // Shipping address of the invoice.
  ShipAddr?: QboPhysicalAddress | null;
  // Date for delivery of goods or services.
  ShipDate?: Date;
  // Shipping from address of the invoice.
  ShipFromAddr?: QboPhysicalAddress | null;
  // Reference to the ShipMethod associated with the transaction.
  ShipMethodRef?: ReferenceType | null;
  // During total tax override (when user specifies TxnTaxDetail.TotalTax),
  // if set to true, system overridews all taxes includeing the shipping tax,
  // otherwise only non shipping taxes are overridden and original shipping
  // tax is added to the total tax.
  ShippingTaxIncludedInTotalTax?: boolean | null;
  // Reference to the TaxExemptionId and TaxExemptionReason for this customer.
  TaxExemptionRef?: ReferenceType | null;
  // Reference to the Template for the invoice form.
  TemplateRef?: ReferenceType | null;
  // Total amount of the transaction, including all charges, allowances,
  // and taxes.
  TotalAmt?: number;
  // Shipping provider's tracking number for delivery of the goods
  // associated with the transaction.
  TrackingNum?: string;
}

// Line TODO - TaxReviewStatusEnum
export type QboTaxReviewStatusEnum = {
}

// Line 4774 - Transaction is the base class of all transactions.
export type QboTransaction = IntuitEntity & {
  // Reference to the currency in which all amounts on the associated
  // transaction are expressed.
  CurrencyRef?: ReferenceType | null;
  // Location of the transaction, as defined using location tracking
  // in QuickBooks Online.
  DepartmentRef?: ReferenceType | null;
  // Reference number for the transaction.  If DocNumber is not provided,
  // and the Custom Transaction Number is set to "Off", QBO assigns a document
  // number using the next-in-sequence for Sales transactions.  Otherwise, the
  // value will remain null.  Alternatively, you can also pass in "AUTO-GENERATE"
  // in this field to force QBO to auto-sequence the document number for Invoices,
  // Estimates, and sales receipts.
  DocNumber?: string;
  // Currency exchange rate.  Only valid if the company file is set up to use
  // Multi-Currency feature.  In QuickBoos, exhange rates are always recorded
  // as the number of home currency units it takes to equal one foreign currency unit.
  ExchangeRate?: number;
  // Project Estimate identifier.  The amount or equivalent paid or charged
  // for a product/service when using multi-currency.
  HomeTotalCostAmount?: number;
  // A line item of a transaction.  QBO does not support tax lines in the main
  // transaction body, only in the TxnTaxDetail section.
  Line?: QboLine[];
  // A linked (related) transaction.  More than one transaction can be linked.
  LinkedTxn?: QboLinkedTxn[];
  // User entered, organization-private note about the transaction.  This note
  // will not appear on the transaction records by default.
  PrivateNote?: string;
  // References to the project this transaction is associated with.
  ProjectRef?: ReferenceType | null;
  // Reference to the RecurTemplkate which was used to create the transaction.
  RecurDataRef?: ReferenceType | null;
  // The recurring schedule information for the transaction.
  RecurringInfo?: QboRecurringInfo;
  // List of tags used to identify the transaction.
  Tag?: string[];
  // Holds data related to Tax Information based on Regional compliance laws.
  // This is applicable for IN region and can be extended to other regions
  // in the future.
  TaxFormNum?: string;
  // See TaxFormTypeEnum for valid values.  Holds data related to Tax Information,
  // values based on regional compliance laws.  Applicable for IN Region and can be
  // extended for other Regions.
  TaxFormType?: string;
  // Project Estimate identifier.  The amount or equivalent paid or charged
  // for a product/service.
  TotalCostAmount?: number;
  // Location of the purchase or sale transaction.  See TransactionLocationTypeEnum.
  // This is currently applicable onl for the FR region.
  TransactionLocationType?: string;
  // Details of the Approval Status for current transaction in QBO workflows.
  // See TxnApprovalInfo.
  TxnApprovalInfo?: QboTxnApprovalInfo;
  // The date entered by the user when this transaction occurred.  Often, it is
  // the date the transaction is created by the system.
  TxnDate?: Date;
  // Originating source of the transaction.  Valid values are defined in
  // TxnSourceEnum.
  TxnSource?: string;
  // The status of the transaction.  Depending on the transaction type, it may
  // have different values.  For Sales Transactions, acceptable values are
  // defined in PaymentStatusEnum.  For Estimates ,the values are defined in
  // Qbo  EstimateStatusEnum.
  TxnStatus?: string;
  // Details of taxes charged on the transaction as a whole.  For US versions of
  // QuickBoos, tax rates used in the detail section must not be used in any tax
  // line appearing in the main transaction body.
  TxnTaxDetail?: QboTxnTaxDetail;
}

// Line TODO - TransactionDeliveryInfo
export type QboTransactionDeliveryInfo = {
}

// Line TODO - TransactionLocationTypeEnum
export enum QboTransactionLocationTypeEnum {
}

// Line TODO - TxnApprovalInfo
export type QboTxnApprovalInfo = {
}

// Line TODO - TxnSourceEnum
export enum QboTxnSourceEnum {
}

// Line 5066 - Details of taxes charged on the transaction as a whole.  For US
// versions of QuickBooks, tax rates used in the detail section must not be
// used in any tax line appearing in the main transaction body.
export type QboTxnTaxDetail = {
  // Reference to the default tax code that applies to the transaction
  // as a whole.
  DefaultTaxCodeRef?: ReferenceType | null;
  // Must be a Line whose LineDetailType is TaxLineDetail.
  TaxLine?: QboLine[];
  // Enumerated reasons to review Taxes on the Transaction.
  TaxReviewStatus?: QboTaxReviewStatusEnum;
  // Total tax calculated for the transaction, excluding any embedded
  // tax lines.
  TotalTax?: number;
  // Reference to the trancation tax code.  For US editions only.
  // Note that the US tax model can have just a single tax code per transaction.
  TxnTaxCodeRef?: ReferenceType | null;
  // Defines if developer intends to use Automated Sales Tax or tax code that
  // they have provided in the payload.
  UseAutomatedSalesTax?: boolean | null;
}

// Line TODO - TxnTypeEnum ???
export enum QboTxnTypeEnum {
}
