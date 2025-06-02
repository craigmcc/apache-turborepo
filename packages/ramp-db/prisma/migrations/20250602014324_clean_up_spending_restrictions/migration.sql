-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_limits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "balance_cleared_amt" INTEGER,
    "balance_cleared_cc" TEXT,
    "balance_pending_amt" INTEGER,
    "balance_pending_cc" TEXT,
    "balance_total_amt" INTEGER,
    "balance_total_cc" TEXT,
    "created_at" TEXT,
    "display_name" TEXT,
    "has_program_overridden" BOOLEAN,
    "is_shareable" BOOLEAN,
    "permitted_primary_card_enabled" BOOLEAN,
    "permitted_reimbursements_enabled" BOOLEAN,
    "state" TEXT,
    "suspension_acting_user_id" TEXT,
    "suspension_inserted_at" TEXT,
    "suspension_suspended_by_ramp" BOOLEAN,
    "entity_id" TEXT,
    "spend_program_id" TEXT,
    CONSTRAINT "limits_spend_program_id_fkey" FOREIGN KEY ("spend_program_id") REFERENCES "spend_programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "limits_id_fkey" FOREIGN KEY ("id") REFERENCES "limits_spending_restrictions" ("limit_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_limits" ("balance_cleared_amt", "balance_cleared_cc", "balance_pending_amt", "balance_pending_cc", "balance_total_amt", "balance_total_cc", "created_at", "display_name", "entity_id", "has_program_overridden", "id", "is_shareable", "permitted_primary_card_enabled", "permitted_reimbursements_enabled", "spend_program_id", "state", "suspension_acting_user_id", "suspension_inserted_at", "suspension_suspended_by_ramp") SELECT "balance_cleared_amt", "balance_cleared_cc", "balance_pending_amt", "balance_pending_cc", "balance_total_amt", "balance_total_cc", "created_at", "display_name", "entity_id", "has_program_overridden", "id", "is_shareable", "permitted_primary_card_enabled", "permitted_reimbursements_enabled", "spend_program_id", "state", "suspension_acting_user_id", "suspension_inserted_at", "suspension_suspended_by_ramp" FROM "limits";
DROP TABLE "limits";
ALTER TABLE "new_limits" RENAME TO "limits";
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
    "suspended" BOOLEAN
);
INSERT INTO "new_limits_spending_restrictions" ("allowed_categories", "allowed_vendors", "auto_lock_date", "blocked_categories", "blocked_vendors", "interval", "limit_amt", "limit_cc", "limit_id", "next_interval_reset", "start_of_interval", "suspended", "temporary_limit_amt", "temporary_limit_cc", "transaction_amount_limit_amt", "transaction_amount_limit_cc") SELECT "allowed_categories", "allowed_vendors", "auto_lock_date", "blocked_categories", "blocked_vendors", "interval", "limit_amt", "limit_cc", "limit_id", "next_interval_reset", "start_of_interval", "suspended", "temporary_limit_amt", "temporary_limit_cc", "transaction_amount_limit_amt", "transaction_amount_limit_cc" FROM "limits_spending_restrictions";
DROP TABLE "limits_spending_restrictions";
ALTER TABLE "new_limits_spending_restrictions" RENAME TO "limits_spending_restrictions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
