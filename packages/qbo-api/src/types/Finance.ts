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
