/*
  Warnings:

  - You are about to drop the column `rppsid` on the `vendors` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "archived" BOOLEAN,
    "createdTime" TEXT,
    "creditAmount" REAL,
    "description" TEXT,
    "dueAmount" REAL,
    "dueDate" TEXT,
    "exchangeRate" REAL,
    "fundingAmount" REAL,
    "invoiceDate" TEXT,
    "invoiceNumber" TEXT,
    "paidAmount" REAL,
    "updatedTime" TEXT,
    "payFromChartOfAccountId" TEXT
);

-- CreateTable
CREATE TABLE "bills_classifications" (
    "billId" TEXT NOT NULL PRIMARY KEY,
    "accountingClassId" TEXT,
    "chartOfAccountId" TEXT,
    "departmentId" TEXT,
    "itemId" TEXT,
    "locationId" TEXT,
    CONSTRAINT "bills_classifications_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bills_line_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "description" TEXT,
    "price" REAL,
    "quantity" REAL,
    "billId" TEXT NOT NULL,
    CONSTRAINT "bills_line_items_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bills_line_items_classifications" (
    "billLineItemId" TEXT NOT NULL PRIMARY KEY,
    "accountingClassId" TEXT,
    "chartOfAccountId" TEXT,
    "customerId" TEXT,
    "departmentId" TEXT,
    "employeeId" TEXT,
    "itemId" TEXT,
    "jobId" TEXT,
    "locationId" TEXT,
    CONSTRAINT "bills_line_items_classifications_billLineItemId_fkey" FOREIGN KEY ("billLineItemId") REFERENCES "bills_line_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_vendors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountNumber" TEXT,
    "accountType" TEXT,
    "archived" BOOLEAN,
    "balance_amount" REAL,
    "balance_lastUpdatedDate" TEXT,
    "billCurrency" TEXT,
    "createdTime" TEXT,
    "email" TEXT,
    "name" TEXT,
    "networkStatus" TEXT,
    "phone" TEXT,
    "recurringPayments" BOOLEAN,
    "rppsId" TEXT,
    "shortName" TEXT,
    "updatedTime" TEXT
);
INSERT INTO "new_vendors" ("accountNumber", "accountType", "archived", "balance_amount", "balance_lastUpdatedDate", "billCurrency", "createdTime", "email", "id", "name", "networkStatus", "phone", "recurringPayments", "shortName", "updatedTime") SELECT "accountNumber", "accountType", "archived", "balance_amount", "balance_lastUpdatedDate", "billCurrency", "createdTime", "email", "id", "name", "networkStatus", "phone", "recurringPayments", "shortName", "updatedTime" FROM "vendors";
DROP TABLE "vendors";
ALTER TABLE "new_vendors" RENAME TO "vendors";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
