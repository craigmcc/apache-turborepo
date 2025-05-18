-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardholder_name" TEXT,
    "card_program_id" TEXT NOT NULL,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
