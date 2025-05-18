/*
  Warnings:

  - You are about to drop the column `amount` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `original_transaction_amount` on the `transactions` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accounting_date" TEXT,
    "amount_amt" INTEGER,
    "amount_cc" TEXT,
    "card_present" BOOLEAN,
    "currency_code" TEXT,
    "memo" TEXT,
    "merchant_category_code" TEXT,
    "merchant_category_description" TEXT,
    "merchant_name" TEXT,
    "original_transaction_amount_amt" INTEGER,
    "original_transaction_amount_cc" TEXT,
    "settlement_date" TEXT,
    "sk_category_id" TEXT,
    "sk_category_name" TEXT,
    "sync_status" TEXT NOT NULL,
    "synced_at" TEXT,
    "entity_id" TEXT,
    "limit_id" TEXT,
    "merchant_id" TEXT,
    "spend_program_id" TEXT,
    "trip_id" TEXT,
    "trip_name" TEXT,
    "user_transaction_time" TEXT,
    "card_id" TEXT NOT NULL,
    CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_transactions" ("accounting_date", "card_id", "card_present", "currency_code", "entity_id", "id", "limit_id", "memo", "merchant_category_code", "merchant_category_description", "merchant_id", "merchant_name", "settlement_date", "sk_category_id", "sk_category_name", "spend_program_id", "sync_status", "synced_at", "trip_id", "trip_name", "user_transaction_time") SELECT "accounting_date", "card_id", "card_present", "currency_code", "entity_id", "id", "limit_id", "memo", "merchant_category_code", "merchant_category_description", "merchant_id", "merchant_name", "settlement_date", "sk_category_id", "sk_category_name", "spend_program_id", "sync_status", "synced_at", "trip_id", "trip_name", "user_transaction_time" FROM "transactions";
DROP TABLE "transactions";
ALTER TABLE "new_transactions" RENAME TO "transactions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
