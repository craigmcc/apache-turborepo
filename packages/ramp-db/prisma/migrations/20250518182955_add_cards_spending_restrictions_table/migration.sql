-- CreateTable
CREATE TABLE "cards_spending_restrictions" (
    "card_id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER,
    "auto_lock_date" TEXT,
    "interval" TEXT,
    "suspended" BOOLEAN,
    "transaction_limit" INTEGER,
    "cardId" TEXT NOT NULL,
    CONSTRAINT "cards_spending_restrictions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
