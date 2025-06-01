/*
  Warnings:

  - You are about to drop the column `limitId` on the `limits_spending_restrictions` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_limits_spending_restrictions" (
    "limit_id" TEXT NOT NULL PRIMARY KEY,
    "allowed_categories" TEXT,
    "allowed_vendors" TEXT,
    "amount_amt" INTEGER NOT NULL,
    "amount_cc" TEXT NOT NULL,
    "auto_lock_date" TEXT,
    "blocked_categories" TEXT,
    "blocked_vendors" TEXT,
    "interval" TEXT,
    "next_interval_reset" TEXT,
    "start_of_interval" TEXT,
    "temporary_limit_amt" INTEGER NOT NULL,
    "temporary_limit_cc" TEXT NOT NULL,
    "transaction_amount_limit_amt" INTEGER NOT NULL,
    "transaction_amount_limit_cc" TEXT NOT NULL,
    "suspended" BOOLEAN,
    CONSTRAINT "limits_spending_restrictions_limit_id_fkey" FOREIGN KEY ("limit_id") REFERENCES "limits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_limits_spending_restrictions" ("allowed_categories", "allowed_vendors", "amount_amt", "amount_cc", "auto_lock_date", "blocked_categories", "blocked_vendors", "interval", "limit_id", "next_interval_reset", "start_of_interval", "suspended", "temporary_limit_amt", "temporary_limit_cc", "transaction_amount_limit_amt", "transaction_amount_limit_cc") SELECT "allowed_categories", "allowed_vendors", "amount_amt", "amount_cc", "auto_lock_date", "blocked_categories", "blocked_vendors", "interval", "limit_id", "next_interval_reset", "start_of_interval", "suspended", "temporary_limit_amt", "temporary_limit_cc", "transaction_amount_limit_amt", "transaction_amount_limit_cc" FROM "limits_spending_restrictions";
DROP TABLE "limits_spending_restrictions";
ALTER TABLE "new_limits_spending_restrictions" RENAME TO "limits_spending_restrictions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
