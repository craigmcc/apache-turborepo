/*
  Warnings:

  - The primary key for the `vendors_credits_usage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `index` to the `vendors_credits_usage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_vendors_credits_usage" (
    "vendorCreditId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "amount" REAL,
    "paymentId" TEXT,
    "billId" TEXT,

    PRIMARY KEY ("vendorCreditId", "index"),
    CONSTRAINT "vendors_credits_usage_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "vendors_credits_usage_vendorCreditId_fkey" FOREIGN KEY ("vendorCreditId") REFERENCES "vendors_credits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_vendors_credits_usage" ("amount", "billId", "paymentId", "vendorCreditId") SELECT "amount", "billId", "paymentId", "vendorCreditId" FROM "vendors_credits_usage";
DROP TABLE "vendors_credits_usage";
ALTER TABLE "new_vendors_credits_usage" RENAME TO "vendors_credits_usage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
