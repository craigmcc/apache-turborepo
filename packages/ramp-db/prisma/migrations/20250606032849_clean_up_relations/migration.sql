-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardholder_name" TEXT,
    "card_program_id" TEXT,
    "created_at" TEXT,
    "display_name" TEXT NOT NULL,
    "expiration" TEXT NOT NULL,
    "has_program_overridden" BOOLEAN NOT NULL,
    "is_physical" BOOLEAN,
    "last_four" TEXT NOT NULL,
    "state" TEXT,
    "entity_id" TEXT,
    "cardholder_id" TEXT,
    CONSTRAINT "cards_cardholder_id_fkey" FOREIGN KEY ("cardholder_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cards" ("card_program_id", "cardholder_id", "cardholder_name", "created_at", "display_name", "entity_id", "expiration", "has_program_overridden", "id", "is_physical", "last_four", "state") SELECT "card_program_id", "cardholder_id", "cardholder_name", "created_at", "display_name", "entity_id", "expiration", "has_program_overridden", "id", "is_physical", "last_four", "state" FROM "cards";
DROP TABLE "cards";
ALTER TABLE "new_cards" RENAME TO "cards";
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
CREATE TABLE "new_limits_cards" (
    "expiration" TEXT NOT NULL,
    "is_ap_card" BOOLEAN NOT NULL,
    "last_four" TEXT NOT NULL,
    "via_new_product_or_service" BOOLEAN NOT NULL,
    "card_id" TEXT NOT NULL,
    "limit_id" TEXT NOT NULL,

    PRIMARY KEY ("limit_id", "card_id"),
    CONSTRAINT "limits_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "limits_cards_limit_id_fkey" FOREIGN KEY ("limit_id") REFERENCES "limits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_limits_cards" ("card_id", "expiration", "is_ap_card", "last_four", "limit_id", "via_new_product_or_service") SELECT "card_id", "expiration", "is_ap_card", "last_four", "limit_id", "via_new_product_or_service" FROM "limits_cards";
DROP TABLE "limits_cards";
ALTER TABLE "new_limits_cards" RENAME TO "limits_cards";
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
CREATE TABLE "new_limits_users" (
    "limit_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("limit_id", "user_id"),
    CONSTRAINT "limits_users_limit_id_fkey" FOREIGN KEY ("limit_id") REFERENCES "limits" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "limits_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_limits_users" ("limit_id", "user_id") SELECT "limit_id", "user_id" FROM "limits_users";
DROP TABLE "limits_users";
ALTER TABLE "new_limits_users" RENAME TO "limits_users";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "employee_id" TEXT,
    "first_name" TEXT,
    "is_manager" BOOLEAN,
    "last_name" TEXT,
    "phone" TEXT,
    "entity_id" TEXT,
    "location_id" TEXT,
    "manager_id" TEXT,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "department_id" TEXT,
    CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("department_id", "email", "employee_id", "entity_id", "first_name", "id", "is_manager", "last_name", "location_id", "manager_id", "phone", "role", "status") SELECT "department_id", "email", "employee_id", "entity_id", "first_name", "id", "is_manager", "last_name", "location_id", "manager_id", "phone", "role", "status" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
