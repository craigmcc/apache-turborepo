/*
  Warnings:

  - The primary key for the `journal_entry_lines` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_journal_entry_lines" (
    "id" TEXT NOT NULL,
    "createTime" DATETIME,
    "domain" TEXT,
    "lastUpdatedTime" DATETIME,
    "amount" REAL,
    "description" TEXT,
    "accountId" TEXT,
    "postingType" TEXT,
    "journal_entry_id" TEXT NOT NULL,

    PRIMARY KEY ("journal_entry_id", "id"),
    CONSTRAINT "journal_entry_lines_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "journal_entry_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_journal_entry_lines" ("accountId", "amount", "description", "id", "journal_entry_id", "postingType") SELECT "accountId", "amount", "description", "id", "journal_entry_id", "postingType" FROM "journal_entry_lines";
DROP TABLE "journal_entry_lines";
ALTER TABLE "new_journal_entry_lines" RENAME TO "journal_entry_lines";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
