-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createTime" DATETIME,
    "domain" TEXT,
    "lastUpdatedTime" DATETIME,
    "active" BOOLEAN,
    "currency" TEXT,
    "email" TEXT,
    "name" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_key" ON "customers"("id");
