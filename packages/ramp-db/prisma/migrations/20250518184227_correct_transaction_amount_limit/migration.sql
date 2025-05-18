/*
  Warnings:

  - You are about to drop the column `transaction_limit` on the `cards_spending_restrictions` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cards_spending_restrictions" (
    "card_id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER,
    "auto_lock_date" TEXT,
    "interval" TEXT,
    "suspended" BOOLEAN,
    "transaction_amount_limit" INTEGER,
    "cardId" TEXT NOT NULL,
    CONSTRAINT "cards_spending_restrictions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cards_spending_restrictions" ("amount", "auto_lock_date", "cardId", "card_id", "interval", "suspended") SELECT "amount", "auto_lock_date", "cardId", "card_id", "interval", "suspended" FROM "cards_spending_restrictions";
DROP TABLE "cards_spending_restrictions";
ALTER TABLE "new_cards_spending_restrictions" RENAME TO "cards_spending_restrictions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
