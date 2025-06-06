/*
  Warnings:

  - You are about to drop the column `currency_code` on the `transactions` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "transactions_line_items" (
    "amount_amt" INTEGER,
    "amount_cc" TEXT,
    "converted_amount_amt" INTEGER,
    "converted_amount_cc" TEXT,
    "memo" TEXT,
    "index_line_item" INTEGER NOT NULL,
    "transaction_id" TEXT NOT NULL,

    PRIMARY KEY ("transaction_id", "index_line_item"),
    CONSTRAINT "transactions_line_items_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions_line_items_accounting_field_selections" (
    "category_info_external_id" TEXT,
    "category_info_id" TEXT,
    "category_info_name" TEXT,
    "category_info_type" TEXT,
    "external_code" TEXT,
    "external_id" TEXT,
    "name" TEXT,
    "source_type" TEXT,
    "type" TEXT,
    "index_line_item" INTEGER NOT NULL,
    "ramp_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,

    PRIMARY KEY ("transaction_id", "index_line_item", "ramp_id"),
    CONSTRAINT "transactions_line_items_accounting_field_selections_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_line_items_accounting_field_selections_transaction_id_index_line_item_fkey" FOREIGN KEY ("transaction_id", "index_line_item") REFERENCES "transactions_line_items" ("transaction_id", "index_line_item") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accounting_date" TEXT,
    "amount_amt" INTEGER,
    "amount_cc" TEXT,
    "card_present" BOOLEAN,
    "memo" TEXT,
    "merchant_category_code" TEXT,
    "merchant_category_description" TEXT,
    "merchant_name" TEXT,
    "original_transaction_amount_amt" INTEGER,
    "original_transaction_amount_cc" TEXT,
    "settlement_date" TEXT,
    "sk_category_id" TEXT,
    "sk_category_name" TEXT,
    "state" TEXT,
    "sync_status" TEXT NOT NULL,
    "synced_at" TEXT,
    "trip_name" TEXT,
    "user_transaction_time" TEXT,
    "entity_id" TEXT,
    "limit_id" TEXT,
    "merchant_id" TEXT,
    "spend_program_id" TEXT,
    "statement_id" TEXT,
    "trip_id" TEXT,
    "card_holder_user_id" TEXT,
    "card_id" TEXT,
    CONSTRAINT "transactions_card_holder_user_id_fkey" FOREIGN KEY ("card_holder_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_transactions" ("accounting_date", "amount_amt", "amount_cc", "card_holder_user_id", "card_id", "card_present", "entity_id", "id", "limit_id", "memo", "merchant_category_code", "merchant_category_description", "merchant_id", "merchant_name", "original_transaction_amount_amt", "original_transaction_amount_cc", "settlement_date", "sk_category_id", "sk_category_name", "spend_program_id", "state", "statement_id", "sync_status", "synced_at", "trip_id", "trip_name", "user_transaction_time") SELECT "accounting_date", "amount_amt", "amount_cc", "card_holder_user_id", "card_id", "card_present", "entity_id", "id", "limit_id", "memo", "merchant_category_code", "merchant_category_description", "merchant_id", "merchant_name", "original_transaction_amount_amt", "original_transaction_amount_cc", "settlement_date", "sk_category_id", "sk_category_name", "spend_program_id", "state", "statement_id", "sync_status", "synced_at", "trip_id", "trip_name", "user_transaction_time" FROM "transactions";
DROP TABLE "transactions";
ALTER TABLE "new_transactions" RENAME TO "transactions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
