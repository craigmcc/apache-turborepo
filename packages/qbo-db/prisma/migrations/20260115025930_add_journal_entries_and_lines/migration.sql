-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createTime" DATETIME,
    "domain" TEXT,
    "lastUpdatedTime" DATETIME,
    "privateNote" TEXT,
    "txnDate" DATETIME,
    "adjustment" BOOLEAN
);

-- CreateTable
CREATE TABLE "journal_entry_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "description" TEXT,
    "accountId" TEXT,
    "postingType" TEXT,
    "journal_entry_id" TEXT NOT NULL,
    CONSTRAINT "journal_entry_lines_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "journal_entry_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_id_key" ON "journal_entries"("id");

-- CreateIndex
CREATE INDEX "journal_entry_lines_journal_entry_id_id_idx" ON "journal_entry_lines"("journal_entry_id", "id");
