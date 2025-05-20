-- CreateTable
CREATE TABLE "spend_programs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "display_name" TEXT,
    "is_shareable" BOOLEAN,
    "issue_physical_card_if_needed" BOOLEAN,
    "permitted_primary_card_enabled" BOOLEAN,
    "permitted_reimbursements_enabled" BOOLEAN,
    "restrictions_allowed_categories" TEXT,
    "restrictions_auto_lock_date" TEXT,
    "restrictions_blocked_categories" TEXT,
    "restrictions_interval" TEXT,
    "restrictions_limit_amt" INTEGER,
    "restrictions_limit_cc" TEXT,
    "restrictions_next_interval_reset" TEXT,
    "restrictions_start_of_interval" TEXT,
    "restrictions_temporary_limit_amt" INTEGER,
    "restrictions_temporary_limit_cc" TEXT,
    "restrictions_transaction_amount_limit_amt" INTEGER,
    "restrictions_transaction_amount_limit_cc" TEXT
);

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
    "restrictions_allowed_categories" TEXT,
    "restrictions_auto_lock_date" TEXT,
    "restrictions_blocked_categories" TEXT,
    "restrictions_interval" TEXT,
    "restrictions_limit_amt" INTEGER,
    "restrictions_limit_cc" TEXT,
    "restrictions_next_interval_reset" TEXT,
    "restrictions_start_of_interval" TEXT,
    "restrictions_temporary_limit_amt" INTEGER,
    "restrictions_temporary_limit_cc" TEXT,
    "restrictions_transaction_amount_limit_amt" INTEGER,
    "restrictions_transaction_amount_limit_cc" TEXT,
    "state" TEXT,
    "suspension_acting_user_id" TEXT,
    "suspension_inserted_at" TEXT,
    "suspension_suspended_by_ramp" BOOLEAN,
    "entity_id" TEXT,
    "spend_program_id" TEXT,
    CONSTRAINT "limits_spend_program_id_fkey" FOREIGN KEY ("spend_program_id") REFERENCES "spend_programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_limits" ("balance_cleared_amt", "balance_cleared_cc", "balance_pending_amt", "balance_pending_cc", "balance_total_amt", "balance_total_cc", "created_at", "display_name", "entity_id", "has_program_overridden", "id", "is_shareable", "permitted_primary_card_enabled", "permitted_reimbursements_enabled", "restrictions_allowed_categories", "restrictions_auto_lock_date", "restrictions_blocked_categories", "restrictions_interval", "restrictions_limit_amt", "restrictions_limit_cc", "restrictions_next_interval_reset", "restrictions_start_of_interval", "restrictions_temporary_limit_amt", "restrictions_temporary_limit_cc", "restrictions_transaction_amount_limit_amt", "restrictions_transaction_amount_limit_cc", "spend_program_id", "state", "suspension_acting_user_id", "suspension_inserted_at", "suspension_suspended_by_ramp") SELECT "balance_cleared_amt", "balance_cleared_cc", "balance_pending_amt", "balance_pending_cc", "balance_total_amt", "balance_total_cc", "created_at", "display_name", "entity_id", "has_program_overridden", "id", "is_shareable", "permitted_primary_card_enabled", "permitted_reimbursements_enabled", "restrictions_allowed_categories", "restrictions_auto_lock_date", "restrictions_blocked_categories", "restrictions_interval", "restrictions_limit_amt", "restrictions_limit_cc", "restrictions_next_interval_reset", "restrictions_start_of_interval", "restrictions_temporary_limit_amt", "restrictions_temporary_limit_cc", "restrictions_transaction_amount_limit_amt", "restrictions_transaction_amount_limit_cc", "spend_program_id", "state", "suspension_acting_user_id", "suspension_inserted_at", "suspension_suspended_by_ramp" FROM "limits";
DROP TABLE "limits";
ALTER TABLE "new_limits" RENAME TO "limits";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
