/*
  Warnings:

  - Added the required column `vendorId` to the `bills` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bills" (
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
    "vendorName" TEXT,
    "payFromChartOfAccountId" TEXT,
    "vendorId" TEXT NOT NULL,
    CONSTRAINT "bills_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bills" ("amount", "archived", "createdTime", "creditAmount", "description", "dueAmount", "dueDate", "exchangeRate", "fundingAmount", "id", "invoiceDate", "invoiceNumber", "paidAmount", "payFromChartOfAccountId", "updatedTime") SELECT "amount", "archived", "createdTime", "creditAmount", "description", "dueAmount", "dueDate", "exchangeRate", "fundingAmount", "id", "invoiceDate", "invoiceNumber", "paidAmount", "payFromChartOfAccountId", "updatedTime" FROM "bills";
DROP TABLE "bills";
ALTER TABLE "new_bills" RENAME TO "bills";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
