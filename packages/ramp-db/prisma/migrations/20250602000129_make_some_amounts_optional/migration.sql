-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_limits_spending_restrictions" (
    "limit_id" TEXT NOT NULL PRIMARY KEY,
    "allowed_categories" TEXT,
    "allowed_vendors" TEXT,
    "auto_lock_date" TEXT,
    "blocked_categories" TEXT,
    "blocked_vendors" TEXT,
    "interval" TEXT,
    "limit_amt" INTEGER NOT NULL,
    "limit_cc" TEXT NOT NULL,
    "next_interval_reset" TEXT,
    "start_of_interval" TEXT,
    "temporary_limit_amt" INTEGER,
    "temporary_limit_cc" TEXT,
    "transaction_amount_limit_amt" INTEGER,
    "transaction_amount_limit_cc" TEXT,
    "suspended" BOOLEAN,
    CONSTRAINT "limits_spending_restrictions_limit_id_fkey" FOREIGN KEY ("limit_id") REFERENCES "limits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_limits_spending_restrictions" ("allowed_categories", "allowed_vendors", "auto_lock_date", "blocked_categories", "blocked_vendors", "interval", "limit_amt", "limit_cc", "limit_id", "next_interval_reset", "start_of_interval", "suspended", "temporary_limit_amt", "temporary_limit_cc", "transaction_amount_limit_amt", "transaction_amount_limit_cc") SELECT "allowed_categories", "allowed_vendors", "auto_lock_date", "blocked_categories", "blocked_vendors", "interval", "limit_amt", "limit_cc", "limit_id", "next_interval_reset", "start_of_interval", "suspended", "temporary_limit_amt", "temporary_limit_cc", "transaction_amount_limit_amt", "transaction_amount_limit_cc" FROM "limits_spending_restrictions";
DROP TABLE "limits_spending_restrictions";
ALTER TABLE "new_limits_spending_restrictions" RENAME TO "limits_spending_restrictions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
