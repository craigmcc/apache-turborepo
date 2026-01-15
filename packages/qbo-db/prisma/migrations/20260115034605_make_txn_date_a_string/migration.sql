-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_journal_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createTime" DATETIME,
    "domain" TEXT,
    "lastUpdatedTime" DATETIME,
    "privateNote" TEXT,
    "txnDate" TEXT,
    "adjustment" BOOLEAN
);
INSERT INTO "new_journal_entries" ("adjustment", "createTime", "domain", "id", "lastUpdatedTime", "privateNote", "txnDate") SELECT "adjustment", "createTime", "domain", "id", "lastUpdatedTime", "privateNote", "txnDate" FROM "journal_entries";
DROP TABLE "journal_entries";
ALTER TABLE "new_journal_entries" RENAME TO "journal_entries";
CREATE UNIQUE INDEX "journal_entries_id_key" ON "journal_entries"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
