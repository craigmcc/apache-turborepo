-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountNumber" TEXT,
    "accountType" TEXT,
    "ca1099FormType" TEXT,
    "ca1099Type" TEXT,
    "createdTime" TEXT,
    "description" TEXT,
    "entity" TEXT,
    "isActive" BOOLEAN,
    "name" TEXT,
    "updatedTime" TEXT,
    "parentChartOfAccountId" TEXT
);
