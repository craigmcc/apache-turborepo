-- CreateTable
CREATE TABLE "limits" (
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
    "restrictions_limit_amt" INTEGER,
    "restrictions_limit_cc" TEXT,
    "restrictions_temporary_limit_amt" INTEGER,
    "restrictions_temporary_limit_cc" TEXT,
    "restrictions_transaction_amount_limit_amt" INTEGER,
    "restrictions_transaction_amount_limit_cc" TEXT,
    "state" TEXT,
    "suspension_acting_user_id" TEXT,
    "suspension_inserted_at" TEXT,
    "suspension_suspended_by_ramp" BOOLEAN,
    "entity_id" TEXT,
    "spend_program_id" TEXT
);

-- CreateTable
CREATE TABLE "limits_cards" (
    "expiration" TEXT NOT NULL,
    "is_ap_card" BOOLEAN NOT NULL,
    "last_four" TEXT NOT NULL,
    "via_new_product_or_service" BOOLEAN NOT NULL,
    "card_id" TEXT NOT NULL,
    "limit_id" TEXT NOT NULL,

    PRIMARY KEY ("limit_id", "card_id"),
    CONSTRAINT "limits_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "limits_cards_limit_id_fkey" FOREIGN KEY ("limit_id") REFERENCES "limits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "limits_users" (
    "user_id" TEXT NOT NULL,
    "limit_id" TEXT NOT NULL,

    PRIMARY KEY ("limit_id", "user_id"),
    CONSTRAINT "limits_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "limits_users_limit_id_fkey" FOREIGN KEY ("limit_id") REFERENCES "limits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
