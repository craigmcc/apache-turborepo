-- CreateTable
CREATE TABLE "transactions" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "amount" REAL,
    "date" TEXT,
    "documentNumber" TEXT,
    "memo" TEXT,
    "name" TEXT,
    "type" TEXT,
    "accountId" TEXT,
    CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_id_key" ON "transactions"("id");

-- CreateIndex
CREATE INDEX "transactions_date_accountId_idx" ON "transactions"("date", "accountId");
