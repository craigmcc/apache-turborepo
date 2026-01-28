-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createTime" DATETIME,
    "domain" TEXT,
    "lastUpdatedTime" DATETIME,
    "accountSubType" TEXT,
    "accountType" TEXT,
    "acctNum" TEXT,
    "active" BOOLEAN,
    "classification" TEXT,
    "currencyRefName" TEXT,
    "currencyRefValue" TEXT,
    "currentBalance" REAL,
    "description" TEXT,
    "fullyQualifiedName" TEXT,
    "name" TEXT,
    "parentId" TEXT,
    "subAccount" BOOLEAN,
    CONSTRAINT "accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_id_key" ON "accounts"("id");
