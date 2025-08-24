/*
  Warnings:

  - Made the column `vendorId` on table `recurring_bills` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recurring_bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "archived" BOOLEAN,
    "createdTime" TEXT,
    "description" TEXT,
    "processingOptionsAutoPay" BOOLEAN,
    "updatedTime" TEXT,
    "vendorId" TEXT NOT NULL,
    "paymentInformationBankAccountId" TEXT,
    CONSTRAINT "recurring_bills_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recurring_bills" ("archived", "createdTime", "description", "id", "paymentInformationBankAccountId", "processingOptionsAutoPay", "updatedTime", "vendorId") SELECT "archived", "createdTime", "description", "id", "paymentInformationBankAccountId", "processingOptionsAutoPay", "updatedTime", "vendorId" FROM "recurring_bills";
DROP TABLE "recurring_bills";
ALTER TABLE "new_recurring_bills" RENAME TO "recurring_bills";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
