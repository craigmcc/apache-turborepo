/*
  Warnings:

  - Added the required column `recurringBillId` to the `recurring_bills_line_items` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recurring_bills_line_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "description" TEXT,
    "recurringBillId" TEXT NOT NULL,
    CONSTRAINT "recurring_bills_line_items_recurringBillId_fkey" FOREIGN KEY ("recurringBillId") REFERENCES "recurring_bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recurring_bills_line_items" ("amount", "description", "id") SELECT "amount", "description", "id" FROM "recurring_bills_line_items";
DROP TABLE "recurring_bills_line_items";
ALTER TABLE "new_recurring_bills_line_items" RENAME TO "recurring_bills_line_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
