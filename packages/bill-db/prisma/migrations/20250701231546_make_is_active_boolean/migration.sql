/*
  Warnings:

  - You are about to alter the column `isActive` on the `vendors_credits_approvers` table. The data in that column could be lost. The data in that column will be cast from `String` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_vendors_credits_approvers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity" TEXT,
    "isActive" BOOLEAN,
    "lastReminderDate" TEXT,
    "sortOrder" INTEGER,
    "status" TEXT,
    "statusChangedDate" TEXT,
    "userId" TEXT NOT NULL,
    "vendorCreditId" TEXT NOT NULL,
    CONSTRAINT "vendors_credits_approvers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vendors_credits_approvers_vendorCreditId_fkey" FOREIGN KEY ("vendorCreditId") REFERENCES "vendors_credits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_vendors_credits_approvers" ("entity", "id", "isActive", "lastReminderDate", "sortOrder", "status", "statusChangedDate", "userId", "vendorCreditId") SELECT "entity", "id", "isActive", "lastReminderDate", "sortOrder", "status", "statusChangedDate", "userId", "vendorCreditId" FROM "vendors_credits_approvers";
DROP TABLE "vendors_credits_approvers";
ALTER TABLE "new_vendors_credits_approvers" RENAME TO "vendors_credits_approvers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
