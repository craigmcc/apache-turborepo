/*
  Warnings:

  - You are about to drop the column `restrictions_allowed_categories` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_auto_lock_date` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_blocked_categories` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_interval` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_limit_amt` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_limit_cc` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_next_interval_reset` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_start_of_interval` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_temporary_limit_amt` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_temporary_limit_cc` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_transaction_amount_limit_amt` on the `limits` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions_transaction_amount_limit_cc` on the `limits` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "limits_spending_restrictions" (
    "limit_id" TEXT NOT NULL PRIMARY KEY,
    "amount_amt" INTEGER NOT NULL,
    "amount_cc" TEXT NOT NULL,
    "allowed_categories" TEXT,
    "allowed_vendors" TEXT,
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
    "limitId" TEXT NOT NULL,
    CONSTRAINT "limits_spending_restrictions_limit_id_fkey" FOREIGN KEY ("limit_id") REFERENCES "limits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "state" TEXT,
    "suspension_acting_user_id" TEXT,
    "suspension_inserted_at" TEXT,
    "suspension_suspended_by_ramp" BOOLEAN,
    "entity_id" TEXT,
    "spend_program_id" TEXT,
    CONSTRAINT "limits_spend_program_id_fkey" FOREIGN KEY ("spend_program_id") REFERENCES "spend_programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_limits" ("balance_cleared_amt", "balance_cleared_cc", "balance_pending_amt", "balance_pending_cc", "balance_total_amt", "balance_total_cc", "created_at", "display_name", "entity_id", "has_program_overridden", "id", "is_shareable", "permitted_primary_card_enabled", "permitted_reimbursements_enabled", "spend_program_id", "state", "suspension_acting_user_id", "suspension_inserted_at", "suspension_suspended_by_ramp") SELECT "balance_cleared_amt", "balance_cleared_cc", "balance_pending_amt", "balance_pending_cc", "balance_total_amt", "balance_total_cc", "created_at", "display_name", "entity_id", "has_program_overridden", "id", "is_shareable", "permitted_primary_card_enabled", "permitted_reimbursements_enabled", "spend_program_id", "state", "suspension_acting_user_id", "suspension_inserted_at", "suspension_suspended_by_ramp" FROM "limits";
DROP TABLE "limits";
ALTER TABLE "new_limits" RENAME TO "limits";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
